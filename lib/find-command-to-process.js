const dc = require("node-dev-console");
const R = require("ramda");
const {storeError} = require("./database");
const {getCollectionCommandIndex} = require("./database");


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
    try {

        // dc.l("findCommandToProcess().findOneAndUpdate(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options));
        const result = await getCollectionCommandIndex().findOneAndUpdate(filter, update, options);
        // dc.j(result, "findCommandToProcess().findOneAndUpdate().result");
        // if (false) console.log("findCommandToProcess:", R.pathOr(null, ["value", "_id"], result), "priority", R.pathOr(null, ["value", "priority"], result))
        return result;

    } catch (e) {
        console.error(e);
        await storeError(__filename, 63, "findCommandToProcess", e);
    }

    return null;
}


module.exports = {
    findCommandToProcess,
};
