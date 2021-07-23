const dc = require("node-dev-console");
const {
    updateOneCommand,
    updateManyCommands,
    upsertCommandControl,
} = require("./emit-command");


async function setOneCommandPaused({
                                       context = "",
                                       aggregate = "",
                                       command = "",
                                       invokeId = "",
                                       uniqueId = null,
                                       commandId = null
                                   }) {
    return updateOneCommand({
        context,
        aggregate,
        command,
        invokeId,
        uniqueId,
        commandId
    }, {
        paused: true,
        pausedAt: new Date(),
    });
}


async function setOneCommandNotPaused({
                                          context = "",
                                          aggregate = "",
                                          command = "",
                                          invokeId = "",
                                          uniqueId = null,
                                          commandId = null
                                      }) {
    return updateOneCommand({
        context,
        aggregate,
        command,
        invokeId,
        uniqueId,
        commandId,
    }, {
        paused: false,
        pausedAt: null,
    });
}


async function setOneCommandHandled({
                                        context = "",
                                        aggregate = "",
                                        command = "",
                                        invokeId = "",
                                        uniqueId = null,
                                        commandId = null
                                    }) {
    return updateOneCommand({
        context,
        aggregate,
        command,
        invokeId,
        uniqueId,
        commandId,
    }, {
        handled: true,
        // handledAt: new Date(),
    });
}


async function setOneCommandNotHandled({
                                           context = "",
                                           aggregate = "",
                                           command = "",
                                           invokeId = "",
                                           uniqueId = null,
                                           commandId = null
                                       }) {
    return updateOneCommand({
        context,
        aggregate,
        command,
        invokeId,
        uniqueId,
        commandId,
    }, {
        handled: false,
    });
}


async function setOneCommandNotRunning({
                                           context = "",
                                           aggregate = "",
                                           command = "",
                                           invokeId = "",
                                           uniqueId = null,
                                           commandId = null
                                       }) {
    return updateOneCommand({
        context,
        aggregate,
        command,
        invokeId,
        uniqueId,
        commandId,
    }, {
        running: false,
    });
}


async function setManyCommandsPaused({
                                         context,
                                         aggregate,
                                         command
                                     }) {
    // Set scope paused
    const cmdCtlResult = await upsertCommandControl({
        context,
        aggregate,
        command,
    }, {
        paused: true
    });
    // dc.j(cmdCtlResult, "cmdCtlResult");

    // pause all commands in scope
    return updateManyCommands({
            context,
            aggregate,
            command,
        }, {
            paused: true,
            pausedAt: new Date(),
        },
        {
            $or: [
                {multiInvoke: true},
                {handled: false}
            ]
        });
}


async function setManyCommandsNotPaused({
                                            context,
                                            aggregate,
                                            command,
                                        }) {
    // Set scope paused
    const cmdCtlResult = await upsertCommandControl({
        context,
        aggregate,
        command,
    }, {
        paused: false
    });
    // dc.j(cmdCtlResult, "cmdCtlResult");

    // un pause all commands in scope
    return updateManyCommands({
            context,
            aggregate,
            command,
        }, {
            paused: false,
            pausedAt: null,
        },
        {
            paused: true
        });
}


async function setManyCommandsHandled({
                                          context,
                                          aggregate,
                                          command,
                                      }) {
    return updateManyCommands({
            context,
            aggregate,
            command,
        }, {
            handled: true,
            handledAt: new Date(),
            resultMsg: [{
                setManyCommandsHandled: true
            }]
        },
        {
            handled: false,
        });
}


async function setManyCommandsNotHandled({
                                             context,
                                             aggregate,
                                             command,
                                         }) {
    return updateManyCommands({
            context,
            aggregate,
            command,
        }, {
            handled: false,
        },
        {
            multiInvoke: true
        });
}


module.exports = {
    setOneCommandPaused,
    setOneCommandNotPaused,
    setOneCommandHandled,
    setOneCommandNotHandled,
    setOneCommandNotRunning,

    setManyCommandsPaused,
    setManyCommandsNotPaused,
    setManyCommandsHandled,
    setManyCommandsNotHandled,
};
