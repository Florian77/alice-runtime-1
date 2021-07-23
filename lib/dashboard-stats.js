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



const getUndispatchedDataEventCount = async () => {
    const filter = {
        dispatched: false,
    };
    // dcl("getUndispatchedDataEventCount().countDocuments(filter:%s)", dc.stringify(filter));
    const result = await getCollectionDataStream().countDocuments(filter);
    // dcl("getUndispatchedDataEventCount().countDocuments().result", dc.stringify(result));

    // TODO  throw Error ... for retry logic
    return result;
};

const getTriggerCheckForUpdatesCount = async () => {
    const filter = {
        checkForUpdates: true,
        running: false,
        error: false, //{$ne: true},
    };
    // dcl("getTriggerCheckForUpdatesCount().countDocuments(filter:%s)", dc.stringify(filter));
    const result = await getCollectionTriggerIndex().countDocuments(filter);
    // dcl("getTriggerCheckForUpdatesCount().countDocuments().result", dc.stringify(result));

    // TODO  throw Error ... for retry logic
    return result;
};

const getUnhandledCommandCount = async () => {
    const filter = {
        handled: false,
        running: false
    };
    // dcl("getUnhandledCommandCount().countDocuments(filter:%s)", dc.stringify(filter));
    const result = await getCollectionCommandIndex().countDocuments(filter);
    // dcl("getUnhandledCommandCount().countDocuments().result", dc.stringify(result));

    // TODO  throw Error ... for retry logic
    return result;
};

// -----------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------
const contextAggregateQuery = (collection, match, countName) => async ({context, aggregate, command}) => {
    // dc.l("context", context, "aggregate", aggregate);
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
    // dcl("contextAggregateListQuery().result", dc.stringify(result));
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
    // dcl("contextAggregateList", dc.stringify(contextAggregateList));

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
    // dcl("makeIndexObject(EMPTY-DEFAULT).result", dc.stringify(result));

    const total = await contextAggregateListQuery(commandIndex, {}, "total", contextAggregateList); // INDEX: Alice_getCommandIndexOverview_1
    // dcl("contextAggregateListQuery(total).result", dc.stringify(total));
    result = addIndexObjectData(result, total);
    // dcl("addIndexObjectData(total).result", dc.stringify(result));

    const error = await contextAggregateListQuery(commandIndex, {ok: false}, "error", contextAggregateList);  // INDEX: Alice_getCommandIndexOverview_2
    // dcl("contextAggregateListQuery(error).result", dc.stringify(error));
    result = addIndexObjectData(result, error);
    // dcl("addIndexObjectData(error).result", dc.stringify(result));

    const multiInvoke = await contextAggregateListQuery(commandIndex, {multiInvoke: true}, "multiInvoke", contextAggregateList); // INDEX: Alice_getCommandIndexOverview_3
    // dcl("contextAggregateListQuery(multiInvoke).result", dc.stringify(multiInvoke));
    result = addIndexObjectData(result, multiInvoke);
    // dcl("addIndexObjectData(multiInvoke).result", dc.stringify(result));

    const unhandled = await contextAggregateListQuery(commandIndex, {handled: false}, "unhandled", contextAggregateList); // INDEX: Alice_getCommandIndexOverview_4
    // dcl("contextAggregateListQuery(unhandled).result", dc.stringify(unhandled));
    result = addIndexObjectData(result, unhandled);
    // dcl("addIndexObjectData(unhandled).result", dc.stringify(result));

    const running = await contextAggregateListQuery(commandIndex, {running: true}, "running", contextAggregateList); // INDEX: Alice_getCommandIndexOverview_5
    // dcl("contextAggregateListQuery(running).result", dc.stringify(running));
    result = addIndexObjectData(result, running);
    // dcl("addIndexObjectData(running).result", dc.stringify(result));

    const paused = await contextAggregateListQuery(commandIndex, {paused: true}, "paused", contextAggregateList); // INDEX: Alice_getCommandIndexOverview_5
    // dcl("contextAggregateListQuery(paused).result", dc.stringify(paused));
    result = addIndexObjectData(result, paused);
    // dcl("addIndexObjectData(paused).result", dc.stringify(result));

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
    // dcl("contextAggregateList", dc.stringify(contextAggregateList));

    // Default Result Object
    let result = makeIndexObject(contextAggregateList, {"context": "", "aggregate": "", total: 0, error: 0, checkForUpdates: 0, running: 0});
    // dcl("makeIndexObject(EMPTY-DEFAULT).result", dc.stringify(result));

    const total = await contextAggregateListQuery(triggerIndex, {}, "total", contextAggregateList); // INDEX: Alice_getTriggerIndexOverview_1
    // dcl("contextAggregateListQuery(total).result", dc.stringify(total));
    result = addIndexObjectData(result, total);
    // dcl("addIndexObjectData(total).result", dc.stringify(result));

    const error = await contextAggregateListQuery(triggerIndex, {error: true}, "error", contextAggregateList); // INDEX: Alice_getTriggerIndexOverview_2
    // dcl("contextAggregateListQuery(error).result", dc.stringify(error));
    result = addIndexObjectData(result, error);
    // dcl("addIndexObjectData(error).result", dc.stringify(result));

    const checkForUpdates = await contextAggregateListQuery(triggerIndex, {checkForUpdates: true}, "checkForUpdates", contextAggregateList); // INDEX: Alice_getTriggerIndexOverview_3
    // dcl("contextAggregateListQuery(checkForUpdates).result", dc.stringify(checkForUpdates));
    result = addIndexObjectData(result, checkForUpdates);
    // dcl("addIndexObjectData(checkForUpdates).result", dc.stringify(result));

    const running = await contextAggregateListQuery(triggerIndex, {running: true}, "running", contextAggregateList); // INDEX: Alice_getTriggerIndexOverview_4
    // dcl("contextAggregateListQuery(running).result", dc.stringify(running));
    result = addIndexObjectData(result, running);
    // dcl("addIndexObjectData(running).result", dc.stringify(result));

    const paused = await contextAggregateListQuery(triggerIndex, {paused: true}, "paused", contextAggregateList); // INDEX: Alice_getTriggerIndexOverview_4
    // dcl("contextAggregateListQuery(paused).result", dc.stringify(paused));
    result = addIndexObjectData(result, paused);
    // dcl("addIndexObjectData(paused).result", dc.stringify(result));

    result = R.values(result);
    // dcl("result", dc.stringify(result));

    return result;
};

// ---------------------------------------------------------------------------------
const getDataIndexOverview = async () => {
    const dataIndex = getCollectionDataIndex();

    const contextAggregateList = await getDataContextAggregateList();
    // dcl("contextAggregateList", dc.stringify(contextAggregateList));

    // Default Result Object
    let result = makeIndexObject(contextAggregateList, {"context": "", "aggregate": "", total: 0, undispatched: 0});
    // dcl("makeIndexObject(EMPTY-DEFAULT).result", dc.stringify(result));

    const total = await contextAggregateListQuery(dataIndex, {}, "total", contextAggregateList);
    // dcl("contextAggregateListQuery(total).result", dc.stringify(total));
    result = addIndexObjectData(result, total);
    // dcl("addIndexObjectData(total).result", dc.stringify(result));

    const undispatched = await contextAggregateListQuery(getCollectionDataStream(), {
        dispatched: false,
        linkEventId: {$exists: false}
    }, "undispatched", contextAggregateList); // INDEX: Alice_getDataIndexOverview
    // dcl("contextAggregateListQuery(undispatched).result", dc.stringify(undispatched));
    result = addIndexObjectData(result, undispatched);
    // dcl("addIndexObjectData(undispatched).result", dc.stringify(result));

    result = R.values(result);
    // dcl("result", dc.stringify(result));

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
