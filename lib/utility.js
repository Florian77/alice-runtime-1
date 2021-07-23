const R = require("ramda")
const dc = require("node-dev-console")
const {parse, stringify} = require('query-string/index')
const {wrapArray} = require("solid-robot")


/**
 * @typedef {Object} Command
 * @property {string} invokeId
 * @property {Object} payload
 */
/**
 * @typedef {Object} Aggregate
 * @property {string} aggregateId
 */


const get_id = R.propOr(null, "_id")
const getStreamId = R.propOr(null, "streamId")
const getContext = R.propOr(null, "context")
const getAggregate = R.propOr(null, "aggregate")
const getAggregateId = R.propOr(null, "aggregateId")
const getCommand = R.propOr(null, "command")
const getInvokeId = R.propOr(null, "invokeId")
const getUniqueId = R.propOr(null, "uniqueId")
const getVersion = R.propOr("", "version")
const getPayload = R.propOr({}, "payload")
const getPriority = R.propOr(0, "priority")
const getSequenceNumber = R.propOr(null, "sequenceNumber")
const getSubscription = R.propOr([], "subscription")
const isSubscriptionEmpty = R.pipe(getSubscription, R.isEmpty)
const getCallbackFrom = R.propOr([], "callbackFrom")
const isCallbackFromEmpty = R.pipe(getCallbackFrom, R.isEmpty)
const isMultiInvokeCommand = R.propEq("multiInvoke", true)
const aggregateExists = R.allPass([
    R.complement(R.equals(false)),
    R.complement(R.propEq("event", "Deleted"))
])


/**
 *
 * @param {object} event
 * @return {string}
 */
function makeSubscriptionId(event) {
    return `${getContext(event)}/${getAggregate(event)}?${getAggregateId(event)}`;
}

// todo -> add schema validation functions


/**
 *
 * @function stringifyId
 * @param {string|string[]} keyOrder
 * @param {Object|string|number} values
 * @return {string}
 */
function stringifyId(keyOrder, values) {
    if (R.is(String, keyOrder) && !R.is(Object, values)) {
        values = {
            [keyOrder]: values
        }
    }
    return R.pipe(
        // dc.r1,
        R.map(
            key => {
                if (!R.has(key, values)) {
                    throw Error(`stringifyId(): key [${key}] missing in values`)
                }
                return R.pick([key], values)
            }
        ),
        // dc.r2,
        R.map(stringify),
        // dc.r3,
        R.join("&"),
    )(wrapArray(keyOrder))
}


/**
 *
 * @function parseAggregateId
 * @param {Aggregate}
 * @return {Object}
 */
const parseAggregateId = R.pipe(
    getAggregateId,
    // dc.r1,
    parse,
    // dc.r2,
)


/**
 *
 * @function parseInvokeId
 * @param {Command}
 * @return {Object}
 */
const parseInvokeId = R.pipe(
    getInvokeId,
    // dc.r1,
    parse,
    // dc.r2,
)


/**
 *
 * @param {string|object|Array} message
 * @param {string|string[]} [subscription=[]]
 * @param {boolean} [warning=false]
 * @param {boolean} [paused=false]
 * @returns {{subscription: ([]|[*]), warning: boolean, ok: boolean, resultMsg: ([]|[*])}}
 */
function returnCmdSuccess(message = [], {subscription = [], warning = false, paused = false} = {}) {
    return {
        ok: true,
        warning,
        resultMsg: wrapArray(message),
        subscription: wrapArray(subscription),
        paused,
    }
}


/**
 * @param {string|object|Array} message
 * @param {string|string[]} [subscription=[]]
 * @param {boolean} [paused=false]
 * @returns {{subscription: ([]|[*]), ok: boolean, errorMsg: ([]|[*])}}
 */
function returnCmdError(message = [], {subscription = [], paused = false} = {}) {
    return {
        ok: false,
        errorMsg: wrapArray(message),
        subscription: wrapArray(subscription),
        paused,
    }
}

// TODO -> define and add returnCmdWarning -> question: add warning message array?


module.exports = {
    get_id,
    getStreamId,
    getContext,
    getAggregate,
    getAggregateId,
    getCommand,
    getInvokeId,
    getUniqueId,
    getVersion,
    getPayload,
    getPriority,
    getSubscription,
    getSequenceNumber,
    isSubscriptionEmpty,
    getCallbackFrom,
    isCallbackFromEmpty,
    isMultiInvokeCommand,
    aggregateExists,
    makeSubscriptionId,
    parse,
    parseAggregateId,
    parseInvokeId,
    stringify,
    stringifyId,
    returnCmdSuccess,
    returnCmdError,
}
