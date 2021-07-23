const dc = require("node-dev-console");
const expect = require('chai').expect;
const R = require("ramda");
const aliceTestEnv = require("../../test-environment");


dc.activate();


describe('test environment - commandTestEnvironment', function () {

    this.timeout(10 * 1000);

    // -----------------------------------------------------------------------------------------------------------------------------
    const eventAggregate = {
        context: "RANDOM-CONTEXT",
        aggregate: "random-eventAggregate",
        aggregateId: "id=random",
    };
    const eventInput = {
        ...eventAggregate,
        payload: {
            my: "data"
        }
    };
    const commandAggregate = {
        context: "RANDOM-CONTEXT",
        aggregate: "random-aggregate",
        invokeId: "id=random",
        command: "random-command",
    };
    const commandInput = {
        ...commandAggregate,
        payload: {
            my: "data"
        }
    };

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
    it('happy path of log.clear', async function () {
        const env = aliceTestEnv.commandTestEnvironment();
        {
            const result = await env.emitMultiCommand(commandInput);
            dc.j(env.log.emitMultiCommand(), "TEST log.emitMultiCommand");
            dc.j(env.log.emitMultiCommandResult(), "TEST log.emitMultiCommand Result");
            expect(env.log.emitMultiCommand()).to.be.deep.equal([
                commandInput
            ]);
            env.log.clear();
            dc.j(env.log.emitMultiCommand(), "TEST log.emitMultiCommand after env.log.clear()");
            dc.j(env.log.emitMultiCommandResult(), "TEST log.emitMultiCommand Result after env.log.clear()");
            expect(env.log.emitMultiCommand()).to.be.empty;
            expect(env.log.emitMultiCommandResult()).to.be.empty;
            expect(env.log.getAll()).to.be.empty;
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('happy path of log.getAll', async function () {
        const env = aliceTestEnv.commandTestEnvironment();
        {
            const result = await env.emitMultiCommand(commandInput);
            env.log.displayAll();
            expect(env.log.getAll().length).to.be.equal(2);
            expect(env.log.getAll()).to.be.not.empty;
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('happy path of storeDataEvent+getLastDataEvent', async function () {
        const env = aliceTestEnv.commandTestEnvironment();
        {
            const result = await env.storeDataEvent(eventInput);
            dc.j(result, "TEST result 1");
            dc.j(env.log.storeDataEvent(), "TEST log_storeDataEvent");
            dc.j(env.log.storeDataEventResult(), "TEST log_storeDataEvent Result");
            expect(env.log.storeDataEvent()).to.be.deep.equal([
                eventInput
            ]);
            expect(env.log.storeDataEventResult()).to.be.not.empty;
            expect(env.log.storeDataEventResult()[0]).to.be.not.empty;
        }
        {
            const result = await env.getLastDataEvent(eventAggregate);
            dc.j(result, "TEST result 2");
            dc.j(env.log.getLastDataEvent(), "TEST log_getLastDataEvent");
            dc.j(env.log.getLastDataEventResult(), "TEST log_getLastDataEvent Result");
            expect(result._id).to.be.equal("RANDOM-CONTEXT/random-eventAggregate/id=random/0");
            expect(env.log.getLastDataEvent()).to.be.deep.equal([
                eventAggregate
            ]);
            expect(env.log.getLastDataEventResult()).to.be.not.empty;
            expect(env.log.getLastDataEventResult()[0]).to.be.not.empty;
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('happy path of emitCommand', async function () {
        const env = aliceTestEnv.triggerTestEnvironment();
        {
            const result = await env.emitCommand(commandInput);
            dc.j(result, "TEST result 1");
            dc.j(env.log.emitCommand(), "TEST log.emitCommand");
            dc.j(env.log.emitCommandResult(), "TEST log.emitCommand Result");
            expect(env.log.emitCommand()).to.be.deep.equal([
                commandInput
            ]);
        }
        expect(env.log.emitCommandResult()).to.be.not.empty;
        expect(env.log.emitCommandResult()[0]).to.be.not.empty;
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('happy path of emitMultiCommand', async function () {
        const env = aliceTestEnv.commandTestEnvironment();
        {
            const result = await env.emitMultiCommand(commandInput);
            dc.j(result, "TEST result 1");
            dc.j(env.log.emitMultiCommand(), "TEST log.emitMultiCommand");
            dc.j(env.log.emitMultiCommandResult(), "TEST log.emitMultiCommand Result");
            expect(env.log.emitMultiCommand()).to.be.deep.equal([
                commandInput
            ]);
            expect(env.log.emitMultiCommandResult()).to.be.not.empty;
            expect(env.log.emitMultiCommandResult()[0]).to.be.not.empty;

        }
    });

    // todo -> implement tests for all test env methods

});
