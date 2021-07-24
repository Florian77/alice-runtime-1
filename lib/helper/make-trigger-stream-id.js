const dc = require("node-dev-console");
const R = require("ramda");


const isNotNil = R.complement(R.isNil);


function makeTriggerStreamId({
                                 streamContext,
                                 streamAggregate = null,
                                 streamAggregateId = null,
                             }) {
    let streamId = R.join("/", ["__CONTEXT", streamContext]);

    if (isNotNil(streamAggregate) && !isNotNil(streamAggregateId)) {
        streamId = R.join("/", ["__AGGREGATE", streamContext, streamAggregate]);
    }
    if (isNotNil(streamAggregate) && isNotNil(streamAggregateId)) {
        streamId = R.join("/", [streamContext, streamAggregate, streamAggregateId]);
    }

    return streamId;
}


module.exports = {
    makeTriggerStreamId
};
