const dc = require("node-dev-console");
const R = require("ramda");
const {getCollectionStatsContextAggregate} = require("./database");

const {storeError} = require("./database");

const hasValue = R.complement(R.isNil);


const upsertStatsContextAggregate = async ({
                                               type = null,
                                               context = null,
                                               aggregate = null,
                                               command = null
                                           }) => {


    const contextAggregate = R.join("/", [context, aggregate]);
    let id = R.join("::", [type, contextAggregate]);
    if (!R.isNil(command)) {
        id = R.join("/", [id, command]);
    }
    // dc.l("id", id, command);
    const filter = {
        _id: id
    };
    const update = {
        $inc: {total: 1},
        $setOnInsert: {
            context,
            aggregate,
            command,
            type,
        }
    };
    const options = {
        upsert: true
    };
    // dcl("updateOne(filter:%s, update:%s, options:%s)", dc.stringify(filter), dc.stringify(update), dc.stringify(options));
    try {
        const result = await getCollectionStatsContextAggregate().updateOne(filter, update, options);
        // dcl("command stored [id=%s]", id);
        // dcl("updateOne()", ftDev.mongoUpdateOne(result), dc.stringify(result));

    } catch (e) {
        console.error(e);
        await storeError(__filename, 53, "upsertStatsContextAggregate", e)
        return false;
    }

    return true;
};

const upsertStatsDataContextAggregate = async ({context, aggregate}) => upsertStatsContextAggregate({type: "DATA", context, aggregate});
const upsertStatsCommandContextAggregate = async ({context, aggregate, command}) => upsertStatsContextAggregate({type: "CMD", context, aggregate, command});
const upsertStatsTriggerContextAggregate = async ({context, aggregate}) => upsertStatsContextAggregate({type: "TGR", context, aggregate});

const getContextAggregateList = async (type, options = {commandList: false}) => {
    const {
        commandList
    } = options;
    // dc.l("[commandList=%s]", commandList);
    const query = {
        type
    };
    let queryOptions = {
        projection: {
            _id: 0,
            aggregate: 1,
            context: 1,
            total: 1
        }
    };
    if (commandList) {
        queryOptions.projection.command = 1;
    }
    const result = await getCollectionStatsContextAggregate().find(query, queryOptions).toArray();
    // dc.l("getContextAggregateList().find(query:%s, options:%s).result", dc.stringify(query), dc.stringify(queryOptions), dc.stringify(result));
    const uniqResult = (type === "CMD" && !commandList) ? R.uniq(result) : result;
    // dc.j(uniqResult, "uniqResult");
    // TODO -> Sum all {total} for same context/aggregate -> sum Command count
    return uniqResult;
};

const getDataContextAggregateList = async () => getContextAggregateList("DATA");
const getCommandContextAggregateList = async (options = {commandList: true}) => getContextAggregateList("CMD", options);
const getCommandContextAggregateCommandList = async () => getContextAggregateList("CMD", {commandList: true});
const getTriggerContextAggregateList = async () => getContextAggregateList("TGR");


module.exports = {
    upsertStatsDataContextAggregate,
    upsertStatsCommandContextAggregate,
    upsertStatsTriggerContextAggregate,
    getDataContextAggregateList,
    getCommandContextAggregateList,
    getCommandContextAggregateCommandList,
    getTriggerContextAggregateList,
};
