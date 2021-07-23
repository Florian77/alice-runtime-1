const dc = require("node-dev-console");
const R = require("ramda");
const {makeCommandId} = require("./helper/make-command-id");
const {getCollectionCommandIndex} = require("./database");
const {storeError} = require("./database");


async function updateOneCommand({
                                    context = "",
                                    aggregate = "",
                                    command = "",
                                    invokeId = "",
                                    uniqueId = null,
                                    commandId = null
                                }, set = {}) {

    if (R.isNil(commandId) || R.isEmpty(commandId)) {
        commandId = makeCommandId(context, aggregate, command, invokeId, uniqueId);
    }
    const filter = {
        _id: commandId,
    };
    let update = {
        $set: {
            ...set,
        }
    };
    const options = {};
    // dc.l("updateOneCommand(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options))
    try {
        const result = await getCollectionCommandIndex().updateOne(filter, update, options);
        // dc.l("command stored [id=%s]", commandId);
        // dc.l("updateOne()", dc.stringify(result));

        return {
            ok: R.propEq("acknowledged", true, result),
            matchedCount: R.prop("matchedCount", result),
            modifiedCount: R.prop("modifiedCount", result),
        };
    } catch (e) {
        console.error(e);
        await storeError(__filename, 390, "updateOneCommand", e);
        return false;
    }
}


module.exports = {
    updateOneCommand,
};
