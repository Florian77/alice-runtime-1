const dc = require("node-dev-console");
const expect = require('chai').expect;
const aliceTestEnv = require("alice-runtime/test-environment");

dc.activate();
aliceTestEnv.loadRuntimeConfig(__dirname, dc.or("test", "unit-test"));

const testHandler = require('../handler');


describe('app/_THIS_CONTEXT_/_THIS_AGGREGATE_/cmd/makeAggregate/handler', function () {

    // -----------------------------------------------------------------------------------------------------------------------------
    before(async () => {
        await aliceTestEnv.connect();
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    after(async () => {
        await aliceTestEnv.disconnect();
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(async function () {
        dc.l("---------------", this.currentTest.title, "---------------");
        await aliceTestEnv.clearDatabase();
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('data/command-1', async function () {
        const env = aliceTestEnv.commandTestEnvironment();
        await env.storeDataEvent(require("./data/item-123456"));
        env.log.clear();

        const result = await testHandler(
            require('./data/command-1'),
            env
        );
        dc.j(result, "Test result");
        dc.j(env.log.getLastDataEvent(), "Test log.getLastDataEvent");
        dc.j(env.log.queryDataIndex(), "Test log.queryDataIndex");
        dc.j(env.log.storeDataEvent(), "Test log.storeDataEvent");
        dc.j(env.log.storeDataEventOnPayloadChange(), "Test log.storeDataEventOnPayloadChange");

        expect(env.log.storeDataEventOnPayloadChange()).to.deep.equal(require('./data/command-1_result'));
    });


});
