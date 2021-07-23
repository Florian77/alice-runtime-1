// -------------------------------------------------------------------------
// ALICE-RUNTIME:TEMPLATE:cmd-import-payload:VERSION:0.0.1
// -------------------------------------------------------------------------

const ftDev = require("ftws-node-dev-tools");
const {jsonString} = ftDev;
const R = require("ramda");
const {parse} = require('query-string/index');

// process.env.DEV_CONSOLE_ON = 1
const dc = require("node-dev-console");
dc.showMessageIsOn();

const getContext = R.propOr(null, "context");
const getAggregate = R.propOr(null, "aggregate");
const getCommand = R.propOr(null, "command");
const get_id = R.propOr("ERROR-MISSING-DATA", "_id");

// LOG / DEBUG

const updateOnChange = async (command, env) => {
    console.log("handle command [id=%s]", get_id(command));
    // dc.l("command data", ftDev.jsonString(command));

    // TODO -> Add command schema check

    const {id} = parse(command.invokeId);

    // ---------------------------------------------------------------------------------
    // make -> this Aggregate
    const this_Aggregate = {
        context: command.context,
        aggregate: command.aggregate,
        aggregateId: `id=${id}`
    };
    // dc.l("this_Aggregate", jsonString(this_Aggregate));

    const newData = {
        ...this_Aggregate,
        payload: {
            ...command.payload
        }
    };
    // dc.l("newData", jsonString(newData));

    // throw Error("WHAT!!!");

    // ---------------------------------------------------------------------------------
    // store -> new Data
    const result = await env.storeDataEventOnPayloadChange(newData);
    // dc.l("env.storeDataEventOnPayloadChange(%s).result", jsonString(newData), jsonString(result));


    // ---------------------------------------------------------------------------------
    // return -> command result
    return {
        ok: true,
        resultMsg: [
            {
                dataChanged: result,
            }
        ],
        // paused: true,
        // pausedAt: new Date(),
    };

};


module.exports = updateOnChange;