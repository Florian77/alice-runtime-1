const alice = require('../../index');
const {clearDatabase} = require('alice-runtime-test-helper');

process.env.DEV_CONSOLE_ON = 1;
const dc = require("node-dev-console");

alice.loadRuntimeConfig(__dirname, "local");

let doClearDatabase = false;
doClearDatabase = true;

describe('store-event-test-1', function () {

    this.timeout(10 * 1000);

    before(async () => {
        if (doClearDatabase) {
            if (!await clearDatabase(alice)) {
                throw Error('clearDatabase() faild ');
            }
            console.log('clearDatabase(): OK');
        } else {
            await alice.connect();
            console.log('clearDatabase(): OFF');
        }
    });

    after(async () => {
        await alice.disconnect();
    });


    it('process', async function () {


        const context = "AKENEO",
            aggregate = "product",
            aggregateId = "sku=203040";


        // Store Event
        let payload = {
            myData: "Hallo Welt!"
        };

        const result = await alice.storeDataEvent({
            context,
            aggregate,
            aggregateId,
            payload,
        });
        console.log("storeEvent().result", dc.stringify(result));

        const events = await alice.getDataEventStream({
            context,
            aggregate,
            aggregateId,
        });
        console.log("getDataEventStream().result", dc.stringify(events));


    });


});

