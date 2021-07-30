const R = require("ramda");
const {CTX1__AGGT2} = require("../../../../../app_aggregates");
const {CTX1__AGGT1} = require("../../../../../app_aggregates");
const path = require('path')

const useIt = R.ap(
    R.flip(R.drop),
    R.pipe(
        R.lastIndexOf(path.sep),
        R.add(1)
    )
)


const installTrigger = {
    type: "stream",
    context: CTX1__AGGT2.context,
    aggregate: CTX1__AGGT2.aggregate,
    trigger: useIt(__dirname), // R.pipe(R.split(path.sep), R.last)(__dirname),
    streamContext: CTX1__AGGT1.context,
    streamAggregate: CTX1__AGGT1.aggregate,
    streamAggregateId: null,
    lastSequenceNumber: -1,
    // paused: true,
};

/*
// in the body of getDir() ...
-> R.lastIndexOf
var sepIndex = filePath.lastIndexOf('/');
if(sepIndex == -1){
    sepIndex = filePath.lastIndexOf('\\');
}
// include the trailing separator
return filePath.substring(0, sepIndex+1);
*/

module.exports = installTrigger;
