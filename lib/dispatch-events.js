const dc = require("node-dev-console");
const {getCollectionDataStream, getCollectionTriggerIndex} = require("./database");
const R = require("ramda");
const fs = require('fs');
const {storeError} = require("./database");


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
    // dc.l(`findEventToDispatch().filter:`, dc.stringify(filter));
    // dc.l(`findEventToDispatch().update:`, dc.stringify(update));
    // dc.l(`findEventToDispatch().options:`, dc.stringify(options));
    const result = await getCollectionDataStream().findOneAndUpdate(
        filter,
        update,
        options
    );
    // console.log(`findEventToDispatch().result`, dc.stringify(result));
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
   // dc.l(`updateTriggerIndex().filter:`, dc.stringify(filter));
   // dc.l(`updateTriggerIndex().update:`, dc.stringify(update));
    const result = await getCollectionTriggerIndex().updateMany(
        filter,
        update
    );
   // dc.l(`updateTriggerIndex().result`, dc.stringify(result));
    return result;
};

const dispatchNextEvent = async ({
                                     context = null,
                                     excludeContext = false,
                                 } = {}) => {
    // dc.l("start dispatchNextEvent()");

    const result = await findEventToDispatch({context, excludeContext});

    if (!eventFound(result)) {
       // dc.l("no event found -> exit");
        return false;
    }

    const event = getEventDataFromResult(result);
   // dc.l("Found event [id:%s]", getEventId(event));
   // dc.l("Event:", dc.stringify(event));

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

       // dc.l("processedCounter [%s] max [%s] reached [%s]", processedCounter, maxDispatchEventsCount, (maxDispatchEvents <= 0));
       // dc.l("runTime [%s] max [%s] reached [%s]", nowDif(startTime), maxRuntime, (maxRuntime <= nowDif(startTime)));

    } catch (e) {
        // TODO debug over error log !?!
       // dc.l('error [message=%s]', e.message);
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
