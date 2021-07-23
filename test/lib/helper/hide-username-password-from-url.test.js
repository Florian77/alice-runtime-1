const dc = require("node-dev-console");
const expect = require('chai').expect;
const {hideUsernamePasswordFromUrl} = require("../../../lib/helper/hide-username-password-from-url");

dc.activate();


describe('lib/helper/hide-username-password-from-url', function () {

    it('happy path', function () {
        {
            const result = hideUsernamePasswordFromUrl("port://Username:Password@hostname/path?query=string#random-hash");
            dc.t(result, "result:");
            expect(result).to.be.equal("port://Usexxx:xxx@hostname/path?query=string#random-hash");
        }
        {
            const result = hideUsernamePasswordFromUrl("port://user12:Password@hostname/path?query=string#random-hash");
            dc.t(result, "result:");
            expect(result).to.be.equal("port://xxx:xxx@hostname/path?query=string#random-hash");
        }
        {
            const result = hideUsernamePasswordFromUrl("port://Username@hostname/path?query=string#random-hash");
            dc.t(result, "result:");
            expect(result).to.be.equal("port://Usexxx@hostname/path?query=string#random-hash");
        }
        {
            const result = hideUsernamePasswordFromUrl("port://hostname/path?query=string#random-hash");
            dc.t(result, "result:");
            expect(result).to.be.equal("port://hostname/path?query=string#random-hash");
        }
        {
            const result = hideUsernamePasswordFromUrl("port://hostname/path?query=string");
            dc.t(result, "result:");
            expect(result).to.be.equal("port://hostname/path?query=string");
        }
        {
            const result = hideUsernamePasswordFromUrl("port://hostname/path");
            dc.t(result, "result:");
            expect(result).to.be.equal("port://hostname/path");
        }
        {
            const result = hideUsernamePasswordFromUrl("port://hostname/");
            dc.t(result, "result:");
            expect(result).to.be.equal("port://hostname/");
        }
        {
            const result = hideUsernamePasswordFromUrl("port://hostname");
            dc.t(result, "result:");
            expect(result).to.be.equal("port://hostname");
        }
        {
            const result = hideUsernamePasswordFromUrl("no-url");
            dc.t(result, "result:");
            expect(result).to.be.equal("no-url");
        }
        {
            const result = hideUsernamePasswordFromUrl("");
            dc.t(result, "result:");
            expect(result).to.be.equal("");
        }
        {
            const result = hideUsernamePasswordFromUrl({});
            dc.t(result, "result:");
            expect(result).to.be.deep.equal({});
        }
        {
            const result = hideUsernamePasswordFromUrl([]);
            dc.t(result, "result:");
            expect(result).to.be.deep.equal([]);
        }
        {
            const result = hideUsernamePasswordFromUrl(123);
            dc.t(result, "result:");
            expect(result).to.be.equal(123);
        }
        {
            const result = hideUsernamePasswordFromUrl();
            dc.t(result, "result:");
            expect(result).to.be.undefined;
        }
    });

});
