const dc = require("node-dev-console");
const R = require("ramda");


const myCronJob = async (trigger, env) => {
    // dc.j(trigger, "trigger");

    const result = await env.storeDataEvent({
        context: "RANDOM-CONTEXT",
        aggregate: "random-aggregate",
        aggregateId: "id=1",
        payload: {
            test: "data",
            trigger: trigger.trigger
        },
    });
    // dc.j(result, "result");

    return true;
};


module.exports = myCronJob;
