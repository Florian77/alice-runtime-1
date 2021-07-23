const ftDev = require("ftws-node-dev-tools");
const {jsonString} = ftDev;
const R = require("ramda");
const _MODULE = require("./module");

const getCommandId = R.propOr("ERROR-MISSING-DATA", "_id");
const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");

// LOG / DEBUG
const _logger = require('debug')(_MODULE.namespace);
const log = _logger.extend('log');
const debug = _logger.extend('debug');

const updateOnChange = async (command, env) => {
    log("start command [id=%s]", getCommandId(command));
    debug("command data", ftDev.jsonString(command));

    const {context, aggregate, payload} = command;
    const {sku, data} = payload;
    const aggregateId = `sku=${sku}`;

    const lastEventQuery = {
        context,
        aggregate,
        aggregateId,
    };
    debug("env.getLastDataEvent(%s)", jsonString(lastEventQuery));

    const lastEvent = await env.getLastDataEvent(lastEventQuery);
    debug("env.getLastDataEvent().result", jsonString(lastEvent));

    // ftDev.logJsonString(R.equals({a: "NAME", b: {a: "X"}}, {b: {a: "1X"}, a: "NAME"}), 'TEST');
    // Event Exists
    if(lastEvent !== false) {
        log("found last event [id=%s]", getEventId(lastEvent));

        const lastData = R.pathOr({}, ["payload"], lastEvent);

        if(R.equals(data, lastData)) {
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
            ...data
        }
    };
    debug("env.storeDataEvent(%s)", jsonString(storeEvent));
    const storeEventResult = await env.storeDataEvent(storeEvent);
    debug("env.storeDataEvent().result", jsonString(storeEventResult));


    return {
        ok: true
    };
};


module.exports = updateOnChange;