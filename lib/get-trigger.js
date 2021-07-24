const dc = require("node-dev-console");
const R = require("ramda");
const {makeTriggerId} = require("./helper/make-trigger-id");
const {getCollectionTriggerIndex} = require("./database");


const hasValue = R.complement(R.isNil);


async function getTrigger({
                              type,
                              context,
                              aggregate,
                              trigger,
                              streamType,
                              streamId = null,
                              streamContext,
                              streamAggregate = null,
                              streamAggregateId = null,
                              triggerId = null
                          }) {

    if (R.isNil(triggerId)) {
        triggerId = makeTriggerId({
            type,
            context,
            aggregate,
            trigger,
            streamType,
            streamId,
            streamContext,
            streamAggregate,
            streamAggregateId,
        });
    }
    const query = {
        _id: triggerId,
    };
    // dcl("getTrigger().findOne(%s)", dc.stringify(query));
    const result = await getCollectionTriggerIndex().findOne(query);
    // dcl("getTrigger().findOne().result", dc.stringify(result));

    if (!hasValue(result)) {
        return false
    }

    return result
}


module.exports = {
    getTrigger,
};
