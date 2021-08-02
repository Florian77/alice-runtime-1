const dc = require("node-dev-console");
const expect = require('chai').expect;
const R = require('ramda');
const aliceTestEnv = require("../../test-environment");
const alice = require("../../index");
const {CTX1__AGGT2} = require("./src/app_aggregates");
const {CTX1__AGGT1} = require("./src/app_aggregates");
const {utility: u} = alice;
const {resolve} = require("path");


dc.activate();


describe('TEST APP 1', function () {

    this.timeout(0);
    const functionPath = resolve(__dirname, "./src/app");
    dc.t(functionPath, "functionPath");

    const processConfig = {
        showLog: false,
        maxRuntime: 900,
        maxProcessCycles: 1000,
        maxProcessCommands: 1,
    };

    const commandCount = 1000;


    // -----------------------------------------------------------------------------------------------------------------------------
    before(async () => {

        // aliceTestEnv.loadRuntimeConfig(__dirname, dc.or("test-case", "unit-test"));
        aliceTestEnv.loadRuntimeConfig(__dirname, "test-case");
        await aliceTestEnv.connect();

        // force use indexes
        const res = await alice.getDatabase().admin().command({setParameter: 1, notablescan: 1});
        dc.j(res, "notablescan");
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    after(async () => {
        const res = await alice.getDatabase().admin().command({setParameter: 1, notablescan: 0});
        dc.j(res, "notablescan");

        await aliceTestEnv.disconnect();
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(async function () {
        dc.l("---------------", this.currentTest.title, "---------------");
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('reset database', async function () {

        await aliceTestEnv.clearDatabase({createIndexAfterClear: true});

        const triggerList = require("./src/install_trigger_list");
        for (const _MODULE of triggerList) {
            try {
                // dc.j(_MODULE, "_MODULE")
                const result = await alice.createTrigger(_MODULE);
                dc.l(R.pipe(R.pick(["type", "streamType", "context", "aggregate", "trigger"]), R.values, R.join("/"))(result));

            } catch (e) {
                console.error(e);
            }
        }

        // await aliceTestEnv.singleProcess(functionPath, processConfig)

    });


    // -----------------------------------------------------------------------------------------------------------------------------
    it('insert data', async function () {

        for (let i = 0; i < commandCount; i++) {
            await alice.emitCommand({
                ...CTX1__AGGT1,
                command: "updateOnChange",
                invokeId: u.stringifyId("id", i),
                payload: {
                    data: "data",
                    i,
                },
            });
        }

        // todo -> validate data

    });


    // -----------------------------------------------------------------------------------------------------------------------------
    it('multiProcess', async function () {

        const result = await aliceTestEnv.multiProcess(functionPath, 2, {
            ...processConfig,
            maxProcessCommands: 1,
            // showLog: 1,
        });
        dc.j(result, "result");

        expect(result.totalProcessedCommands).to.be.equals(commandCount * 2);
        expect(result.totalsDispatchedEvents).to.be.equals(commandCount * 2);
        expect(result.totalProcessedEvents).to.be.equals(commandCount);

    });


    // -----------------------------------------------------------------------------------------------------------------------------
    it.skip('singleProcess', async function () {

        const result = await aliceTestEnv.singleProcess(functionPath, {
            ...processConfig,
            maxProcessCommands: 1,
            // showLog: 1,
        });
        dc.j(result, "result");

        expect(result.totalProcessedCommands).to.be.equals(commandCount * 2);
        expect(result.totalsDispatchedEvents).to.be.equals(commandCount * 2);
        expect(result.totalProcessedEvents).to.be.equals(commandCount);

    });


    // -----------------------------------------------------------------------------------------------------------------------------
    it.skip('CTX1__AGGT1 -> processCommands', async function () {

        // await aliceTestEnv.multiProcess(functionPath, 3, processConfig)
        const result = await alice.processCommands({functionPath});
        dc.j(result, "result");

        // todo -> validate data

    })


    // -----------------------------------------------------------------------------------------------------------------------------
    it.skip('CTX1__AGGT1 -> dispatchEvents', async function () {

        const result = await alice.dispatchEvents();
        dc.j(result, "result");

        // todo -> validate data

    })


    // -----------------------------------------------------------------------------------------------------------------------------
    it.skip('CTX1__AGGT2 -> process trigger', async function () {

        {
            const result = await alice.getCollectionTriggerIndex().updateMany({
                ...CTX1__AGGT2,
            }, {
                $set: {
                    paused: false,
                }
            });
            dc.j(result, "getCollectionTriggerIndex().updateMany()");
        }

        // await aliceTestEnv.multiProcess(functionPath, 3, processConfig)

        {
            const result = await alice.processTrigger({functionPath});
            dc.j(result, "result");
        }

        // todo -> validate data

    })


    // -----------------------------------------------------------------------------------------------------------------------------
    it.skip('CTX1__AGGT2 -> processCommands', async function () {

        const result = await alice.processCommands({functionPath});
        dc.j(result, "result");

        // todo -> validate data

    })


    // -----------------------------------------------------------------------------------------------------------------------------
    it.skip('CTX1__AGGT2 -> dispatchEvents', async function () {

        const result = await alice.dispatchEvents();
        dc.j(result, "result");

        // todo -> validate data

    })


    // todo -> calc cluster count with queryDataIndex


    // -----------------------------------------------------------------------------------------------------------------------------
    /*it.skip('processOne', async function () {
        await aliceTestEnv.processOne(functionPath);
    })*/

    // -----------------------------------------------------------------------------------------------------------------------------
    /*it.skip('singleProcess', async function () {
        await aliceTestEnv.singleProcess(functionPath);
    })*/

    // -----------------------------------------------------------------------------------------------------------------------------
    /*it.skip('multiProcess', async function () {
        await aliceTestEnv.multiProcess(functionPath);
    })*/

})

