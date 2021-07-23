const dc = require("node-dev-console");
// const R = require("ramda");
const alice = require("../../index");
const {callLog} = require("./call-log");

const triggerTestEnvironment = ({
                                    dryRun = false
                                } = {}) => {

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
        reInvokeSubscription: () => getByCallType("reInvokeSubscription"),

        /** @return {Array} */
        reInvokeSubscriptionResult: () => getByCallType("reInvokeSubscriptionResult"),

        /** @return {Array} */
        storeAppData: () => getByCallType("storeAppData"),
        /** @return {Array} */
        storeAppDataResult: () => getByCallType("storeAppDataResult"),

        /** @return {Array} */
        loadAppData: () => getByCallType("loadAppData"),
        /** @return {Array} */
        loadAppDataResult: () => getByCallType("loadAppDataResult"),

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
        getCollectionView: () => getByCallType("getCollectionView"),

        /** @return {Array} */
        getCollectionBackup: () => getByCallType("getCollectionBackup"),

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

    const emitCommand = async input => {
        add("emitCommand", input);
        if (dryRun) {
            return true;
        }
        const result = await alice.emitCommand(input);
        add("emitCommandResult", result);
        return result;
    };

    const emitMultiCommand = async input => {
        add("emitMultiCommand", input);
        if (dryRun) {
            return true;
        }
        const result = await alice.emitMultiCommand(input);
        add("emitMultiCommandResult", result);
        return result;
    };

    const reInvokeSubscription = async input => {
        add("reInvokeSubscription", input);
        if (dryRun) {
            return {
                ok: 1,
                matchedCount: 1,
                modifiedCount: 1,
            };
        }
        const result = await alice.reInvokeSubscription(input);
        add("reInvokeSubscriptionResult", result);
        return result;
    };

    return {
        storeDataEvent: async input => {
            add("storeDataEvent", input);
            const result = await alice.storeDataEvent(input);
            add("storeDataEventResult", result);
            return result;
        },

        storeDataEventOnPayloadChange: async input => {
            add("storeDataEventOnPayloadChange", input);
            const result = await alice.storeDataEventOnPayloadChange(input);
            add("storeDataEventOnPayloadChangeResult", result);
            return result;
        },

        emitCommand,
        emitMultiCommand,
        reInvokeSubscription,
        /** @deprecated */
        callLogEmitCommand: log.emitCommand,
        /** @deprecated */
        callLogEmitMultiCommand: log.emitMultiCommand,


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

        setOneCommandPaused: async (key) => {
            add("setOneCommandPaused", {key});
            const result = await alice.setOneCommandPaused(key);
            add("setOneCommandPausedResult", result);
            return result;
        },

        setOneCommandNotPaused: async (key) => {
            add("setOneCommandNotPaused", {key});
            const result = await alice.setOneCommandNotPaused(key);
            add("setOneCommandNotPausedResult", result);
            return result;
        },

        setOneCommandHandled: async (key) => {
            add("setOneCommandHandled", {key});
            const result = await alice.setOneCommandHandled(key);
            add("setOneCommandHandledResult", result);
            return result;
        },

        setOneCommandNotHandled: async (key) => {
            add("setOneCommandNotHandled", {key});
            const result = await alice.setOneCommandNotHandled(key);
            add("setOneCommandNotHandledResult", result);
            return result;
        },

        setOneCommandNotRunning: async (key) => {
            add("setOneCommandNotRunning", {key});
            const result = await alice.setOneCommandNotRunning(key);
            add("setOneCommandNotRunningResult", result);
            return result;
        },

        setManyCommandsPaused: async (key) => {
            add("setManyCommandsPaused", {key});
            const result = await alice.setManyCommandsPaused(key);
            add("setManyCommandsPausedResult", result);
            return result;
        },

        setManyCommandsNotPaused: async (key) => {
            add("setManyCommandsNotPaused", {key});
            const result = await alice.setManyCommandsNotPaused(key);
            add("setManyCommandsNotPausedResult", result);
            return result;
        },

        setManyCommandsHandled: async (key) => {
            add("setManyCommandsHandled", {key});
            const result = await alice.setManyCommandsHandled(key);
            add("setManyCommandsHandledResult", result);
            return result;
        },

        setManyCommandsNotHandled: async (key) => {
            add("setManyCommandsNotHandled", {key});
            const result = await alice.setManyCommandsNotHandled(key);
            add("setManyCommandsNotHandledResult", result);
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

        encrypt: alice.encrypt,
        decrypt: alice.decrypt,

        log,
    };
};

module.exports = {
    triggerTestEnvironment
};
