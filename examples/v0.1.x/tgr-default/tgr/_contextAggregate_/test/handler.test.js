const dc = require("node-dev-console");
const expect = require('chai').expect;
const aliceTestEnv = require("alice-runtime/test-environment");

dc.activate();
aliceTestEnv.loadRuntimeConfig(__dirname, dc.or("test", "unit-test"));

const testHandler = require('../handler');


describe('app/_THIS_CONTEXT_/_THIS_AGGREGATE_/trg/_contextAggregate_/handler', function () {

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
    it('data/event-1', async function () {
        const env = aliceTestEnv.triggerTestEnvironment();

        const result = await testHandler(
            require('./data/event-1'),
            env,
        );

        dc.j(result, "Test result");
        dc.j(env.log.emitCommand(), "Test log.emitCommand");
        dc.j(env.log.emitMultiCommand(), "Test log.emitMultiCommand");

        expect(result).to.equal(true);
        expect(env.log.emitMultiCommand()).to.deep.equal(require('./data/event-1_result'));
    });



});
