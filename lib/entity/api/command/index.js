const createFunction = require("./create");
const definitionFunction = require("./definition");
const deleteFunction = require("./delete");
const entityFunction = require("./entity");
const queryFunction = require("./query");
const updateFunction = require("./update");

module.exports = {
    create: createFunction,
    definition: definitionFunction,
    delete: deleteFunction,
    entity: entityFunction,
    query: queryFunction,
    update: updateFunction,
};
