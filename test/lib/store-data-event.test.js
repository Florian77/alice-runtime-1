const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {
    storeDataEventOnPayloadChange,
    storeDataEvent
} = require("../../index");


dc.activate();


/*require("debug").log = console.log.bind(console);
const _logger = require("debug")("test");
const log = _logger.extend("log");
const logResult = log.extend("result");
// const debug = _logger.extend("debug");
require("debug").enable(""
    + ",*:log"
    // +",*:debug"
    + ",test:log:result"
    // +",test:debug"
    // + ",alice:storeDataEvent:debug"
    + ",alice:db:connect"
);*/

describe('lib/store-data-event.js', function () {

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
    it('storeDataEvent basic happy path', async function () {
        const result = await storeDataEvent({
            context: "akeneo",
            aggregate: "product",
            aggregateId: "sku=203040",
            event: "newData",
            payload: {
                name: "Hello World!"
            },
            dataIndex: {
                index: {
                    indexTest: "keyColumn"
                },
                meta: {
                    author: "Florian",
                }
            }
        });
        dc.j(result, "TEST result");

        expect(result.uniqueId).to.be.a("string");
        expect(result.uniqueId).to.have.lengthOf(36);

        // TODO -> Check result
        // expect(result).to.equal(true);
    });

    it('basic-store-3-events', async function () {
        {
            const result = await storeDataEvent({
                context: "akeneo",
                aggregate: "product",
                aggregateId: "sku=203040",
                payload: {
                    name: "Hello World!"
                },
                dataIndex: {
                    index: {
                        sku: "203040"
                    }
                }
            });
            //log("storeDataEvent() [1] [sku=203040] DONE");
            //logResult("storeDataEvent().result [1] [sku=203040]", ftDev.jsonString(result));

            // TODO -> Check result
            // expect(result).to.equal(true);
        }
        {
            const result = await storeDataEvent({
                context: "akeneo",
                aggregate: "product",
                aggregateId: "sku=203040",
                payload: {
                    name: "Hello MY World!"
                },
                dataIndex: {
                    index: {
                        sku: "203040"
                    }
                }
            });
            //log("storeDataEvent() [2] [sku=203040] DONE");
            //logResult("storeDataEvent().result [2] [sku=203040]", ftDev.jsonString(result));

            // TODO -> Check result
            // expect(result).to.equal(true);
        }
        {
            const result = await storeDataEvent({
                context: "akeneo",
                aggregate: "value",
                aggregateId: "color=12",
                payload: {
                    value: "RED"
                },
                dataIndex: {
                    index: {
                        color: "12"
                    }
                }
            });
            //log("storeDataEvent() [color=12] DONE");
            //logResult("storeDataEvent().result [color=12]", ftDev.jsonString(result));

            // TODO -> Check result
            // expect(result).to.equal(true);
        }
    });


    it('storeDataEventOnPayloadChange-1', async function () {
        const event = {
            context: "akeneo",
            aggregate: "product",
            aggregateId: "sku=203040",
            event: "newData",
            payload: {
                name: "Hello World!"
            }
        };
        {
            const result = await storeDataEventOnPayloadChange(event);
            //log("storeDataEventOnPayloadChange() DONE");
            //logResult("storeDataEventOnPayloadChange().result", ftDev.jsonString(result));
            expect(result).to.equal(true);
        }

        // TODO -> Check result
        // expect(result).to.equal(true);
    });

    it('storeDataEventOnPayloadChange-2', async function () {
        const event = {
            context: "akeneo",
            aggregate: "product",
            aggregateId: "sku=203040",
            event: "newData",
            payload: {
                name: "Hello World!"
            }
        };
        {
            const result = await storeDataEvent(event);
            //log("storeDataEvent() DONE");
            //logResult("storeDataEvent().result", ftDev.jsonString(result));
            // expect(result).to.equal(true);
        }
        {
            const result = await storeDataEventOnPayloadChange(event);
            //log("storeDataEventOnPayloadChange() DONE");
            //logResult("storeDataEventOnPayloadChange().result", ftDev.jsonString(result));
            expect(result).to.equal(false);
        }

        // TODO -> Check result
        // expect(result).to.equal(true);
    });

    it('storeDataEventOnPayloadChange-3', async function () {
        const event = {
            context: "akeneo",
            aggregate: "product",
            aggregateId: "sku=203040",
            event: "newData",
            payload: {
                name: "Hello World!"
            }
        };
        {
            const result = await storeDataEvent(event);
            //log("storeDataEvent() DONE");
            //logResult("storeDataEvent().result", ftDev.jsonString(result));
            // expect(result).to.equal(true);
        }
        {
            const result = await storeDataEventOnPayloadChange({
                ...event,
                payload: {
                    name: "Hello NEW World!"
                }
            });
            //log("storeDataEventOnPayloadChange() DONE");
            //logResult("storeDataEventOnPayloadChange().result", ftDev.jsonString(result));
            expect(result).to.equal(true);
        }

        // TODO -> Check result
        // expect(result).to.equal(true);
    });

    it('storeDataEventOnPayloadChange with new version, update data', async function () {
        const event = {
            context: "akeneo",
            aggregate: "product",
            aggregateId: "sku=203040",
            event: "newData",
            payload: {
                data: 1
            },
            version: "1",
        };
        {
            const result = await storeDataEvent(event);
            //log("storeDataEvent() DONE");
            //logResult("storeDataEvent().result", ftDev.jsonString(result));
        }
        {
            const result = await storeDataEventOnPayloadChange({
                ...event,
                index: {
                    key: "value"
                },
                version: "2",
            });
            //log("storeDataEventOnPayloadChange() DONE");
            //logResult("storeDataEventOnPayloadChange().result", ftDev.jsonString(result));
            expect(result).to.equal(true);
        }
    });

});
