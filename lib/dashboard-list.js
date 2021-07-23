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
    // ftDev.log("getDataIndex().args", dc.stringify({context, aggregate, indexFilter}));

    let query = {
        ...(hasValue(indexFilter) && R.is(Object, indexFilter) ? indexFilter : {})
    };
    if (hasValue(context)) {
        query['context'] = context;
    }
    if (hasValue(aggregate)) {
        query['aggregate'] = aggregate;
    }
    // dc.j(query, 'query');

    const skip = Number(page) * Number(rowsPerPage);
    // ftDev.log("getDataIndex().query.skip(%s)", skip, dc.stringify(query));
    if (getCount === true) {
        const result = await getCollectionDataIndex().countDocuments(query);
        // dcl("getDataIndex().result", dc.stringify(result));
        return result;
    }

    const result = await getCollectionDataIndex().find(query).skip(skip).limit(Number(rowsPerPage)).toArray();
    // dc.l("getDataIndex().result", dc.stringify(result));
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
    // dc.l("getCommandIndex().args", dc.stringify({context, aggregate, indexFilter}));

    let query = {
        ...(hasValue(indexFilter) && R.is(Object, indexFilter) ? indexFilter : {})
    };
    if (hasValue(context)) {
        query['context'] = context;
    }
    if (hasValue(aggregate)) {
        query['aggregate'] = aggregate;
    }
    // dc.j(query, 'query');

    const skip = Number(page) * Number(rowsPerPage);
    // ftDev.log("getDataIndex().query.skip(%s)", skip, dc.stringify(query));
    if (getCount === true) {
        const result = await getCollectionCommandIndex().countDocuments(query);
        // dcl("getDataIndex().result", dc.stringify(result));
        return result;
    }

    // dc.l("getCommandIndex().query", dc.stringify(query));
    const result = await getCollectionCommandIndex().find(query).skip(skip).limit(Number(rowsPerPage)).toArray();
    // dc.l("getCommandIndex().result", dc.stringify(result));
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
    // dc.l("getTriggerIndex().args", dc.stringify({context, aggregate, indexFilter}));

    let query = {
        ...(hasValue(indexFilter) && R.is(Object, indexFilter) ? indexFilter : {})
    };
    if (hasValue(context)) {
        query['context'] = context;
    }
    if (hasValue(aggregate)) {
        query['aggregate'] = aggregate;
    }
    // dc.j(query, 'query');

    const skip = Number(page) * Number(rowsPerPage);
    // ftDev.log("getDataIndex().query.skip(%s)", skip, dc.stringify(query));
    if (getCount === true) {
        const result = await getCollectionTriggerIndex().countDocuments(query);
        // dcl("getDataIndex().result", dc.stringify(result));
        return result;
    }

    // dc.l("getTriggerIndex().query", dc.stringify(query));
    const result = await getCollectionTriggerIndex().find(query).skip(skip).limit(Number(rowsPerPage)).toArray();
    // dc.l("getTriggerIndex().result", dc.stringify(result));
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
    // dc.l("contextAggregatePipeline(pipeline:%s)", dc.stringify(pipeline));
    let result = await collection.aggregate(pipeline).toArray();
    // dc.l("contextAggregatePipeline().result", dc.stringify(result));
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
