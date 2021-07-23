const expect = require('chai').expect;
const {loadRuntimeConfig} = require("../../../index");
const dc = require("node-dev-console");


dc.activate();


describe('lib/load-runtime-config.js/loadRuntimeConfig', function () {

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(function () {
        dc.l("---------------", this.currentTest.title, "---------------");
        delete process.env.ALICE_RUNTIME_MONGODB_DB;
        delete process.env.ALICE_RUNTIME_MONGODB_URL;
        delete process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG;
        delete process.env.ALICE_RUNTIME_STAGE;
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('happy path + default values', function () {
        loadRuntimeConfig(__dirname, "random-stage");

        dc.t(process.env.ALICE_RUNTIME_MONGODB_DB, "ALICE_RUNTIME_MONGODB_DB");
        dc.t(process.env.ALICE_RUNTIME_MONGODB_URL, "ALICE_RUNTIME_MONGODB_URL");
        dc.t(process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG, "ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG");
        dc.t(process.env.ALICE_RUNTIME_STAGE, "ALICE_RUNTIME_STAGE");

        expect(process.env.ALICE_RUNTIME_MONGODB_DB).to.be.equal("db-name");
        expect(process.env.ALICE_RUNTIME_MONGODB_URL).to.be.equal("mongodb://host");
        expect(process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG).to.be.equal("true");
        expect(process.env.ALICE_RUNTIME_STAGE).to.be.equal("random-stage");
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('SHOW_DB_CONNECTION_MSG off', function () {
        loadRuntimeConfig(__dirname, "db-msg-false");
        dc.t(process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG, "ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG");
        expect(process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG).to.be.equal("false");
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('SHOW_DB_CONNECTION_MSG use default value from process.env', function () {
        process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG = "1";
        dc.t(process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG, "ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG before");
        loadRuntimeConfig(__dirname, "db-msg-not-set");
        dc.t(process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG, "ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG after");
        expect(process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG).to.be.equal("1");
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('error config file not exists', function () {
        try {
            loadRuntimeConfig(__dirname, "config-file-not-exists");
        } catch (e) {
            dc.t(e.message, "error message");
            expect(e.message).to.be.equal("alice runtime config not found [stage=config-file-not-exists]");
        }
    });


});