const ftDev = require('ftws-node-dev-tools');
const {jsonString} = ftDev;
const _MODULE = require("../module");
const testHandler = require('../handler');

// TODO -> Mock DB

require("debug").log = console.log.bind(console);
const _logger = require("debug")(`test:${_MODULE.namespace}`);
const log = _logger.extend("log");
const logResult = log.extend("result");
const debug = _logger.extend("debug");
require("debug").enable(""
    + ",*:log"
    // +",*:debug"
    + `,test:${_MODULE.namespace}:log:result`
    // + `,test:${_loggerNs}:debug`
    + `,${_MODULE.namespace}:debug`
    + ",alice:db:connect"
);

describe('app/akeneo/text/cmd/makeAggregate/handler', function () {

    // -----------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------
    it('data/command-1--no-last-event', async function () {
        const Command_1_obj = require('./data/command-1');

        let testData = {
            storeDataEvent: null,
            getLastDataEvent: null,
        };
        const env = {
            storeDataEvent: async input => {
                debug("storeDataEvent(%s)", jsonString(input));
                testData.storeDataEvent = input;
            },
            getLastDataEvent: async input => {
                debug("getLastDataEvent(%s)", jsonString(input));
                testData.getLastDataEvent = input;
                if( input.aggregate === "import-products"){
                    return require("./data/input-data-1");
                }
                return false;
            },
        };

        const result = await testHandler(
            Command_1_obj,
            env,
        );
        logResult("result", jsonString(result));
        // expect(result).to.deep.equal(require('./data/result/createAggregates-2'));
    });

});
