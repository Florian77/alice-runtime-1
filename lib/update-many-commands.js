const dc = require("node-dev-console");
const R = require("ramda");
const {getCollectionCommandIndex} = require("./database");
const {storeError} = require("./database");


async function updateManyCommands(
    {
        context = null,
        aggregate = null,
        command = null,
    } = {},
    set = {},
    filter = {}
) {

    // const commandId = makeCommandId(context, aggregate, command)
    const updateFilter = {
        context,
        aggregate,
        command,
        ...filter,
    };
    let update = {
        $set: {
            ...set,
        }
    };
    const options = {};
    // dc.j(updateFilter, "updateFilter")
    try {
        const result = await getCollectionCommandIndex().updateMany(updateFilter, update, options);
        // dc.l("command stored [id=%s]", commandId);
        // dc.l("updateOne()", dc.stringify(result));

        return {
            ok: R.propEq("acknowledged", true, result),
            matchedCount: R.propOr(null, "matchedCount", result),
            modifiedCount: R.propOr(null, "modifiedCount", result),
        };
    } catch (e) {
        console.error(e);
        await storeError(__filename, 429, "updateManyCommands", e);
        return false;
    }
}


module.exports = {
    updateManyCommands,
};
