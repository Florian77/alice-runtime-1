const dc = require("node-dev-console");
const R = require("ramda");
const {getCollectionTriggerIndex} = require("./database");
const hasValue = R.complement(R.isNil);




const getItemTriggerIndex = async (id) => {
    const query = {
        _id: id,
    };
    // dcl("getItemTriggerIndex().findOne(%s)", dc.stringify(query));
    const result = await getCollectionTriggerIndex().findOne(query);
    // dcl("getItemTriggerIndex().findOne().result", dc.stringify(result));

    return hasValue(result) ? result : false;
};

module.exports = {
    getItemTriggerIndex,
};
