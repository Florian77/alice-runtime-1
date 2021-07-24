const dc = require("node-dev-console");
const R = require("ramda");
const {getCollectionDataIndex} = require("./database");
const {getCollectionCommandIndex} = require("./database");
const {getCollectionTriggerIndex} = require("./database");


const hasValue = v => v && !R.isEmpty(v);


async function dashboard_queryDataIndex({
                                            context = "",
                                            aggregate = "",
                                            indexFilter = "",
                                        } = {},
                                        {
                                            page = 0,
                                            rowsPerPage = 50,
                                            getCount = false
                                        } = {}) {
    // ftDev.log("dashboard_queryDataIndex().args", dc.stringify({context, aggregate, indexFilter}));

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
    // ftDev.log("dashboard_queryDataIndex().query.skip(%s)", skip, dc.stringify(query));
    if (getCount === true) {
        const result = await getCollectionDataIndex().countDocuments(query);
        // dcl("dashboard_queryDataIndex().result", dc.stringify(result));
        return result;
    }

    const result = await getCollectionDataIndex().find(query).skip(skip).limit(Number(rowsPerPage)).toArray();
    // dc.l("dashboard_queryDataIndex().result", dc.stringify(result));
    return result;
}


async function dashboard_queryCommandIndex({
                                               context = "",
                                               aggregate = "",
                                               indexFilter = "",
                                           } = {},
                                           {
                                               page = 0,
                                               rowsPerPage = 50,
                                               getCount = false
                                           } = {}) {
    // dc.l("dashboard_queryCommandIndex().args", dc.stringify({context, aggregate, indexFilter}));

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
    // ftDev.log("dashboard_queryDataIndex().query.skip(%s)", skip, dc.stringify(query));
    if (getCount === true) {
        const result = await getCollectionCommandIndex().countDocuments(query);
        // dcl("dashboard_queryDataIndex().result", dc.stringify(result));
        return result;
    }

    // dc.l("dashboard_queryCommandIndex().query", dc.stringify(query));
    const result = await getCollectionCommandIndex().find(query).skip(skip).limit(Number(rowsPerPage)).toArray();
    // dc.l("dashboard_queryCommandIndex().result", dc.stringify(result));
    return result;
}


async function dashboard_queryTriggerIndex({
                                               context = "",
                                               aggregate = "",
                                               indexFilter = "",
                                           } = {},
                                           {
                                               page = 0,
                                               rowsPerPage = 50,
                                               getCount = false
                                           } = {}) {
    // dc.l("dashboard_queryTriggerIndex().args", dc.stringify({context, aggregate, indexFilter}));

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
    // ftDev.log("dashboard_queryDataIndex().query.skip(%s)", skip, dc.stringify(query));
    if (getCount === true) {
        const result = await getCollectionTriggerIndex().countDocuments(query);
        // dcl("dashboard_queryDataIndex().result", dc.stringify(result));
        return result;
    }

    // dc.l("dashboard_queryTriggerIndex().query", dc.stringify(query));
    const result = await getCollectionTriggerIndex().find(query).skip(skip).limit(Number(rowsPerPage)).toArray();
    // dc.l("dashboard_queryTriggerIndex().result", dc.stringify(result));
    return result;
}


module.exports = {
    dashboard_queryDataIndex,
    dashboard_queryCommandIndex,
    dashboard_queryTriggerIndex,
};
