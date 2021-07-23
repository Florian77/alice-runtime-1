const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {resolve} = require("path");
const {
    dispatchNextEvent,
    dispatchEvents,
    storeDataEvent,
    createDataTrigger,
    processTrigger
} = require("../../index");


dc.activate();


const insertTestData1 = async () => {
    {

        const result = await createDataTrigger({
            context: "akeneo",
            aggregate: "product",
            trigger: "emptyTrigger",
            streamContext: "akeneo",
            streamAggregate: "product",
            streamAggregateId: "sku=203040",
        });
        // log("insertTestData1().createDataTrigger() DONE");
        // debug("insertTestData1().createDataTrigger().result", ftDev.jsonString(result));
    }
    {

        const result = await createDataTrigger({
            context: "akeneo",
            aggregate: "product",
            trigger: "emptyTrigger",
            streamContext: "akeneo",
            streamAggregate: "product",
        });
        // log("insertTestData1().createDataTrigger() DONE");
        // debug("insertTestData1().createDataTrigger().result", ftDev.jsonString(result));
    }
    {

        const result = await createDataTrigger({
            context: "akeneo",
            aggregate: "product",
            trigger: "emptyTrigger",
            streamContext: "akeneo",
        });
        // log("insertTestData1().createDataTrigger() DONE");
        // debug("insertTestData1().createDataTrigger().result", ftDev.jsonString(result));
    }
    {
        const result = await processTrigger({
            functionPath: resolve(
                __dirname,
                "dispatch-events",
                "test-data-1"
            )
        });
        // log("insertTestData1().processTrigger() DONE");
        // debug("insertTestData1().processTrigger().result ", ftDev.jsonString(result));
    }
    {
        const result = await storeDataEvent({
            context: "akeneo",
            aggregate: "product",
            aggregateId: "sku=203040",
            payload: {
                myData: "important command"
            },
        });
        // log("insertTestData1().storeDataEvent() DONE");
        // debug("insertTestData1().storeDataEvent().result", ftDev.jsonString(result));
    }
    return true;
};


describe('lib/dispatch-events.js', function () {

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
    it('basic-dispatch-next-event', async function () {
        await insertTestData1();

        const result = await dispatchNextEvent();
        // log("dispatchNextEvent() DONE");
        // logResult("dispatchNextEvent().result", ftDev.jsonString(result));

        expect(result).to.equal(true);

        // TODO -> check result in DB
    });

    it('basic-dispatch-events-1', async function () {
        await insertTestData1();

        const result = await dispatchEvents({
            maxDispatchEvents: 1
        });
        // log("dispatchEvents() [1] DONE");
        // logResult("dispatchEvents().result [1]", ftDev.jsonString(result));

        expect(result).to.be.deep.equal({
            "moreToProcess": true,
            "processedCounter": 1,
            "runTime": 0,
            "withError": false
        });

        // TODO -> check result in DB
    });

    it('basic-dispatch-events-2', async function () {
        await insertTestData1();

        const result = await dispatchEvents({
            maxDispatchEvents: 10
        });
        // log("dispatchEvents() DONE [2]");
        // logResult("dispatchEvents().result [2]", ftDev.jsonString(result));

        expect(result).to.be.deep.equal({
            "moreToProcess": false,
            "processedCounter": 4,
            "runTime": 0,
            "withError": false
        });
        // TODO -> check result in DB
    });


});
