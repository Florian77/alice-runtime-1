const dc = require("node-dev-console");
const R = require("ramda");
const {utility} = require("../../../../../../../index");


async function commandHandler(command, env) {
    // dc.j(command, "command")

    return utility.returnCmdError("custom error message")

}


module.exports = commandHandler;
