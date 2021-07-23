const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../../test-environment");
const alice = require("../../../index");
const R = require("ramda");
const {resolve} = require('path');

dc.activate();


describe('test case command callback', function () {

    this.timeout(10 * 1000);

    const functionPath = resolve(__dirname, "app");
    const context = "CONTEXT";
    const aggregate = "aggregate";
    const invokeId = "id=1";

    // -----------------------------------------------------------------------------------------------------------------------------
    before(async () => {
        aliceTestEnv.loadRuntimeConfig(__dirname, dc.or("test-case", "unit-test"));
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
    it('basic callback', async function () {
        {
            const result = await alice.emitCommand({
                context,
                aggregate,
                command: "firstCommand",
                payload: {
                    returnResult: true,
                    returnMessage: "Success"
                }
            }, [
                {
                    context,
                    aggregate,
                    command: "callbackCommand",
                    // invokeId,
                },
                {
                    context,
                    aggregate,
                    command: "callbackCommand",
                    invokeId,
                    multiInvoke: true,
                }
                // todo -> add condition (on success / on error)
            ]);
            dc.j(result, "emitCommand() result");
        }
        await alice.processNextCommand({functionPath});
        dc.l("--------------");

    });


    // -----------------------------------------------------------------------------------------------------------------------------
    it('callback for existing multi command', async function () {
        {
            const result = await alice.emitCommand({
                context,
                aggregate,
                command: "firstCommand",
            }, [
                {
                    context,
                    aggregate,
                    command: "callbackCommand",
                    invokeId,
                    multiInvoke: true,
                }
            ]);
            dc.j(result, "emitCommand() result");
        }
        await alice.process({functionPath});
        {
            const result = await alice.emitCommand({
                context,
                aggregate,
                command: "firstCommand",
            }, [
                {
                    context,
                    aggregate,
                    command: "callbackCommand",
                    invokeId,
                    multiInvoke: true,
                }
            ]);
            dc.j(result, "emitCommand() result");
        }
        await alice.process({functionPath});

        {
            const result = await alice.getLastDataEvent({
                context,
                aggregate,
                aggregateId: invokeId,
            });
            expect(alice.utility.getPayload(result).counter).to.be.equal(2);
        }
        {
            const result = await alice.getCollectionCommandIndex().findOne({
                context,
                aggregate,
                invokeId,
            });
            dc.j(result, "multi command result");
            expect(alice.utility.isCallbackFromEmpty(result)).to.be.false;
            expect(alice.utility.getCallbackFrom(result).length).to.be.equal(2);
        }

    });


});
