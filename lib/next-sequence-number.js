const dc = require("node-dev-console");
const R = require("ramda");
const {getCollectionStreamSequenceNumber} = require("./database");
const {storeError} = require("./database");


async function getNextSequenceNumber(streamType, streamId) {
    const result = await getCollectionStreamSequenceNumber().findOneAndUpdate(
        {
            _id: R.join("::", [streamType, streamId])
        },
        {
            $inc: {nextPosition: 1},
        },
        {
            // returnNewDocument: true,
            upsert: true,
        }
    );
    // dc.j(result, "getNextEventStreamPosition().result");
    return result.value === null ? 0 : result.value.nextPosition;
}


async function nextSequenceNumber_dataStream(streamId) {
    for (let i = 0; i < 3; i++) {
        try {
            return await getNextSequenceNumber("DATA", streamId);
        } catch (e) {
            console.error(e);
            await storeError(__filename, 36, "nextSequenceNumber_dataStream", e);
        }
    }
    throw Error("nextSequenceNumber_dataStream failed");
}


async function nextSequenceNumber_dataIndex(context, aggregate) {
    for (let i = 0; i < 3; i++) {
        try {
            return await getNextSequenceNumber("INDEX", R.join("/", [context, aggregate]));
        } catch (e) {
            console.error(e);
            await storeError(__filename, 45, "nextSequenceNumber_dataIndex", e);
        }
    }
    throw Error("nextSequenceNumber_dataIndex failed");
}


module.exports = {
    nextSequenceNumber_dataStream,
    nextSequenceNumber_dataIndex,
};
