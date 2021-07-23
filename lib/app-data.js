const R = require("ramda");
const {
    UTILITY_NAMESPACE,
    makeUtilityCollectionId,
    getCollectionUtility,
} = require("./database");
const {storeError} = require("./database");


function appDataUtilityId(key) {
    return makeUtilityCollectionId(
        UTILITY_NAMESPACE.APP,
        [key],
        "/"
    );
}


async function storeAppData(key, data) {

    const docId = appDataUtilityId(key);
    const filter = {
        _id: docId
    };
    const update = {
        $set: {
            data
        }
    };
    const options = {
        upsert: true
    };
    try {
        /*const result =*/
        await getCollectionUtility().updateOne(filter, update, options);

        return true;
    } catch (e) {
        console.error(e);
        await storeError(__filename, 39, "storeAppData", e)
    }

    return false;
}


async function loadAppData(key) {

    const docId = appDataUtilityId(key);
    const filter = {
        _id: docId
    };
    try {
        const result = await getCollectionUtility().findOne(filter);
        // console.log("result", result);

        if (R.isNil(result)) {
            return false;
        }

        return R.propOr(false, "data", result);

    } catch (e) {
        console.error(e);
        await storeError(__filename, 63, "loadAppData", e)
    }

    return false;
}


module.exports = {
    storeAppData,
    loadAppData,
};
