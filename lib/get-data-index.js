const dc = require("node-dev-console");
const R = require("ramda");
const {mergeIndexAndEvent} = require("./helper/merge-index-and-event");
const {makeStreamId} = require("./helper/make-stream-id");
const {getCollectionDataIndex} = require("./database");
const {getLastDataEvent} = require("./get-last-data-event")


async function getDataIndex({
                                    context,
                                    aggregate,
                                    aggregateId,
                                }, {
                                    getLastEvent = false
                                    // TODO -> getEventStream = false
                                } = {}) {
    const query = {
        _id: makeStreamId({context, aggregate, aggregateId}),
    };
    // dc.l("getDataEvent().findOne(%s)", dc.stringify(query));
    const result = await getCollectionDataIndex().findOne(query);
    // dc.l("getDataEvent().findOne().result", dc.stringify(result));

    if (R.isNil(result)) {
        return false;
    }

    if (!getLastEvent) {
        return result;
    }

    return mergeIndexAndEvent(
        result,
        await getLastDataEvent(result)
    );
}

// TODO -> getNextDataIndex


module.exports = {
    getDataIndex,
};
