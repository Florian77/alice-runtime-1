const cronParser = require("cron-parser");

function calcCronNextRunAt(cronExpression) {
    const interval = cronParser.parseExpression(cronExpression);

    // todo -> add validation

    return interval.next().toDate();
}

module.exports = calcCronNextRunAt;
