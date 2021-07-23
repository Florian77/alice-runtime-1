const dc = require("node-dev-console");
const R = require("ramda");

const backup_Command = require("./command/backup");
const createIfNotExists_Command = require("./command/create-if-not-exists");
const delete_Command = require("./command/delete");
const recalc_Command = require("./command/recalc");
const updateOnChange_Command = require("./command/update-on-change");

module.exports = {
    backup_Command,
    createIfNotExists_Command,
    delete_Command,
    recalc_Command,
    updateOnChange_Command,
};
