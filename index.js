const {DataCluster} = require("./lib/data-cluster");
const utility = require("./lib/utility");
const entity = require("./lib/entity");
const {makeCommandId} = require("./lib/helper/make-command-id");
const {updateManyCommands} = require("./lib/update-many-commands");
const {updateOneCommand} = require("./lib/update-one-command");
const {reInvokeSubscription} = require("./lib/re-invoke-subscription");
const {emitCommand} = require("./lib/emit-command");
const {emitMultiCommand} = require("./lib/emit-multi-command");
const {upsertCommandControl} = require("./lib/command-control");
const {getCommandControl} = require("./lib/command-control");
const {getDatabase} = require("./lib/database");
const {createTrigger} = require("./lib/create-trigger");
const {createDataTrigger} = require("./lib/create-data-trigger");
const {createCronTrigger} = require("./lib/create-cron-trigger");
const {storeAppData} = require("./lib/app-data");
const {loadAppData} = require("./lib/app-data");
const {
    connect,
    disconnect,
    isConnected,

    listCollections,
    createCollection,
    getCollection,
    getCollectionDataIndex,
    getCollectionDataStream,
    getCollectionTriggerIndex,
    getCollectionTriggerStream,
    getCollectionCommandIndex,
    getCollectionCommandStream,
    getCollectionStreamSequenceNumber,
    getCollectionStatsContextAggregate,
    getCollectionUtility,
    getCollectionView,
    getCollectionBackup,
    getCollectionCommandPrivate,
} = require("./lib/database");
const {makeUtilityCollectionId} = require("./lib/helper/make-utility-collection-id")
const {nextSequenceNumber_dataStream} = require("./lib/next-sequence-number")
const {nextSequenceNumber_dataIndex} = require("./lib/next-sequence-number")
const {checkIndexes} = require("./lib/database-indexes");
const {storeDataEvent} = require("./lib/store-data-event");
const {storeDataEventOnPayloadChange} = require("./lib/store-data-event-on-payload-change");

const {
    getDataEvent,
    loadLinkedDataEvent,
    resolveEvent,
} = require("./lib/get-data-event");
const {getDataEventStream} = require("./lib/get-data-event-stream");
const {getLastDataEvent} = require("./lib/get-last-data-event");
const {queryDataIndex} = require("./lib/query-data-index");
const {countDataIndex} = require("./lib/count-data-index");
const {getDataIndex} = require("./lib/get-data-index");

const {
    processNextTrigger,
    processTrigger,
    activateCronTrigger,
} = require("./lib/process-trigger");

const {processCommands} = require("./lib/process-commands");
const {processNextCommand} = require("./lib/process-next-command");

const {
    dispatchNextEvent,
    dispatchEvents,
} = require("./lib/dispatch-events");

const {loadRuntimeConfig} = require("./lib/load-runtime-config");

const {
    getTriggerCheckForUpdatesCount,
    getTriggerIndexOverview,
    getUnhandledCommandCount,
    getCommandIndexOverview,
    getDataIndexOverview,
    getUndispatchedDataEventCount,
} = require("./lib/dashboard-stats");

const {
    dashboard_queryDataIndex,
    dashboard_queryCommandIndex,
    dashboard_queryTriggerIndex,
} = require("./lib/dashboard-querys");

const {
    getDataContextAggregateList,
    getCommandContextAggregateList,
    getTriggerContextAggregateList,
} = require("./lib/upsert-stats");

const {getTrigger} = require("./lib/get-trigger");
const {process} = require("./lib/process");
const {dashboardApi} = require("./lib/dashboard-api");

const {
    setOneCommandPaused,
    setOneCommandNotPaused,
    setOneCommandHandled,
    setOneCommandNotHandled,
    setOneCommandNotRunning,

    setManyCommandsPaused,
    setManyCommandsNotPaused,
    setManyCommandsHandled,
    setManyCommandsNotHandled,
} = require("./lib/update-command-state");

const {getCommand} = require("./lib/get-command");
const {frontendApi} = require("./lib/frontend-api");
const {encrypt} = require("./lib/encrypt");
const {decrypt} = require("./lib/decrypt");


module.exports = {

    // database
    connect,
    disconnect,
    isConnected,

    getDatabase,
    listCollections,
    createCollection,
    getCollection,
    getCollectionDataIndex,
    getCollectionDataStream,
    getCollectionTriggerIndex,
    getCollectionTriggerStream,
    getCollectionCommandIndex,
    getCollectionCommandStream,
    getCollectionStreamSequenceNumber,
    getCollectionStatsContextAggregate,
    getCollectionUtility,
    getCollectionView,
    getCollectionBackup,
    getCollectionCommandPrivate,

    makeUtilityCollectionId,

    nextSequenceNumber_dataStream,
    nextSequenceNumber_dataIndex,

    // database indexes
    checkIndexes,

    // store data events
    storeDataEvent,
    storeDataEventOnPayloadChange,

    // load data events
    getDataEventStream,
    getLastDataEvent,
    getDataEvent,
    loadLinkedDataEvent,
    resolveEvent,
    getDataIndex,
    queryDataIndex,
    countDataIndex,

    // trigger
    createTrigger,
    createDataTrigger,
    createCronTrigger,

    // process-trigger
    processNextTrigger,
    processTrigger,
    activateCronTrigger,

    // process-commands
    processNextCommand,
    processCommands,

    // dispatch-events
    dispatchNextEvent,
    dispatchEvents,

    loadRuntimeConfig,

    // dashboard-stats
    getTriggerCheckForUpdatesCount,
    getTriggerIndexOverview,
    getUnhandledCommandCount,
    getCommandIndexOverview,
    getDataIndexOverview,
    getUndispatchedDataEventCount,

    // dashboard-list
    dashboard_queryDataIndex,
    dashboard_queryCommandIndex,
    dashboard_queryTriggerIndex,
    getDataContextAggregateList,
    getCommandContextAggregateList,
    getTriggerContextAggregateList,

    // get-trigger-events
    getTrigger,

    process,

    dashboardApi,

    updateOneCommand,
    updateManyCommands,
    reInvokeSubscription,

    // command-control
    setOneCommandPaused,
    setOneCommandNotPaused,
    setOneCommandHandled,
    setOneCommandNotHandled,
    setOneCommandNotRunning,

    setManyCommandsPaused,
    setManyCommandsNotPaused,
    setManyCommandsHandled,
    setManyCommandsNotHandled,

    // emit-command
    makeCommandId,
    emitCommand,
    emitMultiCommand,

    // command-control
    getCommandControl,
    upsertCommandControl,
    getCommand,
    frontendApi,

    // App Data
    storeAppData,
    loadAppData,

    // rest
    utility,
    entity,
    DataCluster,
    encrypt,
    decrypt,
};
