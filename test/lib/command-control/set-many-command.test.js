const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../../test-environment");
const alice = require('../../../index');


dc.activate();


describe('lib/command-control:set-many-command', function () {

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
    it('happy path', async function () {
        {
            const result = await alice.emitMultiCommand({
                context,
                aggregate,
                command,
                invokeId,
                paused: true,
            });
            dc.j(result, "TEST result emitMultiCommand");
        }
        {
            const result = await alice.emitCommand({
                context,
                aggregate,
                command,
                // paused: true,
            });
            dc.j(result, "TEST result emitCommand");
        }
        const commandKey = {
            context,
            aggregate,
            command,
        };
        {
            const result = await alice.setManyCommandsNotPaused(commandKey);
            dc.j(result, "TEST result setManyCommandsNotPaused");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 1,
            });
        }
        {
            const result = await alice.setManyCommandsPaused(commandKey);
            dc.j(result, "TEST result setManyCommandsPaused");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 2,
                "modifiedCount": 2
            });
        }
        {
            const result = await alice.setManyCommandsNotPaused(commandKey);
            dc.j(result, "TEST result setManyCommandsNotPaused()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 2,
                "modifiedCount": 2
            });
        }
        {
            const result = await alice.setManyCommandsHandled(commandKey);
            dc.j(result, "TEST result setManyCommandsHandled()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 2,
                "modifiedCount": 2
            });
        }
        {
            const result = await alice.setManyCommandsNotHandled(commandKey);
            dc.j(result, "TEST result setManyCommandsNotHandled()");
            expect(result).to.be.deep.equal({
                "ok": true,
                "matchedCount": 1,
                "modifiedCount": 1
            });
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('setManyCommandsPaused before emitMultiCommand, command is paused', async function () {
        {
            const result = await alice.setManyCommandsPaused({
                context,
                aggregate,
                command,
            });
            dc.j(result, "TEST result setManyCommandsPaused");
        }
        {
            const result = await alice.emitMultiCommand({
                context,
                aggregate,
                command,
                invokeId,
            });
            dc.j(result, "TEST result emitMultiCommand");
            expect(result.paused).to.be.equal(true);
        }
    });

});

