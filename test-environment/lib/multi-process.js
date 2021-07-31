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


async function multiProcess(functionPath, processCount, config = {}) {

    const processConfig = {
        ...config,
        functionPath,
    };

    let totalResult = R.clone(emptyResult), runAgain;

    do {

        const resultList = await Promise.all(
            R.map(
                () => alice.process(processConfig),
                R.range(0, processCount)
            )
        );
        // dc.j(resultList, "resultList");

        const processResult = R.reduce(addResults, emptyResult, resultList);

        runAgain = someThingProcessed(processResult);
        if (runAgain) {
            totalResult = addResults(totalResult, processResult);
        }
    } while (runAgain);

    return totalResult;
}


module.exports = {
    multiProcess,
};
