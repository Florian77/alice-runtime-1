const dc = require("node-dev-console");
const R = require("ramda");
const {makeTriggerStreamId} = require("./make-trigger-stream-id");


function makeTriggerId({
                           type,
                           context,
                           aggregate,
                           trigger,
                           streamType,
                           streamId = null,
                           streamContext,
                           streamAggregate = null,
                           streamAggregateId = null,
                       }) {

    const contextAggregate = R.join("/", [context, aggregate]);

    if (type === "cron") {
        return R.join("::", [contextAggregate, type, trigger])
    }

    if (R.isNil(streamId)) {
        streamId = makeTriggerStreamId({
            streamContext,
            streamAggregate,
            streamAggregateId,
        });
    }

    return R.join("::", [contextAggregate, type, trigger, streamType, streamId])

}


module.exports = {
    makeTriggerId
};
