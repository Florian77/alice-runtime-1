const dc = require("node-dev-console");
const R = require("ramda");


async function commandHandler(command, env) {
    // dc.j(command, "command")

    throw Error("custom error message");

}


module.exports = commandHandler;
