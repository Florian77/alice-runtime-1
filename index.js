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

    makeUtilityCollectionId,

    getNextDataStreamSequenceNumber,
    getNextDataIndexSequenceNumber,

    // COLLECTION_LIST,
    // UTILITY_NAMESPACE,
} = require("./lib/database");

const {checkIndexes} = require("./lib/database-indexes");
const {storeDataEvent} = require("./lib/store-data-event");
const {storeDataEventOnPayloadChange} = require("./lib/store-data-event-on-payload-change");

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
} = require("./lib/update-command-state");


const {
    getCommand,
} = require("./lib/get-command");

const {
    frontendApi,
} = require("./lib/frontend-api");

const {
    encrypt,
    decrypt,
} = require("./lib/encrypt_decrypt");


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

    // process
    process,

    //dashboard-api
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
