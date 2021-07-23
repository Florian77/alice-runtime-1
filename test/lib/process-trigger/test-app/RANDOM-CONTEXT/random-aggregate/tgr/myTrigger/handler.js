const ftDev = require("ftws-node-dev-tools");
const R = require("ramda");

const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");

const _logger = require('debug')('test:trigger:myTrigger');
const log = _logger.extend('log');
const debug = _logger.extend('debug');

const myTrigger = async (event, env) => {
    log("start processing event [id=%s]", getEventId(event));
    debug("event data", ftDev.jsonString(event));

    /*const result = await env.emitCommand({
        context: "akeneo",
        aggregate: "product",
        command: "doSomeThing",
        invokeId: event.aggregateId,
        multiInvoke: true,
        payload: {
            myData: "important command"
        },
    });
    // if(debug.enabled) ftDev.logJsonString(result, "myTrigger().emitCommand().result");
    debug("myTrigger().emitCommand().result %s", ftDev.jsonString(result));*/


    return true;
};


module.exports = myTrigger;
