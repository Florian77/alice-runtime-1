// const ftDev = require("ftws-node-dev-tools");
// const {jsonString} = ftDev;
const {getCollectionCommandIndex, getCollectionCommandPayload} = require("./database");
const {commandEnvironment} = require("./command-environment");
const R = require("ramda");
const {resolve} = require('path');
const fs = require('fs');
const dc = require("node-dev-console");
const {storeError} = require("./database");
const {
    emitCommand,
    emitMultiCommand
} = require("./emit-command");

// const _logger = require('debug')('alice:processCommands');
// const log = _logger.extend('log');
// const debug = _logger.extend('debug');

const hasValue = R.complement(R.isNil);
const findCommandToProcess = async ({
                                        minPriority = null,
                                        maxPriority = null,
                                        context = null,
                                        excludeContext = false,
                                    } = {}) => {
    let filter = {
        handled: false,
        running: false,
        paused: false, // { $ne: true },
    };
    if (!R.isNil(minPriority) && R.is(Number, minPriority)) {
        filter = R.assocPath(["priority", "$gte"], minPriority, filter)
    }
    if (!R.isNil(maxPriority) && R.is(Number, maxPriority)) {
        filter = R.assocPath(["priority", "$lte"], maxPriority, filter)
    }
    if (!R.isNil(context)) {
        let operator = "$eq"
        if (excludeContext === true) {
            operator = R.is(Array, context) ? "$nin" : "$ne"
        } else if (R.is(Array, context)) {
            operator = "$in"
        }
        filter = R.assoc(
            "context",
            {
                [operator]: context
            },
            filter
        )
    }
    if (false) console.log("findCommandToProcess().filter", filter)
    const update = {
        $set: {
            running: true,
            runningSince: new Date(),
        }
    };
    const options = {
        sort: {
            priority: -1,
            createdAt: 1
        }
    };
    // dc.l("findCommandToProcess().findOneAndUpdate(filter:%s, update:%s, options:%s)", jsonString(filter), jsonString(update), jsonString(options));
    const result = await getCollectionCommandIndex().findOneAndUpdate(filter, update, options);
    // dc.j(result, "findCommandToProcess().findOneAndUpdate().result");
    if (false) console.log("findCommandToProcess:", R.pathOr(null, ["value", "_id"], result), "priority", R.pathOr(null, ["value", "priority"], result))

    // TODO  throw Error ... for retry logic
    return result;
};
const commandFound = R.pipe(R.propOr(null, "value"), R.complement(R.isNil));
const getCommandFromResult = R.prop("value");
const getCommandId = R.propOr("ERROR-MISSING-DATA", "_id");
const getCommandContext = R.propOr(null, "context");
const getCommandAggregate = R.propOr(null, "aggregate");
const getCommandCommand = R.propOr(null, "command");
const getCommandFullPath = (functionPath, command) => resolve(
    functionPath,
    getCommandContext(command),
    getCommandAggregate(command),
    "cmd",
    getCommandCommand(command),
    "handler.js"
);
const getCommandExecutiveFunction = (fullPath, command) => {
    if (!fs.existsSync(fullPath)) {
        return false;
    }
    return require(fullPath);
};
const mergeDefaultExeResult = R.mergeRight({
    ok: false,
    warning: false,
    errorType: null,
    errorMsg: [],
    resultMsg: [],
    subscription: [],
});
const setCommandHandled = async (command, state) => {
    // const debug.enabled = false;
    const query = {
        _id: getCommandId(command)
    };
    // TODO -> validate state + remove data that should not be set
    const update = {
        $set: {
            ...(mergeDefaultExeResult(state)),
            handled: true,
            handledAt: new Date(),
            running: false,
        }
    };
    // debug("setCommandHandled().query", jsonString(query));
    // debug("setCommandHandled().update", jsonString(update));
    const result = await getCollectionCommandIndex().updateOne(query, update);
    // debug("setCommandHandled().result", ftDev.mongoUpdateOne(result));

    // TODO return true / false or throw Error ... for retry logic
};
// const invokeCallbackCommand = async (command) => {
//     const query = {
//         callback: getCommandId(command),
//     };
//     const update = {
//         $set: {
//             handled: false,
//         }
//     };
//     return  await getCollectionCommandIndex().updateMany(query, update);
// };
const addErrorMsg = (addMessage, result) => {
    let msg = R.propOr([], "errorMsg", result);
    if (!R.is(Array, msg)) {
        msg = [msg];
    }
    msg = R.append(addMessage, msg);
    result.errorMsg = [...msg];
    return result;
};

const now = () => Date.now() / 1000 | 0;
const nowMs = () => Date.now() | 0;
const nowDif = start => now() - start;
const nowMsDif = start => nowMs() - start;

const processNextCommand = async ({
                                      functionPath = null,
                                      minPriority = null,
                                      maxPriority = null,
                                      context = null,
                                      excludeContext = false,
                                  } = {}) => {
    if (!hasValue(functionPath)) {
        throw Error("functionPath missing");
    }

    // debug("[functionPath=%s]", functionPath);

    const result = await findCommandToProcess({minPriority, maxPriority, context, excludeContext});

    if (!commandFound(result)) {
        // dc.l("no command found -> exit");
        // throw Error("ENDE");
        return false;
    }

    const startTime = nowMs();

    let command = getCommandFromResult(result);
    // log("command found [id=%s]", getCommandId(command));
    // debug("command data", jsonString(command));

    // TODO -> add try catch
    const fullPath = getCommandFullPath(functionPath, command);
    // debug("commandExecutive [fullPath=%s]", fullPath);

    let commandExecutive;
    try {
        commandExecutive = getCommandExecutiveFunction(fullPath, command);
    } catch (e) {
        console.error(e);
        await storeError(__filename, 174, "processNextCommand", e)
        await setCommandHandled(command, {
            ok: false,
            executionTime: nowMsDif(startTime),
            errorType: "EXE",
            errorMsg: [
                "commandExecutive load faild",
                e.message,
                fullPath,
            ]
        });
        return false;
    }

    if (!commandExecutive) {
        // log("error: commandExecutive not exists [id=%s] [fullPath=%s]", getCommandId(command), fullPath);

        await setCommandHandled(command, {
            ok: false,
            executionTime: nowMsDif(startTime),
            errorType: "EXE",
            errorMsg: [
                "commandExecutive not exists",
                fullPath,
            ]
        });
        // log("command handled saved [id=%s]", getCommandId(command));
        return false;
    }

    // Execute Command
    let exeResult = {};
    try {
        // load payload if needed
        if (R.propEq("hasPayload", true, command)) {
            const payload = await getCollectionCommandPayload().findOne({_id: R.propOr(null, "_id", command)})
            // console.log("payload", payload)
            command = R.assoc("payload", R.propOr({}, "payload", payload), command)
        }
        // console.log("command", command)

        exeResult = await commandExecutive(command, commandEnvironment(command));
        // log("command executed [id=%s]", getCommandId(command));
        // debug("command result", jsonString(exeResult));
    } catch (e) {
        // log("error: command execution error [id=%s] [e.message=%s]", getCommandId(command), e.message);
        // debug("execution error", e);
        console.error(e);
        await storeError(__filename, 221, "processNextCommand", e)

        await setCommandHandled(command, {
            ok: false,
            executionTime: nowMsDif(startTime),
            errorType: "EXE",
            errorMsg: [
                "commandExecutive execution faild",
                e.message,
                fullPath,
            ]
        });
        return false;
    }

    // todo -> Add retry logic

    if (!hasValue(exeResult.ok)) {
        exeResult.ok = true;
        exeResult.warning = true;
        exeResult = addErrorMsg("ALICE_RUNTIME:WARNING:result.ok not set", exeResult);
    }
    if (!exeResult.ok) {
        exeResult.errorType = "CMD";
    }


    if (R.propEq("hasCallback", true, command)) {
        // dc.j(command, "command hasCallback===true");
        // await invokeCallbackCommand(command);
        for (let callbackCommand of command.callbackList) {
            callbackCommand.callbackFrom = getCommandId(command);
            // todo -> add condition (on success / on error)
            let callbackResult;
            if (R.propEq("multiInvoke", true, callbackCommand)) {
                callbackResult = await emitMultiCommand(callbackCommand);

            } else {
                callbackResult = await emitCommand(callbackCommand);
            }
            // dc.j(callbackResult, "callbackResult");

            // todo -> store callback command list in command stream
        }
    }

    exeResult.hasCallback = false;
    exeResult.callbackList = [];
    exeResult.executionTime = nowMsDif(startTime);
    await setCommandHandled(command, exeResult);
    // dc.l("set command handled [id=%s]", getCommandId(command));

    // todo -> Store log / event of command execution -> CommandStream

    return true;
};

const makeProcessResult = ({moreToProcess = false, processedCounter = 0, withError = false, runTime = 0} = {}) => ({
    moreToProcess,
    processedCounter,
    withError,
    runTime
});


const processCommands = async ({
                                   functionPath = null,
                                   maxProcessCommands = false,
                                   maxRuntime = false,
                                   minPriority = null,
                                   maxPriority = null,
                                   context = null,
                                   excludeContext = false,
                               } = {}) => {

    if (!hasValue(functionPath)) {
        throw Error("functionPath missing");
    }

    maxProcessCommands = R.is(Number, maxProcessCommands) && maxProcessCommands > 0 ? maxProcessCommands : 10000;
    const maxProcessCommandsCount = maxProcessCommands;

    // console.log("start processCommands() [maxProcessCommands=%s] [maxRuntime=%s]", maxProcessCommands, maxRuntime);

    const startTime = now();
    let processedCounter = 0;
    try {
        // get changed after first cycle
        let returnState = false;
        do {
            const result = await processNextCommand({functionPath, minPriority, maxPriority, context, excludeContext});

            // no process for execution found
            if (result === false) {
                return makeProcessResult({returnState, processedCounter});
            }

            processedCounter += 1;

            if (!returnState) {
                returnState = true;
            }
            // console.log("runtime:", nowDif(startTime), "/", maxRuntime)
        } while (
            (maxProcessCommands -= 1) > 0
            && (maxRuntime === false || maxRuntime > nowDif(startTime))
            );

        // log("processedCounter [%s] max [%s] reached [%s]", processedCounter, maxProcessCommandsCount, (maxProcessCommands <= 0));
        // log("runTime [%s] max [%s] reached [%s]", nowDif(startTime), maxRuntime, (maxRuntime <= nowDif(startTime)));

    } catch (e) {
        // TODO debug over error log !?!
        // log('error [message=%s]', e.message);
        console.error(e);
        await storeError(__filename, 335, "processCommands", e)
        return makeProcessResult({moreToProcess: false, processedCounter, withError: true, runTime: nowDif(startTime)});
    }

    return makeProcessResult({moreToProcess: true, processedCounter, runTime: nowDif(startTime)});
};


module.exports = {
    processNextCommand,
    processCommands,
};