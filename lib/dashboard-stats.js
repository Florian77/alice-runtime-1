const ftDev = require("ftws-node-dev-tools");
const {jsonString} = ftDev;
const {getCollectionDataStream} = require("./database");
const {getCollectionDataIndex} = require("./database");
const {getCollectionCommandIndex} = require("./database");
const {getCollectionTriggerIndex} = require("./database");
const {
    getDataContextAggregateList,
    getCommandContextAggregateList,
    getTriggerContextAggregateList,
} = require("./upsert-stats");
const R = require("ramda");

// process.env.DEV_CONSOLE_ON = 1;
const dc = require("node-dev-console");
const {getCommandControl} = require("./emit-command");

const _logger = require('debug')('alice:dashboardStats');
const log = _logger.extend('log');
const debug = _logger.extend('debug');


const getUndispatchedDataEventCount = async () => {
    const filter = {
        dispatched: false,
    };
    debug("getUndispatchedDataEventCount().countDocuments(filter:%s)", jsonString(filter));
    const result = await getCollectionDataStream().countDocuments(filter);
    debug("getUndispatchedDataEventCount().countDocuments().result", jsonString(result));

    // TODO  throw Error ... for retry logic
    return result;
};

const getTriggerCheckForUpdatesCount = async () => {
    const filter = {
        checkForUpdates: true,
        running: false,
        error: false, //{$ne: true},
    };
    debug("getTriggerCheckForUpdatesCount().countDocuments(filter:%s)", jsonString(filter));
    const result = await getCollectionTriggerIndex().countDocuments(filter);
    debug("getTriggerCheckForUpdatesCount().countDocuments().result", jsonString(result));

    // TODO  throw Error ... for retry logic
    return result;
};

const getUnhandledCommandCount = async () => {
    const filter = {
        handled: false,
        running: false
    };
    debug("getUnhandledCommandCount().countDocuments(filter:%s)", jsonString(filter));
    const result = await getCollectionCommandIndex().countDocuments(filter);
    debug("getUnhandledCommandCount().countDocuments().result", jsonString(result));

    // TODO  throw Error ... for retry logic
    return result;
};

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
const contextAggregateQuery = (collection, match, countName) => async ({context, aggregate, command}) => {
    // debug("context", context, "aggregate", aggregate);
    let filter = {
        context,
        aggregate,
        ...match
    };
    if (!R.isNil(command)) {
        filter.command = command;
    }
    // dc.l("filter=%s", filter);
    const result = await collection.countDocuments(filter);
    // dc.l("contextAggregateQuery(filter:%s).result", filter, dc.stringify(result));
    return {
        context,
        aggregate,
        command,
        [countName]: result
    };
};

const contextAggregateListQuery = async (collection, match, countName, contextAggregateList) => {
    const result = await Promise.all(R.map(
        contextAggregateQuery(collection, match, countName),
        contextAggregateList
    ));
    debug("contextAggregateListQuery().result", jsonString(result));
    return result;
};


const makeIndexKey = d => R.join("/", [d.context, d.aggregate, d.command]);
const makeIndexObject = (data, defaultObject = {}) => R.pipe(
    R.map(
        d => ([makeIndexKey(d), R.mergeLeft(d, defaultObject)])
    ),
    R.fromPairs
)(data);
const addIndexObjectData = (indexObject, newData) => {
    newData.forEach(d => {
        const key = makeIndexKey(d);
        indexObject[key] = R.mergeLeft(d, indexObject[key]);
    });
    return indexObject;
};

// ---------------------------------------------------------------------------------
const getCommandIndexOverview = async (options = {commandList: false}) => {
    const {commandList} = options;
    const commandIndex = getCollectionCommandIndex();

    const contextAggregateList = await getCommandContextAggregateList(options);
    debug("contextAggregateList", jsonString(contextAggregateList));

    // Default Result Object
    let result = makeIndexObject(contextAggregateList, {
        "context": "",
        "aggregate": "",
        "command": "",
        total: 0,
        error: 0,
        unhandled: 0,
        multiInvoke: 0,
        running: 0,
        paused: 0,
        isPaused: false
    });
    debug("makeIndexObject(EMPTY-DEFAULT).result", jsonString(result));

    const total = await contextAggregateListQuery(commandIndex, {}, "total", contextAggregateList); // INDEX: Alice_getCommandIndexOverview_1
    debug("contextAggregateListQuery(total).result", jsonString(total));
    result = addIndexObjectData(result, total);
    debug("addIndexObjectData(total).result", jsonString(result));

    const error = await contextAggregateListQuery(commandIndex, {ok: false}, "error", contextAggregateList);  // INDEX: Alice_getCommandIndexOverview_2
    debug("contextAggregateListQuery(error).result", jsonString(error));
    result = addIndexObjectData(result, error);
    debug("addIndexObjectData(error).result", jsonString(result));

    const multiInvoke = await contextAggregateListQuery(commandIndex, {multiInvoke: true}, "multiInvoke", contextAggregateList); // INDEX: Alice_getCommandIndexOverview_3
    debug("contextAggregateListQuery(multiInvoke).result", jsonString(multiInvoke));
    result = addIndexObjectData(result, multiInvoke);
    debug("addIndexObjectData(multiInvoke).result", jsonString(result));

    const unhandled = await contextAggregateListQuery(commandIndex, {handled: false}, "unhandled", contextAggregateList); // INDEX: Alice_getCommandIndexOverview_4
    debug("contextAggregateListQuery(unhandled).result", jsonString(unhandled));
    result = addIndexObjectData(result, unhandled);
    debug("addIndexObjectData(unhandled).result", jsonString(result));

    const running = await contextAggregateListQuery(commandIndex, {running: true}, "running", contextAggregateList); // INDEX: Alice_getCommandIndexOverview_5
    debug("contextAggregateListQuery(running).result", jsonString(running));
    result = addIndexObjectData(result, running);
    debug("addIndexObjectData(running).result", jsonString(result));

    const paused = await contextAggregateListQuery(commandIndex, {paused: true}, "paused", contextAggregateList); // INDEX: Alice_getCommandIndexOverview_5
    debug("contextAggregateListQuery(paused).result", jsonString(paused));
    result = addIndexObjectData(result, paused);
    debug("addIndexObjectData(paused).result", jsonString(result));

    if (commandList) {
        let isPaused = [];
        for (let contextAggregateCommand of contextAggregateList) {
            // dc.j(contextAggregateCommand, "contextAggregateCommand");
            const commandControl = await getCommandControl(contextAggregateCommand);
            // dc.j(commandControl, "commandControl");
            isPaused.push({
                ...(R.pick(["context", "aggregate", "command"], contextAggregateCommand)),
                isPaused: commandControl.paused
            })
        }
        result = addIndexObjectData(result, isPaused);
    }

    result = R.values(result);
    // dc.l("result", dc.stringify(result));

    return result;
};


// ---------------------------------------------------------------------------------
const getTriggerIndexOverview = async () => {
    const triggerIndex = getCollectionTriggerIndex();

    const contextAggregateList = await getTriggerContextAggregateList();
    debug("contextAggregateList", jsonString(contextAggregateList));

    // Default Result Object
    let result = makeIndexObject(contextAggregateList, {"context": "", "aggregate": "", total: 0, error: 0, checkForUpdates: 0, running: 0});
    debug("makeIndexObject(EMPTY-DEFAULT).result", jsonString(result));

    const total = await contextAggregateListQuery(triggerIndex, {}, "total", contextAggregateList); // INDEX: Alice_getTriggerIndexOverview_1
    debug("contextAggregateListQuery(total).result", jsonString(total));
    result = addIndexObjectData(result, total);
    debug("addIndexObjectData(total).result", jsonString(result));

    const error = await contextAggregateListQuery(triggerIndex, {error: true}, "error", contextAggregateList); // INDEX: Alice_getTriggerIndexOverview_2
    debug("contextAggregateListQuery(error).result", jsonString(error));
    result = addIndexObjectData(result, error);
    debug("addIndexObjectData(error).result", jsonString(result));

    const checkForUpdates = await contextAggregateListQuery(triggerIndex, {checkForUpdates: true}, "checkForUpdates", contextAggregateList); // INDEX: Alice_getTriggerIndexOverview_3
    debug("contextAggregateListQuery(checkForUpdates).result", jsonString(checkForUpdates));
    result = addIndexObjectData(result, checkForUpdates);
    debug("addIndexObjectData(checkForUpdates).result", jsonString(result));

    const running = await contextAggregateListQuery(triggerIndex, {running: true}, "running", contextAggregateList); // INDEX: Alice_getTriggerIndexOverview_4
    debug("contextAggregateListQuery(running).result", jsonString(running));
    result = addIndexObjectData(result, running);
    debug("addIndexObjectData(running).result", jsonString(result));

    const paused = await contextAggregateListQuery(triggerIndex, {paused: true}, "paused", contextAggregateList); // INDEX: Alice_getTriggerIndexOverview_4
    debug("contextAggregateListQuery(paused).result", jsonString(paused));
    result = addIndexObjectData(result, paused);
    debug("addIndexObjectData(paused).result", jsonString(result));

    result = R.values(result);
    debug("result", jsonString(result));

    return result;
};

// ---------------------------------------------------------------------------------
const getDataIndexOverview = async () => {
    const dataIndex = getCollectionDataIndex();

    const contextAggregateList = await getDataContextAggregateList();
    debug("contextAggregateList", jsonString(contextAggregateList));

    // Default Result Object
    let result = makeIndexObject(contextAggregateList, {"context": "", "aggregate": "", total: 0, undispatched: 0});
    debug("makeIndexObject(EMPTY-DEFAULT).result", jsonString(result));

    const total = await contextAggregateListQuery(dataIndex, {}, "total", contextAggregateList);
    debug("contextAggregateListQuery(total).result", jsonString(total));
    result = addIndexObjectData(result, total);
    debug("addIndexObjectData(total).result", jsonString(result));

    const undispatched = await contextAggregateListQuery(getCollectionDataStream(), {
        dispatched: false,
        linkEventId: {$exists: false}
    }, "undispatched", contextAggregateList); // INDEX: Alice_getDataIndexOverview
    debug("contextAggregateListQuery(undispatched).result", jsonString(undispatched));
    result = addIndexObjectData(result, undispatched);
    debug("addIndexObjectData(undispatched).result", jsonString(result));

    result = R.values(result);
    debug("result", jsonString(result));

    return result;
};


// ---------------------------------------------------------------------------------
module.exports = {
    getTriggerCheckForUpdatesCount,
    getTriggerIndexOverview,
    getUnhandledCommandCount,
    getCommandIndexOverview,
    getDataIndexOverview,
    getUndispatchedDataEventCount,
    // getDataContextAggregateList,
    // getCommandContextAggregateList,
    // getTriggerContextAggregateList,
};
