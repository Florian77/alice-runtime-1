const dc = require("node-dev-console");
const R = require("ramda");
const {makeCommandId} = require("./helper/make-command-id");
const {v1: uuid} = require("uuid"); // todo -> change !!!!
const {
    getCollectionCommandIndex,
    getCollectionCommandPayload,
} = require("./database");
const {upsertStatsCommandContextAggregate} = require("./upsert-stats");
const {storeError} = require("./database");
const {isCommandControlPaused} = require("./command-control");


async function emitCommand({
                               context,
                               aggregate, //  mandatory or optional ???
                               command,
                               payload = {},
                               invokeId = "",
                               priority = 0,
                               paused = false,
                               callbackFrom = false,
                           },
                           callbackList = []) {
    // todo -> verify Data

    const hasCallback = !R.isEmpty(callbackList);

    const uniqueId = uuid();

    // load global paused setting
    if (await isCommandControlPaused({context, aggregate, command})) {
        paused = true;
    }

    const commandId = makeCommandId(context, aggregate, command, invokeId, uniqueId);

    const hasPayload = !R.isEmpty(payload);

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
    // dc.l(("insertOne(%s)", dc.stringify(commandData))
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
        await storeError(__filename, 178, "emitCommand", e);
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

    if (hasPayload) {
        return {
            ...commandData,
            payload,
        };
    }

    return commandData;
}


module.exports = {
    emitCommand,
};
