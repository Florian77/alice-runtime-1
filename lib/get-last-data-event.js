const dc = require("node-dev-console");
const R = require("ramda");
const {makeStreamId} = require("./helper/make-stream-id");
const {getCollectionDataStream} = require("./database");


async function getLastDataEvent({
                                    context,
                                    aggregate = null,
                                    aggregateId = null,
                                }) {
    const query = {
        streamId: makeStreamId({context, aggregate, aggregateId}),
    };
    const options = {
        sort: {
            sequenceNumber: -1
        }
    };
    // dcl("getLastDataEvent().findOne(%s, %s)", dc.stringify(query), dc.stringify(options));
    const result = await getCollectionDataStream().findOne(query, options);
    // dcl("getLastDataEvent().findOne().result", dc.stringify(result));

    if (R.isNil(result)) {
        return false;
    }

    return result;
}


module.exports = {
    getLastDataEvent,
};
