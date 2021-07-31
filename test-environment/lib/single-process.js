const dc = require("node-dev-console");
const R = require('ramda');
const alice = require("../../index");
const {someThingProcessed} = require("./helper/some-thing-processed");


const emptyResult = {
    processedCycles: 0,
    executionTime: 0,
    totalProcessedCommands: 0,
    totalsDispatchedEvents: 0,
    totalProcessedTrigger: 0,
    totalProcessedEvents: 0,
};


function addResults(a, b) {
    return {
        processedCycles: a.processedCycles + b.processedCycles,
        executionTime: a.executionTime + b.executionTime,
        totalProcessedCommands: a.totalProcessedCommands + b.totalProcessedCommands,
        totalsDispatchedEvents: a.totalsDispatchedEvents + b.totalsDispatchedEvents,
        totalProcessedTrigger: a.totalProcessedTrigger + b.totalProcessedTrigger,
        totalProcessedEvents: a.totalProcessedEvents + b.totalProcessedEvents,
    };
}


async function singleProcess(functionPath, config = {}) {

    let totalResult = R.clone(emptyResult), runAgain;

    do {
        const processResult = await alice.process({
            ...config,
            functionPath,
        });
        runAgain = someThingProcessed(processResult);
        if (runAgain) {
            totalResult = addResults(totalResult, processResult);
        }
    } while (runAgain);

    return totalResult;
}


module.exports = {
    singleProcess,
};
