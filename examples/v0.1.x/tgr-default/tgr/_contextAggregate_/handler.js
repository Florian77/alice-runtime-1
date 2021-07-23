// -------------------------------------------------------------------------
// ALICE-RUNTIME:TEMPLATE:tgr-default:VERSION:0.0.2
// -------------------------------------------------------------------------

const dc = require("node-dev-console");
const {utility: u} = require("alice-runtime");
const R = require("ramda");


const _contextAggregate__Trigger = async (event, env) => {
    dc.l("event data", dc.stringify(event));

    const command = {
        context: "_THIS_CONTEXT_",
        aggregate: "_THIS_AGGREGATE_",
        command: "_THIS_COMMAND_",
        invokeId: u.getAggregateId(event),
        // priority: 0,
        // paused: true,
        payload: {
            ...(u.parseAggregateId(event))
        },
    };

    const result = await env.emitMultiCommand(command);
    dc.l("env.emitMultiCommand(%s).result", dc.stringify(command), dc.stringify(result));

    return true;
};


module.exports = _contextAggregate__Trigger;
