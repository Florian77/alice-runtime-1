const expect = require('chai').expect;
const {resolve} = require('path');
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {
    processCommands,
    processNextCommand,
    emitCommand
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
    //log("insertTestData1().emitCommand() DONE");
    //debug("insertTestData1().emitCommand().result", jsonString(result));
    return true;
};

const insertTestData2 = async () => {
    for (let i = 0; i < 2; i += 1) {
        const result = await emitCommand({
            context: "akeneo",
            aggregate: "product",
            command: "doSomeThing",
            multiInvoke: false,
            payload: {
                myData: "important command"
            },
        });
        //log("insertTestData2().emitCommand() [i=%s]", i);
        //debug("insertTestData2().emitCommand().result [i=%s]", i, jsonString(result));
    }
    return true;
};

const insertTestDataError1 = async () => {
    const result = await emitCommand({
        context: "akeneo",
        aggregate: "product",
        command: "doSomeThing",
        multiInvoke: false,
        payload: {
            returnError: true,
            errorMessage: "return my own error msg",
        },
    });
    //log("insertTestDataError1().emitCommand() DONE");
    //debug("insertTestDataError1().emitCommand().result", jsonString(result));
    return true;
};

const insertTestDataError2 = async () => {
    const result = await emitCommand({
        context: "akeneo",
        aggregate: "product",
        command: "doSomeThing",
        multiInvoke: false,
        payload: {
            throwError: true,
            errorMessage: "thrown error",
        },
    });
    //log("insertTestDataError2().emitCommand() DONE");
    //debug("insertTestDataError2().emitCommand().result", jsonString(result));
    return true;
};


describe('lib/process-commands.js', function () {

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
    it('process-next-command-basic', async function () {
        await insertTestData1();
        {
            const result = await processNextCommand({
                // context: "akeneo",
                functionPath: resolve(
                    __dirname,
                    "process-command",
                    "test-1"
                )
            });
            //logResult("processNextCommand() [1] [result=%s]", result);
            expect(result).to.equal(true);
        }
        {
            const result = await processNextCommand({
                functionPath: resolve(
                    __dirname,
                    "process-command",
                    "test-1"
                )
            });
            //logResult("processNextCommand() [2] [result=%s]", result);
            expect(result).to.equal(false);
        }

        // TODO -> check result in DB
    });


    it('process-next-command-error-1', async function () {
        await insertTestDataError1();
        {
            const result = await processNextCommand({
                // context: "akeneo",
                functionPath: resolve(
                    __dirname,
                    "process-command",
                    "test-1"
                )
            });
            //logResult("processNextCommand() [result=%s]", result);
            expect(result).to.equal(true);
            // TODO -> check result in DB
        }
    });


    it('process-next-command-error-2', async function () {
        await insertTestDataError2();
        {
            const result = await processNextCommand({
                // context: "akeneo",
                functionPath: resolve(
                    __dirname,
                    "process-command",
                    "test-1"
                )
            });
            //logResult("processNextCommand() [result=%s]", result);
            expect(result).to.equal(false);
            // TODO -> check result in DB
        }
    });


    it('error path, catch on require', async function () {
        {
            const result = await emitCommand({
                context: "akeneo",
                aggregate: "product",
                command: "throwErrorOnRequire",
            });
            dc.j(result, "emitCommand().result");
        }
        {
            const result = await processNextCommand({
                // context: "akeneo",
                functionPath: resolve(
                    __dirname,
                    "process-command",
                    "test-1"
                )
            });
            dc.j(result, "processNextCommand().result");
            //logResult("processNextCommand() [result=%s]", result);
            expect(result).to.equal(false);
            // TODO -> check result in DB
        }
    });

    it('process-commands-basic', async function () {
        await insertTestData2();
        const input = {
            maxProcessCommands: 3,
            functionPath: resolve(
                __dirname,
                "process-command",
                "test-1"
            )
        };
        //debug("processCommands().input [object]", jsonString(input));
        const result = await processCommands(input);
        //log("processCommands() DONE");
        //logResult("processCommands().result", jsonString(result));
        expect(result).to.be.deep.equal({
            "moreToProcess": false,
            "processedCounter": 2,
            "runTime": 0,
            "withError": false
        });
    });


});