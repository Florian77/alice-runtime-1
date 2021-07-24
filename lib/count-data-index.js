const dc = require("node-dev-console");
const {getCollectionDataIndex} = require("./database");


/**
 *
 * @param {Object} query
 * @return {Promise<[]|*>}
 */
async function countDataIndex(query) {
    // dc.j(query, "countDataIndex().query");
    return getCollectionDataIndex().countDocuments(query);
}


module.exports = {
    countDataIndex,
};
