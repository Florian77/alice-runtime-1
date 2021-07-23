const dc = require("node-dev-console");
const R = require("ramda");
const url = require("url");
const http = require("http");
const {dashboardApi} = require("./dashboard-api");


// dc.activate();


let urlPathnamePrefix = "/";
let privateApi = false;

const app = http.createServer(async (request, response) => {
    // dc.j(request.headers, "request.headers");
    // dc.j(request.url);
    // dc.j(request.method);
    if (request.method === "OPTIONS") {
        response.writeHead(
            200,
            {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Methods': '*',
                'Access-Control-Allow-Credentials': true,
                "Content-Type": "application/json"
            }
        );
        response.write("OK");
        response.end();
        return;
    }

    if (privateApi) {
        const apiKey = R.pathOr("", ["headers", "x-api-key"], request);
        // dc.t(apiKey, "x-api-key");

        if (R.isEmpty(apiKey) || !R.pathEq(["env", "ALICE_RUNTIME_DASHBOARD_API_KEY"], apiKey, process)) {
            // dc.l("API check faild");
            response.writeHead(
                403,
                {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Methods': '*',
                    'Access-Control-Allow-Credentials': true,
                    "Content-Type": "application/json"
                }
            );
            response.write(JSON.stringify(
                {
                    ok: false,
                    ack: 'error',
                    message: 'header:x-api-key check faild',
                }
            ));
            response.end();
            return;
        }
    }
    const parsedUrl = url.parse(request.url, true);
    // dc.j(parsedUrl);
    const {query, pathname} = parsedUrl;
    const action = String(pathname).substr(R.length(urlPathnamePrefix));
    // dc.l("[action=%s] [query=%s]", action, dc.stringify(query));

    const [responseCode, responseBody] = await dashboardApi(action, query);

    response.writeHead(
        responseCode,
        {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            "Content-Type": "application/json"
        }
    );
    response.write(JSON.stringify(
        R.mergeLeft(
            responseBody,
            {
                ok: true,
                ack: 'success',
                message: '',
            }
        )
    ));
    response.end();
});


function setPrivateApi(value) {
    privateApi = value;
}


function startServer(port = 3000, {pathPrefix = "/", privateApi = false}) {
    urlPathnamePrefix = pathPrefix;
    setPrivateApi(privateApi);

    app.listen(port, () => {
        console.log(`listen on http://localhost:${port}/`, privateApi ? "HEADER:x-api-key required" : "");
    });
}


module.exports = startServer;
