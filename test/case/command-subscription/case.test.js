const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../../test-environment");
const alice = require("../../../index");
const R = require("ramda");
const {resolve} = require('path');

dc.activate();


describe('test case command subscription', function () {

    this.timeout(10 * 1000);

    const functionPath = resolve(__dirname, "app");
    const context = "CONTEXT";
    const aggregate = "aggregate";
    const command = "randomCommand";
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
    it('add subscription over emitMultiCommand', async function () {
        await alice.emitMultiCommand({
            context,
            aggregate,
            command,
            invokeId,
            subscription: [
                "mySubscription",
            ]
        });
        await alice.processNextCommand({functionPath});
        dc.l("--------------");
        {
            const result = await alice.updateManyCommands({
                context,
                aggregate,
                command,
            }, {
                handled: false
            }, {
                subscription: "mySubscription"
            });
            dc.j(result, "updateManyCommands() result");
            expect(result.modifiedCount).to.be.equal(1);
        }
        await alice.processNextCommand({functionPath});
        const result_DataEvent = await alice.getLastDataEvent({
            context,
            aggregate,
            aggregateId: invokeId,
        });
        expect(alice.utility.getPayload(result_DataEvent).counter).to.be.equal(2);
    });

    it("add subscription inside a command", async function () {
        await alice.emitMultiCommand({
            context,
            aggregate,
            command,
            invokeId,
            payload: {
                returnSubscription: [
                    "mySubscription",
                ]
            }
        });
        await alice.processNextCommand({functionPath});
        dc.l("--------------");
        {
            const result = await alice.reInvokeSubscription({
                context,
                aggregate,
                command,
                subscription: "mySubscription"
            });
            dc.j(result, "reInvokeSubscription() result");
            expect(result.modifiedCount).to.be.equal(1);
        }
        await alice.processNextCommand({functionPath});
        const result_DataEvent = await alice.getLastDataEvent({
            context,
            aggregate,
            aggregateId: invokeId,
        });
        expect(alice.utility.getPayload(result_DataEvent).counter).to.be.equal(2);
    });

    it("change subscription inside a command", async function () {
        await alice.emitMultiCommand({
            context,
            aggregate,
            command,
            invokeId,
            payload: {
                returnSubscription: [
                    "mySubscription",
                ]
            },
            subscription: [
                "NOTmySubscription",
            ]
        });
        await alice.processNextCommand({functionPath});
        dc.l("--------------");
        {
            const result = await alice.reInvokeSubscription({
                context,
                aggregate,
                command,
                subscription: "mySubscription"
            });
            dc.j(result, "reInvokeSubscription() result");
            expect(result.modifiedCount).to.be.equal(1);
        }
        await alice.processNextCommand({functionPath});
        const result_DataEvent = await alice.getLastDataEvent({
            context,
            aggregate,
            aggregateId: invokeId,
        });
        expect(alice.utility.getPayload(result_DataEvent).counter).to.be.equal(2);
    });

    it("remove subscription inside a command", async function () {
        await alice.emitMultiCommand({
            context,
            aggregate,
            command,
            invokeId,
            payload: {
                returnSubscription: []
            },
            subscription: [
                "mySubscription",
            ]
        });
        await alice.processNextCommand({functionPath});
        dc.l("--------------");
        {
            const result = await alice.reInvokeSubscription({
                context,
                aggregate,
                command,
                subscription: "mySubscription"
            });
            dc.j(result, "reInvokeSubscription() result");
            expect(result.modifiedCount).to.be.equal(0);
        }
        await alice.processNextCommand({functionPath});
        const result_DataEvent = await alice.getLastDataEvent({
            context,
            aggregate,
            aggregateId: invokeId,
        });
        expect(alice.utility.getPayload(result_DataEvent).counter).to.be.equal(1);
    });

});
