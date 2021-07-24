const R = require("ramda");
const {
    getCollectionView,
    getCollectionBackup,
    getCollectionTriggerPrivate,
} = require("./database")
const {storeDataEvent} = require("./store-data-event");
const {storeDataEventOnPayloadChange} = require("./store-data-event-on-payload-change");
const {emitCommand} = require("./emit-command");
const {emitMultiCommand} = require("./emit-multi-command");
const {reInvokeSubscription} = require("./re-invoke-subscription");
const {getDataEventStream} = require("./get-data-event-stream");
const {getLastDataEvent} = require("./get-last-data-event");
const {getDataEvent} = require("./get-data-event");
const {queryDataIndex} = require("./query-data-index");
const {getCommand} = require("./get-command");
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
} = require("./update-command-state")
const {
    storeAppData,
    loadAppData,
} = require("./app-data");
const {
    encrypt,
    decrypt,
} = require("./encrypt_decrypt");


function triggerEnvironment(trigger) {

    if (R.isNil(trigger)) {
        throw Error("commandEnvironment(): param trigger is missing");
    }


    const getCollectionPrivate = (name) => {
        return getCollectionTriggerPrivate(trigger, name);
    };


    return {
        // Trigger ENV + Command ENV
        getCollectionView,
        getCollectionBackup,
        getCollectionPrivate,

        storeDataEvent,
        storeDataEventOnPayloadChange,

        emitCommand,
        emitMultiCommand,
        reInvokeSubscription,

        getDataEventStream,
        getLastDataEvent,
        getDataEvent,
        queryDataIndex,

        getCommand,

        setOneCommandPaused,
        setOneCommandNotPaused,
        setOneCommandHandled,
        setOneCommandNotHandled,
        setOneCommandNotRunning,

        setManyCommandsPaused,
        setManyCommandsNotPaused,
        setManyCommandsHandled,
        setManyCommandsNotHandled,

        storeAppData,
        loadAppData,

        encrypt,
        decrypt,

        // Trigger ENV only
    };
}


module.exports = {
    triggerEnvironment
};
