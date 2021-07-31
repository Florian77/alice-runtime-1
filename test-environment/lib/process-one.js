const dc = require("node-dev-console");
const alice = require("../../index");


async function processOne(functionPath, config = {}) {

    const processOneResult = await alice.process({
        ...config,
        functionPath,
        maxProcessCycles: 1,
        maxProcessCommands: 1,
    });
    // dc.j(processOneResult, "Process One Result");

    return processOneResult;
}


module.exports = {
    processOne,
};
