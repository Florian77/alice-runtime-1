const ftDev = require("ftws-node-dev-tools");
const {jsonString} = ftDev;
const {getCollectionStatsContextAggregate} = require("./database");
const R = require("ramda");

// process.env.DEV_CONSOLE_ON = 1;
const dc = require("node-dev-console");
const {storeError} = require("./database");

const hasValue = R.complement(R.isNil);

const _logger = require('debug')('alice:upsertStats');
const log = _logger.extend('log');
const debug = _logger.extend('debug');

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
    debug("updateOne(filter:%s, update:%s, options:%s)", ftDev.jsonString(filter), ftDev.jsonString(update), ftDev.jsonString(options));
    try {
        const result = await getCollectionStatsContextAggregate().updateOne(filter, update, options);
        debug("command stored [id=%s]", id);
        debug("updateOne()", ftDev.mongoUpdateOne(result), ftDev.jsonString(result));

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
    // dc.l("getContextAggregateList().find(query:%s, options:%s).result", jsonString(query), jsonString(queryOptions), jsonString(result));
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
