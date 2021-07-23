const ftDev = require('ftws-node-dev-tools');
const {jsonString} = ftDev;
const _MODULE = require("../module");
const testHandler = require('../handler');

// DB Stuff
require('../../../../../../app1-test-env');
const {clearDatabase} = require('alice-runtime-test-helper');
const alice = require('../../../../../../../../index');


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

describe('app/akeneo/text/cmd/syncMongoAkeneoText/handler', function () {

    beforeEach(async () => {

        if (!await alice.connect()) {
            throw Error('connect() failed ');
        }
        log("connected to database");
        await alice.getCollectionView("AkeneoText").deleteMany({});
        log("collection sync_AkeneoText cleared");
    });

    after(async () => {
        await alice.disconnect();
        log("disconnected from database");
    });


    // -----------------------------------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------------------------------
    it('data/command-1', async function () {
        const Command_1_obj = require('./data/command-1');

        let testData = {
            getLastDataEvent: null,
        };
        const env = {
            getCollectionView: alice.getCollectionView,
            getLastDataEvent: async input => {
                debug("getLastDataEvent(%s)", jsonString(input));
                testData.getLastDataEvent = input;
                return require("./data/input-data-1");
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
