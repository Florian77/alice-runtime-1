const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../../test-environment");
const alice = require('../../../index');


dc.activate();


describe('lib/command-control:set-one-command', function () {

    this.timeout(10 * 1000);

    const context = "CONT",
        aggregate = "aggt",
        command = "doIt",
        invokeId = "id=1";

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
    it('emitCommand happy path', async function () {
        let uniqueId;
        {
            const result = await alice.emitCommand({
                context,
                aggregate,
                command,
                invokeId,
                payload: {
                    data: 100
                },
                priority: 0,
                // paused: true,
            });
            dc.j(result, "TEST result emitCommand");
            uniqueId = result.uniqueId;
        }
        const commandKey = {
            context,
            aggregate,
            command,
            invokeId,
            uniqueId,
        };
        {
            const result = await alice.setOneCommandNotPaused(commandKey);
            dc.j(result, "TEST result setOneCommandNotPaused");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 0
            });
        }
        {
            const result = await alice.setOneCommandPaused(commandKey);
            dc.j(result, "TEST result setOneCommandPaused");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 1
            });
        }
        {
            const result = await alice.setOneCommandNotPaused(commandKey);
            dc.j(result, "TEST result setOneCommandNotPaused()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 1
            });
        }
        {
            const result = await alice.setOneCommandHandled(commandKey);
            dc.j(result, "TEST result setOneCommandNotPaused()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 1
            });
        }
        {
            const result = await alice.setOneCommandNotHandled(commandKey);
            dc.j(result, "TEST result setOneCommandNotPaused()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 1
            });
        }
        {
            const result = await alice.setOneCommandNotRunning(commandKey);
            dc.j(result, "TEST result setOneCommandNotPaused()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 0
            });
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('emitMultiCommand happy path', async function () {
        {
            const result = await alice.emitMultiCommand({
                context,
                aggregate,
                command,
                invokeId,
                payload: {
                    data: 100
                },
                priority: 0,
                // paused: true,
            });
            dc.j(result, "TEST result emitMultiCommand");
        }
        const commandKey = {
            context,
            aggregate,
            command,
            invokeId,
        };
        {
            const result = await alice.setOneCommandNotPaused(commandKey);
            dc.j(result, "TEST result setOneCommandNotPaused");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 0
            });
        }
        {
            const result = await alice.setOneCommandPaused(commandKey);
            dc.j(result, "TEST result setOneCommandPaused");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 1
            });
        }
        {
            const result = await alice.setOneCommandNotPaused(commandKey);
            dc.j(result, "TEST result setOneCommandNotPaused()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 1
            });
        }
        {
            const result = await alice.setOneCommandHandled(commandKey);
            dc.j(result, "TEST result setOneCommandNotPaused()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 1
            });
        }
        {
            const result = await alice.setOneCommandNotHandled(commandKey);
            dc.j(result, "TEST result setOneCommandNotPaused()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 1
            });
        }
        {
            const result = await alice.setOneCommandNotRunning(commandKey);
            dc.j(result, "TEST result setOneCommandNotPaused()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 0
            });
        }
    });

});

