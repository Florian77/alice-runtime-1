const {getCollectionTriggerIndex} = require("./database");
const R = require("ramda");
const {upsertStatsTriggerContextAggregate} = require("./upsert-stats");

const isNotNil = R.complement(R.isNil);


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

    let streamId = R.join("/", ["__CONTEXT", streamContext]);

    if (isNotNil(streamAggregate) && !isNotNil(streamAggregateId)) {
        streamId = R.join("/", ["__AGGREGATE", streamContext, streamAggregate]);
    }
    if (isNotNil(streamAggregate) && isNotNil(streamAggregateId)) {
        streamId = R.join("/", [streamContext, streamAggregate, streamAggregateId]);
    }

    const contextAggregate = R.join("/", [context, aggregate]);

    const triggerData = {
        _id: R.join("::", [contextAggregate, type, trigger, streamType, streamId]),
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
    // if (debug.enabled) ftDev.logJsonString(triggerData, "createDataTrigger().triggerData");

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
