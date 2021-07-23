const alice = require('../../index');
const {clearDatabase} = require('alice-runtime-test-helper');
const {resolve} = require("path");
// const sleep = require('await-sleep');

process.env.DEV_CONSOLE_ON = 1;
const dc = require("node-dev-console");

alice.loadRuntimeConfig(__dirname, "local");

let doClearDatabase = false;
doClearDatabase = true;

const functionPath = resolve(__dirname, "app"),
    context = "CONT",
    aggregate = "aggt";

describe('emit-commands-2', function () {

    this.timeout(false);

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


    it('task-1', async function () {

        {
            const result = await alice.emitCommand({
                context,
                aggregate,
                invokeId: "id=1",
                command: "doIt",
                payload: {
                    data: 100
                },
                priority: 0,
                paused: true,
            });
            console.log("result", dc.stringify(result));
        }
        // await sleep(1000);
        {
            const result = await alice.emitCommand({
                context,
                aggregate,
                invokeId: "id=2",
                command: "doIt2",
                payload: {
                    data: 200
                },
                priority: 0
            });
            console.log("result", dc.stringify(result));
        }
       /* {
            const result = await alice.processCommands({
                functionPath,
                maxProcessCommands: 2
            });
            // console.log("processCommands", dc.stringify(result));
        }*/

    });


});

