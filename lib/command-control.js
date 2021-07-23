const R = require("ramda");
const {
    updateOneCommand,
    updateManyCommands,
    getCommandControl,
    upsertCommandControl,
} = require("./emit-command");

// process.env.DEV_CONSOLE_ON = 1;
const dc = require("node-dev-console");


// ---------------------------------------------------------------------------------
const setOneCommandPaused = async ({context = "", aggregate = "", command = "", invokeId = "", uniqueId = null, commandId = null}) =>
    updateOneCommand({context, aggregate, command, invokeId, uniqueId, commandId}, {
        paused: true,
        pausedAt: new Date(),
    });

// ---------------------------------------------------------------------------------
const setOneCommandNotPaused = async ({context = "", aggregate = "", command = "", invokeId = "", uniqueId = null, commandId = null}) =>
    updateOneCommand({context, aggregate, command, invokeId, uniqueId, commandId}, {
        paused: false,
        pausedAt: null,
    });

// ---------------------------------------------------------------------------------
const setOneCommandHandled = async ({context = "", aggregate = "", command = "", invokeId = "", uniqueId = null, commandId = null}) =>
    updateOneCommand({context, aggregate, command, invokeId, uniqueId, commandId}, {
        handled: true,
        // handledAt: new Date(),
    });

// ---------------------------------------------------------------------------------
const setOneCommandNotHandled = async ({context = "", aggregate = "", command = "", invokeId = "", uniqueId = null, commandId = null}) =>
    updateOneCommand({context, aggregate, command, invokeId, uniqueId, commandId}, {
        handled: false,
    });

// ---------------------------------------------------------------------------------
const setOneCommandNotRunning = async ({context = "", aggregate = "", command = "", invokeId = "", uniqueId = null, commandId = null}) =>
    updateOneCommand({context, aggregate, command, invokeId, uniqueId, commandId}, {
        running: false,
    });

// ---------------------------------------------------------------------------------
const setManyCommandsPaused = async ({
                                         context,
                                         aggregate,
                                         command
                                     }) => {
    // Set scope paused
    const cmdCtlResult = await upsertCommandControl({context, aggregate, command}, {
        paused: true
    });
    // dc.j(cmdCtlResult, "cmdCtlResult");

    // pause all commands in scope
    return await updateManyCommands({context, aggregate, command}, {
            paused: true,
            pausedAt: new Date(),
        },
        {
            $or: [
                {multiInvoke: true},
                {handled: false}
            ]
        })

};
// ---------------------------------------------------------------------------------
const setManyCommandsNotPaused = async ({
                                            context,
                                            aggregate,
                                            command
                                        }) => {
    // Set scope paused
    const cmdCtlResult = await upsertCommandControl({context, aggregate, command}, {
        paused: false
    });
    // dc.j(cmdCtlResult, "cmdCtlResult");

    // pause all commands in scope
    return await updateManyCommands({context, aggregate, command}, {
            paused: false,
            pausedAt: null,
        },
        {
            paused: true
        })
};

// ---------------------------------------------------------------------------------
const setManyCommandsHandled = async ({
                                          context,
                                          aggregate,
                                          command
                                      }) => {
    return await updateManyCommands({context, aggregate, command}, {
            handled: true,
            handledAt: new Date(),
            resultMsg: [{
                setManyCommandsHandled: true
            }]
        },
        {
            handled: false,
        })
};

// ---------------------------------------------------------------------------------
const setManyCommandsNotHandled = async ({
                                             context,
                                             aggregate,
                                             command
                                         }) => {
    return await updateManyCommands({context, aggregate, command}, {
            handled: false,
        },
        {
            multiInvoke: true
        })
};


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
