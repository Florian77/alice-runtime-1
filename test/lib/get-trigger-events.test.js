const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {
    createDataTrigger,
    getItemTriggerIndex
} = require("../../index");


dc.activate();


const insertTestData1 = async () => {
    const result = await createDataTrigger({
        context: "akeneo",
        aggregate: "product",
        trigger: "myTrigger",

        streamContext: "akeneo",
        streamAggregate: "product",
        streamAggregateId: "sku=203040",

        lastSequenceNumber: -1,
    });
    // dc.l("createDataTrigger().result", dc.stringify(result));
    return result;
};


describe('lib/get-trigger-events.js', function () {

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
    it('get-item-trigger-index-1', async function () {

        const testDataResult = await insertTestData1();
        {
            const result = await getItemTriggerIndex(testDataResult._id);
            // dc.l("getDataEvent() [0] DONE");
            // logResult("getDataEvent().result [0]", dc.stringify(result));

            expect(result).to.be.deep.equal(testDataResult);
            // TODO -> Test Result
            // expect(result).to.have.property("_id", "akeneo/import-product/sku=203040/0");
        }

    });

});
