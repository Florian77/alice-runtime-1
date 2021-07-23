const dc = require("node-dev-console")
const R = require("ramda")
const {resolve} = require("path")
const {existsSync} = require("fs")


function defaultValueShowDbConnectionMsg() {
    if (R.isNil(process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG)) {
        return "true"
    }
    return process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG
}


function loadRuntimeConfig(currentDir, stage = "local") {
    try {
        let max = 20
        while (
            !existsSync(resolve(currentDir, `alice-runtime-config.${stage}.json`))
            && (max -= 1) > 0
            ) {
            currentDir = resolve(currentDir, "../")
            // dc.j(currentDir, "currentDir")
        }

        const config = require(resolve(currentDir, `alice-runtime-config.${stage}.json`))
        // dc.j(config, "config")

        process.env.ALICE_RUNTIME_STAGE = R.pathOr(stage, ["ALICE_RUNTIME", "STAGE"], config)
        process.env.ALICE_RUNTIME_MONGODB_URL = R.pathOr("", ["ALICE_RUNTIME", "MONGODB", "URL"], config)
        process.env.ALICE_RUNTIME_MONGODB_DB = R.pathOr("", ["ALICE_RUNTIME", "MONGODB", "DB"], config)
        process.env.ALICE_RUNTIME_SHOW_DB_CONNECTION_MSG = R.pathOr(defaultValueShowDbConnectionMsg(), ["ALICE_RUNTIME", "SHOW_DB_CONNECTION_MSG"], config)

        process.env.ALICE_RUNTIME_DASHBOARD_API_KEY = R.pathOr("", ["ALICE_RUNTIME", "DASHBOARD_API_KEY"], config)
        process.env.ALICE_RUNTIME_APP_API_KEY = R.pathOr("", ["ALICE_RUNTIME", "APP_API_KEY"], config)

        process.env.ALICE_RUNTIME_ENCRYPTION_KEY = R.pathOr("", ["ALICE_RUNTIME", "ENCRYPTION_KEY"], config)

    } catch (e) {
        if (R.startsWith("Cannot find module", e.message)) {
            throw Error(`alice runtime config not found [stage=${stage}]`)
        }
        throw e
    }
}


module.exports = {
    loadRuntimeConfig,
}
