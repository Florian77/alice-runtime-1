const dc = require("node-dev-console");
const expect = require('chai').expect;
const R = require("ramda");
const aliceTestEnv = require("../../test-environment");


dc.activate();


describe('test environment - triggerTestEnvironment', function () {

    this.timeout(10 * 1000);

    // -----------------------------------------------------------------------------------------------------------------------------
    const aggregate = {
        context: "RANDOM-CONTEXT",
        aggregate: "random-aggregate",
        invokeId: "id=random",
        command: "random-command",
    };
    const input = {
        ...aggregate,
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
        const env = aliceTestEnv.triggerTestEnvironment();
        {
            const result = await env.emitMultiCommand(input);
            dc.j(env.log.emitMultiCommand(), "TEST log.emitMultiCommand");
            dc.j(env.log.emitMultiCommandResult(), "TEST log.emitMultiCommand Result");
            expect(env.log.emitMultiCommand()).to.be.deep.equal([
                input
            ]);
            env.log.clear();
            dc.j(env.log.emitMultiCommand(), "TEST log.emitMultiCommand after env.log.clear()");
            expect(env.log.emitMultiCommand()).to.be.empty;
            dc.j(env.log.emitMultiCommandResult(), "TEST log.emitMultiCommand Result after env.log.clear()");
            expect(env.log.emitMultiCommandResult()).to.be.empty;
            expect(env.log.getAll()).to.be.empty;
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('happy path of log.getAll', async function () {
        const env = aliceTestEnv.triggerTestEnvironment();
        {
            const result = await env.emitMultiCommand(input);
            env.log.displayAll();
            expect(env.log.getAll().length).to.be.equal(2);
            expect(env.log.getAll()).to.be.not.empty;
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('happy path of emitCommand', async function () {
        const env = aliceTestEnv.triggerTestEnvironment();
        {
            const result = await env.emitCommand(input);
            dc.j(result, "TEST result 1");
            dc.j(env.log.emitCommand(), "TEST log.emitCommand");
            dc.j(env.log.emitCommandResult(), "TEST log.emitCommand Result");
            expect(env.log.emitCommand()).to.be.deep.equal([
                input
            ]);
            expect(env.log.emitCommandResult()).to.be.not.empty;
            expect(env.log.emitCommandResult()[0]).to.be.not.empty;
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('happy path of emitMultiCommand', async function () {
        const env = aliceTestEnv.triggerTestEnvironment();
        {
            const result = await env.emitMultiCommand(input);
            dc.j(result, "TEST result 1");
            dc.j(env.log.emitMultiCommand(), "TEST log.emitMultiCommand");
            dc.j(env.log.emitMultiCommandResult(), "TEST log.emitMultiCommand Result");
            expect(env.log.emitMultiCommand()).to.be.deep.equal([
                input
            ]);
            expect(env.log.emitMultiCommandResult()).to.be.not.empty;
            expect(env.log.emitMultiCommandResult()[0]).to.be.not.empty;
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('happy path of reInvokeSubscription', async function () {
        const env = aliceTestEnv.triggerTestEnvironment();
        {
            const input = {
                context: "RANDOM-CONTEXT",
                aggregate: "random-aggregate",
                command: "random-command",
                subscription: [
                    "random-subscription"
                ],
            };
            const result = await env.reInvokeSubscription(input);
            dc.j(result, "TEST result 1");
            dc.j(env.log.reInvokeSubscription(), "TEST log.reInvokeSubscription");
            dc.j(env.log.reInvokeSubscriptionResult(), "TEST log.reInvokeSubscription Result");
            expect(env.log.reInvokeSubscription()).to.be.deep.equal([
                input
            ]);
            expect(env.log.reInvokeSubscriptionResult()).to.be.not.empty;
            expect(env.log.reInvokeSubscriptionResult()[0]).to.be.not.empty;
        }
    });


});
