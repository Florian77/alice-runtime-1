require("package-that-not-exists-123");

throw Error("my Error");

async function commandHandler(command, env) {
    // dc.j(command, "command")

}


module.exports = commandHandler;
