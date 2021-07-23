const R = require("ramda");
const {
    getCollectionView,
    getCollectionBackup,
    getCollectionCommandPrivate,
} = require("./database");
const {
    storeDataEvent,
    storeDataEventOnPayloadChange,
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
} = require("./get-command-events");
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
} = require("./command-control")
const {
    storeAppData,
    loadAppData,
} = require("./app-data");
const {
    encrypt,
    decrypt,
} = require("./encrypt_decrypt");
const {csvImport} = require("./csv-import");

const commandEnvironment = (command) => {

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
        csvImport,
    };
};

module.exports = {
    commandEnvironment
};
