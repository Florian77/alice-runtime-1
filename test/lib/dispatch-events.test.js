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
        // dc.l("insertTestData1().createDataTrigger() DONE");
        // dc.l("insertTestData1().createDataTrigger().result", dc.stringify(result));
    }
    {

        const result = await createDataTrigger({
            context: "akeneo",
            aggregate: "product",
            trigger: "emptyTrigger",
            streamContext: "akeneo",
            streamAggregate: "product",
        });
        // dc.l("insertTestData1().createDataTrigger() DONE");
        // dc.l("insertTestData1().createDataTrigger().result", dc.stringify(result));
    }
    {

        const result = await createDataTrigger({
            context: "akeneo",
            aggregate: "product",
            trigger: "emptyTrigger",
            streamContext: "akeneo",
        });
        // dc.l("insertTestData1().createDataTrigger() DONE");
        // dc.l("insertTestData1().createDataTrigger().result", dc.stringify(result));
    }
    {
        const result = await processTrigger({
            functionPath: resolve(
                __dirname,
                "dispatch-events",
                "test-data-1"
            )
        });
        // dc.l("insertTestData1().processTrigger() DONE");
        // dc.l("insertTestData1().processTrigger().result ", dc.stringify(result));
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
        // dc.l("insertTestData1().storeDataEvent() DONE");
        // dc.l("insertTestData1().storeDataEvent().result", dc.stringify(result));
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
        // dc.l("dispatchNextEvent() DONE");
        // logResult("dispatchNextEvent().result", dc.stringify(result));

        expect(result).to.equal(true);

        // TODO -> check result in DB
    });

    it('basic-dispatch-events-1', async function () {
        await insertTestData1();

        const result = await dispatchEvents({
            maxDispatchEvents: 1
        });
        // dc.l("dispatchEvents() [1] DONE");
        // logResult("dispatchEvents().result [1]", dc.stringify(result));

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
        // dc.l("dispatchEvents() DONE [2]");
        // logResult("dispatchEvents().result [2]", dc.stringify(result));

        expect(result).to.be.deep.equal({
            "moreToProcess": false,
            "processedCounter": 1,
            "runTime": 0,
            "withError": false
        });
        // TODO -> check result in DB
    });


});
