const dc = require("node-dev-console");
const R = require("ramda");
const {makeStreamId} = require("./helper/make-stream-id");
const {getCollectionDataStream} = require("./database");


async function getDataEvent({
                                context = null,
                                aggregate = null,
                                aggregateId = null,
                                sequenceNumber = 0,
                                eventId = null,
                            }) {

    // todo -> validate input

    let query;
    if (R.isNil(eventId)) {
        query = {
            // streamId: makeStreamId({context, aggregate, aggregateId}),
            context,
            aggregate,
            aggregateId,
            sequenceNumber,
        };
    } else {
        query = {
            _id: eventId
        };
    }

    // todo -> add try catch ???

    // dcl("getDataEvent().findOne(%s)", dc.stringify(query));
    const result = await getCollectionDataStream().findOne(query);
    // dcl("getDataEvent().findOne().result", dc.stringify(result));

    if (R.isNil(result)) {
        return false;
    }

    return result;
}


// todo -> remove if event is not longer split

async function loadLinkedDataEvent(event) {
    const query = {
        _id: R.propOr(null, "linkEventId", event)
    };
    // dcl("loadLinkedDataEvent().findOne(%s)", dc.stringify(query));
    const result = await getCollectionDataStream().findOne(query);
    // dcl("loadLinkedDataEvent().findOne().result", dc.stringify(result));
    return result;
}


// todo -> remove if event is not longer split

async function resolveEvent(event) {
    return R.has("linkEventId", event) ? await loadLinkedDataEvent(event) : event;
}


module.exports = {
    getDataEvent,
    loadLinkedDataEvent,
    resolveEvent,
};
