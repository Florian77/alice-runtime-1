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

const syncMongoAkeneoText = async (command, env) => {
    log("start command [id=%s]", getCommandId(command));
    debug("command data", ftDev.jsonString(command));

    const {context, aggregate, payload} = command;
    const {aggregateId} = payload;
    debug("aggregateId", jsonString(aggregateId));
    const {sku} = parse(aggregateId);
    debug("sku", sku);
    debug("[sku=%s]", sku);

    // Load aggregate akeneo/text
    const lastEventQuery = {
        context,
        aggregate,
        aggregateId,
    };
    debug("env.getLastDataEvent(%s)", jsonString(lastEventQuery));

    const lastEvent = await env.getLastDataEvent(lastEventQuery);
    debug("env.getLastDataEvent().result", jsonString(lastEvent));

    const data = R.propOr({}, "payload", lastEvent);
    debug("data", jsonString(data));


    // Store Data in Mongo
    const filter = {
        _id: sku,
    };
    const replace = {
        ...data
    };
    const options = {
        upsert: true
    };
    debug("replaceOne(filter:%s, replace:%s, options:%s)", ftDev.jsonString(filter), ftDev.jsonString(replace), ftDev.jsonString(options));
    const result = await env.getCollectionView("AkeneoText").replaceOne(filter, replace, options);
    log("data synced [sku=%s]", sku);
    debug("replaceOne()", ftDev.mongoReplaceOne(result), ftDev.jsonString(result));

    // TODO -> React on deleted Event -> delete row


    return {
        ok: true
    };
};


module.exports = syncMongoAkeneoText;
