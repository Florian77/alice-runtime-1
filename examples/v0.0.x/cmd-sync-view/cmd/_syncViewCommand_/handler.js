// -------------------------------------------------------------------------
// ALICE-RUNTIME:TEMPLATE:cmd-sync-view:VERSION:0.0.2
// -------------------------------------------------------------------------

const dc = require("node-dev-console");
const {utility: u} = require("@florian77/alice-runtime");
const R = require("ramda");


const _syncViewCommand__Command = async (command, env) => {
    dc.l("command data", dc.stringify(command));

    const {_THIS_ITEM_ID_FIELD_} = u.parseInvokeId(command);

    // ---------------------------------------------------------------------------------
    // Load -> this Aggregate
    const this_Aggregate = {
        context: "_THIS_CONTEXT_",
        aggregate: "_THIS_AGGREGATE_",
        aggregateId: u.getInvokeId(command),
    };
    dc.l("this_Aggregate", dc.stringify(this_Aggregate));
    const this_DataEvent = await env.getLastDataEvent(this_Aggregate);
    dc.l("env.getLastDataEvent(%s).result", dc.stringify(this_Aggregate), dc.stringify(this_DataEvent));
    // TODO -> Handle Aggregate not exists -> delete row
    const this_Data = u.getPayload(this_DataEvent);
    dc.l("this_Data", dc.stringify(this_Data));

    // Store Data in Mongo
    const filter = {
        _id: _THIS_ITEM_ID_FIELD_,
    };
    const replace = {
        ...this_Data
    };
    const options = {
        upsert: true
    };
    dc.l("replaceOne(filter:%s, replace:%s, options:%s)", dc.stringify(filter), dc.stringify(replace), dc.stringify(options));
    const result = await env.getCollectionView("_VIEW_NAME_").replaceOne(filter, replace, options);
    console.log("data synced [_THIS_ITEM_ID_FIELD_=%s]", _THIS_ITEM_ID_FIELD_);
    // dc.l("replaceOne()", ftDev.mongoReplaceOne(result), dc.stringify(result));

    const dataChanged = {
        ok: R.pathOr(-1, ["result", "ok"], result),
        modifiedCount: R.propOr(-1, "modifiedCount", result),
        upsertedId: R.propOr(-1, "upsertedId", result),
        upsertedCount: R.propOr(-1, "upsertedCount", result),
        matchedCount: R.propOr(-1, "matchedCount", result),
    };
    dc.j(dataChanged, "dataChanged");

    // ---------------------------------------------------------------------------------
    return u.returnCmdSuccess({
        dataChanged,
    });
};


module.exports = _syncViewCommand__Command;
