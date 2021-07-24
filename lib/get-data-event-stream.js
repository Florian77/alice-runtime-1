const dc = require("node-dev-console");
const {makeStreamId} = require("./helper/make-stream-id");
const {getCollectionDataStream} = require("./database");


async function getDataEventStream({
                                      context,
                                      aggregate = null,
                                      aggregateId = null,
                                      // TODO -> fromSequenceNumber = null,
                                      // TODO -> toSequenceNumber = null,
                                      // TODO -> limit = null,
                                  }) {

    const streamId = makeStreamId({context, aggregate, aggregateId});

    const query = {
        streamId
    };

    // dcl("getDataEventStream().find(%s)", dc.stringify(query));
    const result = await getCollectionDataStream()
        .find(query)
        .sort({sequenceNumber: 1})
        .toArray()
    ;
    // dcl("getDataEventStream().find().result", dc.stringify(result));

    return result;
}


module.exports = {
    getDataEventStream,
};
