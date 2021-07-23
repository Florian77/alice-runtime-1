require('../../app1-env');
const ftDev = require('ftws-node-dev-tools');
const {jsonString} = ftDev;
const alice = require('../../../../index');
const {resolve} = require('path');


require("debug").log = console.log.bind(console);
const _loggerNs = "app:system:processTrigger";
const _logger = require("debug")(_loggerNs);
const log = _logger.extend("log");
const debug = _logger.extend("debug");
require("debug").enable(""
    + ",*:log"
    // +",*:debug"
    + `,${_loggerNs}:log`
    // + `,${_loggerNs}:debug`
    // + ",alice:processTrigger:debug"
    // + ",alice:processCommands:debug"
    // + ",alice:storeDataEvent:debug"
    + ",alice:db:connect"
);

(async () => {
    log("start process");
    try {
        // Connect to Database
        await alice.connect();

        const functionPath = resolve(
            __dirname,
            "../",
            "../",
            "app"
        );
        debug("functionPath:", functionPath);

        await alice.processTrigger({
            functionPath,
            maxProcessTrigger: 1,
            maxProcessEvents: 1,
        });

    } catch (e) {
        console.error(e);
    }
    await alice.disconnect();
    log("process completed");
})();
