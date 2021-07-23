const dc = require("node-dev-console");
const R = require("ramda");

const getCommandId = R.propOr("ERROR-MISSING-DATA", "_id");
const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");




const emptyTrigger = async (event, env) => {
    dc.l("start processing event [id=%s]", getEventId(event));
    dc.l("event data", dc.stringify(event));


    return true;
};


module.exports = emptyTrigger;
