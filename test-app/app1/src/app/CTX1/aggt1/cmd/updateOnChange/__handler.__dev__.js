const dc = require("node-dev-console");
const aliceTestEnv = require("../../../../../../../../test-environment");
const testHandler = require('./handler');

dc.activate();


(async () => {
    aliceTestEnv.loadRuntimeConfig(__dirname, "test-case");
    await aliceTestEnv.connect();

    const env = aliceTestEnv.commandTestEnvironment();

    const result = await testHandler({
        invokeId: "id=test1",
        payload: {
            data: "data"
        }
    }, env);

    dc.j(result, "Test result");
    // env.log.displayAll();


    await aliceTestEnv.disconnect();
})();

