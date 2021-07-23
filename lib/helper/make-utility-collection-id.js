const dc = require("node-dev-console");
const R = require("ramda");


function makeUtilityCollectionId(namespace, idParts, idPartSeparator = "::") {
    return R.join("::", [namespace, R.join(idPartSeparator, idParts)]);
}


module.exports = {
    makeUtilityCollectionId
};
