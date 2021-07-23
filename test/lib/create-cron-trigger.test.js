const expect = require('chai').expect;
const dc = require("node-dev-console");
const R = require("ramda");
const aliceTestEnv = require("../../test-environment");
const {createTrigger} = require("../../index");


dc.activate();


describe('lib/create-cron-trigger.js', function () {

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
            type: "cron",
            context: "RANDOM-CONTEXT",
            aggregate: "random-aggregate",
            trigger: "randomTriggerName",
            cronExpression: "*/5 * * * * *",
        });
        dc.j(result, "result");

        expect(result.deployedAt).to.be.a("date");
        expect(result.nextRunAt).to.be.a("date");
        expect(R.omit(["deployedAt", "nextRunAt"], result)).to.be.deep.equal({
            "_id": "RANDOM-CONTEXT/random-aggregate::cron::randomTriggerName",
            "context": "RANDOM-CONTEXT",
            "aggregate": "random-aggregate",
            "trigger": "randomTriggerName",
            "type": "cron",
            "cronExpression": "*/5 * * * * *",
            "checkForUpdates": false,
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
