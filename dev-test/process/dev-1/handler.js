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

const updateOnChange = async function* (command, env) {
    console.log("handle command [id=%s]", get_id(command));
    // dc.l("command data", ftDev.jsonString(command));

    // TODO -> Add command schema check

    const {id} = parse(command.invokeId);

    const cmdResult = yield env.callback('callback-key').emitCommand({
        context: "CNTXT",
        aggregate: "aggt",
        command: "asyncTask",
        invokeId: command.invokeId,
        payload: {
            id,
        },
        timeout: "20m",
    });

    dc.l("cmdResult: %s", cmdResult);

    if(cmdResult.ok) {
        dc.l("OKAY");
    }
    else {
        dc.l("NOT OKAY");
    }


    // ---------------------------------------------------------------------------------
    // return -> command result
    return {
        ok: true,
        // resultMsg: [
        //     {
        //         dataChanged: result,
        //     }
        // ],
        // paused: true,
        // pausedAt: new Date(),
    };

};


module.exports = updateOnChange;