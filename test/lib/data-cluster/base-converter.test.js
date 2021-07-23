const {expect} = require('chai');
const baseConverterTest = require('../../../lib/data-cluster/base-converter');

// dc.activate();

describe('lib/data-cluster/base-converter', function () {


    it('dec2hex', async function () {
        let r;

        r = baseConverterTest.dec2hex(15);
        expect(r).to.equal('f');

        r = baseConverterTest.dec2hex(255);
        expect(r).to.equal('ff');

    });


    it('hex2dec', async function () {
        let r;

        r = baseConverterTest.hex2dec('f');
        expect(r).to.equal('15');

        r = baseConverterTest.hex2dec('ff');
        expect(r).to.equal('255');

        r = baseConverterTest.hex2dec('00');
        expect(r).to.equal('0');

        r = baseConverterTest.hex2dec('01');
        expect(r).to.equal('1');

        r = baseConverterTest.hex2dec('a');
        expect(r).to.equal('10');

        r = baseConverterTest.hex2dec('10');
        expect(r).to.equal('16');

    });

});

