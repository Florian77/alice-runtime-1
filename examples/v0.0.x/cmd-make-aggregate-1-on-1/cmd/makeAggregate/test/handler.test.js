const dc = require("node-dev-console");
const expect = require('chai').expect;
const {mockCommandEnvironment} = require('alice-runtime-test-helper');

dc.activate();

const testHandler = require('../handler');


describe('app/_THIS_CONTEXT_/_THIS_AGGREGATE_/cmd/makeAggregate/handler', function () {

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(function () {
        dc.l("---------------", this.currentTest.title, "---------------");
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('data/command-1', async function () {
        const env = mockCommandEnvironment()
            .dbAddData(require("./data/item-123456"))
            // .dbLogData()
        ;
        const result = await testHandler(
            require('./data/command-1'),
            env
        );
        dc.l("result", dc.stringify(result));
        dc.l("GetLastDataEvent", dc.stringify(env.callLogGetLastDataEvent()));
        dc.l("QueryDataIndex", dc.stringify(env.callLogQueryDataIndex()));
        dc.l("StoreDataEvent", dc.stringify(env.callLogStoreDataEvent()));
        dc.l("StoreDataEventOnPayloadChange", dc.stringify(env.callLogStoreDataEventOnPayloadChange()));

        expect(env.callLogStoreDataEventOnPayloadChange()).to.deep.equal(require('./data/command-1_result'));
    });


});
