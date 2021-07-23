const ftDev = require("ftws-node-dev-tools");
const {jsonString} = ftDev;
const {getCollectionDataStream, getCollectionDataIndex} = require("./database");
const R = require("ramda");
const dc = require("node-dev-console");
const utility = require("./utility");
const hasValue = R.complement(R.isNil);


const _logger = require('debug')('alice:getDataEvents');
const log = _logger.extend('log');
const debug = _logger.extend('debug');

const isEventLink = R.has("linkEventId");
const getLinkEventId = R.propOr(null, "linkEventId");

// ----> COPY USED IN mockCommandEnvironment()
const makeStreamId = ({context, aggregate, aggregateId}) => {

    let streamId = R.join("/", ["__CONTEXT", context]);

    if (hasValue(aggregate) && !hasValue(aggregateId)) {
        streamId = R.join("/", ["__AGGREGATE", context, aggregate]);
    }
    if (hasValue(aggregate) && hasValue(aggregateId)) {
        streamId = R.join("/", [context, aggregate, aggregateId]);
    }

    return streamId;
};

const getDataEventStream = async ({
                                      context,
                                      aggregate = null,
                                      aggregateId = null,
                                      // TODO -> fromSequenceNumber = null,
                                      // TODO -> toSequenceNumber = null,
                                      // TODO -> limit = null,
                                  }) => {

    const streamId = makeStreamId({context, aggregate, aggregateId});

    const query = {
        streamId
    };
    debug("getDataEventStream().find(%s)", jsonString(query));
    const result = await getCollectionDataStream().find(query).sort({sequenceNumber: 1}).toArray();
    debug("getDataEventStream().find().result", jsonString(result));

    // TODO -> Load Event if event is linked

    return result;
};

const getLastDataEvent = async ({
                                    context,
                                    aggregate = null,
                                    aggregateId = null,
                                }) => {
    const query = {
        streamId: makeStreamId({context, aggregate, aggregateId}),
    };
    const options = {
        sort: {
            sequenceNumber: -1
        }
    };
    debug("getLastDataEvent().findOne(%s, %s)", jsonString(query), jsonString(options));
    const result = await getCollectionDataStream().findOne(query, options);
    debug("getLastDataEvent().findOne().result", jsonString(result));

    // TODO -> Load Event if event is linked

    return hasValue(result) ? result : false;
};


const getDataEvent = async ({
                                context,
                                aggregate = null,
                                aggregateId = null,
                                sequenceNumber = 0,
                                eventId = null,
                            }) => {
    let query;
    if(R.isNil(eventId)) {
        query = {
            streamId: makeStreamId({context, aggregate, aggregateId}),
            sequenceNumber,
        };
    }
    else {
        query = {
            _id: eventId
        };
    }
    debug("getDataEvent().findOne(%s)", jsonString(query));
    const result = await getCollectionDataStream().findOne(query);
    debug("getDataEvent().findOne().result", jsonString(result));

    // TODO -> Load Event if event is linked

    return hasValue(result) ? result : false;
};


const loadLinkedDataEvent = async (event) => {
    const query = {
        _id: getLinkEventId(event)
    };
    debug("loadLinkedDataEvent().findOne(%s)", jsonString(query));
    const result = await getCollectionDataStream().findOne(query);
    debug("loadLinkedDataEvent().findOne().result", jsonString(result));
    return result;
};

const resolveEvent = async event => isEventLink(event) ? await loadLinkedDataEvent(event) : event;


const mergeIndexAndEvent = (index, event) => {
    /*if (!event) {
        return {
            ...index,
            lastEvent: false,
            streamId: "",
            payload: {},
            version: utility.getVersion(event),
        }
    }*/
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
};


const getItemDataIndex = async ({
                                    context,
                                    aggregate,
                                    aggregateId,
                                }, {
                                    getLastEvent = false
                                    // TODO -> getEventStream = false
                                } = {}) => {
    const query = {
        _id: makeStreamId({context, aggregate, aggregateId}),
    };
    // debug("getDataEvent().findOne(%s)", jsonString(query));
    const result = await getCollectionDataIndex().findOne(query);
    // debug("getDataEvent().findOne().result", jsonString(result));

    if (!hasValue(result)) {
        return false;
    }

    if (!getLastEvent) {
        return result;
    }

    const dataEvent = await getLastDataEvent(result);
    return mergeIndexAndEvent(result, dataEvent);
};

// TODO -> getNextDataIndex

/**
 *
 * @param {Object} query
 * @param {boolean} getLastEvent
 * @param {number} skip
 * @param {number} limit
 * @param {object|null} sort
 * @return {Promise<[]|*>}
 */
const queryDataIndex = async (query, {
    getLastEvent = false,
    // TODO -> getEventStream = false
    skip = 0,
    limit = 0,
    sort = null,
} = {}) => {
    // debug("queryDataIndex().findOne(%s)", jsonString(query));

    if (R.isNil(sort)) {
        sort = {
            sequenceNumber: 1
        };
    }
    let indexResult = getCollectionDataIndex().find(
        query,
        {
            sort,
        });
    if (skip > 0) {
        indexResult.skip(skip);
    }
    if (limit > 0) {
        indexResult.limit(limit);
    }
    indexResult = await indexResult.toArray();
    // debug("queryDataIndex().find().indexResult.length", jsonString(query), R.length(indexResult));

    if (!getLastEvent) {
        return indexResult;
    }

    let dataResult = [];
    for (let indexItem of indexResult) {
        const dataEvent = await getLastDataEvent(indexItem);
        // dc.j(dataEvent, "dataEvent");
        dataResult.push(
            mergeIndexAndEvent(indexItem, dataEvent)
        );
    }
    return dataResult;
};

/**
 *
 * @param {Object} query
 * @return {Promise<[]|*>}
 */
const countDataIndex = async (query) => {
    // dc.j(query, "countDataIndex().query");
    return await getCollectionDataIndex().countDocuments(query);
};

module.exports = {
    getDataEventStream,
    getLastDataEvent,
    getDataEvent,
    isEventLink,
    loadLinkedDataEvent,
    resolveEvent,
    getItemDataIndex,
    queryDataIndex,
    countDataIndex,
    // makeDataStreamId: makeStreamId,
    // getLastDataEventSequenceNumber: getLastDataEvent
};
