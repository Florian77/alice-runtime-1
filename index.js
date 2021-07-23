const {
    DataCluster,
} = require("./lib/data-cluster");

const utility = require("./lib/utility");
const entity = require("./lib/entity");
const {getDatabase} = require("./lib/database");
const {createTrigger} = require("./lib/create-trigger");
const {createCronTrigger} = require("./lib/create-cron-trigger");
const {
    storeAppData,
    loadAppData,
} = require("./lib/app-data");

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

    makeUtilityCollectionId,

    getNextDataStreamSequenceNumber,
    getNextDataIndexSequenceNumber,

    // COLLECTION_LIST,
    // UTILITY_NAMESPACE,
} = require("./lib/database");

const {
    checkIndexes,
} = require("./lib/database-indexes");

const {
    storeDataEvent,
    storeDataEventOnPayloadChange,
} = require("./lib/store-data-event");

const {
    getDataEventStream,
    getLastDataEvent,
    getDataEvent,
    isEventLink,
    loadLinkedDataEvent,
    resolveEvent,
    getItemDataIndex,
    queryDataIndex,
    countDataIndex,
} = require("./lib/get-data-events");

const {
    createDataTrigger,
} = require("./lib/create-data-trigger");

const {
    processNextTrigger,
    processTrigger,
    activateCronTrigger,
} = require("./lib/process-trigger");

const {
    processNextCommand,
    processCommands,
} = require("./lib/process-commands");

const {
    dispatchNextEvent,
    dispatchEvents,
} = require("./lib/dispatch-events");

const {
    loadRuntimeConfig,
} = require("./lib/load-runtime-config");

const {
    getTriggerCheckForUpdatesCount,
    getTriggerIndexOverview,
    getUnhandledCommandCount,
    getCommandIndexOverview,
    getDataIndexOverview,
    getUndispatchedDataEventCount,
} = require("./lib/dashboard-stats");

const {
    getDataIndex,
    getCommandIndex,
    getTriggerIndex,
    getDataContextAggregateList,
    getCommandContextAggregateList,
    getTriggerContextAggregateList,
} = require("./lib/dashboard-list");

const {
    getItemTriggerIndex,
} = require("./lib/get-trigger-events");

const {
    csvImport,
} = require("./lib/csv-import");

const {
    process,
} = require("./lib/process");

const {
    dashboardApi,
} = require("./lib/dashboard-api");

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
} = require("./lib/command-control");

const {
    makeCommandId,
    emitCommand,
    emitMultiCommand,
    updateOneCommand,
    updateManyCommands,
    getCommandControl,
    upsertCommandControl,
    reInvokeSubscription,
} = require("./lib/emit-command");

const {
    getCommand,
} = require("./lib/get-command-events");

const {
    frontendApi,
} = require("./lib/frontend-api");

const {
    encrypt,
    decrypt,
} = require("./lib/encrypt_decrypt");

// ----------------------------------------------------------
//  Module Export
// ----------------------------------------------------------
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

    getNextDataStreamSequenceNumber,
    getNextDataIndexSequenceNumber,

    // database-indexes
    checkIndexes,

    // store-data-event
    storeDataEvent,
    storeDataEventOnPayloadChange,

    // get-data-events
    getDataEventStream,
    getLastDataEvent,
    getDataEvent,
    isEventLink,
    loadLinkedDataEvent,
    resolveEvent,
    getItemDataIndex,
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

    // load-runtime-config
    loadRuntimeConfig,

    // dashboard-stats
    getTriggerCheckForUpdatesCount,
    getTriggerIndexOverview,
    getUnhandledCommandCount,
    getCommandIndexOverview,
    getDataIndexOverview,
    getUndispatchedDataEventCount,

    // dashboard-list
    getDataIndex,
    getCommandIndex,
    getTriggerIndex,
    getDataContextAggregateList,
    getCommandContextAggregateList,
    getTriggerContextAggregateList,

    // get-trigger-events
    getItemTriggerIndex,

    // csv-import
    csvImport,

    // process
    process,

    //dashboard-api
    dashboardApi,

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
    updateOneCommand,
    updateManyCommands,
    getCommandControl,
    upsertCommandControl,
    reInvokeSubscription,

    // get-command-events
    getCommand,

    // frontend API
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
