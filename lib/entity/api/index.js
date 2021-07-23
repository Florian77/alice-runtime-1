const dc = require("node-dev-console");
const R = require("ramda");
const commandLib = require("./command");


async function entityApi(alice, appBasePath, entityBasePath, apiCall, payload) {
    // dc.j(appBasePath, "entityApi().appBasePath");
    // dc.j(entityBasePath, "entityApi().entityBasePath");
    // dc.j(apiCall, "entityApi().apiCall");
    // dc.j(payload, "entityApi().payload");

    const {/*httpMethod,*/ context, aggregate, command} = apiCall;


    // load entity config
    const entityBaseConfig = require(entityBasePath);
    // dc.j(entityBaseConfig, "entityBaseConfig");

    const entityConfig = R.pathOr(null, [context, aggregate, "entityConfig"], entityBaseConfig);
    if (R.isNil(entityConfig)) {
        // todo -> add error code + msg
        return false;
    }
    // dc.j(entityConfig, "entityConfig");

    if (!R.has(command, commandLib)) {
        // todo -> add error code + msg
        return false;
    }

    const result = await commandLib[command](alice, entityConfig, payload, appBasePath);
    // dc.j(result, "result");

    return result;

}


module.exports = {
    entityApi,
};
