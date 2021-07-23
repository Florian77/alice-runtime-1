// -------------------------------------------------------------------------
// ALICE-RUNTIME:TEMPLATE:cmd-import-payload:VERSION:0.1.0
// -------------------------------------------------------------------------
const dc = require("node-dev-console");
const {utility: u} = require("../../../../../../../../index");
const R = require("ramda");


const updateOnChange_Command = async (command, env) => {
    // dc.l("command data", dc.stringify(command));

    const {returnResult = true, returnMessage = "message"} = u.getPayload(command);

    if (returnResult) {
        return u.returnCmdSuccess(returnMessage);
    }
    else {
        return u.returnCmdError(returnMessage);
    }

};


module.exports = updateOnChange_Command;