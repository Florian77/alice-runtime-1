const dc = require("node-dev-console");
const R = require("ramda");
const pack = require('../package');
const MongoClient = require('mongodb').MongoClient;
const utility = require("./utility");
const {logConnectionMsg} = require("./helper/log-connection-msg");
const {hideUsernamePasswordFromUrl} = require("./helper/hide-username-password-from-url");


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


function isConnected() {
    return !!client && !!client.topology && client.topology.isConnected();
}


async function connect() {
    if (!isConnected()) {
        try {
            logConnectionMsg("AliceRuntime DB.connect [%s::%s] v%s", hideUsernamePasswordFromUrl(process.env.ALICE_RUNTIME_MONGODB_URL), process.env.ALICE_RUNTIME_MONGODB_DB, pack.version);


            // todo -> change to new Mclient() !!!!!!


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
}


async function disconnect() {
    await client.close();
    logConnectionMsg("AliceRuntime DB.disconnect");
}


function getCollection(collectionName) {
    return database.collection(collectionName);
}


function getCollectionDataIndex() {
    return getCollection(DATA_INDEX_COLLECTION);
}


function getCollectionDataStream() {
    return getCollection(DATA_STREAM_COLLECTION);
}


function getCollectionTriggerIndex() {
    return getCollection(TRIGGER_INDEX_COLLECTION);
}


function getCollectionTriggerStream() {
    return getCollection(TRIGGER_STREAM_COLLECTION);
}


function getCollectionCommandIndex() {
    return getCollection(COMMAND_INDEX_COLLECTION);
}


function getCollectionCommandPayload() {
    return getCollection(COMMAND_PAYLOAD_COLLECTION);
}


function getCollectionCommandStream() {
    return getCollection(COMMAND_STREAM_COLLECTION);
}


function getCollectionStreamSequenceNumber() {
    return getCollection(STREAM_SEQUENCE_NUMBER_COLLECTION);
}


function getCollectionStatsContextAggregate() {
    return getCollection(STATS_CONTEXT_AGGREGATE_COLLECTION);
}


function getCollectionUtility() {
    return getCollection(UTILITY_COLLECTION);
}


function getCollectionView(name) {
    return getCollection(`view_${name}`);
}


function getCollectionBackup(name) {
    return getCollection(`backup_${name}`);
}


function makeCollectionPrivatePrefix(command) {
    return R.join("__", [utility.getContext(command), utility.getAggregate(command), utility.getCommand(command)]);
}


function getCollectionCommandPrivate(command, name) {
    return getCollection(`private_${makeCollectionPrivatePrefix(command)}_CMD_${name}`);
}


function getCollectionTriggerPrivate(trigger, name) {
    return getCollection(`private_${makeCollectionPrivatePrefix(trigger)}_TGR_${name}`);
}


function makeUtilityCollectionId(namespace, idParts, idPartSeparator = "::") {
    return R.join("::", [namespace, R.join(idPartSeparator, idParts)]);
}


// CMD

// TGR

// TODO -> getCurrentStreamSequenceNumber
// const getCurrentEventStreamPosition = async (eventStream, context = "") => {
//     const result = await getCollectionEventStreamPosition(context).findOne(
//         {_id: eventStream }
//     );
//     dc.j(result, "getCurrentEventStreamPosition().result");
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
    dc.j(result, "resetNextEventStreamPosition().result");
    return true
};*/


function listCollections(filter, options) {
    return database.listCollections(filter, options);
}


function createCollection(name) {
    return database.createCollection(name);
}


function getDatabase() {
    return database
}


async function storeError(file, line, functionName, error) {
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

    storeError,

    COLLECTION_LIST,
    UTILITY_NAMESPACE,

};
