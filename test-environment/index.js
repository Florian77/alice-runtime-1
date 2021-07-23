const alice = require("../index");
const {commandTestEnvironment} = require("./lib/command-test-environment");
const {triggerTestEnvironment} = require("./lib/trigger-test-environment");
const {clearDatabase} = require("./lib/clear-database");

module.exports = {
    loadRuntimeConfig: alice.loadRuntimeConfig,

    connect: alice.connect,
    disconnect: alice.disconnect,
    clearDatabase,
    getCollection: alice.getCollection,

    commandTestEnvironment,
    triggerTestEnvironment,
};
