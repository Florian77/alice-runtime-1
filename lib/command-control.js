const dc = require("node-dev-console");
const R = require("ramda");
const {
    getCollectionUtility,
    makeUtilityCollectionId,
    UTILITY_NAMESPACE,
} = require("./database");
const {storeError} = require("./database");


function generateUtilityId({context, aggregate, command}) {
    return makeUtilityCollectionId(
        UTILITY_NAMESPACE.COMMAND_CONTROL,
        [context, aggregate, command],
        "/"
    );
}


async function getCommandControl({context, aggregate, command}) {
    const utilityId = generateUtilityId({context, aggregate, command});
    //dc.l("[utilityId=%s]", utilityId);
    try {
        const result = await getCollectionUtility().findOne({_id: utilityId});
        // dc.l("findOne():", dc.stringify(result));
        return R.isNil(result) ? {paused: false} : result;
    } catch (e) {
        console.error(e);
        await storeError(__filename, 53, "getCommandControl", e);
        return false;
    }
}


async function isCommandControlPaused({context, aggregate, command}) {
    const commandControl = await getCommandControl({context, aggregate, command});
    // dc.j(commandControl, "commandControl");
    return R.propEq("paused", true, commandControl);
}


async function upsertCommandControl({context, aggregate, command}, set) {

    const utilityId = generateUtilityId({context, aggregate, command});
    // dc.l("[utilityId=%s]", utilityId);

    const filter = {
        _id: utilityId,
    };
    let update = {
        $set: {
            ...set
        },
        $setOnInsert: {
            context,
            aggregate,
            command,
        }
    };
    const options = {
        upsert: true
    };
    // dc.l("updateOne(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options));
    try {
        const result = await getCollectionUtility().updateOne(filter, update, options);
        // dc.l("updateOne():", dc.stringify(result));

    } catch (e) {
        console.error(e);
        await storeError(__filename, 87, "upsertCommandControl", e);
        return false;
    }

    return true;
}


module.exports = {
    getCommandControl,
    isCommandControlPaused,
    upsertCommandControl,
};
