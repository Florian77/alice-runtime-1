const R = require("ramda");
const {
    getCollectionView,
    getCollectionBackup,
    getCollectionTriggerPrivate,
} = require("./database")
const {
    storeDataEvent,
    storeDataEventOnPayloadChange
} = require("./store-data-event");
const {
    emitCommand,
    emitMultiCommand,
    reInvokeSubscription,
} = require("./emit-command");
const {
    getDataEventStream,
    getLastDataEvent,
    getDataEvent,
    queryDataIndex,
} = require("./get-data-events");
const {
    getCommand
} = require("./get-command");
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
