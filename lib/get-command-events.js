const dc = require("node-dev-console");
const {
    getCollectionCommandIndex,
    getCollectionCommandPayload,
} = require("./database");
const R = require("ramda");


// const _logger = require('debug')('alice:getCommandEvents');
// const log = _logger.extend('log');
// const debug = _logger.extend('debug');


const getItemCommandIndex = async (id) => {
    const query = {
        _id: id,
    };
    // debug("getItemCommandIndex().findOne(%s)", jsonString(query));
    let result = await getCollectionCommandIndex().findOne(query);
    // debug("getItemCommandIndex().findOne().result", jsonString(result));
    // console.log("getDataEvent().findOne().result", result);

    if (R.isNil(result)) {
        return false
    }

    if (R.propEq("hasPayload", true, result)) {
        const payload = await getCollectionCommandPayload().findOne(query)
        // console.log("payload", payload)
        result = R.assoc("payload", R.propOr({}, "payload", payload), result)
    }

    return result;
};


async function getCommand({
                              context,
                              aggregate,
                              command,
                              invokeId,
                              commandId = null
                          }) {
    if (R.isNil(commandId)) {
        commandId = R.join("/", [
            context,
            aggregate,
            command,
            invokeId,
        ]);
    }
    const query = {
        _id: commandId
    };
    // debug("getDataEvent().findOne(%s)", jsonString(query));
    let result = await getCollectionCommandIndex().findOne(query);
    // console.log("getDataEvent().findOne().result", result);

    if (R.isNil(result)) {
        return false
    }

    if (R.propEq("hasPayload", true, result)) {
        const payload = await getCollectionCommandPayload().findOne(query)
        // console.log("payload", payload)
        result = R.assoc("payload", R.propOr({}, "payload", payload), result)
    }

    return result
}

module.exports = {
    getItemCommandIndex, // internal function
    getCommand,
};
