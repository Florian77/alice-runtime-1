const ftDev = require('ftws-node-dev-tools');
const {jsonString} = ftDev;
const dc = require("node-dev-console");
const pack = require('../package');
const MongoClient = require('mongodb').MongoClient;
const R = require("ramda");
const utility = require("./utility");
const {logConnectionMsg} = require("./helper/log-connection-msg");
const {hideUsernamePasswordFromUrl} = require("./helper/hide-username-password-from-url");

const _logger = require('debug')('alice:db');
const logConnect = _logger.extend("connect");
const log = _logger.extend('log');
const debug = _logger.extend('debug');

const DATA_INDEX_COLLECTION = "DataIndex";
const DATA_STREAM_COLLECTION = "DataStream";
const TRIGGER_INDEX_COLLECTION = "TriggerIndex";
const TRIGGER_STREAM_COLLECTION = "TriggerStream";
const COMMAND_INDEX_COLLECTION = "CommandIndex";
const COMMAND_PAYLOAD_COLLECTION = "CommandPayload";
const COMMAND_STREAM_COLLECTION = "CommandStream";
const STATS_CONTEXT_AGGREGATE_COLLECTION = "StatsContextAggregate";
const STREAM_SEQUENCE_NUMBER_COLLECTION = "StreamSequenceNumber";
const UTILITY_COLLECTION = "Utility";
const COLLECTION_LIST = [
    DATA_INDEX_COLLECTION,
    DATA_STREAM_COLLECTION,
    TRIGGER_INDEX_COLLECTION,
    TRIGGER_STREAM_COLLECTION,
    COMMAND_INDEX_COLLECTION,
    COMMAND_PAYLOAD_COLLECTION,
    COMMAND_STREAM_COLLECTION,
    STATS_CONTEXT_AGGREGATE_COLLECTION,
    STREAM_SEQUENCE_NUMBER_COLLECTION,
    UTILITY_COLLECTION,
];

const UTILITY_NAMESPACE = {
    COMMAND_CONTROL: "CommandControl",
    APP: "App",
    PROCESS: "Process",
};

let client = null;
let database = null;


const isConnected = () => !!client && client.isConnected(); // !!client.topology && client.topology.isConnected();

const connect = async () => {
    if (!isConnected()) {
        try {
            logConnectionMsg("AliceRuntime DB.connect [%s::%s] v%s", hideUsernamePasswordFromUrl(process.env.ALICE_RUNTIME_MONGODB_URL), process.env.ALICE_RUNTIME_MONGODB_DB, pack.version);
            client = await MongoClient.connect(process.env.ALICE_RUNTIME_MONGODB_URL, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                heartbeatFrequencyMS: 250
            });
            database = await client.db(process.env.ALICE_RUNTIME_MONGODB_DB);
        } catch (e) {
            console.error(e);
            return false;
        }

    } else {
        logConnectionMsg("AliceRuntime DB.alreadyConnected");
    }
    return true;
};

const disconnect = async () => {
    await client.close();
    logConnectionMsg("AliceRuntime DB.disconnect");
};

const getCollection = collectionName => database.collection(collectionName);

const getCollectionDataIndex = () => getCollection(DATA_INDEX_COLLECTION);
const getCollectionDataStream = () => getCollection(DATA_STREAM_COLLECTION);
const getCollectionTriggerIndex = () => getCollection(TRIGGER_INDEX_COLLECTION);
const getCollectionTriggerStream = () => getCollection(TRIGGER_STREAM_COLLECTION);
const getCollectionCommandIndex = () => getCollection(COMMAND_INDEX_COLLECTION);
const getCollectionCommandPayload = () => getCollection(COMMAND_PAYLOAD_COLLECTION);
const getCollectionCommandStream = () => getCollection(COMMAND_STREAM_COLLECTION);
const getCollectionStreamSequenceNumber = () => getCollection(STREAM_SEQUENCE_NUMBER_COLLECTION);
const getCollectionStatsContextAggregate = () => getCollection(STATS_CONTEXT_AGGREGATE_COLLECTION);
const getCollectionUtility = () => getCollection(UTILITY_COLLECTION);

const getCollectionView = (name) => getCollection("view_".concat(name));
const getCollectionBackup = (name) => getCollection("backup_".concat(name));

const makeCollectionPrivatePrefix = (command) => R.join("__", [utility.getContext(command), utility.getAggregate(command), utility.getCommand(command)]);
const getCollectionCommandPrivate = (command, name) => getCollection(`private_${makeCollectionPrivatePrefix(command)}_CMD_${name}`);
const getCollectionTriggerPrivate = (trigger, name) => getCollection(`private_${makeCollectionPrivatePrefix(trigger)}_TGR_${name}`);


const makeUtilityCollectionId = (namespace, idParts, idPartSeparator = "::") => R.join("::", [namespace, R.join(idPartSeparator, idParts)]);

const getNextStreamSequenceNumber = async (streamType, streamId) => {
    // TODO -> use utility collection

    // todo -> add retry logic !!!

    const result = await getCollectionStreamSequenceNumber().findOneAndUpdate(
        {
            _id: R.join("::", [streamType, streamId])
        },
        {
            $inc: {nextPosition: 1},
        },
        {
            // returnNewDocument: true,
            upsert: true
        }
    );
    // ftDev.logJsonString(result, "getNextEventStreamPosition().result");
    return result.value === null ? 0 : result.value.nextPosition;
};

const getNextDataStreamSequenceNumber = async (streamId) => getNextStreamSequenceNumber("DATA", streamId);
const getNextDataIndexSequenceNumber = async () => getNextStreamSequenceNumber("INDEX", "DATA");

// CMD

// TGR

// TODO -> getCurrentStreamSequenceNumber
// const getCurrentEventStreamPosition = async (eventStream, context = "") => {
//     const result = await getCollectionEventStreamPosition(context).findOne(
//         {_id: eventStream }
//     );
//     ftDev.logJsonString(result, "getCurrentEventStreamPosition().result");
//     return result.value === null ? false : result.value.lastPosition;
// };

/*const resetNextEventStreamPosition = async eventStream => {
    const result = await getCollectionEventStreamPosition().updateOne(
        {_id: eventStream},
        {$set: {nextPosition: 0}},
        {
            // returnNewDocument: true,
            upsert: true
        }
    );
    ftDev.logJsonString(result, "resetNextEventStreamPosition().result");
    return true
};*/

const listCollections = (filter, options) => database.listCollections(filter, options);
const createCollection = (name) => database.createCollection(name);

const getDatabase = () => {
    return database
}

const storeError = async (file, line, functionName, error) => {
    try {
        // console.log("error", JSON.stringify(error.stack, null, 2))
        await database.collection("_error").insertOne({
            created: new Date(),
            file,
            line,
            function: functionName,
            name: error.name,
            message: error.message,
            error,
        })
    } catch (e) {
        console.error("storeError() ERROR:", e)
    }
}

module.exports = {
    connect,
    disconnect,
    isConnected,

    getDatabase,

    listCollections,
    createCollection,

    getCollection,
    getCollectionDataIndex,
    getCollectionDataStream,
    getCollectionTriggerIndex,
    getCollectionTriggerStream,
    getCollectionCommandIndex,
    getCollectionCommandPayload,
    getCollectionCommandStream,
    getCollectionStreamSequenceNumber,
    getCollectionStatsContextAggregate,
    getCollectionUtility,
    getCollectionView,
    getCollectionBackup,
    getCollectionCommandPrivate,
    getCollectionTriggerPrivate,

    makeUtilityCollectionId,

    getNextDataStreamSequenceNumber,
    getNextDataIndexSequenceNumber,

    storeError,

    COLLECTION_LIST,
    UTILITY_NAMESPACE,

};
