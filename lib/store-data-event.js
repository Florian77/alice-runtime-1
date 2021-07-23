const dc = require("node-dev-console");
const R = require("ramda");
const {v1: uuid} = require("uuid");
const mapValues = require('lodash.mapvalues')
const sortAny = require('sort-any')
const {getCollectionDataStream, getCollectionDataIndex, getNextDataStreamSequenceNumber, getNextDataIndexSequenceNumber} = require("./database");
const {getLastDataEvent} = require("./get-data-events");
const {upsertStatsDataContextAggregate} = require("./upsert-stats");
const u = require("./utility");
const {storeError} = require("./database");


// TODO -> Add Version to event payload

// TODO -> Add Event Type and some stuff like that...


async function storeDataEvent({
                                  context,
                                  aggregate,
                                  aggregateId,
                                  event = "DataChanged",
                                  version = "1",
                                  priority = 0,
                                  payload = {},
                                  dataIndex = {}, // TODO -> deprecate -> remove
                                  index = {},
                                  meta = {},
                              }) {

    // version should always be a string
    version = String(version);

    // todo -> verify priority is number

    // TODO -> verify Data
    const dateNow = new Date();

    const streamId = R.join("/", [context, aggregate, aggregateId]);
    const sequenceNumber = await getNextDataStreamSequenceNumber(streamId);

    const aggregateStreamId = R.join("/", ["__AGGREGATE", context, aggregate]);
    const aggregateSequenceNumber = await getNextDataStreamSequenceNumber(aggregateStreamId);

    const contextStreamId = R.join("/", ["__CONTEXT", context]);
    const contextSequenceNumber = await getNextDataStreamSequenceNumber(contextStreamId);

    const systemStreamId = "__SYSTEM";
    const systemSequenceNumber = await getNextDataStreamSequenceNumber(systemStreamId);


    // TODO -> start transaction
    const eventId = R.join("/", [context, aggregate, aggregateId, sequenceNumber]);
    const eventData = {
        _id: eventId,
        context,
        aggregate,
        aggregateId,
        uniqueId: uuid(),
        event,
        streamId: streamId,
        sequenceNumber: sequenceNumber,
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
        const result = await getCollectionDataStream().insertOne(eventData);
        // dc.l("event stored [id=%s] a#%s c#%s s#%s", dc.stringify(eventId), aggregateSequenceNumber, contextSequenceNumber, systemSequenceNumber);
        // dc.l("DataStream([EVENT]).insertOne()", ftDev.mongoInsertOne(result), dc.stringify(result));
    } catch (e) {
        // if (e.code === 11000) {
        //     console.error("duplicate key error");
        //     return false;
        // } else {
        console.error(e);
        await storeError(__filename, 90, "storeDataEvent", e)
        // throw e;
        // }
    }

    // Aggregate Stream Link
    const aggregateEventId = R.join("/", [aggregateStreamId, aggregateSequenceNumber]);
    const aggregateEvent = {
        _id: aggregateEventId,
        streamId: aggregateStreamId,
        sequenceNumber: aggregateSequenceNumber,
        context,
        aggregate,
        createdAt: dateNow,
        dispatched: false,
        dispatchedAt: null,
        linkEventId: eventId
    };
    // dc.l("DataStream([AGGREGATE]).insertOne(%s)", dc.stringify(aggregateEvent));
    try {
        const result = await getCollectionDataStream().insertOne(aggregateEvent);
        // dc.l("aggregate event stored [id=%s]", dc.stringify(aggregateEventId));
        // dc.l("DataStream([AGGREGATE]).insertOne()", ftDev.mongoInsertOne(result), dc.stringify(result));
    } catch (e) {
        console.error(e);
        await storeError(__filename, 115, "storeDataEvent", e)
        // throw e;
    }

    //  Context stream Link
    const contextEventId = R.join("/", [contextStreamId, contextSequenceNumber]);
    const contextEvent = {
        _id: contextEventId,
        streamId: contextStreamId,
        sequenceNumber: contextSequenceNumber,
        context,
        createdAt: dateNow,
        dispatched: false,
        dispatchedAt: null,
        linkEventId: eventId
    };
    // dc.l("DataStream([CONTEXT]).insertOne(%s)", dc.stringify(contextEvent));
    try {
        const result = await getCollectionDataStream().insertOne(contextEvent);
        // dc.l("context event stored [id=%s]", dc.stringify(contextEventId));
        // dc.l("DataStream([CONTEXT]).insertOne()", ftDev.mongoInsertOne(result), dc.stringify(result));
    } catch (e) {
        console.error(e);
        await storeError(__filename, 138, "storeDataEvent", e)
        // throw e;
    }

    //  System stream Link
    const systemEventId = R.join("/", [systemStreamId, systemSequenceNumber]);
    const systemEvent = {
        _id: systemEventId,
        streamId: systemStreamId,
        sequenceNumber: systemSequenceNumber,
        createdAt: dateNow,
        dispatched: false,
        dispatchedAt: null,
        linkEventId: eventId
    };
    // dc.l("DataStream([SYSTEM]).insertOne(%s)", dc.stringify(systemEvent));
    try {
        const result = await getCollectionDataStream().insertOne(systemEvent);
        // dc.l("system event stored [id=%s]", dc.stringify(systemEventId));
        // dc.l("DataStream([SYSTEM]).insertOne()", ftDev.mongoInsertOne(result), dc.stringify(result));
    } catch (e) {
        console.error(e);
        await storeError(__filename, 160, "storeDataEvent", e)
        // throw e;
    }

    // Data Index
    let dataIndexUpdated = false;

    let setIndex = {
        // ...parsedAggregateId,
        ...(R.propOr({}, "index", dataIndex)),
        ...index,
    };
    // add context + aggregate to index to support mongodb index
    if (!R.isEmpty(setIndex)) {
        setIndex = R.assoc("context", context, setIndex)
        setIndex = R.assoc("aggregate", aggregate, setIndex)
    }
    const setMeta = {
        ...(R.propOr({}, "meta", dataIndex)),
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
            await storeError(__filename, 210, "storeDataEvent", e)
        }
    }
    if (!dataIndexUpdated) {
        const dataIndexSequenceNumber = await getNextDataIndexSequenceNumber();

        const insertDoc = {
            _id: streamId,
            sequenceNumber: dataIndexSequenceNumber,
            context,
            aggregate,
            aggregateId,
            event,
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
            const result = await getCollectionDataIndex().insertOne(insertDoc, options);
            // dc.l("data index created [id=%s]", streamId);
            // dc.l("DataIndex.insertOne()", ftDev.mongoInsertOne(result), dc.stringify(result));
        } catch (e) {
            console.error(e);
            await storeError(__filename, 241, "storeDataEvent", e)
        }
    }

    await upsertStatsDataContextAggregate({context, aggregate});

    return eventData;
}


function sortDeep(object) {
    object = R.clone(object)
    if (!Array.isArray(object)) {
        if (!(typeof object === 'object') || object === null) {
            return object;
        }
        return mapValues(object, sortDeep);
    }
    return sortAny(object.map(sortDeep));
}


function deepEqualInAnyOrder(value1, value2) {
    return R.equals(sortDeep(value1), sortDeep(value2))
}


/**
 * Return:
 *  True = Changed
 *  False = Unchanged
 * @param newPayload
 * @param newVersion
 * @param lastEvent
 * @param ignoreCompareFields
 * @returns {boolean}
 * @private
 */
function _defaultOnPayloadChangeCompareFunc(newPayload, newVersion, lastEvent = null, ignoreCompareFields = null) {
    if (lastEvent === false || R.isNil(lastEvent)) {
        return true;
    }
    let lastEventPayload = u.getPayload(lastEvent)
    // console.log("newPayload", newPayload)
    // console.log("lastEventPayload", lastEventPayload)
    if (!R.isNil(ignoreCompareFields) && R.is(Array, ignoreCompareFields)) {
        for (let field of ignoreCompareFields) {
            if (R.is(Array, field)) {
                newPayload = R.dissocPath(field, newPayload)
                lastEventPayload = R.dissocPath(field, lastEventPayload)
            } else {
                newPayload = R.dissoc(field, newPayload)
                lastEventPayload = R.dissoc(field, lastEventPayload)
            }
        }
    }
    // console.log("newPayload", newPayload)
    // console.log("lastEventPayload", lastEventPayload)

    return (
        !deepEqualInAnyOrder(newPayload, lastEventPayload) ||
        !R.equals(newVersion, u.getVersion(lastEvent))
    );
}


// return =
// true: created / updated
// false: no update was necessary
async function storeDataEventOnPayloadChange({
                                                 context,
                                                 aggregate,
                                                 aggregateId,
                                                 event = "DataChanged",
                                                 priority = 0,
                                                 payload = {},
                                                 dataIndex = {},
                                                 index = {},
                                                 meta = {},
                                                 version = "1",
                                                 compareFunc = _defaultOnPayloadChangeCompareFunc,
                                                 ignoreCompareFields = null,
                                             }) {

    // version should always be a string
    version = String(version);

    // TODO -> What to do if only dataIndex changed?
    // -> Workaround update version
    // TODO -> check data Index if payload + version not changed

    const query = {
        context,
        aggregate,
        aggregateId,
    };
    const lastEvent = await getLastDataEvent(query);
    // dc.l("onChange: getLastDataEvent(%s).result", dc.stringify(query), dc.stringify(lastEvent));

    if (lastEvent !== false) {
        // dc.l("onChange: found last event [id=%s]", u.get_id(lastEvent));
    }

    const cmpResult = compareFunc(payload, version, lastEvent, ignoreCompareFields);
    // dc.l("onChange: compareFunc [result=%s]", cmpResult);

    if (!cmpResult) {
        // dc.l("onChange: exit without update", cmpResult);
        return false;
    }

    // console.log("payload", payload)
    // Add Event
    const storeEvent = {
        context,
        aggregate,
        aggregateId,
        event,
        priority,
        payload,
        dataIndex,
        index,
        meta,
        version,
    };
    const storeEventResult = await storeDataEvent(storeEvent);
    // dc.l("onChange: storeDataEvent(%s).result", dc.stringify(storeEvent), dc.stringify(storeEventResult));

    return true;
}


module.exports = {
    storeDataEvent,
    storeDataEventOnPayloadChange,
};
