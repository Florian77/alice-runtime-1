require('chai').use(require('chai-string'));
const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {
    storeAppData,
    loadAppData,
} = require("../../index");


dc.activate();


describe('lib/app-data.js', function () {

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
    it('store app data', async function () {

        const key = "random_key";
        const data = {test: "data"};
        {
            const result = await storeAppData(key, data);
            dc.j(result, "storeAppData().result");
            expect(result).to.be.true;
        }
        {
            const result = await loadAppData(key);
            dc.j(result, "loadAppData().result");
            expect(result).to.be.deep.equal(data);
        }

    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('load app data that not exists', async function () {

        const key = "random_key";
        {
            const result = await loadAppData(key);
            dc.j(result, "result");
            expect(result).to.be.false;
        }

    });


});
