const dc = require("node-dev-console");
const R = require("ramda");
const {processNextCommand} = require("./process-next-command");
const {storeError} = require("./database");


const now = () => Date.now() / 1000 | 0;
const nowDif = start => now() - start;


function makeProcessResult({moreToProcess = false, processedCounter = 0, withError = false, runTime = 0} = {}) {
    return {
        moreToProcess,
        processedCounter,
        withError,
        runTime
    };
}


async function processCommands({
                                   functionPath = null,
                                   maxProcessCommands = false,
                                   maxRuntime = false,
                                   minPriority = null,
                                   maxPriority = null,
                                   context = null,
                                   excludeContext = false,
                               } = {}) {

    if (R.isNil(functionPath) || R.isEmpty(functionPath)) {
        throw Error("functionPath missing");
    }

    maxProcessCommands = R.is(Number, maxProcessCommands) && maxProcessCommands > 0 ? maxProcessCommands : 10000;
    // const maxProcessCommandsCount = maxProcessCommands;

    // console.log("start processCommands() [maxProcessCommands=%s] [maxRuntime=%s]", maxProcessCommands, maxRuntime);

    const startTime = now();
    let processedCounter = 0;
    try {
        // get changed after first cycle
        let returnState = false;
        do {
            const result = await processNextCommand({functionPath, minPriority, maxPriority, context, excludeContext});

            // no process for execution found
            if (result === false) {
                return makeProcessResult({returnState, processedCounter});
            }

            processedCounter += 1;

            if (!returnState) {
                returnState = true;
            }
            // console.log("runtime:", nowDif(startTime), "/", maxRuntime)
        } while (
            (maxProcessCommands -= 1) > 0
            && (maxRuntime === false || maxRuntime > nowDif(startTime))
            );

        // dc.l("processedCounter [%s] max [%s] reached [%s]", processedCounter, maxProcessCommandsCount, (maxProcessCommands <= 0));
        // dc.l("runTime [%s] max [%s] reached [%s]", nowDif(startTime), maxRuntime, (maxRuntime <= nowDif(startTime)));

    } catch (e) {
        // TODO debug over error log !?!
        // dc.l('error [message=%s]', e.message);
        console.error(e);
        await storeError(__filename, 335, "processCommands", e)
        return makeProcessResult({moreToProcess: false, processedCounter, withError: true, runTime: nowDif(startTime)});
    }

    return makeProcessResult({moreToProcess: true, processedCounter, runTime: nowDif(startTime)});
}


module.exports = {
    processCommands,
};
