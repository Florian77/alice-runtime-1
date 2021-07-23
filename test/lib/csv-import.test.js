const expect = require('chai').expect;
const dc = require("node-dev-console");
const aliceTestEnv = require("../../test-environment");
const {csvImport} = require("../../index");


dc.activate();


describe('lib/csv-import.js', function () {

    this.timeout(10 * 1000);

    // -----------------------------------------------------------------------------------------------------------------------------
    before(async () => {
        aliceTestEnv.loadRuntimeConfig(__dirname, "unit-test");
        await aliceTestEnv.connect();
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    after(async () => {
        await aliceTestEnv.disconnect();
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(async function () {
        dc.l("---------------", this.currentTest.title, "---------------");
        await aliceTestEnv.clearDatabase({createIndexAfterClear: true});
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('csv-import-basic-request.get', async function () {
        const result = await csvImport({
            active: true,

            context: "akeneo",
            aggregate: "import-product",
            command: "updateOnChange",

            // invokeId: "prefix_", // false
            invokeIdFunction: item => `id=${item.id}`, // false

            source: {
                type: "request.get",
                url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSxRogI6zccKMN9xIzuJwcn1dH_-N58S1kHX7nH1QiHfKM9kHdSwwRVQblRBkXJ5IochVkvVyyd8Du2/pub?gid=0&single=true&output=csv",
            },

            csvOptions: {
                delimiter: ',',
                quote: '"',
                trim: true,
            },


        });
        // dc.l("csvImport() DONE");
        // logResult("csvImport().result", dc.stringify(result));
        expect(result).to.be.deep.equal([
            {
                "active": true,
                "context": "akeneo",
                "aggregate": "import-product",
                "command": "updateOnChange",
                "importMaxRows": false,
                "total": 2
            }
        ]);
    });

    it('csv-import-basic-ftp', async function () {
        const result = await csvImport({
            active: true,

            context: "akeneo",
            aggregate: "import-product",
            command: "updateOnChange",

            // invokeId: "prefix_", // false
            invokeIdFunction: item => `id=${item.id}`, // false

            source: {
                type: "ftp",
                connection: {
                    host: "bt-server.de",
                    port: 21,
                    user: "301612-demodaten",
                    password: "wraqsa46r8D_",
                },
                filePath: "/HTTPCSVImportDemodaten.csv",
            },

            csvOptions: {
                delimiter: ',',
                quote: '"',
                trim: true,
            },


        });
        // dc.l("csvImport() DONE");
        // logResult("csvImport().result", dc.stringify(result));
        expect(result).to.be.deep.equal([
            {
                "active": true,
                "context": "akeneo",
                "aggregate": "import-product",
                "command": "updateOnChange",
                "importMaxRows": false,
                "total": 2
            }
        ]);
    });


});
