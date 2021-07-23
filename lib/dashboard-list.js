const ftDev = require("ftws-node-dev-tools");
const {jsonString} = ftDev;
const {getCollectionDataStream} = require("./database");
const {getCollectionDataIndex} = require("./database");
const {getCollectionCommandIndex} = require("./database");
const {getCollectionTriggerIndex} = require("./database");
const {
    getDataContextAggregateList,
    getCommandContextAggregateList,
    getTriggerContextAggregateList,
} = require("./upsert-stats");
const R = require("ramda");

// process.env.DEV_CONSOLE_ON = 1;
const dc = require("node-dev-console");

const hasValue = v => v && !R.isEmpty(v);

const _logger = require('debug')('alice:dashboardStats');
const log = _logger.extend('log');
const debug = _logger.extend('debug');

// ---------------------------------------------------------------------------------
const getDataIndex = async ({
                                context = "",
                                aggregate = "",
                                indexFilter = "",
                            } = {},
                            {
                                page = 0,
                                rowsPerPage = 50,
                                getCount = false
                            } = {}) => {
    // ftDev.log("getDataIndex().args", jsonString({context, aggregate, indexFilter}));

    let query = {
        ...(hasValue(indexFilter) && R.is(Object, indexFilter) ? indexFilter : {})
    };
    if (hasValue(context)) {
        query['context'] = context;
    }
    if (hasValue(aggregate)) {
        query['aggregate'] = aggregate;
    }
    // ftDev.logJsonString(query, 'query');

    const skip = Number(page) * Number(rowsPerPage);
    // ftDev.log("getDataIndex().query.skip(%s)", skip, jsonString(query));
    if (getCount === true) {
        const result = await getCollectionDataIndex().countDocuments(query);
        debug("getDataIndex().result", jsonString(result));
        return result;
    }

    const result = await getCollectionDataIndex().find(query).skip(skip).limit(Number(rowsPerPage)).toArray();
    // debug("getDataIndex().result", jsonString(result));
    return result;
};

// ---------------------------------------------------------------------------------
const getCommandIndex = async ({
                                   context = "",
                                   aggregate = "",
                                   indexFilter = "",
                               } = {},
                               {
                                   page = 0,
                                   rowsPerPage = 50,
                                   getCount = false
                               } = {}) => {
    // debug("getCommandIndex().args", jsonString({context, aggregate, indexFilter}));

    let query = {
        ...(hasValue(indexFilter) && R.is(Object, indexFilter) ? indexFilter : {})
    };
    if (hasValue(context)) {
        query['context'] = context;
    }
    if (hasValue(aggregate)) {
        query['aggregate'] = aggregate;
    }
    // ftDev.logJsonString(query, 'query');

    const skip = Number(page) * Number(rowsPerPage);
    // ftDev.log("getDataIndex().query.skip(%s)", skip, jsonString(query));
    if (getCount === true) {
        const result = await getCollectionCommandIndex().countDocuments(query);
        debug("getDataIndex().result", jsonString(result));
        return result;
    }

    // debug("getCommandIndex().query", jsonString(query));
    const result = await getCollectionCommandIndex().find(query).skip(skip).limit(Number(rowsPerPage)).toArray();
    // debug("getCommandIndex().result", jsonString(result));
    return result;
};


// ---------------------------------------------------------------------------------
const getTriggerIndex = async ({
                                   context = "",
                                   aggregate = "",
                                   indexFilter = "",
                               } = {},
                               {
                                   page = 0,
                                   rowsPerPage = 50,
                                   getCount = false
                               } = {}) => {
    // debug("getTriggerIndex().args", jsonString({context, aggregate, indexFilter}));

    let query = {
        ...(hasValue(indexFilter) && R.is(Object, indexFilter) ? indexFilter : {})
    };
    if (hasValue(context)) {
        query['context'] = context;
    }
    if (hasValue(aggregate)) {
        query['aggregate'] = aggregate;
    }
    // ftDev.logJsonString(query, 'query');

    const skip = Number(page) * Number(rowsPerPage);
    // ftDev.log("getDataIndex().query.skip(%s)", skip, jsonString(query));
    if (getCount === true) {
        const result = await getCollectionTriggerIndex().countDocuments(query);
        debug("getDataIndex().result", jsonString(result));
        return result;
    }

    // debug("getTriggerIndex().query", jsonString(query));
    const result = await getCollectionTriggerIndex().find(query).skip(skip).limit(Number(rowsPerPage)).toArray();
    // debug("getTriggerIndex().result", jsonString(result));
    return result;
};

// ---------------------------------------------------------------------------------
const contextAggregatePipeline = async (collection) => {
    const pipeline = [
        {
            $group: {
                _id: {
                    context: "$context",
                    aggregate: "$aggregate",
                }
            }
        },
        {
            "$project": {
                _id: 0,
                "context": "$_id.context",
                "aggregate": "$_id.aggregate"
            }
        },
    ];
    // debug("contextAggregatePipeline(pipeline:%s)", jsonString(pipeline));
    let result = await collection.aggregate(pipeline).toArray();
    // debug("contextAggregatePipeline().result", jsonString(result));
    return result;
};

// ---------------------------------------------------------------------------------
module.exports = {
    getDataIndex,
    getCommandIndex,
    getTriggerIndex,
    getDataContextAggregateList,
    getCommandContextAggregateList,
    getTriggerContextAggregateList,
};
