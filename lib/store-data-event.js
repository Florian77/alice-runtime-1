const dc = require("node-dev-console");
const R = require("ramda");
const {makeStreamId} = require("./helper/make-stream-id");
const {nextSequenceNumber_dataIndex} = require("./next-sequence-number");
const {nextSequenceNumber_dataStream} = require("./next-sequence-number");
const {v1: uuid} = require("uuid");
const {getCollectionDataStream, getCollectionDataIndex} = require("./database");
const {upsertStatsDataContextAggregate} = require("./upsert-stats");
const {storeError} = require("./database");


async function storeDataEvent({
                                  context,
                                  aggregate,
                                  aggregateId,
                                  event = "DataChanged",
                                  version = "1",
                                  priority = 0,
                                  payload = {},
                                  index = {},
                                  meta = {},
                              }) {

    // version should always be a string
    version = String(version);

    // TODO -> verify Data
    // todo -> verify priority is number

    const dateNow = new Date();

    const streamId = R.join("/", [context, aggregate, aggregateId]);

    const sequenceNumber = await nextSequenceNumber_dataStream(streamId);

    const aggregateStreamId = R.join("/", ["__AGGREGATE", context, aggregate]);
    const aggregateSequenceNumber = await nextSequenceNumber_dataStream(aggregateStreamId);

    // todo -> make system option

    // const contextStreamId = R.join("/", ["__CONTEXT", context]);
    const contextSequenceNumber = 0 // await nextSequenceNumber_dataStream(contextStreamId);

    // todo -> make system option

    // const systemStreamId = "__SYSTEM";
    const systemSequenceNumber = 0 // await nextSequenceNumber_dataStream(systemStreamId);


    // TODO -> start transaction


    const eventId = R.join("/", [context, aggregate, aggregateId, sequenceNumber]);
    const eventData = {
        _id: eventId,
        context,
        aggregate,
        aggregateId,
        // uniqueId: uuid(),
        event,
        // streamId: streamId,
        sequenceNumber,
        aggregateSequenceNumber,
        contextSequenceNumber,
        systemSequenceNumber,
        createdAt: dateNow,
        dispatched: false,
        dispatchedAt: null,
        version,
        priority,
        payload,
    };
    // dc.l("DataStream([EVENT]).insertOne(%s)", dc.stringify(eventData));
    try {
        // const result =
        await getCollectionDataStream().insertOne(eventData);
        // dc.l("event stored [id=%s] a#%s c#%s s#%s", dc.stringify(eventId), aggregateSequenceNumber, contextSequenceNumber, systemSequenceNumber);
        // dc.l("DataStream([EVENT]).insertOne()", ftDev.mongoInsertOne(result), dc.stringify(result));
    } catch (e) {
        // if (e.code === 11000) {
        //     console.error("duplicate key error");
        //     return false;
        // }
        console.error(e);
        await storeError(__filename, 89, "storeDataEvent", e)
        throw Error(`storeDataEvent insert dataStream [${eventId}] failed`);
    }


    // Data Index
    let dataIndexUpdated = false;

    let setIndex = {
        // ...parsedAggregateId,
        ...index,
    };
    // add context + aggregate to index to support mongodb index
    if (!R.isEmpty(setIndex)) {
        setIndex = R.assoc("context", context, setIndex)
        setIndex = R.assoc("aggregate", aggregate, setIndex)
    }
    const setMeta = {
        ...meta
    };
    if (sequenceNumber > 0) { // First try to update
        const filter = {
            _id: streamId,
        };
        const update = {
            $set: {
                event,
                index: setIndex,
                meta: setMeta,
                lastEventSequenceNumber: sequenceNumber,
                lastEventAt: dateNow,
                version,
            },
        };
        const options = {};
        // dc.l("DataIndex.updateOne(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options));
        try {
            const result = await getCollectionDataIndex().updateOne(filter, update, options);
            // dc.j(result, "getCollectionDataIndex().updateOne() -> result");
            // check update worked
            if (R.propEq("matchedCount", 1, result) && R.propEq("modifiedCount", 1, result)) {
                // dc.l("data index updated [id=%s]", streamId);
                dataIndexUpdated = true;
            } else {
                // dc.l("error: data index updated failed [id=%s]", streamId);
            }
            // dc.l("DataIndex.updateOne()", ftDev.mongoUpdateOne(result), dc.stringify(result));
        } catch (e) {
            console.error(e);
            await storeError(__filename, 141, "storeDataEvent", e);
            throw Error(`storeDataEvent update dataIndex [${streamId}] failed`);
        }
    }
    if (!dataIndexUpdated) {
        // const dataIndexSequenceNumber = await nextSequenceNumber_dataIndex(context, aggregate);

        const insertDoc = {
            _id: streamId,
            context,
            aggregate,
            aggregateId,
            event,
            // aggregateSequenceNumber: dataIndexSequenceNumber,
            index: setIndex,
            meta,
            firstEventAt: dateNow,
            firstEventSequenceNumber: sequenceNumber,
            lastEventSequenceNumber: sequenceNumber,
            lastEventAt: dateNow,
            version,
            // deleted: null,
            // deletedAt: null,
        };
        const options = {};
        // dc.l("DataIndex.insertOne(doc:%s, options:%s)", dc.stringify(insertDoc), dc.stringify(options));
        try {
            // const result =
            await getCollectionDataIndex().insertOne(insertDoc, options);
            // dc.l("data index created [id=%s]", streamId);
            // dc.l("DataIndex.insertOne()", ftDev.mongoInsertOne(result), dc.stringify(result));
        } catch (e) {
            console.error(e);
            await storeError(__filename, 173, "storeDataEvent", e);
            throw Error(`storeDataEvent insert dataIndex [${streamId}] failed`);
        }
    }

    await upsertStatsDataContextAggregate({context, aggregate});

    return eventData;
}


module.exports = {
    storeDataEvent,
};
