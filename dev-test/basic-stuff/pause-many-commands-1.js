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
    aggregate = "aggt",
    command = "doIt";

describe('pause-many-commands-1', function () {

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
            const result = await alice.setManyCommandsPaused({
                context,
                aggregate,
                command,
            });
            console.log("pauseManyCommands():", dc.stringify(result));
        }
        {
            const result = await alice.emitMultiCommand({
                context,
                aggregate,
                invokeId: "id=1",
                command: "doIt",
                payload: {
                    data: 100
                },
                priority: 0,
                // paused: true,
            });
            console.log("emitMultiCommand():", dc.stringify(result));
        }
    });

    it('task-2', async function () {
        {
            const result = await alice.emitMultiCommand({
                context,
                aggregate,
                invokeId: "id=1",
                command: "doIt",
                payload: {
                    data: 100
                },
                priority: 0,
                // paused: true,
            });
            console.log("emitMultiCommand():", dc.stringify(result));
        }
        {
            const result = await alice.setManyCommandsPaused({
                context,
                aggregate,
                command,
            });
            console.log("pauseManyCommands():", dc.stringify(result));
        }
    });


});

