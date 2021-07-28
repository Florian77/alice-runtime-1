const alice = require("../index");
const {multiProcess} = require("./lib/multi-process");
const {singleProcess} = require("./lib/single-process");
const {processOne} = require("./lib/process-one");
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

    processOne,
    singleProcess,
    multiProcess,
};
