const R = require("ramda");

const trimPropEg = (prop, value, object) => {
    if (!R.has(prop, object)) {
        return false;
    }
    return R.trim(R.prop(prop, object)) === value;
};

const logConnectionMsg = (...parm) => {
    if (
        !trimPropEg("ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG", "false", process.env)
        && !trimPropEg("ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG", "0", process.env)
    ) {
        console.log(...parm);
    }
};

module.exports = {
    trimPropEg,
    logConnectionMsg
};