const dc = require("node-dev-console");
const R = require("ramda");
const {storeError} = require("./database");
const {getCollectionTriggerIndex} = require("./database");


async function updateOneTrigger({
                                    triggerId = null
                                }, set = {}) {

    const filter = {
        _id: triggerId,
    };
    let update = {
        $set: {
            ...set,
        }
    };
    const options = {};
    // dc.l("updateOneTrigger(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options));
    try {
        const result = await getCollectionTriggerIndex().updateOne(filter, update, options);
        // dc.l("command stored [id=%s]", triggerId);
        // dc.l("updateOne()", dc.stringify(result));

        return {
            ok: R.propEq("acknowledged", true, result),
            matchedCount: R.prop("matchedCount", result),
            modifiedCount: R.prop("modifiedCount", result),
        };
    } catch (e) {
        console.error(e);
        await storeError(__filename, 44, "updateOneTrigger", e)
        return false;
    }
}


module.exports = {
    updateOneTrigger,
};
