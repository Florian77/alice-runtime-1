const dc = require("node-dev-console");
const R = require("ramda");
const {
    updateOneTrigger,
} = require("./create-trigger");


async function setOneTriggerPaused({triggerId}) {
    return updateOneTrigger(
        {
            triggerId
        },
        {
            paused: true,
            pausedAt: new Date(),
        }
    );
}


async function setOneTriggerNotPaused({triggerId}) {
    return updateOneTrigger(
        {
            triggerId
        },
        {
            paused: false,
            pausedAt: null,
        }
    );
}


async function setOneTriggerCheckForUpdates({triggerId}) {
    return updateOneTrigger(
        {
            triggerId
        },
        {
            checkForUpdates: true,
        }
    );
}


async function setOneTriggerNotCheckForUpdates({triggerId}) {
    return updateOneTrigger(
        {
            triggerId
        },
        {
            checkForUpdates: false,
        }
    );
}


async function setOneTriggerNotRunning({triggerId}) {
    return updateOneTrigger(
        {
            triggerId
        },
        {
            running: false,
        }
    );
}


async function setOneTriggerResetLastSequenceNumber({triggerId}) {
    return updateOneTrigger(
        {
            triggerId
        },
        {
            lastSequenceNumber: -1,
        }
    );
}


async function setOneTriggerCronExpression({triggerId, cronExpression}) {
    return updateOneTrigger(
        {
            triggerId
        },
        {
            cronExpression,
        }
    );
}


module.exports = {
    setOneTriggerPaused,
    setOneTriggerNotPaused,
    setOneTriggerCheckForUpdates,
    setOneTriggerNotCheckForUpdates,
    setOneTriggerNotRunning,
    setOneTriggerResetLastSequenceNumber,
    setOneTriggerCronExpression,
};
