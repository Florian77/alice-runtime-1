const dc = require("node-dev-console");
const R = require("ramda");
const {
    getCollectionCommandIndex,
    getCollectionCommandPayload,
} = require("./database");


async function getItemCommandIndex(id) {
    const query = {
        _id: id,
    };
    // dc.l("getItemCommandIndex().findOne(%s)", dc.stringify(query));
    let result = await getCollectionCommandIndex().findOne(query);
    // dc.l("getItemCommandIndex().findOne().result", dc.stringify(result));
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
}


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
    // dc.l("getDataEvent().findOne(%s)", dc.stringify(query));
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
