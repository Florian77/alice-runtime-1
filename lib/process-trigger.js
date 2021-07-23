const ftDev = require("ftws-node-dev-tools");
const {jsonString} = ftDev;
const dc = require("node-dev-console");
const {getCollectionTriggerIndex, getCollectionDataStream} = require("./database");
const {resolveEvent} = require("./get-data-events");
const {triggerEnvironment} = require("./trigger-environment");
const R = require("ramda");
const {resolve} = require('path');
const fs = require('fs');
const calcCronNextRunAt = require("./helper/calc-cron-next-run-at");
const {storeError} = require("./database");

// const _logger = require('debug')('alice:processTrigger');
// const log = _logger.extend('log');
// const debug = _logger.extend('debug');

const hasValue = R.complement(R.isNil);
const findTriggerToProcess = async ({
                                        context = null,
                                        type = null,
                                        excludeContext = false,
                                    } = {}) => {
    let filter = {
        checkForUpdates: true,
        running: false,
        error: false, //{$ne: true},
        paused: false, //{$ne: true},
    };
    if (!R.isNil(context)) {
        let operator = "$eq"
        if (excludeContext === true) {
            operator = R.is(Array, context) ? "$nin" : "$ne"
        } else if (R.is(Array, context)) {
            operator = "$in"
        }
        filter = R.assoc(
            "context",
            {
                [operator]: context
            },
            filter
        )
    }
    if (!R.isNil(type)) {
        filter = R.assoc(
            "type",
            R.is(Array, type) ? {$in: type} : type,
            filter
        )
    }
    // console.log("findTriggerToProcess().filter", filter)
    const update = {
        $set: {
            running: true,
            runningSince: new Date(),
            checkForUpdates: false,
        }
    };
    const options = {
        sort: {
            lastRunAt: 1
        }
    };
    //debug("findTriggerToProcess().findOneAndUpdate(filter:%s, update:%s, options:%s)", jsonString(filter), jsonString(update), jsonString(options));
    const result = await getCollectionTriggerIndex().findOneAndUpdate(filter, update, options);
    // console.log("result", result)
    if(false) console.log("findTriggerToProcess:", R.pathOr(null, ["value", "_id"], result))
    //debug("findTriggerToProcess().result", jsonString(result)); // TODO -> improve debug with ftDev.mongoFindOneAndUpdate()

    // TODO  throw Error ... for retry logic
    return result;
};
const triggerFound = R.pipe(R.propOr(null, "value"), R.complement(R.isNil));
const getTriggerFromResult = R.prop("value");
const getTriggerContext = R.propOr("", "context");
const getTriggerLastSequenceNumber = R.propOr(0, "lastSequenceNumber");
const getTriggerStreamId = R.propOr("ERROR-MISSING-DATA", "streamId");
const getTriggerId = R.propOr("ERROR-MISSING-DATA", "_id");
const getTriggerAggregate = R.propOr(null, "aggregate");
const getTriggerTrigger = R.propOr(null, "trigger");
const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");
const findEventToProcess = async (trigger) => {
    const query = {
        streamId: getTriggerStreamId(trigger),
        sequenceNumber: {
            $gt: getTriggerLastSequenceNumber(trigger)
        },
        dispatched: true,
    };
    const options = {
        sort: {
            sequenceNumber: 1
        }
    };
    // debug("findEventToProcess().findOne(%s, %s)", jsonString(query), jsonString(options)/*, jsonString(result)*/);
    // TODO -> select stream Collection with trigger.streamType
    const result = await getCollectionDataStream().findOne(query, options);
    //debug("findEventToProcess().findOne(%s, %s).result", jsonString(query), jsonString(options), jsonString(result));
    // debug("findEventToProcess().findOne().result", jsonString(result));

    if(false) console.log("findEventToProcess:", R.pathOr(null, ["_id"], result))

    // TODO  throw Error ... for retry logic
    return result;
};

function makeFullPath(functionPath, trigger) {
    return resolve(
        functionPath,
        getTriggerContext(trigger),
        getTriggerAggregate(trigger),
        "tgr",
        getTriggerTrigger(trigger),
        "handler.js"
    );
}

const getTriggerExecutiveFunction = (fullPath) => {
    // console.log("getTriggerExecutiveFunction() [fullPath=%s]", fullPath);
    if (!fs.existsSync(fullPath)) {
        return false;
    }
    // TODO throw Error ... for retry logic
    return require(fullPath);
};
const eventFound = R.complement(R.isNil);
const incrementLastReadSequenceNumber = (trigger) => ({
    ...trigger,
    lastSequenceNumber: getTriggerLastSequenceNumber(trigger) + 1
});
const mergeDefaultExeResult = R.mergeRight({
    error: false,
    errorMsg: "",
});
const setTriggerCompletedRunning = async (trigger, setAdditionalState = {}) => {
    const query = {
        _id: getTriggerId(trigger)
    };
    const update = {
        $set: {
            ...mergeDefaultExeResult(setAdditionalState),
            running: false,
            lastRunAt: new Date(),
            // runningSince: null,
        }
    };
    //debug("setTriggerCompletedRunning(query:%s, update:%s)", jsonString(query), jsonString(update));
    const result = await getCollectionTriggerIndex().updateOne(query, update);
    //debug("setTriggerCompletedRunning()", ftDev.mongoUpdateOne(result));

    // TODO return true / false or throw Error ... for retry logic
};


// TODO -> add option to check trigger they didn't run for a long time

const processNextTrigger = async ({
                                      functionPath = null,
                                      context = null,
                                      excludeContext = false,
                                      type = null,
                                  } = {},
                                  maxProcessCallback = null
) => {
    if (!hasValue(functionPath)) {
        throw Error("functionPath missing");
    }
    //debug("[functionPath=%s]", functionPath);

    if (!hasValue(maxProcessCallback)) {
        //debug("maxProcessCallback not provided -> use internal counter");
        let counter = 1000;
        maxProcessCallback = () => ((counter -= 1) > 0);
    }

    // TODO -> Put in extra function like in process-commands -> const result = await findCommandToProcess();
    // TODO -> Add Debug output for filter / update / options
    const result = await findTriggerToProcess({context, excludeContext, type});

    if (!triggerFound(result)) {
        //log("no trigger found -> exit");
        return false;
    }

    let trigger = getTriggerFromResult(result);
    // log("trigger found [id=%s]", getTriggerId(trigger));
    // dc.j(trigger, "trigger data");

    const fullPath = makeFullPath(functionPath, trigger);

    let triggerExecutive;
    try {
        triggerExecutive = getTriggerExecutiveFunction(fullPath);
    } catch (e) {
        console.error(e);
        await storeError(__filename, 185, "processNextTrigger", e)
        await setTriggerCompletedRunning(trigger, {
            error: true,
            errorMsg: [
                "TriggerExecutive load faild",
                e.message,
                fullPath,
            ]
        });
        return "ERROR";
    }

    if (!triggerExecutive) {
        //log("error: trigger execution function not exists [id=%s] [functionPath=%s]", getTriggerId(trigger), functionPath);
        await setTriggerCompletedRunning(trigger, {
            error: true,
            errorMsg: [
                "TriggerExecutive not exists",
                fullPath,
            ], //`TriggerExecutiveFunction not exists [functionPath=${functionPath}]`
        });
        return "ERROR";
    }

    // ---------------------------------------------------------------------------------
    // cron trigger
    if (R.propEq("type", "cron", trigger)) {

        // Execute Trigger
        try {
            /*const exeResult =*/
            await triggerExecutive(
                trigger,
                triggerEnvironment(trigger)
            );

        } catch (e) {
            console.error(e);
            await storeError(__filename, 222, "processNextTrigger", e)
            await setTriggerCompletedRunning(trigger, {
                error: true,
                errorMsg: [
                    "TriggerExecutive execution faild",
                    e.message,
                    fullPath,
                ], //`TriggerExecutiveFunction execution failed [e.message=${e.message}]`
            });
            return "ERROR";
        }

        await setTriggerCompletedRunning(trigger, {
            nextRunAt: calcCronNextRunAt(trigger.cronExpression),
        });

        maxProcessCallback();

    }
        // ---------------------------------------------------------------------------------
    // stream trigger
    else {

        // read Stream
        do {

            let event = await findEventToProcess(trigger);

            if (!eventFound(event)) {
                // Stop processTrigger
                //log("no event found -> exit processNextTrigger");
                await setTriggerCompletedRunning(trigger);
                return true;
            }
            //log("event found [id=%s]", getEventId(event));
            //debug("event data", jsonString(event));

            // dc.j(trigger, "trigger")
            // dc.j(event, "event")

            // check lastSequenceNumber / sequenceNumber -> sleep
            if (trigger.lastSequenceNumber + 1 !== event.sequenceNumber) {
                await new Promise(r => setTimeout(r, 1000));
                event = await findEventToProcess(trigger);
            }

            // store lastSequenceNumber Error
            if (trigger.lastSequenceNumber + 1 !== event.sequenceNumber) {
                await storeError(__filename, 282, "processNextTrigger", {message: "trigger.lastSequenceNumber+1 !== event.sequenceNumber", trigger, event})
                console.error("trigger", trigger, "event", event)
            }

            // Execute Trigger
            try {
                const exeResult = await triggerExecutive(
                    await resolveEvent(event),
                    triggerEnvironment(trigger)
                );
                //debug("triggerExecutive().exeResult", jsonString(exeResult));
            } catch (e) {
                //log("error: trigger execution faild [id=%s] [e.message=%s]", getTriggerId(trigger), e.message);
                //debug("execution error", e);
                console.error(e);
                await storeError(__filename, 297, "processNextTrigger", e)
                await setTriggerCompletedRunning(trigger, {
                    error: true,
                    errorMsg: `TriggerExecutiveFunction execution failed [e.message=${e.message}]`
                });
                return "ERROR";
            }

            // TODO -> Store log / event of trigger execution -> TriggerStream

            // Store lastSequenceNumber
            // TODO -> make function for this:
            trigger = incrementLastReadSequenceNumber(trigger);
            const updateQuery = {
                _id: getTriggerId(trigger)
            };
            const updateUpdate = {
                $set: {
                    lastSequenceNumber: getTriggerLastSequenceNumber(trigger) // TODO -> use Event Sequence Number!!!
                }
            };
            //debug("updateTriggerSequenceNumber(query:%s, update:%s)", jsonString(updateQuery), jsonString(updateUpdate));
            const updateResult = await getCollectionTriggerIndex().updateOne(updateQuery, updateUpdate);
            //debug("updateTriggerSequenceNumber()", ftDev.mongoUpdateOne(updateResult), jsonString(updateResult));

            //log("event processed [id=%s]", getEventId(event));
        } while (maxProcessCallback());

        // setTrigger finished
        // Exit over maxProcessCallback() -> there can be more events to process -> so run again later
        await setTriggerCompletedRunning(trigger, {checkForUpdates: true});

    }


    return true;
};

const makeProcessResult = ({moreToProcess = false, processedTriggerCounter = 0, processedEventsCounter = 0, withError = false, runTime = 0}) => ({
    moreToProcess,
    processedTriggerCounter,
    processedEventsCounter,
    withError,
    runTime,
});

const now = () => Date.now() / 1000 | 0;
const nowDif = start => now() - start;

const processTrigger = async ({
                                  functionPath = null,
                                  maxProcessTrigger = false,
                                  maxProcessEvents = false,
                                  maxRuntime = false,
                                  context = null,
                                  excludeContext = false,
                                  type = null
                              } = {}) => {

    if (!hasValue(functionPath)) {
        throw Error("functionPath missing");
    }

    maxProcessTrigger = R.is(Number, maxProcessTrigger) && maxProcessTrigger > 0 ? maxProcessTrigger : 1000;
    maxProcessEvents = R.is(Number, maxProcessEvents) && maxProcessEvents > 0 ? maxProcessEvents : 10000;
    const maxProcessTriggerCount = maxProcessTrigger;
    const maxProcessEventCount = maxProcessEvents;

    // console.log("start processTrigger() [maxProcessTrigger=%s] [maxProcessEvents=%s] [maxRuntime=%s]", maxProcessTrigger, maxProcessEvents, maxRuntime);

    const startTime = now();
    let processedTriggerCounter = 0;
    let processedEventsCounter = 0;
    try {
        // get changed after first cycle
        let returnState = false;
        do {
            const result = await processNextTrigger(
                {functionPath, context, excludeContext, type},
                () => {
                    processedEventsCounter += 1;
                    // log("maxProcessEventsCallback:.maxProcessEvents", maxProcessEvents);
                    // log("maxProcessEventsCallback:.processedEventsCounter", processedEventsCounter);
                    return (
                        (maxProcessEvents -= 1) > 0
                        && (maxRuntime === false || maxRuntime > nowDif(startTime))
                    );
                }
            );

            // no trigger for execution found
            if (result === false) {
                return makeProcessResult({returnState, processedTriggerCounter, processedEventsCounter, runTime: nowDif(startTime)});
            }
            // no trigger for execution found
            if (result === "ERROR") { // TODO -> make optional for DEV / LIVE environment
                return makeProcessResult({returnState, processedTriggerCounter, processedEventsCounter, withError: true, runTime: nowDif(startTime)});
            }

            processedTriggerCounter += 1;

            if (!returnState) {
                returnState = true;
            }
        } while (
            (maxProcessTrigger -= 1) > 0
            && maxProcessEvents > 0
            && (maxRuntime === false || maxRuntime > nowDif(startTime))
            );

        //log("processedTriggerCounter [%s] max [%s] reached [%s]", processedTriggerCounter, maxProcessTriggerCount, (maxProcessTrigger <= 0));
        //log("processedEventsCounter [%s] max [%s] reached [%s]", processedEventsCounter, maxProcessEventCount, (maxProcessEvents <= 0));
        //log("runTime [%s] max [%s] reached [%s]", nowDif(startTime), maxRuntime, (maxRuntime <= nowDif(startTime)));
    } catch (e) {
        // TODO debug over error log !?!
        //log('error [message=%s]', e.message);
        console.error(e);
        await storeError(__filename, 383, "processTrigger", e)
        return makeProcessResult({moreToProcess: false, processedTriggerCounter, processedEventsCounter, withError: true, runTime: nowDif(startTime)});
    }

    return makeProcessResult({moreToProcess: true, processedTriggerCounter, processedEventsCounter, runTime: nowDif(startTime)});
};

async function activateCronTrigger() {

    const filter = {
        checkForUpdates: false,
        nextRunAt: {
            $lte: new Date()
        },
        type: "cron",
    };
    const update = {
        $set: {
            checkForUpdates: true,
        }
    };
    let result = false
    try {
        result = await getCollectionTriggerIndex().updateMany(filter, update);
    } catch (e) {
        console.log("MONGO ERROR", e, filter)
        throw e
    }

    // TODO  throw Error ... for retry logic
    return result;
}

module.exports = {
    processNextTrigger,
    processTrigger,
    activateCronTrigger,
};