const ftDev = require("ftws-node-dev-tools");
const {jsonString} = ftDev;
const R = require("ramda");
const {parse} = require('query-string/index');
const _MODULE = require("./module");

const getCommandId = R.propOr("ERROR-MISSING-DATA", "_id");
const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");

// LOG / DEBUG
const _logger = require('debug')(_MODULE.namespace);
const log = _logger.extend('log');
const debug = _logger.extend('debug');

const makeAggregate = async (command, env) => {
    log("start command [id=%s]", getCommandId(command));
    debug("command data", ftDev.jsonString(command));

    const {context, aggregate, payload} = command;
    const {aggregateId} = payload;
    debug("aggregateId", jsonString(aggregateId));
    const {sku} = parse(aggregateId);
    debug("sku", sku);

    // Load aggregate import-products
    const importProductsQuery = {
        context: "akeneo",
        aggregate: "import-products",
        aggregateId,
    };
    debug("env.getLastDataEvent(%s)", jsonString(importProductsQuery));
    const importProductsEvent = await env.getLastDataEvent(importProductsQuery);
    debug("env.getLastDataEvent().result", jsonString(importProductsEvent));

    const importData = R.propOr({}, "payload", importProductsEvent);
    debug("importData", jsonString(importData));

    const newData = {
        name: R.propOr("", "name", importData),
        description: R.propOr("", "description", importData),
    };
    debug("newData", jsonString(newData));

    const lastEventQuery = {
        context,
        aggregate,
        aggregateId,
    };
    debug("env.getLastDataEvent(%s)", jsonString(lastEventQuery));

    const lastEvent = await env.getLastDataEvent(lastEventQuery);
    debug("env.getLastDataEvent().result", jsonString(lastEvent));

    // Event Exists
    if(lastEvent !== false) {
        log("found last event [id=%s]", getEventId(lastEvent));

        const lastData = R.pathOr({}, ["payload"], lastEvent);

        if(R.equals(newData, lastData)) {
            log("aggregate exists - data not changed -> exit without update");
            return {
                ok: true
            };
        }
        log("aggregate exists - data changed -> update data");
    }
    else {
        log("aggregate not exists -> create data");
    }

    // Add Event
    const storeEvent = {
        context,
        aggregate,
        aggregateId,
        payload: {
            ...newData
        }
    };
    debug("env.storeDataEvent(%s)", jsonString(storeEvent));
    const storeEventResult = await env.storeDataEvent(storeEvent);
    debug("env.storeDataEvent().result", jsonString(storeEventResult));


    return {
        ok: true
    };
};


module.exports = makeAggregate;
