const dc = require("node-dev-console");
const R = require("ramda");


const hasValue = R.complement(R.isNil);


function makeStreamId({context, aggregate, aggregateId}) {

    let streamId = R.join("/", ["__CONTEXT", context]);

    if (hasValue(aggregate) && !hasValue(aggregateId)) {
        streamId = R.join("/", ["__AGGREGATE", context, aggregate]);
    }
    if (hasValue(aggregate) && hasValue(aggregateId)) {
        streamId = R.join("/", [context, aggregate, aggregateId]);
    }

    return streamId;
}


module.exports = {
    makeStreamId,
};
