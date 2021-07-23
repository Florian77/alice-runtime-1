const dc = require("node-dev-console");
const R = require("ramda");

const getEventId = R.propOr("ERROR-MISSING-DATA", "_id");


const throwError = async (event, env) => {
    // dc.l("start processing event [id=%s]", getEventId(event));
    dc.l("event data", dc.stringify(event));

    throw Error("my Error");

    // return true;
};


module.exports = throwError;
