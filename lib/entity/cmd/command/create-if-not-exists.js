const dc = require("node-dev-console");
const u = require("../../../../lib/utility");
const R = require("ramda");
const {calcMetaData} = require("../_lib");

function createIfNotExists_Command({
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

        // todo -> check invokeId match entityId config

        // ---------------------------------------------------------------------------------
        // load entity
        const entity_DataEvent = await env.getLastDataEvent({
            context,
            aggregate,
            aggregateId: invokeId,
        });
        // dc.j(entity_DataEvent, "entity_DataEvent");
        // dc.t(u.aggregateExists(entity_DataEvent), "u.aggregateExists(entity_DataEvent)");

        // if exists -> return without action + msg -> "entity already exists"
        if (u.aggregateExists(entity_DataEvent)) {
            if (u.isMultiInvokeCommand(command)) {
                return u.returnCmdSuccess({
                    entityExists: true,
                    dataHasChanged: false,
                    msg: "entity already exists"
                });
            }
            return u.returnCmdError("entity already exists");
        }

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
        // store entity
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

        // ---------------------------------------------------------------------------------
        return u.returnCmdSuccess({
            entityExists: false,
            dataHasChanged: result,
            msg: "entity created"
        });
    };

}


module.exports = createIfNotExists_Command;
