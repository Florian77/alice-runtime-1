// -------------------------------------------------------------------------
// ALICE-RUNTIME:TEMPLATE:tgr-default:VERSION:0.1.0
// -------------------------------------------------------------------------
const dc = require("node-dev-console");
const u = require("../../../lib/utility");
const R = require("ramda");

function self_Trigger({
                          context,
                          aggregate,
                      }) {
    return async (event, env) => {
        // dc.j(event, "event");

        {
            const result = await env.emitMultiCommand({
                context,
                aggregate,
                command: "recalc",
                invokeId: u.getAggregateId(event),
                // paused: true,
                backupCommand: true,
            });
            // dc.j(result, "trigger result");
        }
        {
            const result = await env.emitMultiCommand({
                context,
                aggregate,
                command: "backup",
                invokeId: u.getAggregateId(event),
                // paused: true,
            });
            // dc.j(result, "trigger result");
        }

        return true;
    };
}

function self_Trigger_Module({
                          context,
                          aggregate,
                      }) {
    return {
        "context": context,
        "aggregate": aggregate,
        "trigger": "self",
        "streamContext": context,
        "streamAggregate": aggregate,
        "streamAggregateId": null,
        "lastSequenceNumber": -1,
    };
}


module.exports = {
    self_Trigger,
    self_Trigger_Module,
};
