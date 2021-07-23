const dc = require("node-dev-console");
const expect = require('chai').expect;
const {
    trimPropEg,
    // logConnectionMsg
} = require("../../../lib/helper/log-connection-msg");


dc.activate();


describe('lib/helper/log-connection-msg', function () {

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(async function () {
        dc.l("---------------", this.currentTest.title, "---------------");
    });

    it('trimPropEg prop value without spaces', function () {
        {
            const testObject = {
                testProp: "false"
            };
            const result = trimPropEg("testProp", "false", testObject);
            dc.t(result, "result");
            expect(result).to.be.true;
        }
    });

    it('trimPropEg prop value with spaces', function () {
        {
            const testObject = {
                testProp: " false "
            };
            const result = trimPropEg("testProp", "false", testObject);
            dc.t(result, "result");
            expect(result).to.be.true;
        }
    });

    it('trimPropEg prop not exists', function () {
        {
            const testObject = {};
            const result = trimPropEg("testProp", "not exists", testObject);
            dc.t(result, "result");
            expect(result).to.be.false;
        }
    });

    // todo -> test logConnectionMsg

});
