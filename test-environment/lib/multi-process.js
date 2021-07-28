const dc = require("node-dev-console");
const alice = require("../../index");
const {someThingProcessed} = require("./helper/some-thing-processed");


async function multiProcess(functionPath, processCount, config = {}) {
    const processConfig = {
        ...config,
        functionPath,
    }
    let multiProcessResult, runAgain
    do {

        multiProcessResult = await Promise.all(
            R.map(
                () => alice.process(processConfig),
                R.range(0, processCount)
            )
        )
        multiProcessResult = R.reduce(
            (a, b) => ({
                processedCycles: a.processedCycles + b.processedCycles,
                executionTime: a.executionTime + b.executionTime,
                totalProcessedCommands: a.totalProcessedCommands + b.totalProcessedCommands,
                totalsDispatchedEvents: a.totalsDispatchedEvents + b.totalsDispatchedEvents,
                totalProcessedTrigger: a.totalProcessedTrigger + b.totalProcessedTrigger,
                totalProcessedEvents: a.totalProcessedEvents + b.totalProcessedEvents,
            }),
            {
                processedCycles: 0,
                executionTime: 0,
                totalProcessedCommands: 0,
                totalsDispatchedEvents: 0,
                totalProcessedTrigger: 0,
                totalProcessedEvents: 0,
            },
            multiProcessResult
        )
        runAgain = someThingProcessed(multiProcessResult)
        multiProcessResult.processCount = processCount
        if (runAgain) {
            dc.j(multiProcessResult, "Multi Process Result")
        }
    } while (runAgain)
}


module.exports = {
    multiProcess,
};
