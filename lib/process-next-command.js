const dc = require("node-dev-console");
const R = require("ramda");
const {resolve} = require('path');
const fs = require('fs');
const yup = require('yup');
const {getCollectionCommandStream} = require("./database");
const {sleep} = require("./helper/sleep");
const {returnCmdError} = require("./utility");
const {getCollectionCommandIndex} = require("./database");
const {findCommandToProcess} = require("./find-command-to-process");
const {commandEnvironment} = require("./command-environment");
const {emitCommand} = require("./emit-command");
const {emitMultiCommand} = require("./emit-multi-command");
const {storeError} = require("./database");


const emptyCommandResult = R.propSatisfies(R.isNil, "value");
const getCommandFromResult = R.prop("value");
const getCommandContext = R.propOr(null, "context");
const getCommandAggregate = R.propOr(null, "aggregate");
const getCommandCommand = R.propOr(null, "command");
const getCommandId = R.propOr("ERROR-MISSING-DATA", "_id");
const mergeDefaultExeResult = R.mergeRight({
    ok: false,
    warning: false,
    errorType: null,
    errorMsg: [],
    resultMsg: [],
    subscription: [],
});
const nowMs = () => Date.now() | 0;
const nowMsDif = start => nowMs() - start;
const exeResultSchema = yup.object().shape({
    ok: yup.boolean().required(),
});
const isExecuteResultOk = R.propEq("ok", true);


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
    const commandHandler = require(fullPath);
    // dc.t(commandHandler, "commandHandler")
    if (typeof commandHandler !== "function") {
        return false;
    }
    return commandHandler;
}

async function storeCommandEvent(command, state) {
    // dc.j(command, "command");
    // dc.j(state, "state");

    let event = {
        commandId: R.propOr(null, "_id", command),
        context: R.propOr(null, "context", command),
        aggregate: R.propOr(null, "aggregate", command),
        command: R.propOr(null, "command", command),
        invokeId: R.propOr(null, "invokeId", command),
        uniqueId: R.propOr(null, "uniqueId", command),
        multiInvoke: R.propOr(null, "multiInvoke", command),
        handledAt: R.propOr(null, "handledAt", state),
        executionTime: R.propOr(null, "executionTime", state),
        ok: R.propOr(null, "ok", state),
        warning: R.propOr(null, "warning", state),
        resultMsg: R.propOr(null, "resultMsg", state),
        errorType: R.propOr(null, "errorType", state),
        errorMsg: R.propOr(null, "errorMsg", state),
        commandData: isExecuteResultOk(state) ? null : command,
    };
    for (let i = 0; i < 3; i++) {
        try {

            // const result =
            await getCollectionCommandStream().insertOne(event);
            // dc.j(result, "result");

            return;

        } catch (e) {
            console.error(e);
            await storeError(__filename, 0, "storeCommandEvent", e);
            await sleep(20);
        }
    }
}


async function setCommandHandled(command, state) {
    // const debug.enabled = false;
    const query = {
        _id: getCommandId(command),
    };

    // TODO -> validate state + remove data that should not be set


    const setState = {
        ...(mergeDefaultExeResult(state)),
        handled: true,
        handledAt: new Date(),
        running: false,
    };

    const update = {
        $set: setState,
    };
    for (let i = 0; i < 3; i++) {
        try {

            // dc.l("setCommandHandled().query", dc.stringify(query));
            // dc.l("setCommandHandled().update", dc.stringify(update));
            const result = await getCollectionCommandIndex().updateOne(query, update);
            // dc.l("setCommandHandled().result", ftDev.mongoUpdateOne(result));

            await storeCommandEvent(command, setState);

            return result;

        } catch (e) {
            console.error(e);
            await storeError(__filename, 98, "setCommandHandled", e);
            await sleep(20);
        }
    }
    throw Error("setCommandHandled failed");
}


async function deleteCommand(command) {
    // const debug.enabled = false;
    const query = {
        _id: getCommandId(command)
    };
    for (let i = 0; i < 3; i++) {
        try {
            // dc.l("setCommandHandled().query", dc.stringify(query));
            // dc.l("setCommandHandled().update", dc.stringify(update));
            const result = await getCollectionCommandIndex().deleteOne(query);
            // dc.l("setCommandHandled().result", ftDev.mongoUpdateOne(result));

            return result;

        } catch (e) {
            console.error(e);
            await storeError(__filename, 113, "deleteCommand", e);
            await sleep(20);
        }
    }
    throw Error("deleteCommand failed");
}


async function processNextCommand({
                                      functionPath = null,
                                      minPriority = null,
                                      maxPriority = null,
                                      context = null,
                                      excludeContext = false,
                                  } = {}) {
    if (R.isNil(functionPath) || R.isEmpty(functionPath)) {
        throw Error("functionPath missing");
    }

    // dc.l("[functionPath=%s]", functionPath);

    const result = await findCommandToProcess({minPriority, maxPriority, context, excludeContext});

    if (emptyCommandResult(result)) {
        // dc.l("no command found -> exit");
        return false;
    }

    const startTime = nowMs();

    let command = getCommandFromResult(result);
    // dc.l("command found [id=%s]", getCommandId(command));
    // dc.l("command data", dc.stringify(command));

    let fullPath, commandExecutive;
    try {

        fullPath = getCommandFullPath(functionPath, command);
        // dc.l("commandExecutive [fullPath=%s]", fullPath);

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
        /*if (R.propEq("hasPayload", true, command)) {
            const payload = await getCollectionCommandPayload().findOne({_id: R.propOr(null, "_id", command)})
            // console.log("payload", payload)
            command = R.assoc("payload", R.propOr({}, "payload", payload), command)
        }
        // console.log("command", command)*/

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

    // todo -> Add retry logic ???


    if (!await exeResultSchema.isValid(exeResult)) {
        exeResult = returnCmdError([
            "execution result schema is not valid",
            {
                result: R.clone(exeResult),
            }
        ])
        exeResult.errorType = "EXE";
    } else {
        if (!isExecuteResultOk(exeResult)) {
            exeResult.errorType = "CMD";
        }
    }

    exeResult.executionTime = nowMsDif(startTime);

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


    // todo -> make system option
    // await setCommandHandled(command, exeResult);

    if (command.multiInvoke) {
        await setCommandHandled(command, exeResult);
    } else {

        await storeCommandEvent(command, {
            ...exeResult,
            handledAt: new Date(),
        });

        await deleteCommand(command);
    }

    return true;
}


module.exports = {
    processNextCommand,
};
