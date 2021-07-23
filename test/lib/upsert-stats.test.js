const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {
    upsertStatsDataContextAggregate,
    upsertStatsCommandContextAggregate,
    upsertStatsTriggerContextAggregate
} = require("../../lib/upsert-stats");


dc.activate();


describe('lib/upsert-stats.js', function () {

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
    it('upsert-stats-data-context-aggregate-1', async function () {

        const result = await upsertStatsDataContextAggregate({
            context: "akeneo",
            aggregate: "import-products",
        });
        //dc.l("upsertStatsContextAggregate() DONE");
        //logResult("upsertStatsContextAggregate().result", dc.stringify(result));
        expect(result).to.equal(true);

        // TODO -> check result in DB

    });

    it('upsert-stats-command-context-aggregate-1', async function () {

        const result = await upsertStatsCommandContextAggregate({
            context: "akeneo",
            aggregate: "import-products",
        });
        //dc.l("upsertStatsContextAggregate() DONE");
        //logResult("upsertStatsContextAggregate().result", dc.stringify(result));
        expect(result).to.equal(true);

        // TODO -> check result in DB

    });

    it('upsert-stats-trigger-context-aggregate-1', async function () {

        const result = await upsertStatsTriggerContextAggregate({
            context: "akeneo",
            aggregate: "import-products",
        });
        //dc.l("upsertStatsContextAggregate() DONE");
        //logResult("upsertStatsContextAggregate().result", dc.stringify(result));
        expect(result).to.equal(true);

        // TODO -> check result in DB

    });


});
