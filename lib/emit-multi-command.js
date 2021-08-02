const dc = require("node-dev-console");
const R = require("ramda");
const {makeCommandId} = require("./helper/make-command-id");
const {v1: uuid} = require("uuid"); // todo -> change !!!!
const {
    getCollectionCommandIndex,
    getCollectionCommandPayload,
} = require("./database");
const {upsertStatsCommandContextAggregate} = require("./upsert-stats");
const {wrapArray} = require("solid-robot");
const {storeError} = require("./database");
const {isCommandControlPaused} = require("./command-control");


async function emitMultiCommand({
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
                                }) {
    // TODO -> verify Data

    if (R.isNil(invokeId)) {
        throw Error("invokeId missing");
    }

    // load global paused setting // todo -> make system option
    if (await isCommandControlPaused({context, aggregate, command})) {
        paused = true;
    }

    subscription = wrapArray(subscription)
    const commandId = makeCommandId(context, aggregate, command, invokeId);
    const uniqueId = uuid();
    // const hasPayload = !R.isEmpty(payload);
    // console.log("hasPayload", hasPayload);

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
        payload,
        // hasPayload,
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
            payload,
            // hasPayload,
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
    // const updatePayload = {
    //     $set: {
    //         payload
    //     }
    // };
    const options = {
        upsert: (upsert !== false)
    };
    // dc.l("updateOne(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options))
    let commandUpserted = false, tryCount = 0;
    do {
        try {
            // change payload before command
            /*if (hasPayload) {
                const payloadResult = await getCollectionCommandPayload().updateOne(filter, updatePayload, options);
            } else {
                const payloadResult = await getCollectionCommandPayload().deleteOne(filter);
            }*/

            const result = await getCollectionCommandIndex().updateOne(filter, update, options);
            // dc.l("command stored [id=%s]", commandId);
            // dc.l("updateOne()", ftDev.mongoUpdateOne(result), dc.stringify(result));

            commandUpserted = true;

            if (R.propEq("upsertedCount", 1, result)) {
                await upsertStatsCommandContextAggregate({context, aggregate, command});
            }

        } catch (e) {
            console.error(e);
            await storeError(__filename, 343, "emitMultiCommand", e);

            if (++tryCount >= 3) {
                throw Error(`emitMultiCommand upsert CommandIndex [${commandId}] failed`);
            }

        }
    } while (!commandUpserted);

    // TODO -> handle upsert == false other result ?

    // todo -> return command data from existing command like -> uniqueId

    return commandData;
}


module.exports = {
    emitMultiCommand,
};
