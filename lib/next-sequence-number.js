const dc = require("node-dev-console");
const R = require("ramda");
const {getCollectionStreamSequenceNumber} = require("./database");


async function getNextSequenceNumber(streamType, streamId) {
    // TODO -> use utility collection

    // todo -> add retry logic !!!

    const result = await getCollectionStreamSequenceNumber().findOneAndUpdate(
        {
            _id: R.join("::", [streamType, streamId])
        },
        {
            $inc: {nextPosition: 1},
        },
        {
            // returnNewDocument: true,
            upsert: true
        }
    );
    // dc.j(result, "getNextEventStreamPosition().result");
    return result.value === null ? 0 : result.value.nextPosition;
}


async function nextSequenceNumber_dataStream(streamId) {
    return getNextSequenceNumber("DATA", streamId);
}


async function nextSequenceNumber_dataIndex() {
    return getNextSequenceNumber("INDEX", "DATA");
}


module.exports = {
    nextSequenceNumber_dataStream,
    nextSequenceNumber_dataIndex,
};
