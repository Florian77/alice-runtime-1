const dc = require("node-dev-console");
const R = require("ramda");
const {
    updateOneTrigger,
} = require("./create-trigger");



// ---------------------------------------------------------------------------------
// paused
const setOneTriggerPaused = async ({triggerId}) => updateOneTrigger(
    {
        triggerId
    },
    {
        paused: true,
        pausedAt: new Date(),
    }
);
const setOneTriggerNotPaused = async ({triggerId}) => updateOneTrigger(
    {
        triggerId
    },
    {
        paused: false,
        pausedAt: null,
    }
);


// ---------------------------------------------------------------------------------
// check for updates
const setOneTriggerCheckForUpdates = async ({triggerId}) => updateOneTrigger(
    {
        triggerId
    },
    {
        checkForUpdates: true,
    }
);
const setOneTriggerNotCheckForUpdates = async ({triggerId}) => updateOneTrigger(
    {
        triggerId
    },
    {
        checkForUpdates: false,
    }
);


// ---------------------------------------------------------------------------------
// running
const setOneTriggerNotRunning = async ({triggerId}) => updateOneTrigger(
    {
        triggerId
    },
    {
        running: false,
    }
);


// ---------------------------------------------------------------------------------
// last sequece number
const setOneTriggerResetLastSequenceNumber = async ({triggerId}) => updateOneTrigger(
    {
        triggerId
    },
    {
        lastSequenceNumber: -1,
    }
);


// ---------------------------------------------------------------------------------
// last sequece number
const setOneTriggerCronExpression = async ({triggerId, cronExpression}) => updateOneTrigger(
    {
        triggerId
    },
    {
        cronExpression,
    }
);


module.exports = {
    setOneTriggerPaused,
    setOneTriggerNotPaused,
    setOneTriggerCheckForUpdates,
    setOneTriggerNotCheckForUpdates,
    setOneTriggerNotRunning,
    setOneTriggerResetLastSequenceNumber,
    setOneTriggerCronExpression,
};
