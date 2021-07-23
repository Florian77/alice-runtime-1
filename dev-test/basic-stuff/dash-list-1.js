const ftDev = require('ftws-node-dev-tools');
// ftDev.logJsonString(__dirname);
// ftDev.logJsonString(require('path').resolve(__dirname, '.env'));
// ftDev.logJsonString(process.cwd());
// ftDev.logJsonString(process.env);
const alice = require('../../index');
// const {invokeKeyString, stringifyId, objectType, getObjectKey, getObjectId, objectKey, matchObjectType, findByType, findByKey} = alice.key;
// alice.setTypeExeFnPath(__dirname, '../../type/', true);
const {clearEventStream} = require('alice-runtime-test-helper');
const R = require("ramda");
const uuid = require("uuid/v4");

alice.loadRuntimeConfig(__dirname, "local");

let doClearDatabase = false;
doClearDatabase = true;


require("debug").log = console.log.bind(console);
const _logger = require("debug")("test");
const log = _logger.extend("log");
const logResult = log.extend("result");
// const debug = _logger.extend("debug");
require("debug").enable(""
    + ",*:log"
    // +",*:debug"
    + ",test:log:result"
    // +",test:debug"
    // + ",alice:dashboardStats:debug"
    + ",alice:upsertStats:debug"
    + ",alice:db:connect"
);


describe('dash-test-1', function () {

    this.timeout(10 * 1000);

    before(async () => {
        ftDev.log('----------------------------------------');
        // if (doClearDatabase) {
        //     if (!await clearEventStream(alice, {allContext: true})) {
        //         throw Error('clearDatabase() faild ');
        //     }
        // } else {
        //     ftDev.log('doClearDatabase: OFF');
        // }
        await alice.connect();
    });

    after(async () => {
        await alice.disconnect();
    });


    it('test1', async function () {

        const result = await alice.getDataIndex();
        ftDev.logJsonString(result, "getDataIndex().result");
    });


    it('test2', async function () {

        const result = await alice.getCommandIndex();
        ftDev.logJsonString(result, "getCommandIndex().result");
    });

    it('test3', async function () {

        const result = await alice.getTriggerIndex();
        ftDev.logJsonString(result, "getTriggerIndex().result");
    });

    it('test4', async function () {
        const result = await alice.getDataContextAggregateList();
        ftDev.logJsonString(result, "getDataContextAggregateList().result");
    });

    it('test5', async function () {
        const result = await alice.getCommandContextAggregateList();
        ftDev.logJsonString(result, "getCommandContextAggregateList().result");
    });

    it('test6', async function () {
        const result = await alice.getTriggerContextAggregateList();
        ftDev.logJsonString(result, "getTriggerContextAggregateList().result");
    });


});
