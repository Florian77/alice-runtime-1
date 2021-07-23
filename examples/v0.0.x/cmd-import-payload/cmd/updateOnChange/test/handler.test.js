const dc = require("node-dev-console");
const expect = require('chai').expect;
const {mockCommandEnvironment} = require('alice-runtime-test-helper');

dc.activate();

const testHandler = require('../handler');


describe('app/_THIS_CONTEXT_/_THIS_AGGREGATE_/cmd/updateOnChange/handler', function () {

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(function () {
        dc.l("---------------", this.currentTest.title, "---------------");
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('data/command-1', async function () {
        const env = mockCommandEnvironment()
            // .dbLogData()
        ;
        const result = await testHandler(
            require('./data/command-1'),
            env,
        );
        dc.l("result", dc.stringify(result));
        dc.l("env.callLogGetLastDataEvent()", dc.stringify(env.callLogGetLastDataEvent()));
        dc.l("env.callLogStoreDataEvent()", dc.stringify(env.callLogStoreDataEvent()));
        dc.l("env.callLogStoreDataEventOnPayloadChange()", dc.stringify(env.callLogStoreDataEventOnPayloadChange()));

        expect(env.callLogStoreDataEventOnPayloadChange()).to.deep.equal(require('./data/command-1_result'));
    });


});
