const dc = require("node-dev-console");
const alice = require("../../index");


const clearDatabase = async ({
                                 createIndexAfterClear = false
                             } = {}) => {
    dc.l("clearDatabase()");
    const collections = await alice.listCollections({"type": "collection", "name": { $not: /^backup.*/ }}, {nameOnly: true}).toArray();
    await Promise.all(
        collections
            .map(({name: collectionName}) => alice.getCollection(collectionName).drop())
    );

    if(createIndexAfterClear) {
        await alice.checkIndexes();
    }

    return true;
};

module.exports = {
    clearDatabase
};
