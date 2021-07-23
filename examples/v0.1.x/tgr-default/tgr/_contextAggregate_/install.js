// -------------------------------------------------------------------------
// ALICE-RUNTIME:TEMPLATE:tgr-default:VERSION:0.0.2
// -------------------------------------------------------------------------

const alice = require("alice-runtime");
const _MODULE = require("./module");
const dc = require("node-dev-console");
dc.activate();

alice.loadRuntimeConfig(__dirname, "local");
// alice.loadRuntimeConfig(__dirname, "dev");
// alice.loadRuntimeConfig(__dirname, "prod");



(async () => {
    console.log("start install trigger [%s]", _MODULE.namespace);
    try {
        await alice.connect(); // Connect to Database

        const trigger = {
            ..._MODULE
        };
        dc.l("createDataTrigger(%s)", dc.stringify(trigger));
        const result = await alice.createDataTrigger(trigger);
        console.log("createDataTrigger() DONE");
        dc.l("createDataTrigger().result", dc.stringify(result));

    } catch (e) {
        console.error(e);
    }
    await alice.disconnect();
    console.log("install trigger completed");
})();
