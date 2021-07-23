const dc = require("node-dev-console");
const R = require("ramda");
const {processCommands} = require("./process-commands");
const {dispatchEvents} = require("./dispatch-events");
const {processTrigger} = require("./process-trigger");
const {activateCronTrigger} = require("./process-trigger");
const {getCollectionUtility, UTILITY_NAMESPACE} = require("./database")
const {makeUtilityCollectionId} = require("./helper/make-utility-collection-id")

// dc.activate();


const hasValue = R.complement(R.isNil);
const now = () => Date.now() / 1000 | 0;
const nowDif = start => now() - start;


function getProcessUtilityId() {
    return makeUtilityCollectionId(UTILITY_NAMESPACE.PROCESS, ["state"])
}


async function getProcessState() {
    const result = await getCollectionUtility().findOne({_id: getProcessUtilityId()})
    // dc.j(result, "result")
    if (!R.isNil(result) && R.propEq("state", false, result)) {
        return false
    }
    return true
}


async function isProcessStateOff() {
    const state = await getProcessState()
    return state === false
}


async function isProcessStateOn() {
    const state = await getProcessState()
    return state !== false
}


async function setProcessStateOff() {
    const result = await getCollectionUtility().updateOne({
        _id: getProcessUtilityId()
    }, {
        $set: {
            state: false
        }
    }, {
        upsert: true
    })
    // dc.j(result, "result")
    // if (R.propEq("state", false, result)) {
    //     return false
    // }
    // return true
}


async function setProcessStateOn() {
    const result = await getCollectionUtility().updateOne({
        _id: getProcessUtilityId()
    }, {
        $set: {
            state: true
        }
    }, {
        upsert: true
    })
    // dc.j(result, "result")
    // if (R.propEq("state", false, result)) {
    //     return false
    // }
    // return true
}


async function process({
                           functionPath = null,
                           maxRuntime = false,
                           maxProcessCycles = false, //1000,
                           maxDispatchEvents = false, //5000,
                           maxProcessTrigger = false, //100,
                           maxProcessEvents = false, //1000,
                           maxProcessCommands = false, //1000,
                           showLog = false,
                           logFunction = null,
                           minPriority = null,
                           maxPriority = null,
                           context = null,
                           excludeContext = false,
                           triggerType = null,
                       } = {}) {

    if (!hasValue(functionPath)) {
        throw Error("functionPath missing");
    }

    if (R.isNil(logFunction)) {
        logFunction = console.log.bind(console);
    }

    // dc.t(maxRuntime, "maxRuntime");
    // dc.t(maxProcessCycles, "maxProcessCycles");

    // todo -> validate Data -> failure throw error

    maxRuntime = R.is(Number, maxRuntime) && maxRuntime > 0 ? maxRuntime : 300;
    maxProcessCycles = R.is(Number, maxProcessCycles) && maxProcessCycles > 0 ? maxProcessCycles : 10000;

    if (showLog) {
        logFunction("--------------------------------------------------------------------------------")
        logFunction("start process: [maxProcessCycles=%s] [maxRuntime=%s]", maxProcessCycles, maxRuntime)
        logFunction("per process cycle: [maxProcessCommands=%s] [maxDispatchEvents=%s] [maxProcessTrigger=%s] [maxProcessEvents=%s]", maxProcessCommands, maxDispatchEvents, maxProcessTrigger, maxProcessEvents)
        logFunction("--------------------------------------------------------------------------------")
    }
    const startTime = now();
    let runAgain,
        processCommandsResult,
        dispatchEventsResult,
        processTriggerResult,
        processedCycles = 0;
    let totalProcessedCommands = 0, totalsDispatchedEvents = 0, totalProcessedTrigger = 0, totalProcessedEvents = 0;

    if (await isProcessStateOn()) {
        await activateCronTrigger();
    }

    do {
        if (await isProcessStateOff()) {
            logFunction("ProcessState is OFF",);
            runAgain = false
        } else {

            processedCycles += 1;

            processCommandsResult = await processCommands({
                functionPath,
                maxProcessCommands,
                maxRuntime: 5,
                minPriority,
                maxPriority,
                context,
                excludeContext,
            });
            // dc.l("processCommands().result", dc.stringify(processCommandsResult));
            totalProcessedCommands += processCommandsResult.processedCounter;

            dispatchEventsResult = await dispatchEvents({
                maxDispatchEvents,
                maxRuntime: 25,
                context,
                excludeContext,
            });
            // dc.l("dispatchEvents().result", dc.stringify(dispatchEventsResult));
            totalsDispatchedEvents += dispatchEventsResult.processedCounter;

            processTriggerResult = await processTrigger({
                functionPath,
                maxProcessTrigger,
                maxProcessEvents,
                maxRuntime: 25,
                context,
                excludeContext,
                type: triggerType,
            });
            // dc.l("processTrigger().result", dc.stringify(processTriggerResult));
            totalProcessedTrigger += processTriggerResult.processedTriggerCounter;
            totalProcessedEvents += processTriggerResult.processedEventsCounter;

            runAgain = (
                processCommandsResult.moreToProcess
                || dispatchEventsResult.moreToProcess
                || processTriggerResult.moreToProcess
                || processCommandsResult.processedCounter > 0
                || dispatchEventsResult.processedCounter > 0
                || processTriggerResult.processedTriggerCounter > 0
                || processTriggerResult.processedEventsCounter > 0
            );
            // dc.l("Process: %s/%s run %s/%s sec [runAgain=%s] ", processedCycles, maxProcessCycles, nowDif(startTime), maxRuntime, runAgain);
            if (showLog) {
                logFunction("cycle: %s/%s run %s/%s sec [runAgain=%s] [processedCommands=%s] [dispatchedEvents=%s] [processedTrigger=%s] [processedEvents=%s]", processedCycles, maxProcessCycles, nowDif(startTime), maxRuntime, runAgain, processCommandsResult.processedCounter, dispatchEventsResult.processedCounter, processTriggerResult.processedTriggerCounter, processTriggerResult.processedEventsCounter);
            }
        }
    }
    while (processedCycles < maxProcessCycles && nowDif(startTime) < maxRuntime && runAgain);

    if (showLog) {
        logFunction("--------------------------------------------------------------------------------")
        logFunction("process complete: %s/%s run %s/%s sec [runAgain=%s]", processedCycles, maxProcessCycles, nowDif(startTime), maxRuntime, runAgain);
        logFunction("total: [processedCommands=%s] [dispatchedEvents=%s] [processedTrigger=%s] [processedEvents=%s]", totalProcessedCommands, totalsDispatchedEvents, totalProcessedTrigger, totalProcessedEvents);
        logFunction("--------------------------------------------------------------------------------")
    }

    return {
        processedCycles,
        executionTime: nowDif(startTime),
        totalProcessedCommands,
        totalsDispatchedEvents,
        totalProcessedTrigger,
        totalProcessedEvents,

    };
}


module.exports = {
    process,
    getProcessState,
    setProcessStateOff,
    setProcessStateOn,
};
