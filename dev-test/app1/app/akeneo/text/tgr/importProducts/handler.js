const ftDev = require("ftws-node-dev-tools");
const R = require("ramda");
const _MODULE = require("./module");

const getId = R.propOr("ERROR-MISSING-DATA", "_id");

// LOG / DEBUG
const _logger = require('debug')(_MODULE.namespace);
const log = _logger.extend('log');
const debug = _logger.extend('debug');

const importProducts = async (event, env) => {
    log("start trigger [eventId=%s]", getId(event));
    debug("event data", ftDev.jsonString(event));

    const command = {
        context: "akeneo",
        aggregate: "text",
        command: "makeAggregate",
        invokeId: event.aggregateId,
        payload: {
            aggregateId: event.aggregateId
        },
    };
    debug("env.emitMultiCommand(%s)", ftDev.jsonString(command));
    const result = await env.emitMultiCommand(command);
    debug("env.emitMultiCommand().result", ftDev.jsonString(result));

    return true;
};


module.exports = importProducts;
