const ftDev = require("ftws-node-dev-tools");
const {jsonString} = ftDev;
const {getCollectionTriggerIndex} = require("./database");
const R = require("ramda");
const hasValue = R.complement(R.isNil);


const _logger = require('debug')('alice:getTriggerEvents');
const log = _logger.extend('log');
const debug = _logger.extend('debug');



const getItemTriggerIndex = async (id) => {
    const query = {
        _id: id,
    };
    debug("getItemTriggerIndex().findOne(%s)", jsonString(query));
    const result = await getCollectionTriggerIndex().findOne(query);
    debug("getItemTriggerIndex().findOne().result", jsonString(result));

    return hasValue(result) ? result : false;
};

module.exports = {
    getItemTriggerIndex,
};
