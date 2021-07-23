const R = require("ramda");
const {
    getCollectionView,
    getCollectionBackup,
    getCollectionCommandPrivate,
} = require("./database");
const {storeDataEvent} = require("./store-data-event");
const {storeDataEventOnPayloadChange} = require("./store-data-event-on-payload-change");
const {emitCommand} = require("./emit-command");
const {emitMultiCommand} = require("./emit-multi-command");
const {reInvokeSubscription} = require("./re-invoke-subscription");
const {
    getDataEventStream,
    getLastDataEvent,
    getDataEvent,
    queryDataIndex,
} = require("./get-data-events");
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


function commandEnvironment(command) {

    if (R.isNil(command)) {
        throw Error("commandEnvironment(): param command is missing");
    }


    const getCollectionPrivate = (name) => {
        return getCollectionCommandPrivate(command, name);
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

        // Command ENV only
    };
}


module.exports = {
    commandEnvironment
};
