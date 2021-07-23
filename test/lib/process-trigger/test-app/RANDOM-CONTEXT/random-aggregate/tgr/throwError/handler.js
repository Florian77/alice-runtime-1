const ftDev = require("ftws-node-dev-tools");
const R = require("ramda");

const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");

const _logger = require('debug')('test:trigger:myTrigger');
const log = _logger.extend('log');
const debug = _logger.extend('debug');

const throwError = async (event, env) => {
    log("start processing event [id=%s]", getEventId(event));
    debug("event data", ftDev.jsonString(event));

    throw Error("my Error");

    // return true;
};


module.exports = throwError;
