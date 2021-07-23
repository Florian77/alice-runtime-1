const {getCollectionTriggerIndex} = require("./database");
const R = require("ramda");
const calcCronNextRunAt = require("./helper/calc-cron-next-run-at");
const {upsertStatsTriggerContextAggregate} = require("./upsert-stats");


async function createCronTrigger({
                                     context,
                                     aggregate,
                                     trigger,
                                     cronExpression = null,
                                     checkForUpdates = false,
                                     paused = false,
                                 }) {

    const type = "cron";
    const contextAggregate = R.join("/", [context, aggregate]);

    // calc next run
    // const interval = cronParser.parseExpression(cronExpression);
    // const nextRunAt = interval.next().toDate();

    const nextRunAt = calcCronNextRunAt(cronExpression);


    const triggerData = {
        _id: R.join("::", [contextAggregate, type, trigger]),
        context,
        aggregate,
        trigger,
        type,
        cronExpression,
        nextRunAt,
        checkForUpdates,
        running: false,
        runningSince: null,
        lastRunAt: null,
        error: false,
        errorMsg: null,
        paused,
        pausedAt: null,
        deployedAt: new Date(),
    };
    // if(debug.enabled) ftDev.logJsonString(triggerData, "createCronTrigger().triggerData");

    // TODO -> Add try catch
    const result = await getCollectionTriggerIndex().insertOne(triggerData);
    // if(debug.enabled) ftDev.mongo.logInsertOne(result, "createCronTrigger().insertOne().result", true);

    await upsertStatsTriggerContextAggregate({context, aggregate});

    // TODO check result

    return triggerData;
}

module.exports = {
    createCronTrigger,
};
