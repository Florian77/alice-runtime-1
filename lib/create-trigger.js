const R = require("ramda");
const {createDataTrigger} = require("./create-data-trigger");
const {createCronTrigger} = require("./create-cron-trigger");
const {getCollectionTriggerIndex} = require("./database");


async function createTrigger({
                                     type = "stream",
                                     ...triggerData
                                 }) {
    if (type === "cron") {
        return createCronTrigger(triggerData);
    }

    return createDataTrigger(triggerData);
}


const updateOneTrigger = async ({
                                    triggerId = null
                                }, set = {}) => {

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
};

module.exports = {
    createTrigger,
    updateOneTrigger,
};
