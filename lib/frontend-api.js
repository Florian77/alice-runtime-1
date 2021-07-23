const dc = require("node-dev-console");
const R = require("ramda");
const {resolve} = require("path");
const fs = require("fs");
const {
    entityApi,
} = require("./entity");


const getHttpMethod = R.propOr(null, "httpMethod");
const getApi = R.pathOr(null, ['pathParameters', "api"]);
const getContext = R.pathOr(null, ['pathParameters', "context"]);
const getAggregate = R.pathOr(null, ['pathParameters', "aggregate"]);
const getCommand = R.pathOr(null, ['pathParameters', "command"]);
const getQueryStringParameter = R.propOr({}, 'queryStringParameters');
const getBody = R.pipe(R.propOr("{}", "body"), JSON.parse);

const response = (statusCode, body) => ({statusCode, body});


async function frontendApi(alice, appBasePath, apiBasePath, event, {
    logApiCall = false
}) {
    // const requestContext = getContext(event);
    // const requestAggregate = getAggregate(event);
    // const requestCommand = getCommand(event);

    const payload = {
        query: getQueryStringParameter(event),
        body: getBody(event),
    };
    // dc.j(payload, "payload");

    const apiCall = {
        httpMethod: getHttpMethod(event),
        context: getContext(event),
        aggregate: getAggregate(event),
        command: getCommand(event),
    };
    // dc.j(apiCall, "apiCall");

    if (logApiCall) {
        console.log("apiCall [%s/%s:%s:%s]", apiCall.context, apiCall.aggregate, apiCall.httpMethod, apiCall.command);
    }

    // -----------------------------------------------------------------------------------------------------------------------------
    if (getApi(event) === "sys") {
        if (apiCall.context === "APP" && apiCall.command === "info") {
            const version = R.propOr("", "ALICE_RUNTIME_APP_VERSION", process.env);
            const stage = R.propOr("", "ALICE_RUNTIME_STAGE", process.env);
            return response(200, {ok: true, ack: "success", version, stage});
        }
    }

    // -----------------------------------------------------------------------------------------------------------------------------
    if (getApi(event) === "app") {
        let fn = null;

        let cmdPath = R.join("/", [
            "app",
            getContext(event),
            getAggregate(event)
        ]);
        // dc.t(cmdPath, "cmdPath");

        // load fn from aggregate/index.js
        {
            const fullPath = resolve(apiBasePath, cmdPath, "index.js");
            // dc.t(fullPath, "fullPath");
            if (fs.existsSync(fullPath)) {
                const aggregateModule = require(fullPath);
                fn = R.pathOr(null, [getHttpMethod(event), getCommand(event)], aggregateModule);
                // if (!R.isNil(fn)) {
                //     dc.l("fn loaded from aggregate/index.js");
                // }
            }
        }

        // load fn from command/index.js
        cmdPath = R.join("/", [
            cmdPath,
            getHttpMethod(event),
            getCommand(event),
        ]);
        // dc.t(cmdPath, "cmdPath");
        if (R.isNil(fn)) {
            const fullPath = resolve(apiBasePath, cmdPath, "index.js");
            // dc.t(fullPath, "fullPath");
            if (fs.existsSync(fullPath)) {
                fn = require(fullPath);
            }
        }

        // no command found
        if (R.isNil(fn)) {
            console.error("API.app: cmdPath", cmdPath, "not exists");
            return response(400, {ok: false, ack: "error", message: `command ${cmdPath} not exists`});
        }

        return await fn(payload);
    }

    // -----------------------------------------------------------------------------------------------------------------------------
    if (getApi(event) === "entity") {
        const entityBasePath = resolve(apiBasePath, "entity");
        // dc.t(entityBasePath, "entityBasePath");
        const result = await entityApi(alice, appBasePath, entityBasePath, apiCall, payload);
        if (result === false) {
            return response(400, {
                ok: false,
                ack: "error",
                message: `Undefined entity API error`
            });
        }
        // const {statusCode, body} = result;
        return result;
    }

    // -----------------------------------------------------------------------------------------------------------------------------
    return response(400, {
        ok: false,
        ack: "error",
        message: `api resource [${getHttpMethod(event)}:/${getApi(event)}/${getContext(event)}/${getAggregate(event)}/${getCommand(event)}] not found`
    });
}


module.exports = {
    frontendApi,
};
