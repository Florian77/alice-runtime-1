const dc = require("node-dev-console");
const R = require('ramda');
const {
    getTriggerCheckForUpdatesCount,
    getTriggerIndexOverview,
    getUnhandledCommandCount,
    getCommandIndexOverview,
    getDataIndexOverview,
    getUndispatchedDataEventCount,
} = require("./dashboard-stats");
const {
    getDataIndex,
    getCommandIndex,
    getTriggerIndex,
    getDataContextAggregateList,
    getCommandContextAggregateList,
    getTriggerContextAggregateList,
} = require("./dashboard-list");
const {getItemDataIndex} = require("./get-data-events");
const {getLastDataEvent} = require("./get-data-events");
const {getDataEventStream} = require("./get-data-events");
const {getItemTriggerIndex} = require("./get-trigger-events");
const {getItemCommandIndex} = require("./get-command-events");
const {setManyCommandsNotPaused} = require("./command-control");
const {setManyCommandsPaused} = require("./command-control");
const {setOneCommandNotRunning} = require("./command-control");
const {setOneCommandNotHandled} = require("./command-control");
const {setOneCommandHandled} = require("./command-control");
const {setOneCommandNotPaused} = require("./command-control");
const {setOneCommandPaused} = require("./command-control");
const {storeError} = require("./database");
const {setManyCommandsNotHandled} = require("./command-control");
const {setManyCommandsHandled} = require("./command-control");
const {
    getProcessState,
    setProcessStateOff,
    setProcessStateOn,
} = require("./process");

const {
    setOneTriggerPaused,
    setOneTriggerNotPaused,
    setOneTriggerCheckForUpdates,
    setOneTriggerNotCheckForUpdates,
    setOneTriggerNotRunning,
    setOneTriggerResetLastSequenceNumber,
    setOneTriggerCronExpression,
} = require("./trigger-control");

// dc.activate();


const isActionDashboard = R.equals('dashboard');
const isActionDataIndex = R.equals('data-index');
const isActionCommandIndex = R.equals('command-index');
const isActionCommandList = R.equals('command-list');
const isActionTriggerIndex = R.equals('trigger-index');
const isActionTriggerControlOne = R.equals('trigger-control-one');
const isActionItemDataIndex = R.equals('item-data-index');
const isActionItemLastDataEvent = R.equals('item-last-data-event');
const isActionItemDataEventStream = R.equals('item-data-event-stream');
const isActionItemTriggerIndex = R.equals('item-trigger-index');
const isActionItemCommandIndex = R.equals('item-command-index');
const isActionCommandControlOne = R.equals('command-control-one');
const isActionCommandControlMany = R.equals('command-control-many');
const isActionProcessState = R.equals('process-state');


function parseTrueFalseString(value) {
    return R.equals("true", value) ? true : R.equals("false", value) ? false : value;
}


function getIndexFilter(param) {
    const filterParam = R.propOr(false, "filter", param);
    if (filterParam && !R.isEmpty(filterParam)) {
        const paramList = R.split(',', filterParam);
        // dc.j(paramList, 'paramList')

        const result = paramList.map(filter => {
            let value = R.propOr(false, `filter-${filter}`, param);
            // dc.j(value, filter)
            if (R.isEmpty(value)) {
                return [];
            }
            value = parseTrueFalseString(value);

            const optionNot = R.propEq(`opt-not-${filter}`, "1", param);
            //dc.t(optionNot, "optionNot");

            const optionRegex = R.propEq(`opt-regex-${filter}`, "1", param);
            // dc.t(optionRegex, "optionRegex");

            if (optionRegex && !optionNot) {
                value = {
                    $regex: value
                };
            }
            if (optionNot && !optionRegex) {
                value = {
                    $ne: value
                };
            }
            if (optionNot && optionRegex) {
                value = {
                    $not: {
                        $regex: value
                    }
                };
            }

            return [filter, value];
        })
        // dc.j(result, 'result');
        // dc.j(filterObject, 'filterObject');

        return R.fromPairs(result);
    }
    return {};
}


async function dashboardApi(action, param) {

    // param["opt-not-aggregateId"] = "1";
    // param["opt-regex-aggregateId"] = "1";

    // TODO -> add global log settings
    console.log('[action=%s] [param=%s]', action, dc.stringify(param));

    let responseCode = 200,
        responseBody = {};
    try {

        const page = Number(R.propOr(0, "page", param));
        const rowsPerPage = Number(R.propOr(15, "rowsPerPage", param));
        const context = R.propOr(null, "context", param);
        const aggregate = R.propOr(null, "aggregate", param);
        const aggregateId = R.propOr(null, "aggregateId", param);
        const invokeId = R.propOr(null, "invokeId", param);
        const command = R.propOr(null, "command", param);
        const control = R.propOr(null, "control", param);
        const triggerId = R.propOr(null, "triggerId", param);
        const commandId = R.propOr(null, "commandId", param);

        // ---------------------------------------------------------------------------------
        // Dashboard
        if (isActionDashboard(action)) {
            responseBody = {
                unhandledCommandCount: await getUnhandledCommandCount(),
                undispatchedDataEventCount: await getUndispatchedDataEventCount(),
                triggerCheckForUpdatesCount: await getTriggerCheckForUpdatesCount(),
                dataIndexOverview: await getDataIndexOverview(),
                commandIndexOverview: await getCommandIndexOverview(),
                triggerIndexOverview: await getTriggerIndexOverview(),
            };
        }

            // ---------------------------------------------------------------------------------
        // Data Index
        else if (isActionDataIndex(action)) {
            // dc.l('isActionDataIndex(action):true');
            const query = {
                indexFilter: getIndexFilter(param),
            };
            //dc.j(query, "query");
            responseBody = {
                resultList: await getDataIndex(query, {page, rowsPerPage,}),
                resultCount: await getDataIndex(query, {getCount: true,}),
                contextAggregateList: await getDataContextAggregateList(),
                page,
                rowsPerPage,
            };
        }

            // ---------------------------------------------------------------------------------
        // Trigger Index
        else if (isActionTriggerIndex(action)) {
            // dc.l('isActionTriggerIndex(action):true');
            const query = {
                indexFilter: getIndexFilter(param),
            };
            responseBody = {
                resultList: await getTriggerIndex(query, {page, rowsPerPage,}),
                resultCount: await getTriggerIndex(query, {getCount: true,}),
                contextAggregateList: await getTriggerContextAggregateList(),
                page,
                rowsPerPage,
            };
        }

            // ---------------------------------------------------------------------------------
        // Trigger Index
        else if (isActionTriggerControlOne(action)) {
            // dcl('isActionTriggerControlOne(action):true', "control", control, "triggerId", triggerId);

            const cronExpression = R.propOr(null, "cronExpression", param);
            if (R.isNil(triggerId) || R.isEmpty(triggerId) || R.isNil(control) || R.isEmpty(control)) {
                responseCode = 400;
                responseBody = {ok: false, ack: "error", message: "param missing"};
            } else {
                let result;
                switch (control) {
                    case "paused":
                        result = await setOneTriggerPaused({triggerId});
                        break;
                    case "notPaused":
                        result = await setOneTriggerNotPaused({triggerId});
                        break;
                    case "checkForUpdates":
                        result = await setOneTriggerCheckForUpdates({triggerId});
                        break;
                    case "notCheckForUpdates":
                        result = await setOneTriggerNotCheckForUpdates({triggerId});
                        break;
                    case "notRunning":
                        result = await setOneTriggerNotRunning({triggerId});
                        break;
                    case "resetLastSequenceNumber":
                        result = await setOneTriggerResetLastSequenceNumber({triggerId});
                        break;
                    case "cronExpression":
                        result = await setOneTriggerCronExpression({triggerId, cronExpression});
                        break;
                    default:
                        result = null;
                }
                if (R.isNil(result)) {
                    responseCode = 400;
                    responseBody = {ok: false, ack: "error", message: "param missing"};
                } else {
                    responseBody = {
                        result: result,
                    };
                }
            }
        }

        // ---------------------------------------------------------------------------------
        else if (isActionCommandIndex(action)) {
            // dc.l('isActionCommandIndex(action):true');
            const query = {
                indexFilter: getIndexFilter(param),
            };
            responseBody = {
                resultList: await getCommandIndex(query, {page, rowsPerPage,}),
                resultCount: await getCommandIndex(query, {getCount: true,}),
                contextAggregateList: await getCommandContextAggregateList(),
                page,
                rowsPerPage,
            };
        }

        // ---------------------------------------------------------------------------------
        else if (isActionCommandList(action)) {
            // dc.l('isActionCommandIndex(action):true');
            const query = {
                // indexFilter: getIndexFilter(param),
            };
            responseBody = {
                commandList: await getCommandIndexOverview({commandList: true}),
                // resultCount: await getCommandOverview(query, {getCount: true,}),
                // contextAggregateList: await getCommandContextAggregateList(),
                // page,
                // rowsPerPage,
            };
        }

            // ---------------------------------------------------------------------------------
        // ITEM: Data Index
        else if (isActionItemDataIndex(action)) {
            // dc.l('isActionItemDataIndex(action):true');
            if (R.isNil(context) || R.isNil(context) || R.isNil(aggregateId)) {
                responseCode = 400;
                responseBody = {ok: false, ack: "error", message: "param missing"};
            } else {
                responseBody = {
                    itemDataIndex: await getItemDataIndex({context, aggregate, aggregateId,}),
                };
            }
        }

            // ---------------------------------------------------------------------------------
        // ITEM: Last Data Event
        else if (isActionItemLastDataEvent(action)) {
            // dc.l('isActionItemLastDataEvent(action):true');
            if (R.isNil(context) || R.isNil(context) || R.isNil(aggregateId)) {
                responseCode = 400;
                responseBody = {ok: false, ack: "error", message: "param missing"};
            } else {
                responseBody = {
                    itemLastDataEvent: await getLastDataEvent({context, aggregate, aggregateId,}),
                };
            }
        }

            // ---------------------------------------------------------------------------------
        // ITEM: Data Event Stream
        else if (isActionItemDataEventStream(action)) {
            // dc.l('isActionItemDataEventStream(action):true');
            if (R.isNil(context) || R.isEmpty(context) || R.isNil(context) || R.isEmpty(context) || R.isNil(aggregateId) || R.isEmpty(aggregateId)) {
                responseCode = 400;
                responseBody = {ok: false, ack: "error", message: "param missing"};
            } else {
                responseBody = {
                    itemDataEventStream: await getDataEventStream({context, aggregate, aggregateId,}),
                };
            }
        }

            // ---------------------------------------------------------------------------------
        // ITEM: Trigger Index
        else if (isActionItemTriggerIndex(action)) {
            // dc.l('isActionItemTriggerIndex(action):true');
            if (R.isNil(triggerId) || R.isEmpty(triggerId)) {
                responseCode = 400;
                responseBody = {ok: false, ack: "error", message: "param missing"};
            } else {
                responseBody = {
                    itemTriggerIndex: await getItemTriggerIndex(triggerId)
                };
            }
        }

            // ---------------------------------------------------------------------------------
        // ITEM: Command Index
        else if (isActionItemCommandIndex(action)) {
            // dc.l('isActionItemCommandIndex(action):true');
            if (R.isNil(commandId) || R.isEmpty(commandId)) {
                responseCode = 400;
                responseBody = {ok: false, ack: "error", message: "param missing"};
            } else {
                responseBody = {
                    itemCommandIndex: await getItemCommandIndex(commandId)
                };
            }
        }

            // ---------------------------------------------------------------------------------
        // Command Control: ONE
        else if (isActionCommandControlOne(action)) {
            // dc.l('isActionCommandControl(action):true');
            if (R.isNil(commandId) || R.isEmpty(commandId) || R.isNil(control) || R.isEmpty(control)) {
                responseCode = 400;
                responseBody = {ok: false, ack: "error", message: "param missing"};
            } else {
                let result;
                switch (control) {
                    case "paused":
                        result = await setOneCommandPaused({commandId});
                        break;
                    case "notPaused":
                        result = await setOneCommandNotPaused({commandId});
                        break;
                    case "handled":
                        result = await setOneCommandHandled({commandId});
                        break;
                    case "notHandled":
                        result = await setOneCommandNotHandled({commandId});
                        break;
                    case "notRunning":
                        result = await setOneCommandNotRunning({commandId});
                        break;
                    default:
                        result = null;
                }
                if (R.isNil(result)) {
                    responseCode = 400;
                    responseBody = {ok: false, ack: "error", message: "param missing"};
                } else {
                    responseBody = {
                        result: result,
                    };
                }
            }
        }

            // ---------------------------------------------------------------------------------
        // Command Control: MANY
        else if (isActionCommandControlMany(action)) {
            // dc.l('isActionCommandControlMany(action):true');
            if (R.isNil(context) || R.isNil(aggregate) || R.isNil(command) || R.isNil(control)) {
                responseCode = 400;
                responseBody = {ok: false, ack: "error", message: "param missing"};
            } else {
                let result;
                switch (control) {
                    case "paused":
                        result = await setManyCommandsPaused({context, aggregate, command});
                        break;
                    case "notPaused":
                        result = await setManyCommandsNotPaused({context, aggregate, command});
                        break;
                    case "handled":
                        result = await setManyCommandsHandled({context, aggregate, command});
                        break;
                    case "notHandled":
                        result = await setManyCommandsNotHandled({context, aggregate, command});
                        break;
                    default:
                        result = null;
                }
                if (R.isNil(result)) {
                    responseCode = 400;
                    responseBody = {ok: false, ack: "error", message: "param missing"};
                } else {
                    responseBody = {
                        result: result,
                    };
                }
            }
        }

            // ---------------------------------------------------------------------------------
        // Command Control: MANY
        else if (isActionProcessState(action)) {
            // dcl('isActionProcessState(action):true');

            // dct(control, "control")
            // update process control
            if (!R.isNil(control)) {
                if (control === "off") {
                    await setProcessStateOff()
                } else {
                    await setProcessStateOn()
                }
            }

            responseBody = {
                processState: await getProcessState(),
            }
        }

            // ---------------------------------------------------------------------------------
        // default: action not exists
        else {
            // dc.l("Error: Function Route not found [action=%s]", action);
            responseCode = 404;
            responseBody = {ok: false, ack: "error", message: `action [${action}] not exist`};
        }

    } catch (e) {
        console.error("dashboard-api:ERROR:", e.message);
        console.error("dashboard-api:ERROR:", e);
        await storeError(__filename, 382, "", e)
        responseCode = 400;
        responseBody = {ok: false, ack: "error", message: e.message};
    }

    console.log("response [code=%s] [body.length=%s]", responseCode, R.length(dc.stringify(responseBody)));
    // dc.l("[statusCode=%s] [body=%s]", responseCode, dc.stringify(responseBody));
    return [responseCode, responseBody];
}


module.exports = {
    dashboardApi,
};
