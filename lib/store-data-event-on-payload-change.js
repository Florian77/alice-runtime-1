const dc = require("node-dev-console");
const R = require("ramda");
const mapValues = require('lodash.mapvalues')
const sortAny = require('sort-any')
const {getLastDataEvent} = require("./get-last-data-event");
const u = require("./utility");
const {storeDataEvent} = require("./store-data-event")


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
    storeDataEventOnPayloadChange,
};
