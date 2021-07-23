const dc = require("node-dev-console");
const u = require("../../../../lib/utility");
const R = require("ramda");
const {calcMetaData} = require("../_lib");


function updateOnChange_Command({
                                    context,
                                    aggregate,
                                    entityValue,
                                }) {

    return async (command, env) => {
        // dc.j(command, "command");

        const invokeId = u.getInvokeId(command);
        // dc.t(invokeId, "invokeId");

        const parsedInvokeId = u.parseInvokeId(command);
        // dc.j(parsedInvokeId, "parsedInvokeId");

        const payload = u.getPayload(command);
        // dc.j(payload, "command payload");

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

module.exports = updateOnChange_Command;
