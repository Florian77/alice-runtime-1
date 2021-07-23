const dc = require("node-dev-console");
const R = require("ramda");

const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");


const myTrigger = async (event, env) => {
    dc.l("start processing event [id=%s]", getEventId(event));
    dc.l("event data", dc.stringify(event));

    /*const result = await env.emitCommand({
        context: "akeneo",
        aggregate: "product",
        command: "doSomeThing",
        invokeId: event.aggregateId,
        multiInvoke: true,
        payload: {
            myData: "important command"
        },
    });
    // if(debug.enabled) dc.j(result, "myTrigger().emitCommand().result");
    dc.l("myTrigger().emitCommand().result %s", dc.stringify(result));*/


    return true;
};


module.exports = myTrigger;
