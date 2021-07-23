const ftDev = require("ftws-node-dev-tools");
const R = require("ramda");

const getCommandId = R.propOr("ERROR-MISSING-DATA", "_id");
const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");

const _logger = require('debug')('test:trigger:emptyTrigger');
const log = _logger.extend('log');
const debug = _logger.extend('debug');



const emptyTrigger = async (event, env) => {
    log("start processing event [id=%s]", getEventId(event));
    debug("event data", ftDev.jsonString(event));


    return true;
};


module.exports = emptyTrigger;
