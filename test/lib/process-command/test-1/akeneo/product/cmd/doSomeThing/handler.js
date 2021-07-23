const dc = require("node-dev-console");
const R = require("ramda");

const getCommandId = R.propOr("ERROR-MISSING-DATA", "_id");
const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");



const doSomeThing = async (command, env) => {
    dc.l("start processing command [id=%s]", getCommandId(command));
    dc.l("command data", dc.stringify(command));

    if (R.pathEq(["payload", "returnError"], true, command)) {
        const errorMessage = R.pathOr(undefined, ["payload", "errorMessage"], command);
        dc.l("found returnError [payload.errorMessage=%s]", errorMessage);
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
        dc.l("found throwError [payload.errorMessage=%s]", errorMessage);
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
    dc.l("newEvent [object]", dc.stringify(newEvent));
    const result = await env.storeDataEvent(newEvent);
    dc.l("data event stored [id=%s]", getEventId(result));
    dc.l("storeDataEvent().result [object]", dc.stringify(result));

    const returnState = {
        ok: true,
        subscription: [
            "newSubscription"
        ]
    };
    dc.l("returnState [object]", dc.stringify(returnState));
    return returnState;
};


module.exports = doSomeThing;
