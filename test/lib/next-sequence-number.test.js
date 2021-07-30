const expect = require('chai').expect;
const dc = require("node-dev-console");
const R = require("ramda");
const aliceTestEnv = require("../../test-environment");
const {nextSequenceNumber_dataStream} = require("../../index");
const {nextSequenceNumber_dataIndex} = require("../../index");


dc.activate();


describe('lib/next-sequence-number.js', function () {

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
    it('dataStream - happy path', async function () {

        for (let i = 0; i < 10; i++) {
            const value = await nextSequenceNumber_dataStream("test1");
            dc.t(value, `value (${i})`);
            expect(value).to.be.equals(i);
        }

        for (let i = 0; i < 10; i++) {
            const value = await nextSequenceNumber_dataStream("test2");
            dc.t(value, `value (${i})`);
            expect(value).to.be.equals(i);
        }

    });


    // -----------------------------------------------------------------------------------------------------------------------------
    it('dataIndex - happy path', async function () {

        for (let i = 0; i < 10; i++) {
            const value = await nextSequenceNumber_dataIndex("C", "A");
            dc.t(value, `value (${i})`);
            expect(value).to.be.equals(i);
        }

        for (let i = 0; i < 10; i++) {
            const value = await nextSequenceNumber_dataIndex("C", "B");
            dc.t(value, `value (${i})`);
            expect(value).to.be.equals(i);
        }

    });


    // -----------------------------------------------------------------------------------------------------------------------------
    it('dataStream - race condition test', async function () {

        const result = await Promise.all([
            nextSequenceNumber_dataStream("test"),
            nextSequenceNumber_dataStream("test"),
            nextSequenceNumber_dataStream("test"),
            nextSequenceNumber_dataStream("test"),
            nextSequenceNumber_dataStream("test"),
            nextSequenceNumber_dataStream("test"),
            nextSequenceNumber_dataStream("test"),
            nextSequenceNumber_dataStream("test"),
            nextSequenceNumber_dataStream("test"),
            nextSequenceNumber_dataStream("test"),
        ]);
        dc.j(result, "result");

        expect(result.sort()).to.be.deep.equals([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    });

});
