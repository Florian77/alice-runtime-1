// -------------------------------------------------------------------------
// ALICE-RUNTIME:TEMPLATE:cmd-import-payload:VERSION:0.0.2
// -------------------------------------------------------------------------

const dc = require("node-dev-console");
const {utility: u} = require("@florian77/alice-runtime");

const R = require("ramda");


const updateOnChange_Command = async (command, env) => {
    dc.l("command data", dc.stringify(command));

    // TODO -> Add command schema check

    const {_THIS_ITEM_ID_FIELD_} = u.parseInvokeId(command);

    // ---------------------------------------------------------------------------------
    // make -> this Aggregate
    const this_Aggregate = {
        context: u.getContext(command),
        aggregate: u.getAggregate(command),
        aggregateId: u.stringifyId(
            ["_THIS_ITEM_ID_FIELD_"],
            {_THIS_ITEM_ID_FIELD_}
        ),
    };
    dc.l("this_Aggregate", dc.stringify(this_Aggregate));

    const newData = {
        ...this_Aggregate,
        payload: {
            ...u.getPayload(command)
        },
        index: {
            _THIS_ITEM_ID_FIELD_
        }
    };
    dc.l("newData", dc.stringify(newData));


    // ---------------------------------------------------------------------------------
    // store -> new Data
    const result = await env.storeDataEventOnPayloadChange(newData);
    dc.l("env.storeDataEventOnPayloadChange(%s).result", dc.stringify(newData), dc.stringify(result));


    // ---------------------------------------------------------------------------------
    return u.returnCmdSuccess({
        dataChanged: result,
    });

};


module.exports = updateOnChange_Command;