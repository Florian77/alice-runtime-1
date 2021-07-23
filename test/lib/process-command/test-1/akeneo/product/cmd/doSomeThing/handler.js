const ftDev = require("ftws-node-dev-tools");
const R = require("ramda");

const getCommandId = R.propOr("ERROR-MISSING-DATA", "_id");
const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");

const _logger = require('debug')('test:cmd:doSomeThing');
const log = _logger.extend('log');
const debug = _logger.extend('debug');


const doSomeThing = async (command, env) => {
    log("start processing command [id=%s]", getCommandId(command));
    debug("command data", ftDev.jsonString(command));

    if (R.pathEq(["payload", "returnError"], true, command)) {
        const errorMessage = R.pathOr(undefined, ["payload", "errorMessage"], command);
        log("found returnError [payload.errorMessage=%s]", errorMessage);
        return {
            ok: false,
            errorMsg: [
                "found returnError",
                errorMessage
            ]
        };
    }

    if (R.pathEq(["payload", "throwError"], true, command)) {
        const errorMessage = R.pathOr(undefined, ["payload", "errorMessage"], command);
        log("found throwError [payload.errorMessage=%s]", errorMessage);
        throw Error(errorMessage);
    }

    // env.command();
    const newEvent = {
        context: "akeneo",
        aggregate: "product",
        aggregateId: "sku:203040",
        payload: {
            superData: "YEAH!!!"
        }
    };
    debug("newEvent [object]", ftDev.jsonString(newEvent));
    const result = await env.storeDataEvent(newEvent);
    log("data event stored [id=%s]", getEventId(result));
    debug("storeDataEvent().result [object]", ftDev.jsonString(result));

    const returnState = {
        ok: true,
        subscription: [
            "newSubscription"
        ]
    };
    debug("returnState [object]", ftDev.jsonString(returnState));
    return returnState;
};


module.exports = doSomeThing;