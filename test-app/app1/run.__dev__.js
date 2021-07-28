const dc = require("node-dev-console");
const expect = require('chai').expect
const R = require('ramda')
const aliceTestEnv = require("../../test-environment")
const alice = require("../../index")
const {CTX1__AGGT2} = require("./src/app_aggregates");
const {CTX1__AGGT1} = require("./src/app_aggregates");
const {utility: u} = alice
const {resolve} = require("path")


dc.activate()


describe('TEST APP 1', function () {

    this.timeout(0)
    const functionPath = resolve(__dirname, "./src/app")
    dc.t(functionPath, "functionPath")

    const processConfig = {
        showLog: false,
        maxRuntime: 900,
        maxProcessCycles: 500,
        maxProcessCommands: 1,
    }


    // -----------------------------------------------------------------------------------------------------------------------------
    before(async () => {

        // aliceTestEnv.loadRuntimeConfig(__dirname, dc.or("test-case", "unit-test"))
        aliceTestEnv.loadRuntimeConfig(__dirname, "test-case")
        await aliceTestEnv.connect()

        // force use indexes
        // const res = await alice.getDatabase().executeDbAdminCommand({ setParameter: 1, notablescan: 1 })
        // dc.j("res", res)

    })

    // -----------------------------------------------------------------------------------------------------------------------------
    after(async () => {
        await aliceTestEnv.disconnect()
    })

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(async function () {
        dc.l("---------------", this.currentTest.title, "---------------")
    })

    // -----------------------------------------------------------------------------------------------------------------------------
    it('reset database', async function () {

        await aliceTestEnv.clearDatabase({createIndexAfterClear: true})

        const triggerList = require("./src/install_trigger_list")
        for (const _MODULE of triggerList) {
            try {
                // dc.j(_MODULE, "_MODULE")
                const result = await alice.createTrigger(_MODULE)
                dc.l(R.pipe(R.pick(["type", "streamType", "context", "aggregate", "trigger"]), R.values, R.join("/"))(result))

            } catch (e) {
                console.error(e)
            }
        }

        await aliceTestEnv.singleProcess(functionPath, processConfig)

    })

    // -----------------------------------------------------------------------------------------------------------------------------
    it('insert data', async function () {

        for (let i = 0; i < 1000; i++) {
            await alice.emitCommand({
                ...CTX1__AGGT1,
                command: "updateOnChange",
                invokeId: u.stringifyId("id", i),
                payload: {
                    data: "data",
                    i,
                }
            })
        }

        // todo -> validate data
    })

    // -----------------------------------------------------------------------------------------------------------------------------
    it('process insert data', async function () {

        await aliceTestEnv.multiProcess(functionPath, 3, processConfig)

        // todo -> validate data

    })

    // -----------------------------------------------------------------------------------------------------------------------------
    it('process aggt2', async function () {

        const result = await alice.getCollectionTriggerIndex().updateMany({
            ...CTX1__AGGT2,
        }, {
            $set: {
                paused: false,
            }
        })
        dc.j(result, "getCollectionTriggerIndex().updateMany()")

        await aliceTestEnv.multiProcess(functionPath, 3, processConfig)

        // todo -> validate data

    })


    // todo -> calc cluster count with queryDataIndex


    // -----------------------------------------------------------------------------------------------------------------------------
    /*it.skip('processOne', async function () {
        await processOne(functionPath)
    })*/

    // -----------------------------------------------------------------------------------------------------------------------------
    /*it.skip('singleProcess', async function () {
        await singleProcess(functionPath)
    })*/

    // -----------------------------------------------------------------------------------------------------------------------------
    /*it.skip('multiProcess', async function () {
        await multiProcess(functionPath)
    })*/

})

