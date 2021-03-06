const dc = require("node-dev-console");
const R = require("ramda");
const {sleep} = require("./helper/sleep");
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


    // load global paused setting  // todo -> make system option
    if (await isCommandControlPaused({context, aggregate, command})) {
        paused = true;
    }


    // const hasPayload = !R.isEmpty(payload);

    let uniqueId, commandId, commandData

    // const commandPayload = {
    //     _id: commandId,
    //     payload,
    // };
    // dc.l(("insertOne(%s)", dc.stringify(commandData))
    let commandInserted = false, tryCount = 0;

    // todo -> move retry logic to separate function like in nextSequenceNumber_dataStream -> to understand the logic better

    do {
        try {

            uniqueId = uuid();

            commandId = makeCommandId(context, aggregate, command, invokeId, uniqueId);

            commandData = {
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
                payload,
                // hasPayload,
                hasSubscriptions: false,
                subscription: [],
                hasCallback,
                callbackList,
                callbackFrom: !callbackFrom ? [] : [callbackFrom],
            };

            // insert payload before command
            // if (hasPayload) {
            // const result = await getCollectionCommandPayload().insertOne(commandPayload);
            // dc.l("insertOne(commandPayload).result", result.insertedId);
            // }

            // const result =
            await getCollectionCommandIndex().insertOne(commandData);
            // dc.l("insertOne(commandData).result", result.insertedId);

            commandInserted = true;

        } catch (e) {
            // run again on for example duplicate key error

            console.error(e);
            await storeError(__filename, 91, "emitCommand", e);

            if (++tryCount >= 3) {
                throw Error(`emitCommand insert CommandIndex [${commandId}] failed`);
            }

            await sleep(20);
        }
    } while (!commandInserted);

    await upsertStatsCommandContextAggregate({context, aggregate, command});

    /*if (hasCallback) {
        for (let callbackCommand of callbackList) {
            callbackCommand["callback"] = commandId;
            dc.j(callbackCommand, "callbackCommand");
            const result = await emitCommand(callbackCommand);
            dc.j(result, "callbackCommand result");
        }
    }*/

    // if (hasPayload) {
    //     return {
    //         ...commandData,
    //         payload,
    //     };
    // }

    return commandData;
}


module.exports = {
    emitCommand,
};
