const R = require("ramda");
const {CTX1__AGGT2} = require("../../../../../app_aggregates");
const {CTX1__AGGT1} = require("../../../../../app_aggregates");
const path = require('path')

const installTrigger = {
    type: "stream",
    context: CTX1__AGGT2.context,
    aggregate: CTX1__AGGT2.aggregate,
    trigger: R.pipe(R.split(path.sep), R.last)(__dirname),
    streamContext: CTX1__AGGT1.context,
    streamAggregate: CTX1__AGGT1.aggregate,
    streamAggregateId: null,
    lastSequenceNumber: -1,
    paused: true,
};


module.exports = installTrigger;
