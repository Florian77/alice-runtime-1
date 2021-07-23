const dc = require("node-dev-console");
const u = require("../../../../lib/utility");
const R = require("ramda");


function delete_Command({
                            context,
                            aggregate,
                        }) {

    return async (command, env) => {
        // dc.j(command, "command");

        const invokeId = u.getInvokeId(command);
        // dc.t(invokeId, "invokeId");

        const parsedInvokeId = u.parseInvokeId(command);
        // dc.j(parsedInvokeId, "parsedInvokeId");


        // ---------------------------------------------------------------------------------
        // load entity
        const entity_DataEvent = await env.getLastDataEvent({
            context,
            aggregate,
            aggregateId: invokeId,
        });
        // dc.j(entity_DataEvent, "entity_DataEvent");

        if (!u.aggregateExists(entity_DataEvent)) {
            return u.returnCmdError("entity not exists");
        }

        // ---------------------------------------------------------------------------------
        // store -> Data
        await env.storeDataEvent({
            context,
            aggregate,
            aggregateId: invokeId,
            event: "Deleted",
            payload: {},
            index: {
                deleted: true,
                ...parsedInvokeId,
            }
        });

        return u.returnCmdSuccess({
            dataHasChanged: true,
            msg: "entity deleted"
        });

    };
}

module.exports = delete_Command;
