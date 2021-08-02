const expect = require('chai').expect;
const R = require("ramda");
const dc = require("node-dev-console");
const aliceTestEnv = require("../../../test-environment");
const {
    storeDataEvent,
    queryDataIndex
} = require("../../../index");


dc.activate();


const insertTestDataIndex1 = async () => {
    const idList = ["20", "30", "40", "50"];
    for (let id of idList) {
        const result = await storeDataEvent({
            context: "CXT-NAME",
            aggregate: "AGT-NAME-1",
            aggregateId: `id=${id}`,
            payload: {
                id,
                name: `Item  ${id}`
            },
            index: {
                parentId: "10"
            }
        });
        dc.l("insertTestDataIndex1().storeDataEvent() [id=%s] DONE", id);
        // dc.l("insertTestDataIndex1().storeDataEvent().result [eventCount=%s]", eventCount, dc.stringify(result));
        // expect(result).to.equal(true);
    }
    {
        const id = "10";
        const result = await storeDataEvent({
            context: "CXT-NAME",
            aggregate: "AGT-NAME-2",
            aggregateId: `id=${id}`,
            payload: {
                id,
                name: `Item  ${id}`
            },
            index: {}
        });
        dc.l("insertTestDataIndex1().storeDataEvent() [id=%s] DONE", id);
    }
    return true;
};


describe('lib/get-data-events.js/queryDataIndex', function () {

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
    it('query context', async function () {
        await insertTestDataIndex1();
        {
            const result = await queryDataIndex({
                context: "CXT-NAME",
                aggregate: "AGT-NAME-1",
            });
            dc.l(`[${this.test.title}] result`, dc.stringify(result));
            expect(R.length(result)).to.be.equal(4);
        }
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('query index field', async function () {
        await insertTestDataIndex1();
        {
            const result = await queryDataIndex({
                "index.parentId": "10"
            });
            dc.l(`[${this.test.title}] result`, dc.stringify(result));
            expect(R.length(result)).to.be.equal(4);
        }
    });

    it('empty result', async function () {
        await insertTestDataIndex1();
        {
            const result = await queryDataIndex({
                context: "CXT-NAME",
                aggregate: "NOT-EXISTS",
            });
            dc.l(`[${this.test.title}] result`, dc.stringify(result));
            expect(result).to.be.an('array');
            expect(result).to.be.empty;
        }
    });

    it('limit', async function () {
        await insertTestDataIndex1();
        {
            const result = await queryDataIndex({
                context: "CXT-NAME",
                aggregate: "AGT-NAME-1",
            }, {
                limit: 1,
            });
            dc.l(`[${this.test.title}] result`, dc.stringify(result));
            expect(R.length(result)).to.be.equal(1);
            // expect(result[0].sequenceNumber).to.be.equal(0);
        }
    });

    it('skip', async function () {
        await insertTestDataIndex1();
        {
            const result = await queryDataIndex({
                context: "CXT-NAME",
                aggregate: "AGT-NAME-1",
            }, {
                skip: 3,
            });
            dc.l(`[${this.test.title}] result`, dc.stringify(result));
            expect(R.length(result)).to.be.equal(1);
            // expect(result[0].sequenceNumber).to.be.equal(3);
        }
    });

    it('skip all, empty result', async function () {
        await insertTestDataIndex1();
        {
            const result = await queryDataIndex({
                context: "CXT-NAME",
                aggregate: "AGT-NAME-1",
            }, {
                skip: 4,
            });
            dc.l(`[${this.test.title}] result`, dc.stringify(result));
            expect(R.length(result)).to.be.equal(0);
        }
    });

    it('limit and skip', async function () {
        await insertTestDataIndex1();
        {
            const result = await queryDataIndex({
                context: "CXT-NAME",
                aggregate: "AGT-NAME-1",
            }, {
                skip: 2,
                limit: 1,
            });
            dc.l(`[${this.test.title}] result`, dc.stringify(result));
            expect(R.length(result)).to.be.equal(1);
            // expect(result[0].sequenceNumber).to.be.equal(2);
        }
    });

    it('getLastEvent', async function () {
        await insertTestDataIndex1();
        {
            const result = await queryDataIndex({
                context: "CXT-NAME",
                aggregate: "AGT-NAME-2",
            }, {
                limit: 1,
                getLastEvent: true
            });
            dc.l(`[${this.test.title}] result`, dc.stringify(result));
            expect(R.length(result)).to.be.equal(1);
            expect(result[0].payload).to.be.deep.equal({
                "id": "10",
                "name": "Item  10"
            });

        }
    });

});
