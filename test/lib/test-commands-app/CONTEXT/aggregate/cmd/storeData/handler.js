const dc = require("node-dev-console");
const R = require("ramda");
const {utility} = require("../../../../../../../index");


async function commandHandler(command, env) {
    // dc.j(command, "command")

    const {id = 0} = utility.parseInvokeId(command);

    await env.storeDataEvent({
        context: "CONTEXT",
        aggregate: "aggregate",
        aggregateId: utility.stringifyId("id", id),
        payload: {
            ...utility.getPayload(command),
        },
    });

    return utility.returnCmdSuccess("data stored");
}


module.exports = commandHandler;
