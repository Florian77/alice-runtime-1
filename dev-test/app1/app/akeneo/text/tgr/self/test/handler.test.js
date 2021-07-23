const ftDev = require('ftws-node-dev-tools');
const {jsonString} = ftDev;
const _MODULE = require("../module");
const expect = require('chai').expect;
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

describe('app/akeneo/text/trg/self/handler', function () {

    // -----------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------
    it('data/event-1', async function () {
        const Command_1_obj = require('./data/event-1');

        let testData = {
            emitMultiCommand: null,
        };
        const env = {
            emitMultiCommand: async input => {
                debug("emitMultiCommand(%s)", jsonString(input));
                testData.emitMultiCommand = input;
            },
        };

        const result = await testHandler(
            Command_1_obj,
            env,
        );
        logResult("result", jsonString(result));
        expect(testData.emitMultiCommand).to.deep.equal(require('./data/result-command-1'));
        expect(result).to.equal(true);
    });



});
