const dc = require("node-dev-console");
const R = require("ramda");
const {createDataTrigger} = require("./create-data-trigger");
const {createCronTrigger} = require("./create-cron-trigger");


async function createTrigger({
                                 type = "stream",
                                 ...triggerData
                             }) {
    if (type === "cron") {
        return createCronTrigger(triggerData);
    }

    return createDataTrigger(triggerData);
}


module.exports = {
    createTrigger,
};
