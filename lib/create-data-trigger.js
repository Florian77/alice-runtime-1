const dc = require("node-dev-console");
const R = require("ramda");
const {makeTriggerId} = require("./helper/make-trigger-id");
const {makeTriggerStreamId} = require("./helper/make-trigger-stream-id");
const {getCollectionTriggerIndex} = require("./database");
const {upsertStatsTriggerContextAggregate} = require("./upsert-stats");


async function createDataTrigger({
                                     context,
                                     aggregate,
                                     trigger,
                                     streamContext,
                                     streamAggregate = null,
                                     streamAggregateId = null,
                                     lastSequenceNumber = -1,
                                     paused = false,
                                 }) {
    const type = "stream";
    const streamType = "DATA";

    let streamId = makeTriggerStreamId({
        streamContext,
        streamAggregate,
        streamAggregateId,
    });

    const triggerId = makeTriggerId({
        type,
        context,
        aggregate,
        trigger,
        streamType,
        streamId,
    });

    const triggerData = {
        _id: triggerId,
        context,
        aggregate,
        trigger,
        type,
        streamType,
        streamId,
        lastSequenceNumber,
        checkForUpdates: true,
        running: false,
        runningSince: null,
        lastRunAt: null,
        error: false,
        errorMsg: null,
        paused,
        pausedAt: null,
        deployedAt: new Date(),
    };
    // if (debug.enabled) dc.j(triggerData, "createDataTrigger().triggerData");

    // TODO -> Add try catch
    const result = await getCollectionTriggerIndex().insertOne(triggerData);
    // if (debug.enabled) ftDev.mongo.logInsertOne(result, "createDataTrigger().insertOne().result", true);

    await upsertStatsTriggerContextAggregate({context, aggregate});

    // TODO check result

    return triggerData;
}


module.exports = {
    createDataTrigger,
};
