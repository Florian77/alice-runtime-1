require('../../../../../app1-env');
const ftDev = require('ftws-node-dev-tools');
const {jsonString} = ftDev;
const alice = require('../../../../../../../index');
const _MODULE = require("./module");


require("debug").log = console.log.bind(console);
const _logger = require('debug')(_MODULE.namespace);
const log = _logger.extend('log');
const debug = _logger.extend('debug');
require("debug").enable(""
    + ",*:log"
    // +",*:debug"
    + `,${_MODULE.namespace}:log`
    + `,${_MODULE.namespace}:debug`
    // + ",alice:processTrigger:debug"
    // + ",alice:processCommands:debug"
    // + ",alice:storeDataEvent:debug"
    + ",alice:db:connect"
);


(async () => {
    log("start install trigger [%s]", _MODULE.namespace);
    try {
        await alice.connect(); // Connect to Database

        const trigger = {
            context: _MODULE.context,
            aggregate: _MODULE.aggregate,
            trigger: _MODULE.trigger,

            streamContext: _MODULE.streamContext,
            streamAggregate: _MODULE.streamAggregate,
            streamAggregateId: _MODULE.streamAggregateId,

            lastSequenceNumber: _MODULE.lastSequenceNumber,
        };
        debug("createDataTrigger(%s)", jsonString(trigger));
        const result = await alice.createDataTrigger(trigger);
        log("createDataTrigger() DONE");
        debug("createDataTrigger().result", jsonString(result));

    } catch (e) {
        console.error(e);
    }
    await alice.disconnect();
    log("install trigger completed");
})();
