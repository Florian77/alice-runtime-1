const dc = require("node-dev-console");
const {utility: u} = require("../../../../../../../../index");
const R = require("ramda");
const {CTX1__AGGT1} = require("../../../../../app_aggregates");


async function commandHandler(command, env) {
    // dc.j(command, "command");


    const result = await env.storeDataEventOnPayloadChange({
        ...CTX1__AGGT1,
        aggregateId: u.getInvokeId(command),
        payload: {
            ...u.getPayload(command)
        },
    });


    return u.returnCmdSuccess({
        dataHasChanged: result,
    });

}


module.exports = commandHandler;
