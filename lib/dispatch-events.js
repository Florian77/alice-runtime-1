const ftDev = require("ftws-node-dev-tools");
const {jsonString} = ftDev;
const {getCollectionDataStream, getCollectionTriggerIndex} = require("./database");
const R = require("ramda");
const fs = require('fs');
const {storeError} = require("./database");

const _logger = require('debug')('alice:dispatchEvents');
const log = _logger.extend('log');
const debug = _logger.extend('debug');

const hasValue = R.complement(R.isNil);
const findEventToDispatch = async ({
                                       context = null,
                                       excludeContext = false,
                                   } = {}) => {
    let filter = {
        dispatched: false,
    };
    // not working with _SYSTEM stream -> have no context
    /*if (!R.isNil(context)) {
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
    }*/
    // console.log("findEventToDispatch().filter", filter)
    const update = {
        $set: {
            dispatched: true,
            dispatchedAt: new Date(),
        }
    };
    const options = {
        sort: {
            createdAt: 1
        }
    };
    // debug(`findEventToDispatch().filter:`, ftDev.jsonString(filter));
    // debug(`findEventToDispatch().update:`, ftDev.jsonString(update));
    // debug(`findEventToDispatch().options:`, ftDev.jsonString(options));
    const result = await getCollectionDataStream().findOneAndUpdate(
        filter,
        update,
        options
    );
    // console.log(`findEventToDispatch().result`, ftDev.jsonString(result));
    if(false) console.log("findEventToDispatch:", R.pathOr(null, ["value", "_id"], result))
    return result;
};
const eventFound = R.pipe(R.propOr(null, "value"), R.complement(R.isNil));
const getEventDataFromResult = R.prop("value");
const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");
const getEventStreamId = R.propOr("ERROR-MISSING-DATA", "streamId");
const updateTriggerIndex = async event => {
    const filter = {
        type: "stream",
        streamType: "DATA",
        streamId: getEventStreamId(event),
    };
    const update = {
        $set: {
            checkForUpdates: true,
            // dispatchedAt: new Date(),
        }
    };
   // debug(`updateTriggerIndex().filter:`, ftDev.jsonString(filter));
   // debug(`updateTriggerIndex().update:`, ftDev.jsonString(update));
    const result = await getCollectionTriggerIndex().updateMany(
        filter,
        update
    );
   // debug(`updateTriggerIndex().result`, ftDev.jsonString(result));
    return result;
};

const dispatchNextEvent = async ({
                                     context = null,
                                     excludeContext = false,
                                 } = {}) => {
    // log("start dispatchNextEvent()");

    const result = await findEventToDispatch({context, excludeContext});

    if (!eventFound(result)) {
       // log("no event found -> exit");
        return false;
    }

    const event = getEventDataFromResult(result);
   // log("Found event [id:%s]", getEventId(event));
   // debug("Event:", ftDev.jsonString(event));

    const updateResult = await updateTriggerIndex(event);


    return true;
};

const makeProcessResult = ({moreToProcess = false, processedCounter = 0, withError = false, runTime = 0} = {}) => ({
    moreToProcess,
    processedCounter,
    withError,
    runTime
});


const now = () => Date.now() / 1000 | 0;
const nowDif = start => now() - start;

const dispatchEvents = async ({
                                  maxDispatchEvents = false,
                                  maxRuntime = false,
                                  context = null,
                                  excludeContext = false,
                              } = {}) => {

    maxDispatchEvents = R.is(Number, maxDispatchEvents) && maxDispatchEvents > 0 ? maxDispatchEvents : 10000;
    const maxDispatchEventsCount = maxDispatchEvents;

    // console.log("start dispatchEvents() [maxDispatchEvents=%s] [maxRuntime=%s]", maxDispatchEvents, maxRuntime);

    const startTime = now();
    let processedCounter = 0;
    try {
        // get changed after first cycle
        let returnState = false;
        do {
            const result = await dispatchNextEvent({context, excludeContext});

            // no process for execution found
            if (result === false) {
                return makeProcessResult({returnState, processedCounter});
            }

            processedCounter += 1;

            if (!returnState) {
                returnState = true;
            }
        } while (
            (maxDispatchEvents -= 1) > 0
            && (maxRuntime === false || maxRuntime > nowDif(startTime))
            );

       // log("processedCounter [%s] max [%s] reached [%s]", processedCounter, maxDispatchEventsCount, (maxDispatchEvents <= 0));
       // log("runTime [%s] max [%s] reached [%s]", nowDif(startTime), maxRuntime, (maxRuntime <= nowDif(startTime)));

    } catch (e) {
        // TODO debug over error log !?!
       // log('error [message=%s]', e.message);
        console.error(e);
        await storeError(__filename, 150, "dispatchEvents", e)
        return makeProcessResult({moreToProcess: false, processedCounter, withError: true, runTime: nowDif(startTime)});
    }

    return makeProcessResult({moreToProcess: true, processedCounter, runTime: nowDif(startTime)});
};


module.exports = {
    dispatchNextEvent,
    dispatchEvents,
};
