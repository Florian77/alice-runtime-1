const dc = require("node-dev-console");
const R = require("ramda");
const {v1: uuid} = require("uuid");
const {
    getCollectionCommandIndex,
    getCollectionCommandPayload,
    getCollectionUtility,
    makeUtilityCollectionId,
    UTILITY_NAMESPACE,
} = require("./database");
const {upsertStatsCommandContextAggregate} = require("./upsert-stats");
const {wrapArray} = require("solid-robot");


const {storeError} = require("./database");




const isUpsert = R.propEq("upsertedCount", 1);
const makeCommandId = (context, aggregate, command, invokeId, uniqueId = null) =>
    R.join("/",
        R.filter(
            R.allPass([
                R.complement(R.isNil),
                R.complement(R.isEmpty),
            ]), [context, aggregate, command, invokeId, uniqueId]
        )
    );
const isCCPaused = (commandControl) => R.propEq("paused", true, commandControl);
const ccUtilityId = ({context, aggregate, command}) => makeUtilityCollectionId(
    UTILITY_NAMESPACE.COMMAND_CONTROL,
    [context, aggregate, command],
    "/"
);

// --------------------------------------------------------------------------------------------
const getCommandControl = async ({context, aggregate, command}) => {
    const utilityId = ccUtilityId({context, aggregate, command});
    //dc.l("[utilityId=%s]", utilityId);
    try {
        const result = await getCollectionUtility().findOne({_id: utilityId});
        // dc.l("findOne():", dc.stringify(result));
        return R.isNil(result) ? {paused: false} : result;
    } catch (e) {
        console.error(e);
        await storeError(__filename, 53, "getCommandControl", e)
        return false;
    }
};

// --------------------------------------------------------------------------------------------
const upsertCommandControl = async ({context, aggregate, command}, set) => {

    const utilityId = ccUtilityId({context, aggregate, command});
    // dc.l("[utilityId=%s]", utilityId);

    const filter = {
        _id: utilityId,
    };
    let update = {
        $set: {
            ...set
        },
        $setOnInsert: {
            context,
            aggregate,
            command,
        }
    };
    const options = {
        upsert: true
    };
    // dc.l("updateOne(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options));
    try {
        const result = await getCollectionUtility().updateOne(filter, update, options);
        // dc.l("updateOne():", dc.stringify(result));

    } catch (e) {
        console.error(e);
        await storeError(__filename, 87, "upsertCommandControl", e)
        return false;
    }

    return true;
};

// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------
const emitCommand = async ({
                               context,
                               aggregate, //  mandatory or optional ???
                               command,
                               payload = {},
                               invokeId = "",
                               priority = 0,
                               paused = false,
                               callbackFrom = false,
                           },
                           callbackList = []) => {
    // todo -> verify Data

    const hasCallback = !R.isEmpty(callbackList);

    // const invokeId = (isNotNil(invokeIdPrefix) ? invokeIdPrefix : "") + uuid();
    // dc.l(("invokeId created [%s]", invokeId);

    const uniqueId = uuid();


    // load global paused setting
    // if (R.isNil(paused)) {
    const commandControl = await getCommandControl({context, aggregate, command});
    // dc.j(commandControl, "commandControl");
    if (isCCPaused(commandControl)) {
        paused = true;
    }
    // }

    const commandId = makeCommandId(context, aggregate, command, invokeId, uniqueId);

    const hasPayload = !R.isEmpty(payload)

    const commandData = {
        _id: commandId,
        // commandId,
        context,
        aggregate,
        command,
        invokeId,
        uniqueId,
        multiInvoke: false,
        createdAt: new Date(),
        running: false,
        runningSince: null,
        handled: false,
        handledAt: null,
        priority,
        paused,
        pausedAt: paused ? (new Date()) : null,
        // payload: {},
        hasPayload,
        hasSubscriptions: false,
        subscription: [],
        hasCallback,
        callbackList,
        callbackFrom: !callbackFrom ? [] : [callbackFrom],
    };
    const commandPayload = {
        _id: commandId,
        payload,
    };
    // dc.l(("insertOne(%s)", dc.stringify(commandData));
    try {

        // insert payload before command
        if (hasPayload) {
            const result = await getCollectionCommandPayload().insertOne(commandPayload);
            // dc.l("insertOne(commandPayload).result", result.insertedId);
        }

        const result = await getCollectionCommandIndex().insertOne(commandData);
        // dc.l("insertOne(commandData).result", result.insertedId);

        await upsertStatsCommandContextAggregate({context, aggregate, command});
    } catch (e) {
        // TODO -> run again on duplicate key error
        // if (e.code === 11000) {
        //     console.error("duplicate key error");

        console.error(e);
        await storeError(__filename, 178, "emitCommand", e)
        return false;
    }

    /*if (hasCallback) {
        for (let callbackCommand of callbackList) {
            callbackCommand["callback"] = commandId;
            dc.j(callbackCommand, "callbackCommand");
            const result = await emitCommand(callbackCommand);
            dc.j(result, "callbackCommand result");
        }
    }*/

    if(hasPayload) {
        return {
            ...commandData,
            payload,
        };
    }

    return commandData;
};


// --------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------
const emitMultiCommand = async ({
                                    context,
                                    aggregate, //  mandatory or optional ???
                                    invokeId = null,
                                    command,
                                    payload = {},
                                    upsert = true,
                                    priority = null,
                                    paused = null,
                                    backupCommand = null,
                                    subscription = [],
                                    callbackFrom = false,
                                }) => {
    // TODO -> verify Data

    if (R.isNil(invokeId)) {
        throw Error("invokeId missing");
    }

    // load global paused setting
    // if (R.isNil(paused)) {
    const commandControl = await getCommandControl({context, aggregate, command});
    //dc.j(commandControl, "commandControl");
    if (isCCPaused(commandControl)) {
        paused = true;
    }
    // }

    subscription = wrapArray(subscription);

    const commandId = makeCommandId(context, aggregate, command, invokeId); //R.join("/", [context, aggregate, command, invokeId]);
    const uniqueId = uuid();

    const hasPayload = !R.isEmpty(payload)
    // console.log("hasPayload", hasPayload)

    let commandData = {
        _id: commandId,
        // commandId,
        context,
        aggregate,
        command,
        invokeId,
        uniqueId,
        multiInvoke: true,
        createdAt: new Date(),
        running: false,
        runningSince: null,
        handled: false,
        handledAt: null,
        priority: 0,
        paused: false,
        pausedAt: null,
        // payload,
        hasPayload,
        hasSubscriptions: !R.isEmpty(subscription),
        subscription,
        hasCallback: false,
        callbackList: [],
        callbackFrom: !callbackFrom ? [] : [callbackFrom],
    };

    let addUpdateData = {};
    let addInsertData = {};
    if (!R.isNil(priority)) {
        addUpdateData.priority = priority;
        commandData.priority = priority;
    } else { // Default Data
        addInsertData.priority = 0;
    }
    if (!R.isNil(paused)) {
        addUpdateData.paused = paused;
        commandData.paused = paused;
        addUpdateData.pausedAt = paused ? (new Date()) : null;
        commandData.pausedAt = paused ? (new Date()) : null;
    } else { // Default Data
        addInsertData.paused = false;
        addInsertData.pausedAt = null;
    }

    // create command as handled + don't execute or re execute it (don't set handled if command already exists)
    if (backupCommand) {
        addInsertData.handled = true;
        commandData.handled = true;
        // todo -> create test
    } else {
        addUpdateData.handled = false;
    }

    const filter = {
        _id: commandId,
    };
    let update = {
        $set: {
            // payload,
            hasPayload,
            ...addUpdateData,
        },
        $setOnInsert: {
            context,
            aggregate,
            command,
            invokeId,
            uniqueId,
            multiInvoke: true,
            createdAt: new Date(),
            running: false,
            runningSince: null,
            // handled: false,
            handledAt: null,
            // payload,
            hasSubscriptions: !R.isEmpty(subscription),
            subscription,
            ...addInsertData,
        },
    };
    if (callbackFrom !== false) {
        update = R.assocPath(["$push", "callbackFrom"], callbackFrom, update);
    }
    const updatePayload = {
        $set: {
            payload
        }
    }
    const options = {
        upsert: (upsert !== false)
    };
    // dc.l("updateOne(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options));
    try {
        // change payload before command
        if (hasPayload) {
            const payloadResult = await getCollectionCommandPayload().updateOne(filter, updatePayload, options);
        } else {
            const payloadResult = await getCollectionCommandPayload().deleteOne(filter);
        }

        const result = await getCollectionCommandIndex().updateOne(filter, update, options);
        // dc.l("command stored [id=%s]", commandId);
        // dc.l("updateOne()", ftDev.mongoUpdateOne(result), dc.stringify(result));

        if (isUpsert(result)) {
            await upsertStatsCommandContextAggregate({context, aggregate, command});
        }

    } catch (e) {
        console.error(e);
        await storeError(__filename, 343, "emitMultiCommand", e)
        return false;
    }

    // TODO -> handle upsert == false other result ?

    // todo -> return command data from existing command like -> uniqueId

    return commandData;
};


// --------------------------------------------------------------------------------------------
const updateOneCommand = async ({
                                    context = "",
                                    aggregate = "",
                                    command = "",
                                    invokeId = "",
                                    uniqueId = null,
                                    commandId = null
                                }, set = {}) => {

    if (R.isNil(commandId) || R.isEmpty(commandId)) {
        commandId = makeCommandId(context, aggregate, command, invokeId, uniqueId);
    }
    const filter = {
        _id: commandId,
    };
    let update = {
        $set: {
            ...set,
        }
    };
    const options = {};
    // dc.l("updateOneCommand(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options));
    try {
        const result = await getCollectionCommandIndex().updateOne(filter, update, options);
        // dc.l("command stored [id=%s]", commandId);
        // dc.l("updateOne()", dc.stringify(result));

        return {
            ok: R.propEq("acknowledged", true, result),
            matchedCount: R.prop("matchedCount", result),
            modifiedCount: R.prop("modifiedCount", result),
        };
    } catch (e) {
        console.error(e);
        await storeError(__filename, 390, "updateOneCommand", e)
        return false;
    }
};


// --------------------------------------------------------------------------------------------
const updateManyCommands = async ({
                                      context,
                                      aggregate,
                                      command,
                                  }, set = {}, filter = {}) => {

    // const commandId = makeCommandId(context, aggregate, command);
    const updateFilter = {
        context,
        aggregate,
        command,
        ...filter,
    };
    let update = {
        $set: {
            ...set,
        }
    };
    const options = {};
    // dc.j(updateFilter, "updateFilter");
    try {
        const result = await getCollectionCommandIndex().updateMany(updateFilter, update, options);
        // dc.l("command stored [id=%s]", commandId);
        // dc.l("updateOne()", dc.stringify(result));

        return {
            ok: R.propEq("acknowledged", true, result),
            matchedCount: R.propOr(null, "matchedCount", result),
            modifiedCount: R.propOr(null, "modifiedCount", result),
        };
    } catch (e) {
        console.error(e);
        await storeError(__filename, 429, "updateManyCommands", e)
        return false;
    }
};

// --------------------------------------------------------------------------------------------
const reInvokeSubscription = async ({
                                        context,
                                        aggregate,
                                        command,
                                        subscription,
                                        priority = null,
                                    }) => {

    let set = {
        handled: false
    }
    if (!R.isNil(priority) && R.is(Number, priority)) {
        set = R.assoc("priority", priority, set)
    }
    return updateManyCommands({
            context,
            aggregate,
            command,
        },
        set,
        {
            subscription
        });
};


// --------------------------------------------------------------------------------------------
module.exports = {
    makeCommandId,
    emitCommand,
    emitMultiCommand,
    updateOneCommand,
    updateManyCommands,
    getCommandControl,
    upsertCommandControl,
    reInvokeSubscription,
};
