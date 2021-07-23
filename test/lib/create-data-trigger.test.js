const expect = require('chai').expect;
const dc = require("node-dev-console");
const R = require("ramda");
const aliceTestEnv = require("../../test-environment");
const {createTrigger} = require("../../index");


dc.activate();


describe('lib/create-data-trigger.js', function () {

    this.timeout(10 * 1000);

    // -----------------------------------------------------------------------------------------------------------------------------
    before(async () => {
        aliceTestEnv.loadRuntimeConfig(__dirname, "unit-test");
        await aliceTestEnv.connect();
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    after(async () => {
        await aliceTestEnv.disconnect();
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(async function () {
        dc.l("---------------", this.currentTest.title, "---------------");
        await aliceTestEnv.clearDatabase({createIndexAfterClear: true});
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('happy path', async function () {
        const result = await createTrigger({
            context: "akeneo",
            aggregate: "product",
            trigger: "myTrigger",

            streamContext: "akeneo",
            streamAggregate: "product",
            streamAggregateId: "sku=203040",

            lastSequenceNumber: -1,
        });
        dc.j(result, "result");

        expect(result.deployedAt).to.be.a("date");
        expect(R.omit(["deployedAt"], result)).to.be.deep.equal({
            "_id": "akeneo/product::stream::myTrigger::DATA::akeneo/product/sku=203040",
            "context": "akeneo",
            "aggregate": "product",
            "trigger": "myTrigger",
            "type": "stream",
            "streamType": "DATA",
            "streamId": "akeneo/product/sku=203040",
            "lastSequenceNumber": -1,
            "checkForUpdates": true,
            "running": false,
            "runningSince": null,
            "lastRunAt": null,
            "error": false,
            "errorMsg": null,
            "paused": false,
            "pausedAt": null,
        });
    });


});
