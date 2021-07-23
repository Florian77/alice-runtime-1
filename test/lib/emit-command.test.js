require('chai').use(require('chai-string'));
const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {
    emitCommand,
    emitMultiCommand
} = require("../../index");


dc.activate();


describe('lib/emit-command.js', function () {

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
    it('emitCommand basic happy path', async function () {
        const result = await emitCommand({
            context: "akeneo",
            aggregate: "product",
            command: "doSomeThing",
            invokeId: "id=1234",
            payload: {
                myData: "important command"
            },
            // priority: 100,
            // paused: true,
        });
        dc.j(result, "TEST result");

        expect(result.invokeId).to.be.equal("id=1234");
        expect(result._id).to.startsWith("akeneo/product/doSomeThing/id=1234/");

        expect(result.uniqueId).to.be.a("string");
        expect(result.uniqueId).to.have.lengthOf(36);

        // todo -> Check result better
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('emitCommand without invokeId', async function () {
        const result = await emitCommand({
            context: "akeneo",
            aggregate: "product",
            command: "doSomeThing",
            // invokeId: "id=1234",
            payload: {
                myData: "important command"
            },
            // priority: 100,
            // paused: true,
        });
        dc.j(result, "TEST result");

        expect(result.invokeId).to.be.equal("");
        expect(result._id).to.startsWith("akeneo/product/doSomeThing/");

        // todo -> Check result better
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('emitMultiCommand basic happy path', async function () {
        const result = await emitMultiCommand({
            context: "akeneo",
            aggregate: "product",
            command: "doSomeThing",
            invokeId: "sku=203040",
            payload: {
                myData: "important command"
            },
            priority: 100,
            paused: true,
        });
        dc.j(result, "TEST result");

        expect(result.invokeId).to.be.equal("sku=203040");
        expect(result._id).to.be.equal("akeneo/product/doSomeThing/sku=203040");

        expect(result.uniqueId).to.be.a("string");
        expect(result.uniqueId).to.have.lengthOf(36);

        // todo -> Check result better
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('emit-multi-command-re-invoke', async function () {
        {
            const result = await emitMultiCommand({
                context: "akeneo",
                aggregate: "product",
                command: "doSomeThing",
                invokeId: "sku=203040",
                payload: {
                    myData: "important command"
                },
            });
            dc.j(result, "TEST result");
            // dc.l(("emitMultiCommand() [1] DONE");
            // console.dc.l("emitMultiCommand().result [1] ", dc.stringify(result));
        }
        {
            const result = await emitMultiCommand({
                context: "akeneo",
                aggregate: "product",
                command: "doSomeThing",
                invokeId: "sku=203040",
                payload: {
                    myData: "important command - new Data"
                },
            });
            dc.j(result, "TEST result");
            // dc.l(("emitMultiCommand() [2] DONE");
            // console.dc.l("emitMultiCommand().result [2]", dc.stringify(result));
        }
        // TODO -> Check result
        // expect(result).to.equal(true);
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('emit-multi-command-error-invokeId-missing', async function () {
        try {
            await emitMultiCommand({});
        } catch (e) {
            dc.t(e.message, "TEST result");
            expect(e.message).to.equal("invokeId missing");
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('emit-multi-command-upsert-false-1', async function () {
        {
            const result = await emitMultiCommand({
                context: "akeneo",
                aggregate: "product",
                command: "doSomeThing",
                invokeId: "sku=203040",
                payload: {
                    myData: "important command"
                },
                upsert: false
            });
            dc.j(result, "TEST result");
            // dc.l(("emitMultiCommand() [1] DONE");
            // console.dc.l("emitMultiCommand().result [1] ", dc.stringify(result));
        }
        // TODO -> Check result
        // expect(result).to.equal(true);
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('emit-multi-command-upsert-false-2', async function () {
        {
            const result = await emitMultiCommand({
                context: "akeneo",
                aggregate: "product",
                command: "doSomeThing",
                invokeId: "sku=203040",
                payload: {
                    myData: "important command"
                },
                upsert: true
            });
            dc.j(result, "TEST result");
            // dc.l(("emitMultiCommand() [1] DONE");
            // console.dc.l("emitMultiCommand().result [1] ", dc.stringify(result));
        }
        {
            const result = await emitMultiCommand({
                context: "akeneo",
                aggregate: "product",
                command: "doSomeThing",
                invokeId: "sku=203040",
                payload: {
                    myData: "important command - new Data"
                },
                upsert: false
            });
            dc.j(result, "TEST result");
            // dc.l(("emitMultiCommand() [2] DONE");
            // console.dc.l("emitMultiCommand().result [2] ", dc.stringify(result));
        }
        // TODO -> Check result
        // expect(result).to.equal(true);
    });

});
