const dc = require("node-dev-console");
const R = require("ramda");
const md5 = require('md5');
const {utility: u} = require("../../../../../../../../index");
const {CTX1__AGGT1} = require("../../../../../app_aggregates");
const {CTX1__AGGT2} = require("../../../../../app_aggregates");


const makeClusterId = R.pipe(
    R.toString,
    md5,
    R.slice(0, 1),
);


async function commandHandler(command, env) {
    // dc.j(command, "command");

    const {id} = u.parseInvokeId(command);
    // dc.t(id, "id");

    // ---------------------------------------------------------------------------------
    const aggt1_DataEvent = await env.getLastDataEvent({
        ...CTX1__AGGT1,
        aggregateId: u.stringifyId("id", id),
    });
    // dc.j(aggt1_DataEvent, "aggt1_DataEvent")
    if (!u.aggregateExists(aggt1_DataEvent)) {
        return u.returnCmdError("CTX1__AGGT1 aggregate not exists")
    }


    // ---------------------------------------------------------------------------------
    const clusterId = makeClusterId(id)


    // ---------------------------------------------------------------------------------
    const result = await env.storeDataEventOnPayloadChange({
        ...CTX1__AGGT2,
        aggregateId: u.getInvokeId(command),
        payload: {
            ...u.getPayload(aggt1_DataEvent),
            clusterId,
        },
        index: {
            clusterId,
        },
    });


    // ---------------------------------------------------------------------------------
    return u.returnCmdSuccess({
        dataHasChanged: result,
    });

}


module.exports = commandHandler;
