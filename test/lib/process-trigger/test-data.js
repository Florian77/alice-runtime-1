const dc = require("node-dev-console");
const {
    createTrigger,
    storeDataEvent,
} = require("../../../index");

const storeDataEvent1 = async (eventCount = 1) => {
    const result = await storeDataEvent({
        context: "RANDOM-CONTEXT",
        aggregate: "random-other-aggregate",
        aggregateId: "sku=203040",
        payload: {
            name: "Hello World!"
        }
    });
    // dc.j(result, "storeDataEvent1().result");
    //log("storeDataEvent1() [eventCount=%s] DONE", eventCount);
    //debug("storeDataEvent1().result [eventCount=%s]", eventCount, jsonString(result));
};

const insertTestData1 = async ({eventCount = 1} = {}) => {
    do {
        await storeDataEvent1(eventCount);
    } while ((eventCount -= 1) > 0);
    {
        const result = await createTrigger({
            context: "RANDOM-CONTEXT",
            aggregate: "random-aggregate",
            trigger: "myTrigger",

            streamContext: "RANDOM-CONTEXT",
            streamAggregate: "random-other-aggregate",
        });
        //log("insertTestData1().createTrigger() DONE");
        //debug("insertTestData1().createTrigger().result", jsonString(result));
        // ftDev.logJsonString(result, "createTrigger().result");
        // expect(result).to.equal(true);
    }
    return true;
};
const insertTestData2 = async ({eventCount = 1} = {}) => {
    do {
        await storeDataEvent1(eventCount);
    } while ((eventCount -= 1) > 0);
    {
        const result = await createTrigger({
            context: "RANDOM-CONTEXT",
            aggregate: "random-aggregate",
            trigger: "myTrigger",

            streamContext: "RANDOM-CONTEXT",
            streamAggregate: "random-other-aggregate",

            paused: true,
        });
        //log("insertTestData2().createTrigger() DONE");
        //debug("insertTestData2().createTrigger().result", jsonString(result));
        // ftDev.logJsonString(result, "createTrigger().result");
        // expect(result).to.equal(true);
    }
    return true;
};
const insertTestDataError1 = async () => {
    await storeDataEvent1();
    {
        const result = await createTrigger({
            context: "RANDOM-CONTEXT",
            aggregate: "random-aggregate",
            trigger: "throwError",

            streamContext: "RANDOM-CONTEXT",
            streamAggregate: "random-other-aggregate",
        });
        //log("insertTestDataError1().createTrigger() DONE");
        //debug("insertTestDataError1().createTrigger().result", jsonString(result));
    }
    return true;
};
const insertTestDataError2 = async () => {
    await storeDataEvent1();
    {
        const result = await createTrigger({
            context: "RANDOM-CONTEXT",
            aggregate: "random-aggregate",
            trigger: "notExists",

            streamContext: "RANDOM-CONTEXT",
            streamAggregate: "random-other-aggregate",
        });
        //log("insertTestDataError2().createTrigger() DONE");
        //debug("insertTestDataError2().createTrigger().result", jsonString(result));
    }
    return true;
};

module.exports = {
    insertTestData1,
    insertTestData2,
    insertTestDataError1,
    insertTestDataError2,
}
