const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {
    emitCommand,
    getCommand
} = require("../../index");


dc.activate();


const insertTestData1 = async () => {
    const result = await emitCommand({
        context: "akeneo",
        aggregate: "product",
        command: "doSomeThing",
        multiInvoke: false,
        payload: {
            myData: "important command"
        },
    });
    // dc.l("insertTestData1().emitCommand() DONE");
    // dc.l("insertTestData1().emitCommand().result", dc.stringify(result));
    return result;
};


describe('lib/get-command-events.js', function () {

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
    it('getCommand happy path', async function () {

        const testDataResult = await insertTestData1();
        {
            const result = await getCommand({commandId: testDataResult._id});
            // dc.l("getDataEvent() [0] DONE");
            // logResult("getDataEvent().result [0]", dc.stringify(result));

            expect(result).to.be.deep.equal(testDataResult);
            // TODO -> Test Result
            // expect(result).to.have.property("_id", "akeneo/import-product/sku=203040/0");
        }

    });

});
