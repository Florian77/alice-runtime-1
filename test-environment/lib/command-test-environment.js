const R = require("ramda");
const alice = require("../../index");
const {callLog} = require("./call-log");


const commandTestEnvironment = (command = {
    context: "TEST-CONTEXT",
    aggregate: "test-aggregate",
    command: "testCommand",
}) => {

    const {add, clear, displayAll, getAll, getByCallType} = callLog();

    const log = {
        /** @return {Array} */
        storeDataEvent: () => getByCallType("storeDataEvent"),
        /** @return {Array} */
        storeDataEventResult: () => getByCallType("storeDataEventResult"),

        /** @return {Array} */
        storeDataEventOnPayloadChange: () => getByCallType("storeDataEventOnPayloadChange"),
        /** @return {Array} */
        storeDataEventOnPayloadChangeResult: () => getByCallType("storeDataEventOnPayloadChangeResult"),

        /** @return {Array} */
        emitCommand: () => getByCallType("emitCommand"),
        /** @return {Array} */
        emitCommandResult: () => getByCallType("emitCommandResult"),

        /** @return {Array} */
        emitMultiCommand: () => getByCallType("emitMultiCommand"),
        /** @return {Array} */
        emitMultiCommandResult: () => getByCallType("emitMultiCommandResult"),

        /** @return {Array} */
        getDataEventStream: () => getByCallType("getDataEventStream"),
        /** @return {Array} */
        getDataEventStreamResult: () => getByCallType("getDataEventStreamResult"),

        /** @return {Array} */
        getLastDataEvent: () => getByCallType("getLastDataEvent"),
        /** @return {Array} */
        getLastDataEventResult: () => getByCallType("getLastDataEventResult"),

        /** @return {Array} */
        getDataEvent: () => getByCallType("getDataEvent"),
        /** @return {Array} */
        getDataEventResult: () => getByCallType("getDataEventResult"),

        /** @return {Array} */
        getCollectionView: () => getByCallType("getCollectionView"),

        /** @return {Array} */
        getCollectionBackup: () => getByCallType("getCollectionBackup"),

        /** @return {Array} */
        getCollectionPrivate: () => getByCallType("getCollectionPrivate"),

        /** @return {Array} */
        getCommand: () => getByCallType("getCommand"),
        /** @return {Array} */
        getCommandResult: () => getByCallType("getCommandResult"),

        /** @return {Array} */
        setOneCommandPaused: () => getByCallType("setOneCommandPaused"),
        /** @return {Array} */
        setOneCommandPausedResult: () => getByCallType("setOneCommandPausedResult"),

        /** @return {Array} */
        setOneCommandNotPaused: () => getByCallType("setOneCommandNotPaused"),
        /** @return {Array} */
        setOneCommandNotPausedResult: () => getByCallType("setOneCommandNotPausedResult"),

        /** @return {Array} */
        setOneCommandHandled: () => getByCallType("setOneCommandHandled"),
        /** @return {Array} */
        setOneCommandHandledResult: () => getByCallType("setOneCommandHandledResult"),

        /** @return {Array} */
        setOneCommandNotHandled: () => getByCallType("setOneCommandNotHandled"),
        /** @return {Array} */
        setOneCommandNotHandledResult: () => getByCallType("setOneCommandNotHandledResult"),

        /** @return {Array} */
        setOneCommandNotRunning: () => getByCallType("setOneCommandNotRunning"),
        /** @return {Array} */
        setOneCommandNotRunningResult: () => getByCallType("setOneCommandNotRunningResult"),

        /** @return {Array} */
        setManyCommandsPaused: () => getByCallType("setManyCommandsPaused"),
        /** @return {Array} */
        setManyCommandsPausedResult: () => getByCallType("setManyCommandsPausedResult"),

        /** @return {Array} */
        setManyCommandsNotPaused: () => getByCallType("setManyCommandsNotPaused"),
        /** @return {Array} */
        setManyCommandsNotPausedResult: () => getByCallType("setManyCommandsNotPausedResult"),

        /** @return {Array} */
        setManyCommandsHandled: () => getByCallType("setManyCommandsHandled"),
        /** @return {Array} */
        setManyCommandsHandledResult: () => getByCallType("setManyCommandsHandledResult"),

        /** @return {Array} */
        setManyCommandsNotHandled: () => getByCallType("setManyCommandsNotHandled"),
        /** @return {Array} */
        setManyCommandsNotHandledResult: () => getByCallType("setManyCommandsNotHandledResult"),

        /** @return {Array} */
        queryDataIndex: () => getByCallType("queryDataIndex"),
        /** @return {Array} */
        queryDataIndexResult: () => getByCallType("queryDataIndexResult"),

        /** @return {Array} */
        csvImport: () => getByCallType("csvImport"),
        /** @return {Array} */
        csvImportResult: () => getByCallType("csvImportResult"),

        /** @return {Array} */
        storeAppData: () => getByCallType("storeAppData"),
        /** @return {Array} */
        storeAppDataResult: () => getByCallType("storeAppDataResult"),

        /** @return {Array} */
        loadAppData: () => getByCallType("loadAppData"),
        /** @return {Array} */
        loadAppDataResult: () => getByCallType("loadAppDataResult"),

        /**
         * clear current call log
         */
        clear,

        /**
         * returns full call log
         * @return {Array}
         */
        getAll,

        /**
         * display all log entries with given function fn
         * @param {function} fn
         */
        displayAll,
    };

    return {
        storeDataEvent: async input => {
            add("storeDataEvent", input);
            const result = await alice.storeDataEvent(input);
            add("storeDataEventResult", result);
            return result;
        },
        /** @deprecated */
        callLogStoreDataEvent: log.storeDataEvent, // deprecated

        storeDataEventOnPayloadChange: async input => {
            add("storeDataEventOnPayloadChange", input);
            const result = await alice.storeDataEventOnPayloadChange(input);
            add("storeDataEventOnPayloadChangeResult", result);
            return result;
        },
        /** @deprecated */
        callLogStoreDataEventOnPayloadChange: log.storeDataEventOnPayloadChange, // deprecated

        emitCommand: async input => {
            add("emitCommand", input);
            const result = await alice.emitCommand(input);
            add("emitCommandResult", result);
            return result;
        },
        /** @deprecated */
        callLogEmitCommand: log.emitCommand,

        emitMultiCommand: async input => {
            add("emitMultiCommand", input);
            const result = await alice.emitMultiCommand(input);
            add("emitMultiCommandResult", result);
            return result;
        },
        /** @deprecated */
        callLogEmitMultiCommand: log.emitMultiCommand, // deprecated

        getDataEventStream: async input => {
            add("getDataEventStream", input);
            const result = await alice.getDataEventStream(input);
            add("getDataEventStreamResult", result);
            return result;
        },

        getLastDataEvent: async input => {
            add("getLastDataEvent", input);
            const result = await alice.getLastDataEvent(input);
            add("getLastDataEventResult", result);
            return result;
        },
        /** @deprecated */
        callLogGetLastDataEvent: log.getLastDataEvent, // deprecated

        getDataEvent: async input => {
            add("getDataEvent", input);
            const result = await alice.getDataEvent(input);
            add("getDataEventResult", result);
            return result;
        },

        getCollectionView: name => {
            add("getCollectionView", name);
            return alice.getCollectionView(name);
        },

        getCollectionBackup: name => {
            add("getCollectionBackup", name);
            return alice.getCollectionBackup(name);
        },

        getCollectionPrivate: (name) => {
            add("getCollectionPrivate", name);
            return alice.getCollectionCommandPrivate(command, name);
        },

        getCommand: async input => {
            add("getCommand", input);
            const result = await alice.getCommand(input);
            add("getCommandResult", result);
            return result;
        },

        setOneCommandPaused: async input => {
            add("setOneCommandPaused", input);
            const result = await alice.setOneCommandPaused(input);
            add("setOneCommandPausedResult", result);
            return result;
        },

        setOneCommandNotPaused: async input => {
            add("setOneCommandNotPaused", input);
            const result = await alice.setOneCommandNotPaused(input);
            add("setOneCommandNotPausedResult", result);
            return result;
        },

        setOneCommandHandled: async input => {
            add("setOneCommandHandled", input);
            const result = await alice.setOneCommandHandled(input);
            add("setOneCommandHandledResult", result);
            return result;
        },

        setOneCommandNotHandled: async input => {
            add("setOneCommandNotHandled", input);
            const result = await alice.setOneCommandNotHandled(input);
            add("setOneCommandNotHandledResult", result);
            return result;
        },

        setOneCommandNotRunning: async input => {
            add("setOneCommandNotRunning", input);
            const result = await alice.setOneCommandNotRunning(input);
            add("setOneCommandNotRunningResult", result);
            return result;
        },

        setManyCommandsPaused: async input => {
            add("setManyCommandsPaused", input);
            const result = await alice.setManyCommandsPaused(input);
            add("setManyCommandsPausedResult", result);
            return result;
        },

        setManyCommandsNotPaused: async input => {
            add("setManyCommandsNotPaused", input);
            const result = await alice.setManyCommandsNotPaused(input);
            add("setManyCommandsNotPausedResult", result);
            return result;
        },

        setManyCommandsHandled: async input => {
            add("setManyCommandsHandled", input);
            const result = await alice.setManyCommandsHandled(input);
            add("setManyCommandsHandledResult", result);
            return result;
        },

        setManyCommandsNotHandled: async input => {
            add("setManyCommandsNotHandled", input);
            const result = await alice.setManyCommandsNotHandled(input);
            add("setManyCommandsNotHandledResult", result);
            return result;
        },

        queryDataIndex: async (query, options) => {
            add("queryDataIndex", {query, options});
            const result = await alice.queryDataIndex(query, options);
            add("queryDataIndexResult", result);
            return result;
        },
        /** @deprecated */
        callLogQueryDataIndex: log.queryDataIndex, // deprecated

        csvImport: async (query, options) => {
            add("csvImport", {query, options});
            const result = await alice.csvImport(query, options);
            add("csvImportResult", result);
            return result;
        },

        storeAppData: async (key, data) => {
            add("storeAppData", {key, data});
            const result = await alice.storeAppData(key, data);
            add("storeAppDataResult", result);
            return result;
        },

        loadAppData: async (key) => {
            add("loadAppData", {key});
            const result = await alice.loadAppData(key);
            add("loadAppDataResult", result);
            return result;
        },


        encrypt: alice.encrypt,
        decrypt: alice.decrypt,

        log,
    };
};

module.exports = {
    commandTestEnvironment
};
