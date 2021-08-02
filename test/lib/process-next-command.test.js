const expect = require('chai').expect;
const {resolve} = require('path');
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {utility} = require("../../index");
const {processNextCommand} = require("../../index");
const {emitCommand} = require("../../index");
const {getCommand} = require("../../index");


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


    // -----------------------------------------------------------------------------------------------------------------------------
    it('process 1 command successfully', async function () {

        const command = await emitCommand({
            context: "CONTEXT",
            aggregate: "aggregate",
            command: "storeData",
            invokeId: utility.stringifyId("id", 1),
            payload: {
                myData: "command payload data",
            },
        });
        // dc.j(command, "command");

        {
            const result = await processNextCommand({functionPath});
            //logResult("processNextCommand() [1] [result=%s]", result);
            expect(result).to.equal(true);
        }
        {
            const result = await processNextCommand({functionPath});
            //logResult("processNextCommand() [2] [result=%s]", result);
            expect(result).to.equal(false);
        }
        {
            const commandResult = await getCommand({
                commandId: command._id,
            });
            dc.j(commandResult, "commandResult");
            expect(commandResult._id).to.be.a("string");
            expect(commandResult.context).to.be.equals("CONTEXT");
            expect(commandResult.aggregate).to.be.equals("aggregate");
            expect(commandResult.command).to.be.equals("storeData");
            expect(commandResult.invokeId).to.be.equals("id=1");
            expect(commandResult.uniqueId).to.be.a("string")
                .and.to.have.lengthOf(36);
            expect(commandResult.multiInvoke).to.be.false;
            expect(commandResult.createdAt).to.be.a("date");
            expect(commandResult.running).to.be.false;
            expect(commandResult.runningSince).to.be.a("date");
            expect(commandResult.handled).to.be.true;
            expect(commandResult.handledAt).to.be.a("date");
            expect(commandResult.priority).to.be.equals(0);
            expect(commandResult.paused).to.be.false;
            expect(commandResult.pausedAt).to.be.null;
            expect(commandResult.hasSubscriptions).to.be.false;
            expect(commandResult.subscription).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.hasCallback).to.be.false;
            expect(commandResult.callbackList).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.callbackFrom).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.errorMsg).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.errorType).to.be.null;
            expect(commandResult.executionTime).to.be.a("number")
                .and.at.least(1);
            expect(commandResult.ok).to.be.true;
            expect(commandResult.resultMsg).to.be.deep.equals([
                "data stored",
            ]);
            expect(commandResult.warning).to.be.false;
        }

        // todo -> validate command log

    });


    it('command handler - return error', async function () {

        const command = await emitCommand({
            context: "CONTEXT",
            aggregate: "aggregate",
            command: "returnError",
        });
        // dc.j(command, "command");

        {
            const result = await processNextCommand({functionPath});
            //logResult("processNextCommand() [result=%s]", result);
            expect(result).to.equal(true);
        }
        {
            const commandResult = await getCommand({
                commandId: command._id,
            });
            dc.j(commandResult, "commandResult");
            expect(commandResult._id).to.be.a("string");
            expect(commandResult.context).to.be.equals("CONTEXT");
            expect(commandResult.aggregate).to.be.equals("aggregate");
            expect(commandResult.command).to.be.equals("returnError");
            expect(commandResult.invokeId).to.be.equals("");
            expect(commandResult.uniqueId).to.be.a("string")
                .and.to.have.lengthOf(36);
            expect(commandResult.multiInvoke).to.be.false;
            expect(commandResult.createdAt).to.be.a("date");
            expect(commandResult.running).to.be.false;
            expect(commandResult.runningSince).to.be.a("date");
            expect(commandResult.handled).to.be.true;
            expect(commandResult.handledAt).to.be.a("date");
            expect(commandResult.priority).to.be.equals(0);
            expect(commandResult.paused).to.be.false;
            expect(commandResult.pausedAt).to.be.null;
            expect(commandResult.hasSubscriptions).to.be.false;
            expect(commandResult.subscription).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.hasCallback).to.be.false;
            expect(commandResult.callbackList).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.callbackFrom).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.errorMsg).to.be.deep.equals([
                "custom error message",
            ]);
            expect(commandResult.errorType).to.be.equals("CMD");
            expect(commandResult.executionTime).to.be.a("number")
                .and.at.least(1);
            expect(commandResult.ok).to.be.false;
            expect(commandResult.resultMsg).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.warning).to.be.false;
        }

    });


    it('command handler - return void', async function () {

        const command = await emitCommand({
            context: "CONTEXT",
            aggregate: "aggregate",
            command: "returnVoid",
        });
        // dc.j(command, "command");

        {
            const result = await processNextCommand({functionPath});
            //logResult("processNextCommand() [result=%s]", result);
            expect(result).to.equal(true);
        }
        {
            const commandResult = await getCommand({
                commandId: command._id,
            });
            dc.j(commandResult, "commandResult");
            expect(commandResult._id).to.be.a("string");
            expect(commandResult.context).to.be.equals("CONTEXT");
            expect(commandResult.aggregate).to.be.equals("aggregate");
            expect(commandResult.command).to.be.equals("returnVoid");
            expect(commandResult.invokeId).to.be.equals("");
            expect(commandResult.uniqueId).to.be.a("string")
                .and.to.have.lengthOf(36);
            expect(commandResult.multiInvoke).to.be.false;
            expect(commandResult.createdAt).to.be.a("date");
            expect(commandResult.running).to.be.false;
            expect(commandResult.runningSince).to.be.a("date");
            expect(commandResult.handled).to.be.true;
            expect(commandResult.handledAt).to.be.a("date");
            expect(commandResult.priority).to.be.equals(0);
            expect(commandResult.paused).to.be.false;
            expect(commandResult.pausedAt).to.be.null;
            expect(commandResult.hasSubscriptions).to.be.false;
            expect(commandResult.subscription).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.hasCallback).to.be.false;
            expect(commandResult.callbackList).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.callbackFrom).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.errorMsg).to.be.deep.equals([
                "execution result schema is not valid",
                {
                    "result": null
                }
            ]);
            expect(commandResult.errorType).to.be.equals("EXE");
            expect(commandResult.executionTime).to.be.a("number")
                .and.at.least(1);
            expect(commandResult.ok).to.be.false;
            expect(commandResult.resultMsg).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.warning).to.be.false;
        }

    });


    it("command handler - throw error on execution", async function () {

        const command = await emitCommand({
            context: "CONTEXT",
            aggregate: "aggregate",
            command: "throwErrorOnExecution",
            multiInvoke: false,
            payload: {
                errorMessage: "thrown error",
            },
        });
        // dc.j(command, "command");

        {
            const result = await processNextCommand({functionPath});
            //logResult("processNextCommand() [result=%s]", result);
            expect(result).to.equal(false);
        }
        {
            const commandResult = await getCommand({
                commandId: command._id,
            });
            dc.j(commandResult, "commandResult");
            expect(commandResult._id).to.be.a("string");
            expect(commandResult.context).to.be.equals("CONTEXT");
            expect(commandResult.aggregate).to.be.equals("aggregate");
            expect(commandResult.command).to.be.equals("throwErrorOnExecution");
            expect(commandResult.invokeId).to.be.equals("");
            expect(commandResult.uniqueId).to.be.a("string")
                .and.to.have.lengthOf(36);
            expect(commandResult.multiInvoke).to.be.false;
            expect(commandResult.createdAt).to.be.a("date");
            expect(commandResult.running).to.be.false;
            expect(commandResult.runningSince).to.be.a("date");
            expect(commandResult.handled).to.be.true;
            expect(commandResult.handledAt).to.be.a("date");
            expect(commandResult.priority).to.be.equals(0);
            expect(commandResult.paused).to.be.false;
            expect(commandResult.pausedAt).to.be.null;
            expect(commandResult.hasSubscriptions).to.be.false;
            expect(commandResult.subscription).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.hasCallback).to.be.false;
            expect(commandResult.callbackList).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.callbackFrom).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.errorMsg[0]).to.be.equals("commandExecutive execution faild");
            expect(commandResult.errorMsg[1]).to.be.equals("custom error message");
            expect(commandResult.errorMsg).to.have.lengthOf(3);
            expect(commandResult.errorType).to.be.equals("EXE");
            expect(commandResult.executionTime).to.be.a("number")
                .and.at.least(1);
            expect(commandResult.ok).to.be.false;
            expect(commandResult.resultMsg).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.warning).to.be.false;
        }

    });


    it('error path, catch on require', async function () {

        const command = await emitCommand({
            context: "CONTEXT",
            aggregate: "aggregate",
            command: "throwErrorOnRequire",
        });
        dc.j(command, "emitCommand().command");

        {
            const result = await processNextCommand({functionPath});
            dc.j(result, "processNextCommand().result");
            //logResult("processNextCommand() [result=%s]", result);
            expect(result).to.equal(false);
        }
        {
            const commandResult = await getCommand({
                commandId: command._id,
            });
            dc.j(commandResult, "commandResult");
            expect(commandResult._id).to.be.a("string");
            expect(commandResult.context).to.be.equals("CONTEXT");
            expect(commandResult.aggregate).to.be.equals("aggregate");
            expect(commandResult.command).to.be.equals("throwErrorOnRequire");
            expect(commandResult.invokeId).to.be.equals("");
            expect(commandResult.uniqueId).to.be.a("string")
                .and.to.have.lengthOf(36);
            expect(commandResult.multiInvoke).to.be.false;
            expect(commandResult.createdAt).to.be.a("date");
            expect(commandResult.running).to.be.false;
            expect(commandResult.runningSince).to.be.a("date");
            expect(commandResult.handled).to.be.true;
            expect(commandResult.handledAt).to.be.a("date");
            expect(commandResult.priority).to.be.equals(0);
            expect(commandResult.paused).to.be.false;
            expect(commandResult.pausedAt).to.be.null;
            expect(commandResult.hasSubscriptions).to.be.false;
            expect(commandResult.subscription).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.hasCallback).to.be.false;
            expect(commandResult.callbackList).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.callbackFrom).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.errorMsg[0]).to.be.equals("commandExecutive load faild");
            expect(commandResult.errorMsg).to.have.lengthOf(3);
            expect(commandResult.errorType).to.be.equals("EXE");
            expect(commandResult.executionTime).to.be.a("number")
                .and.at.least(1);
            expect(commandResult.ok).to.be.false;
            expect(commandResult.resultMsg).to.be.a("array")
                .and.to.be.empty;
            expect(commandResult.warning).to.be.false;
        }

    });


});
