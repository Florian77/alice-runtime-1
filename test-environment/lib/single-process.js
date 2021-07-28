const dc = require("node-dev-console");
const alice = require("../../index");
const {someThingProcessed} = require("./helper/some-thing-processed");


async function singleProcess(functionPath, config = {}) {
    let singleProcessResult, runAgain
    do {
        singleProcessResult = await alice.process({
            ...config,
            functionPath,
        })
        runAgain = someThingProcessed(singleProcessResult)
        if (runAgain) {
            dc.j(singleProcessResult, "Single Process Result");
        }
    } while (runAgain)
}


module.exports = {
    singleProcess,
};
