#!/usr/bin/env node

const R = require('ramda');
const alice = require("../index");
const aliceTestEnv = require("../test-environment");
const {resolve} = require("path");

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const dc = require("node-dev-console");
// dc.activate();

/** @type object */
const cliArgs = require('command-line-args')([
    {name: 'command', defaultOption: true},
    {name: 'stage', alias: 's', type: String},
    {name: 'path', alias: 'p', type: String},
    {name: 'max-events', type: Number},
    {name: 'max-commands', type: Number},
    {name: 'max-trigger', type: Number},
    {name: 'max-trigger-events', type: Number},
    {name: 'max-cycles', type: Number},
    {name: 'max-runtime', type: Number},
    {name: 'port', type: Number},
    {name: 'path-prefix', type: String},
    {name: 'loop', type: Boolean},
    {name: 'interval', type: Number},
    {name: 'private-api', type: Boolean},
]);
dc.j(cliArgs);

/** @type string */
const command = R.propOr("", "command", cliArgs);
dc.l("[command=%s]", command);

/** @type string */
const stage = R.propOr("local", "stage", cliArgs);
dc.l("[stage=%s]", stage);

/** @type string */
const path = R.propOr("", "path", cliArgs);
dc.l("[path=%s]", path);

/** @type boolean|number */
const maxDispatchEvents = R.propOr(false, "max-events", cliArgs);
dc.l("[maxDispatchEvents=%s]", maxDispatchEvents);

/** @type boolean|number */
const maxProcessCommands = R.propOr(false, "max-commands", cliArgs);
dc.l("[maxProcessCommands=%s]", maxProcessCommands);

/** @type boolean|number */
const maxProcessTrigger = R.propOr(false, "max-trigger", cliArgs);
dc.l("[maxProcessTrigger=%s]", maxProcessTrigger);

/** @type boolean|number */
const maxProcessEvents = R.propOr(false, "max-trigger-events", cliArgs);
dc.l("[maxProcessEvents=%s]", maxProcessEvents);

/** @type boolean|number */
const maxProcessCycles = R.propOr(false, "max-cycles", cliArgs);
dc.l("[maxProcessCycles=%s]", maxProcessCycles);

/** @type boolean|number */
const maxRuntime = R.propOr(false, "max-runtime", cliArgs);
dc.l("[maxRuntime=%s]", maxRuntime);

/** @type number */
const port = R.propOr(3000, "port", cliArgs);
dc.l("[port=%s]", port);

/** @type string */
const pathPrefix = R.propOr("/", "path-prefix", cliArgs);
dc.l("[pathPrefix=%s]", pathPrefix);

/** @type boolean */
const loop = R.propOr("", "loop", cliArgs);
dc.l("[loop=%s]", loop);

/** @type number */
const interval = R.propOr(5, "interval", cliArgs);
dc.l("[interval=%s]", interval);

/** @type boolean */
const privateApi = R.propOr("", "private-api", cliArgs);
dc.l("[privateApi=%s]", privateApi);


const cwd = process.cwd();
dc.l("[cwd=%s]", cwd);

(async () => {
    try {

        // ---------------------------------------------------------------------------------
        alice.loadRuntimeConfig(cwd, stage);
        await alice.connect();

        // ---------------------------------------------------------------------------------
        const functionPath = resolve(
            cwd,
            path
        );
        dc.l("[functionPath=%s]", functionPath);

        // ---------------------------------------------------------------------------------
        if (command === "index-db") {
            const result = await alice.checkIndexes();
            console.log("checkIndexes().result", dc.stringify(result));
        }

        // ---------------------------------------------------------------------------------
        else if (command === "clear-db") {
            await aliceTestEnv.clearDatabase({createIndexAfterClear: true});
            console.log("DB cleared");
        }

        // ---------------------------------------------------------------------------------
        else if (command === "process") {
            let runAgain = false;
            do {

                const result = await alice.process({
                    functionPath,
                    maxProcessCycles,
                    maxDispatchEvents,
                    maxProcessTrigger,
                    maxProcessEvents,
                    maxProcessCommands,
                    maxRuntime,
                });
                dc.l(".process().result:", dc.stringify(result));

                if(loop) {
                    console.log(`process again after ${interval} second(s)`);
                    runAgain = true;
                    await sleep(interval * 1000);
                }

            } while (runAgain);
        }

        // ---------------------------------------------------------------------------------
        else if (command === "process-commands") {
            const result = await alice.processCommands({
                functionPath,
                maxProcessCommands,
                maxRuntime,
            });
            dc.l(".processCommands().result:", dc.stringify(result));
        }

        // ---------------------------------------------------------------------------------
        else if (command === "process-trigger") {
            const result = await alice.processTrigger({
                functionPath,
                maxProcessTrigger,
                maxProcessEvents,
                maxRuntime,
            });
            dc.l(".processTrigger().result:", dc.stringify(result));
        }

        // ---------------------------------------------------------------------------------
        else if (command === "dispatch-events") {
            const result = await alice.dispatchEvents({
                maxDispatchEvents,
                maxRuntime,
            });
            dc.l(".dispatchEvents().result:", dc.stringify(result));
        }

        // ---------------------------------------------------------------------------------
        else if (command === "dashboard-api") {
            const server = require("../lib/dashboard-api-server");
            server(
                port,
                {
                    pathPrefix,
                    privateApi,
                }
            );
        }

        // ---------------------------------------------------------------------------------
        else {
            console.log("Error command [%s] not supported", command)
        }


    } catch (e) {
        console.error(e);
    }

    // ---------------------------------------------------------------------------------
    if (command !== "dashboard-api") {
        await alice.disconnect();
    }


})();
