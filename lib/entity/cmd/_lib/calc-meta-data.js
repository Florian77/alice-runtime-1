const dc = require("node-dev-console");
const R = require("ramda");

function calcMetaData (entityValue, entityData) {

    const totalValues = R.length(entityValue.fieldList);
    let emptyValues = 0;
    for (let {code} of entityValue.fieldList) {
        const value = R.propOr("", code, entityData);
        if (R.isEmpty(value)) {
            emptyValues += 1;
        }
    }
    const notEmptyValues = totalValues - emptyValues;

    return {
        isNew: emptyValues === totalValues,
        isPartial: notEmptyValues > 0 && notEmptyValues < totalValues,
        isComplete: emptyValues === 0,
        completeness: totalValues > 0 ? Math.round(notEmptyValues / totalValues * 100) : 0.0,
    }
}

module.exports = {
    calcMetaData
};
