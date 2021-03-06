const expect = require('chai').expect;
const R = require("ramda");
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {
    queryDataIndex,
    storeDataEvent,
    getDataEventStream,
    getLastDataEvent,
    getDataEvent,
} = require("../../index");


dc.activate();



const insertTestData1 = async ({eventCount = 1} = {}) => {
    do {
        const result = await storeDataEvent({
            context: "akeneo",
            aggregate: "import-product",
            aggregateId: "sku=203040",
            payload: {
                name: "Hello World!"
            }
        });
        // dc.l("insertTestData1().storeDataEvent() [eventCount=%s] DONE", eventCount);
        // dc.l("insertTestData1().storeDataEvent().result [eventCount=%s]", eventCount, dc.stringify(result));
        // expect(result).to.equal(true);
    } while ((eventCount -= 1) > 0);
    return true;
};

const insertTestDataIndex1 = async () => {
    const skuList = ["20", "30", "40"];
    for (let sku of skuList) {
        const result = await storeDataEvent({
            context: "akeneo",
            aggregate: "import-product",
            aggregateId: `sku=${sku}`,
            payload: {
                sku,
                name: `Product  ${sku}`
            },
            index: {
                parentSku: "10"
            }
        });
        // dc.l("insertTestDataIndex1().storeDataEvent() [sku=%s] DONE", sku);
        // dc.l("insertTestDataIndex1().storeDataEvent().result [eventCount=%s]", eventCount, dc.stringify(result));
        // expect(result).to.equal(true);
    }
    {

        const sku = "10";
        const result = await storeDataEvent({
            context: "akeneo",
            aggregate: "import-product",
            aggregateId: `sku=${sku}`,
            payload: {
                sku,
                name: `Product  ${sku}`
            },
            index: {}
        });
        // dc.l("insertTestDataIndex1().storeDataEvent() [sku=%s] DONE", sku);
    }
    return true;
};


describe('lib/get-data-events.js', function () {

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
    it('get-data-event-stream-1', async function () {

        await insertTestData1({eventCount: 2});

        const result = await getDataEventStream({
            context: "akeneo",
            aggregate: "import-product",
            aggregateId: "sku=203040",
        });
        // dc.l("getDataEventStream() DONE [result.length=%s]", R.length(result));
        // logResult("getDataEventStream().result", dc.stringify(result));


        // TODO -> Check result better
        expect(result).to.be.an('array');

    });

    it('get-data-event-stream-2', async function () {

        const result = await getDataEventStream({
            context: "akeneo",
            aggregate: "import-product",
            aggregateId: "sku=203040",
        });
        // dc.l("getDataEventStream() DONE [result.length=%s]", R.length(result));
        // logResult("getDataEventStream().result", dc.stringify(result));
        expect(result).to.be.an('array');
        expect(result).to.be.empty;

    });

    it('get-last-data-event-1', async function () {

        await insertTestData1({eventCount: 2});

        const result = await getLastDataEvent({
            context: "akeneo",
            aggregate: "import-product",
            aggregateId: "sku=203040",
        });
        // dc.l("getLastDataEvent() DONE");
        // logResult("getLastDataEvent().result", dc.stringify(result));

        expect(result).to.have.property("_id", "akeneo/import-product/sku=203040/1");

    });

    it('get-last-data-event-2', async function () {

        const result = await getLastDataEvent({
            context: "akeneo",
            aggregate: "import-product",
            aggregateId: "sku=203040",
        });
        // dc.l("getLastDataEvent() DONE");
        // logResult("getLastDataEvent().result", dc.stringify(result));
        expect(result).to.equal(false);

    });

    it('get-data-event-1', async function () {

        await insertTestData1({eventCount: 2});
        {
            const result = await getDataEvent({
                context: "akeneo",
                aggregate: "import-product",
                aggregateId: "sku=203040",
                sequenceNumber: 0
            });
            // dc.l("getDataEvent() [0] DONE");
            // logResult("getDataEvent().result [0]", dc.stringify(result));

            expect(result).to.have.property("_id", "akeneo/import-product/sku=203040/0");
        }
        {
            const result = await getDataEvent({
                context: "akeneo",
                aggregate: "import-product",
                aggregateId: "sku=203040",
                sequenceNumber: 1
            });
            // dc.l("getDataEvent() [0] DONE");
            // logResult("getDataEvent().result [0]", dc.stringify(result));

            expect(result).to.have.property("_id", "akeneo/import-product/sku=203040/1");
        }

    });

    it('query-data-index-1', async function () {

        await insertTestDataIndex1();
        {
            const result = await queryDataIndex({
                "index.parentSku": "10"
            });
            // dc.l("queryDataIndex() DONE");
            // logResult("queryDataIndex().result ", dc.stringify(result));

            expect(R.length(result)).to.be.equal(3);
        }
    });

});
