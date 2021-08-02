const expect = require('chai').expect;
const {resolve} = require('path');
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {utility} = require("../../index");
const {processCommands} = require("../../index");
const {emitCommand} = require("../../index");


dc.activate();


describe('lib/process-commands.js', function () {

    this.timeout(10 * 1000);

    const functionPath = resolve(__dirname, "test-commands-app");

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


    it('base case', async function () {

        {
            for (let i = 0; i < 2; i += 1) {
                const result = await emitCommand({
                    context: "CONTEXT",
                    aggregate: "aggregate",
                    command: "storeData",
                    invokeId: utility.stringifyId("id", i),
                    payload: {
                        myData: "command payload data",
                        i,
                    },
                });
                //dc.l("insertTestData2().emitCommand() [i=%s]", i);
                //dc.l("insertTestData2().emitCommand().result [i=%s]", i, dc.stringify(result));
            }
        }
        const input = {
            maxProcessCommands: 3,
            functionPath,
        };
        //dc.l("processCommands().input [object]", dc.stringify(input));
        const result = await processCommands(input);
        //dc.l("processCommands() DONE");
        //logResult("processCommands().result", dc.stringify(result));
        expect(result).to.be.deep.equal({
            "moreToProcess": false,
            "processedCounter": 2,
            "runTime": 0,
            "withError": false
        });
        // todo -> split expect -> runTime check is number

    });


});
