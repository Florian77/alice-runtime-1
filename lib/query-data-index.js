const dc = require("node-dev-console");
const R = require("ramda");
const {mergeIndexAndEvent} = require("./helper/merge-index-and-event");
const {getCollectionDataIndex} = require("./database");
const {getLastDataEvent} = require("./get-last-data-event")


/**
 *
 * @param {Object} query
 * @param {boolean} getLastEvent
 * @param {number} skip
 * @param {number} limit
 * @param {object|null} sort
 * @return {Promise<[]|*>}
 */
async function queryDataIndex(query, {
    getLastEvent = false,
    // TODO -> getEventStream = false
    skip = 0,
    limit = 0,
    sort = null,
} = {}) {
    // dc.l("queryDataIndex().findOne(%s)", dc.stringify(query));

    // todo -> if getLastEvent === true -> use aggregate !

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
    // dc.l("queryDataIndex().find().indexResult.length", dc.stringify(query), R.length(indexResult));

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
}


module.exports = {
    queryDataIndex,
};
