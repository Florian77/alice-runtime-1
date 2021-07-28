const dc = require("node-dev-console");
const R = require("ramda");
const {utility: u} = require("../../../../../../../../index");
const {CTX1__AGGT2} = require("../../../../../app_aggregates");


const triggerHandler = async (event, env) => {
    // dc.j(event, "event");


    await env.emitMultiCommand({
        ...CTX1__AGGT2,
        command: "makeAggregate",
        invokeId: u.getAggregateId(event),
    });


    return true;

};


module.exports = triggerHandler;
