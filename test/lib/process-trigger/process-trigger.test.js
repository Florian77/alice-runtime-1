const expect = require('chai').expect;
const dc = require("node-dev-console");
const {resolve} = require('path');
const aliceTestEnv = require("../../../test-environment");
const {dispatchEvents} = require("../../../index");
const {utility} = require("../../../index");
const {getLastDataEvent} = require("../../../index");
const {
    createTrigger,
    processTrigger,
    processNextTrigger,
    activateCronTrigger,
    process,
} = require("../../../index");
const {
    insertTestData1,
    insertTestData2,
    insertTestDataError1,
    insertTestDataError2,
} = require("./test-data");

dc.activate();


describe('lib/process-triggers.js', function () {

    this.timeout(15 * 1000);

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

    const functionPath = resolve(__dirname, "test-app");

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // -----------------------------------------------------------------------------------------------------------------------------
    it('process-next-trigger-1', async function () {
        await insertTestData1();
        await dispatchEvents();
        const result = await processNextTrigger({functionPath});
        dc.j(result, "result");
        expect(result).to.equal(true);
        // TODO -> check result in DB
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('process-triggers-2', async function () {
        await insertTestData1();
        await dispatchEvents();
        const result = await processTrigger({
            maxProcessTrigger: 2,
            functionPath,
        });
        dc.j(result, "result")
        expect(result).to.be.deep.equal({
            "moreToProcess": false,
            "processedTriggerCounter": 1,
            "processedEventsCounter": 1,
            "withError": false,
            "runTime": 0
        });
        // TODO -> check result in DB
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('process-next-trigger-error-1', async function () {
        await insertTestDataError1();
        await dispatchEvents();
        const result = await processNextTrigger({
            functionPath,
        });
        dc.j(result, "result");
        expect(result).to.equal("ERROR");
        // TODO -> check result in DB
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('process-triggers-error-2', async function () {
        await insertTestDataError2();
        await dispatchEvents();
        const result = await processNextTrigger({
            functionPath,
        });
        dc.j(result, "result");
        expect(result).to.equal("ERROR");
        // TODO -> check result in DB
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('error path, catch error on require', async function () {
        {
            const result = await createTrigger({
                type: "stream",
                context: "RANDOM-CONTEXT",
                aggregate: "random-aggregate",
                trigger: "throwErrorOnRequire",
                streamContext: "RANDOM-CONTEXT",
            });
            dc.j(result, "createTrigger().result");
        }
        {
            const result = await processNextTrigger({
                functionPath,
            });
            dc.j(result, "processNextTrigger().result");
            expect(result).to.equal("ERROR");
        }
        // TODO -> check result in DB
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('process-triggers-3', async function () {
        await insertTestData1({eventCount: 3});
        await dispatchEvents();
        {
            const result = await processTrigger({
                maxProcessTrigger: 1,
                maxProcessEvents: 2,
                functionPath,
            });
            dc.j(result, "result");
            expect(result).to.be.deep.equal({
                "moreToProcess": true,
                "processedTriggerCounter": 1,
                "processedEventsCounter": 2,
                "withError": false,
                "runTime": 0
            });
            // TODO -> check result in DB
        }
        // Check if Trigger is back in checkForUpdates: true state and run again
        {

            const result = await processTrigger({
                maxProcessTrigger: 1,
                maxProcessEvents: 2,
                functionPath,
            });
            dc.j(result, "result");
            expect(result).to.be.deep.equal({
                "moreToProcess": true,
                "processedTriggerCounter": 1,
                "processedEventsCounter": 1,
                "withError": false,
                "runTime": 0
            });
            // TODO -> check result in DB
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('process-triggers-paused-1', async function () {
        await insertTestData2();
        await dispatchEvents();
        const result = await processTrigger({
            maxProcessTrigger: 1,
            functionPath,
        });
        dc.j(result, "result");
        expect(result).to.be.deep.equal({
            "moreToProcess": false,
            "processedTriggerCounter": 0,
            "processedEventsCounter": 0,
            "withError": false,
            "runTime": 0
        });
        // TODO -> check result in DB
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('cron trigger single steps', async function () {
        {
            const result = await createTrigger({
                type: "cron",
                context: "RANDOM-CONTEXT",
                aggregate: "random-aggregate",
                trigger: "myCronJob",
                cronExpression: "*/2 * * * * *",
            });
            dc.j(result, "createTrigger().result");
        }
        {
            const result = await activateCronTrigger();
            dc.t(result.matchedCount, "activateCronTrigger().result.matchedCount before");
            dc.t(result.modifiedCount, "activateCronTrigger().result.modifiedCount before");
            expect(result.matchedCount).to.be.equal(0);
            expect(result.modifiedCount).to.be.equal(0);
        }
        dc.l("wait 2.5 second...");
        await sleep(2.5 * 1000);
        {
            const result = await activateCronTrigger();
            dc.t(result.matchedCount, "activateCronTrigger().result.matchedCount after");
            dc.t(result.modifiedCount, "activateCronTrigger().result.modifiedCount after");
            expect(result.matchedCount).to.be.equal(1);
            expect(result.modifiedCount).to.be.equal(1);
        }
        {
            const result = await processTrigger({
                functionPath,
            });
            dc.j(result, "processTrigger().result");
        }
        {
            const dataEvent = await getLastDataEvent({
                context: "RANDOM-CONTEXT",
                aggregate: "random-aggregate",
                aggregateId: "id=1",
            });
            dc.j(dataEvent, "dataEvent");
            expect(utility.getPayload(dataEvent)).to.be.deep.equal({
                "test": "data",
                "trigger": "myCronJob"
            })
        }

        // TODO -> check trigger result in DB
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('cron trigger full process', async function () {
        {
            const result = await createTrigger({
                type: "cron",
                context: "RANDOM-CONTEXT",
                aggregate: "random-aggregate",
                trigger: "myCronJob",
                cronExpression: "*/2 * * * * *",
            });
            dc.j(result, "createTrigger().result");
        }
        dc.l("wait 2.5 second...");
        await sleep(2.5 * 1000);
        {
            const result = await process({
                functionPath,
            });
            dc.j(result, "process().result");
        }
        {
            const dataEvent = await getLastDataEvent({
                context: "RANDOM-CONTEXT",
                aggregate: "random-aggregate",
                aggregateId: "id=1",
            });
            dc.j(dataEvent, "dataEvent");
            expect(utility.getPayload(dataEvent)).to.be.deep.equal({
                "test": "data",
                "trigger": "myCronJob"
            })
        }
    });


});
