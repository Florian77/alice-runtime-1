// -------------------------------------------------------------------------
// ALICE-RUNTIME:TEMPLATE:cmd-import-payload:VERSION:0.1.0
// -------------------------------------------------------------------------
const dc = require("node-dev-console");
const {utility: u} = require("../../../../../../../../index");
const R = require("ramda");


const updateOnChange_Command = async (command, env) => {
    // dc.l("command data", dc.stringify(command));

    const {id} = u.parseInvokeId(command);
    // dc.t(id, "id");

    let counter;
    // ---------------------------------------------------------------------------------
    // Load -> parent Aggregate
    const parent_DataEvent = await env.getLastDataEvent({
        context: "CONTEXT",
        aggregate: "aggregate",
        aggregateId: u.getInvokeId(command),
    });
    if (parent_DataEvent !== false) { // -> u.aggregateExists()
        const parent_Payload = u.getPayload(parent_DataEvent);
        counter = parent_Payload.counter + 1;
    }
    else {
        counter = 1;
    }
    // dc.t(counter, "counter");

    // ---------------------------------------------------------------------------------
    // store -> Data
    const result = await env.storeDataEventOnPayloadChange({
        context: "CONTEXT",
        aggregate: "aggregate",
        aggregateId: u.stringifyId("id", id),
        payload: {
            counter
        },
        index: {
            id
        }
    });


    let subscription = u.getSubscription(command);
    // dc.j(subscription, "subscription before");

    const returnSubscription = R.propOr(null, "returnSubscription", u.getPayload(command));
    // dc.j(returnSubscription, "returnSubscription");
    if(!R.isNil(returnSubscription)) {
        subscription = returnSubscription;
    }

    // dc.j(subscription, "subscription after");

    return u.returnCmdSuccess({
        dataHasChanged: result,
    }, {
        subscription,
    });

};


module.exports = updateOnChange_Command;
