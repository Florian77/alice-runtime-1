const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {checkIndexes} = require("../../index");


dc.activate();


describe('lib/database-indexes.js', function () {

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
    it('check-indexes-1', async function () {

        const result = await checkIndexes();
        dc.j(result, "result")
        expect(result).to.be.deep.equal([
            "findCommandToProcess",
            "findCommandToProcess.context",
            "reInvokeSubscription",
            "commandId",
            // "stats.multiInvoke_true_v2",
            // "stats.running_true_v2",
            // "stats.paused_true_v2",
            // "stats.ok_false_v2",
            // "stats.handled_false_v2",
            // "stats.handled_false_paused_false_v2",
            "findEventToDispatch",
            "findEventToDispatch.context",
            "dataEventByAggregateId",
            "dataEventByAggregate",
            // "getLastDataEvent",
            // "findEventToProcess",
            // "stats.dispatched_false",
            "context_aggregate",
            "index.*",
            "activateCronTrigger",
            "dispatchEvent.updateTriggerIndex",
            "findTriggerToProcess",
            "findTriggerToProcess.context",
            "context_aggregate",
            // "stats.error_true",
            // "stats.checkForUpdates_true",
            // "stats.running_true",
            // "stats.paused_true",
            "type"
        ]);

        // old indexes
        /*expect(result).to.be.deep.equal([
            "Alice_findEventToDispatch_v2",
            "Alice_getLastDataEvent",
            "Alice_findEventToProcess",
            "Alice_getDataIndexOverview",
            "Alice_getDataIndexOverview",
            "Alice_findCommandToProcess_v2",
            "Alice_getCommandIndexOverview_1",
            "Alice_getCommandIndexOverview_2",
            "Alice_getCommandIndexOverview_3",
            "Alice_getCommandIndexOverview_4",
            "Alice_getCommandIndexOverview_5",
            "Alice_getCommandIndexOverview_6",
            "Alice_reInvokeSubscription",
            "Alice_findTriggerToProcess_v2",
            "Alice_updateTriggerIndex",
            "Alice_getTriggerIndexOverview_1",
            "Alice_getTriggerIndexOverview_2",
            "Alice_getTriggerIndexOverview_3",
            "Alice_getTriggerIndexOverview_4"
        ]);*/

        // TODO -> check result in DB

    });


});
