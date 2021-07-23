// -------------------------------------------------------------------------
// ALICE-RUNTIME:TEMPLATE:cmd-make-aggregate-1-on-1:VERSION:0.0.2
// -------------------------------------------------------------------------

const dc = require("node-dev-console");
const {utility: u} = require("alice-runtime");

const R = require("ramda");


const makeAggregate_Command = async (command, env) => {
    dc.l("command data", dc.stringify(command));

    const {_THIS_ITEM_ID_FIELD_} = u.parseInvokeId(command);

    // ---------------------------------------------------------------------------------
    // Load -> parent Aggregate
    const parent_Aggregate = {
        context: "_PARENT_CONTEXT_",
        aggregate: "_PARENT_AGGREGATE_",
        aggregateId: u.getInvokeId(command),
    };
    dc.l("parent_Aggregate", dc.stringify(parent_Aggregate));
    const parent_DataEvent = await env.getLastDataEvent(parent_Aggregate);
    // dc.l("env.getLastDataEvent(%s).result", dc.stringify(parent_Aggregate), dc.stringify(parent_DataEvent));
    // TODO -> Handle Aggregate not exists
    if (!parent_DataEvent) { // -> u.aggregateExists()
        // return u.returnCmdError("Aggregate [parent] not exists");
    }

    const parent_Data = u.getPayload(parent_DataEvent);
    dc.l("parent_Data", dc.stringify(parent_Data));


    // ---------------------------------------------------------------------------------
    // make -> this Aggregate
    const this_Aggregate = {
        context: "_THIS_CONTEXT_",
        aggregate: "_THIS_AGGREGATE_",
        aggregateId: u.getInvokeId(command),
    };
    dc.l("this_Aggregate", dc.stringify(this_Aggregate));

    // ---------------------------------------------------------------------------------
    // const transformedData = parent_Data.data + "-TRANSFORMED";
    // dc.l("transformedData", dc.stringify(transformedData));

    // ---------------------------------------------------------------------------------
    const newData = {
        ...this_Aggregate,
        payload: {
            ...parent_Data
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


module.exports = makeAggregate_Command;
