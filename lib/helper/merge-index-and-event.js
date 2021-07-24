const dc = require("node-dev-console");
const R = require("ramda");
const utility = require("../utility");


function mergeIndexAndEvent(index, event) {
    return {
        ...index,
        streamId: utility.getStreamId(event),
        payload: utility.getPayload(event),
        version: utility.getVersion(event),
        lastEvent: event
            ? R.omit([
                "streamId",
                "payload",
                "version",
                "context",
                "aggregate",
                "aggregateId",
            ], event)
            : false,
    };
}


module.exports = {
    mergeIndexAndEvent,
};
