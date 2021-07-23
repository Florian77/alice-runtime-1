const dc = require("node-dev-console");
const u = require("../../../../lib/utility");
const R = require("ramda");
const {calcMetaData} = require("../_lib");


function recalc_Command({
                            context,
                            aggregate,
                            entityValue,
                        }) {

    return async (command, env) => {
        // dc.j(command, "recalc_Command.command");


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

        const payload = u.getPayload(entity_DataEvent);
        // dc.j(payload, "entity_DataEvent payload");

        // ---------------------------------------------------------------------------------
        // create empty entity
        let entityData = {};
        for (let {code, type} of entityValue.fieldList) {
            // todo -> set default value depending on type
            entityData[code] = R.propOr("", code, payload);
        }
        // dc.j(entityData, "entityData");

        // ---------------------------------------------------------------------------------
        // calc meta data
        const entityMetaData = calcMetaData(entityValue, entityData);

        // ---------------------------------------------------------------------------------
        // store -> Data
        const result = await env.storeDataEventOnPayloadChange({
            context,
            aggregate,
            aggregateId: invokeId,
            payload: {
                ...entityData,
                ...entityMetaData,
            },
            index: {
                deleted: false,
                ...entityMetaData,
                ...parsedInvokeId,
            }
        });

        return u.returnCmdSuccess({
            dataHasChanged: result,
        });

    };
}

module.exports = recalc_Command;
