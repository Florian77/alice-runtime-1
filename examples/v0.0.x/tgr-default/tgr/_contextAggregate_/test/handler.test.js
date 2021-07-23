const dc = require("node-dev-console");
const expect = require('chai').expect;
const {mockTriggerEnvironment} = require('alice-runtime-test-helper');

dc.activate();

const testHandler = require('../handler');

describe('app/_THIS_CONTEXT_/_THIS_AGGREGATE_/trg/_contextAggregate_/handler', function () {

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(function () {
        dc.l("---------------", this.currentTest.title, "---------------");
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('data/event-1', async function () {
        const env = mockTriggerEnvironment();
        const result = await testHandler(
            require('./data/event-1'),
            env,
        );
        dc.l("result", dc.stringify(result));
        dc.l("env.callLogEmitCommand()", dc.stringify(env.callLogEmitCommand()));
        dc.l("env.callLogEmitMultiCommand()", dc.stringify(env.callLogEmitMultiCommand()));

        expect(env.callLogEmitMultiCommand()).to.deep.equal(require('./data/event-1_result'));
        expect(result).to.equal(true);
    });



});
