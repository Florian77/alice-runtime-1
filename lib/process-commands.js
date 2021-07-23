const dc = require("node-dev-console");
const R = require("ramda");
const {resolve} = require('path');
const fs = require('fs');
const {getCollectionCommandIndex, getCollectionCommandPayload} = require("./database");
const {commandEnvironment} = require("./command-environment");
const {storeError} = require("./database");
const {
    emitCommand,
    emitMultiCommand
} = require("./emit-command");


const hasValue = R.complement(R.isNil);
const commandFound = R.pipe(R.propOr(null, "value"), R.complement(R.isNil));
const getCommandFromResult = R.prop("value");
const getCommandId = R.propOr("ERROR-MISSING-DATA", "_id");
const getCommandContext = R.propOr(null, "context");
const getCommandAggregate = R.propOr(null, "aggregate");
const getCommandCommand = R.propOr(null, "command");
const mergeDefaultExeResult = R.mergeRight({
    ok: false,
    warning: false,
    errorType: null,
    errorMsg: [],
    resultMsg: [],
    subscription: [],
});
const now = () => Date.now() / 1000 | 0;
const nowMs = () => Date.now() | 0;
const nowDif = start => now() - start;
const nowMsDif = start => nowMs() - start;


async function findCommandToProcess({
                                        minPriority = null,
                                        maxPriority = null,
                                        context = null,
                                        excludeContext = false,
                                    } = {}) {
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
    // if (false) console.log("findCommandToProcess().filter", filter)
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
    // dc.l("findCommandToProcess().findOneAndUpdate(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options));
    const result = await getCollectionCommandIndex().findOneAndUpdate(filter, update, options);
    // dc.j(result, "findCommandToProcess().findOneAndUpdate().result");
    // if (false) console.log("findCommandToProcess:", R.pathOr(null, ["value", "_id"], result), "priority", R.pathOr(null, ["value", "priority"], result))

    // TODO  throw Error ... for retry logic
    return result;
}


function getCommandFullPath(functionPath, command) {
    return resolve(
        functionPath,
        getCommandContext(command),
        getCommandAggregate(command),
        "cmd",
        getCommandCommand(command),
        "handler.js"
    );
}


function getCommandExecutiveFunction(fullPath, command) {
    if (!fs.existsSync(fullPath)) {
        return false;
    }
    return require(fullPath);
}


async function setCommandHandled(command, state) {
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
    // dc.l("setCommandHandled().query", dc.stringify(query));
    // dc.l("setCommandHandled().update", dc.stringify(update));
    const result = await getCollectionCommandIndex().updateOne(query, update);
    // dc.l("setCommandHandled().result", ftDev.mongoUpdateOne(result));

    // TODO return true / false or throw Error ... for retry logic
}


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


function addErrorMsg(addMessage, result) {
    let msg = R.propOr([], "errorMsg", result);
    if (!R.is(Array, msg)) {
        msg = [msg];
    }
    msg = R.append(addMessage, msg);
    result.errorMsg = [...msg];
    return result;
}


async function processNextCommand({
                                      functionPath = null,
                                      minPriority = null,
                                      maxPriority = null,
                                      context = null,
                                      excludeContext = false,
                                  } = {}) {
    if (!hasValue(functionPath)) {
        throw Error("functionPath missing");
    }

    // dc.l("[functionPath=%s]", functionPath);

    const result = await findCommandToProcess({minPriority, maxPriority, context, excludeContext});

    if (!commandFound(result)) {
        // dc.l("no command found -> exit");
        // throw Error("ENDE");
        return false;
    }

    const startTime = nowMs();

    let command = getCommandFromResult(result);
    // dc.l("command found [id=%s]", getCommandId(command));
    // dc.l("command data", dc.stringify(command));

    // TODO -> add try catch
    const fullPath = getCommandFullPath(functionPath, command);
    // dc.l("commandExecutive [fullPath=%s]", fullPath);

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
        // dc.l("error: commandExecutive not exists [id=%s] [fullPath=%s]", getCommandId(command), fullPath);

        await setCommandHandled(command, {
            ok: false,
            executionTime: nowMsDif(startTime),
            errorType: "EXE",
            errorMsg: [
                "commandExecutive not exists",
                fullPath,
            ]
        });
        // dc.l("command handled saved [id=%s]", getCommandId(command));
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
        // dc.l("command executed [id=%s]", getCommandId(command));
        // dc.l("command result", dc.stringify(exeResult));
    } catch (e) {
        // dc.l("error: command execution error [id=%s] [e.message=%s]", getCommandId(command), e.message);
        // dc.l("execution error", e);
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
}


function makeProcessResult({moreToProcess = false, processedCounter = 0, withError = false, runTime = 0} = {}) {
    return {
        moreToProcess,
        processedCounter,
        withError,
        runTime
    };
}


async function processCommands({
                                   functionPath = null,
                                   maxProcessCommands = false,
                                   maxRuntime = false,
                                   minPriority = null,
                                   maxPriority = null,
                                   context = null,
                                   excludeContext = false,
                               } = {}) {

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

        // dc.l("processedCounter [%s] max [%s] reached [%s]", processedCounter, maxProcessCommandsCount, (maxProcessCommands <= 0));
        // dc.l("runTime [%s] max [%s] reached [%s]", nowDif(startTime), maxRuntime, (maxRuntime <= nowDif(startTime)));

    } catch (e) {
        // TODO debug over error log !?!
        // dc.l('error [message=%s]', e.message);
        console.error(e);
        await storeError(__filename, 335, "processCommands", e)
        return makeProcessResult({moreToProcess: false, processedCounter, withError: true, runTime: nowDif(startTime)});
    }

    return makeProcessResult({moreToProcess: true, processedCounter, runTime: nowDif(startTime)});
}


module.exports = {
    processNextCommand,
    processCommands,
};
