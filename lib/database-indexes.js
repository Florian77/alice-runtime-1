const ftDev = require('ftws-node-dev-tools');
const {jsonString} = ftDev;
const {
    COLLECTION_LIST,
    getCollectionDataIndex,
    getCollectionDataStream,
    getCollectionTriggerIndex,
    getCollectionCommandIndex,
    getCollectionStatsContextAggregate,
    listCollections,
    createCollection,
} = require("./database");
const R = require("ramda");
const {storeError} = require("./database");

const _logger = require('debug')('alice:db');
const logConnect = _logger.extend("connect");
const log = _logger.extend('log');
const debug = _logger.extend('debug');


// todo -> check docs

// https://docs.mongodb.com/manual/core/index-compound/
// https://docs.mongodb.com/manual/tutorial/manage-indexes/
// https://docs.mongodb.com/manual/core/index-wildcard/
// https://docs.mongodb.com/manual/core/index-partial/
// https://docs.mongodb.com/manual/core/index-sparse
//
//

const checkIndexes = async () => {
    const result = await listCollections({"type": "collection"}, {nameOnly: true}).toArray();
    debug("getContextList().listCollections().result", jsonString(result));
    const existingCollections = R.map(R.prop("name"), result);
    debug("existingCollections", jsonString(existingCollections));
    for (const collection of COLLECTION_LIST) {
        if (!R.includes(collection, existingCollections)) {
            await createCollection(collection);
            log("createCollection(%s)", collection);
        }
    }
    let indexList = [];

    const indexType = "new"

    if (indexType === "new") {
        try {

            // ---------------------------------------------------------------------------------------------------------
            // Command Index
            const dropCommandIndexList = [
                "stats.multiInvoke_true",
                "stats.running_true",
                "stats.paused_true",
                "stats.ok_false",
                "stats.handled_false",
                "stats.handled_false_paused_false",
            ];
            for (let indexName of dropCommandIndexList) {
                try {
                    if (await getCollectionCommandIndex().indexExists(indexName)) {
                        const dropResult = await getCollectionCommandIndex().dropIndex(indexName);
                        // console.log("dropResult", dropResult)
                    }
                } catch (e) {
                    console.error("getCollectionCommandIndex().dropIndex()", indexName, e);
                    await storeError(__filename, 59, "checkIndexes", e)
                }
            }
            {
                const indexName = await getCollectionCommandIndex().createIndex({
                        priority: -1,
                        createdAt: 1,
                    },
                    {
                        name: "findCommandToProcess",
                        partialFilterExpression: {
                            handled: false,
                            paused: false,
                            running: false,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionCommandIndex().createIndex({
                        context: 1,
                        priority: -1,
                        createdAt: 1,
                    },
                    {
                        name: "findCommandToProcess.context",
                        partialFilterExpression: {
                            handled: false,
                            paused: false,
                            running: false,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionCommandIndex().createIndex({
                        context: 1,
                        aggregate: 1,
                        command: 1,
                        subscription: 1,
                    },
                    {
                        name: "reInvokeSubscription", // + updateManyCommands
                    });
                indexList.push(indexName);
            }
            // Command Index -> STATS
            {
                const indexName = await getCollectionCommandIndex().createIndex({
                        multiInvoke: 1,
                        context: 1,
                        aggregate: 1,
                        command: 1,
                    },
                    {
                        name: "stats.multiInvoke_true_v2",
                        partialFilterExpression: {
                            multiInvoke: true,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionCommandIndex().createIndex({
                        running: 1,
                        context: 1,
                        aggregate: 1,
                        command: 1,
                    },
                    {
                        name: "stats.running_true_v2",
                        partialFilterExpression: {
                            running: true,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionCommandIndex().createIndex({
                        paused: 1,
                        context: 1,
                        aggregate: 1,
                        command: 1,
                    },
                    {
                        name: "stats.paused_true_v2",
                        partialFilterExpression: {
                            paused: true,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionCommandIndex().createIndex({
                        ok: 1,
                        context: 1,
                        aggregate: 1,
                        command: 1,
                    },
                    {
                        name: "stats.ok_false_v2",
                        partialFilterExpression: {
                            ok: false,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionCommandIndex().createIndex({
                        handled: 1,
                        context: 1,
                        aggregate: 1,
                        command: 1,
                    },
                    {
                        name: "stats.handled_false_v2",
                        partialFilterExpression: {
                            handled: false,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionCommandIndex().createIndex({
                        handled: 1,
                        paused: 1,
                        context: 1,
                        aggregate: 1,
                        command: 1,
                    },
                    {
                        name: "stats.handled_false_paused_false_v2",
                        partialFilterExpression: {
                            handled: false,
                            paused: false,
                        },
                    });
                indexList.push(indexName);
            }


            // ---------------------------------------------------------------------------------------------------------
            // Data Stream
            {
                const indexName = await getCollectionDataStream().createIndex({
                        createdAt: 1,
                    },
                    {
                        name: "findEventToDispatch",
                        partialFilterExpression: {
                            dispatched: false,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionDataStream().createIndex({
                        context: 1,
                        createdAt: 1,
                    },
                    {
                        name: "findEventToDispatch.context",
                        partialFilterExpression: {
                            dispatched: false,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionDataStream().createIndex({
                        streamId: 1,
                        sequenceNumber: -1,
                    },
                    {
                        name: "getLastDataEvent",
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionDataStream().createIndex({
                        dispatched: 1,
                        streamId: 1,
                        sequenceNumber: 1,
                    },
                    {
                        name: "findEventToProcess",
                        partialFilterExpression: {
                            dispatched: true,
                        },
                    });
                indexList.push(indexName);
            }
            // Data Stream -> STATS
            {
                const indexName = await getCollectionDataStream().createIndex({
                        dispatched: 1,
                        context: 1,
                        aggregate: 1,
                    },
                    {
                        name: "stats.dispatched_false",
                        partialFilterExpression: {
                            dispatched: false,
                        },
                    });
                indexList.push(indexName);
            }


            // ---------------------------------------------------------------------------------------------------------
            // Data Index
            {
                const indexName = await getCollectionDataIndex().createIndex({
                        context: 1,
                        aggregate: 1,
                        // "index.$**": 1
                    },
                    {
                        name: "context_aggregate",
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionDataIndex().createIndex({
                        // context: 1,
                        // aggregate: 1,
                        "index.$**": 1
                    },
                    {
                        name: "index.*",
                    });
                indexList.push(indexName);
            }


            // ---------------------------------------------------------------------------------------------------------
            // Trigger Index
            {
                const indexName = await getCollectionTriggerIndex().createIndex({
                        checkForUpdates: 1,
                        lastRunAt: 1,
                    },
                    {
                        name: "activateCronTrigger",
                        partialFilterExpression: {
                            type: "cron",
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionTriggerIndex().createIndex({
                        streamType: 1,
                        streamId: 1,
                    },
                    {
                        name: "dispatchEvent.updateTriggerIndex",
                        partialFilterExpression: {
                            type: "stream",
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionTriggerIndex().createIndex({
                        lastRunAt: 1,
                    },
                    {
                        name: "findTriggerToProcess",
                        partialFilterExpression: {
                            checkForUpdates: true,
                            running: false,
                            error: false,
                            paused: false,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionTriggerIndex().createIndex({
                        context: 1,
                        lastRunAt: 1,
                    },
                    {
                        name: "findTriggerToProcess.context",
                        partialFilterExpression: {
                            checkForUpdates: true,
                            running: false,
                            error: false,
                            paused: false,
                        },
                    });
                indexList.push(indexName);
                // todo -> check with context + type ???
            }
            {
                const indexName = await getCollectionTriggerIndex().createIndex({
                        context: 1,
                        aggregate: 1,
                    },
                    {
                        name: "context_aggregate",
                    });
                indexList.push(indexName);
            }
            // Trigger Index -> STATS
            {
                const indexName = await getCollectionTriggerIndex().createIndex({
                        error: 1,
                        context: 1,
                        aggregate: 1,
                    },
                    {
                        name: "stats.error_true",
                        partialFilterExpression: {
                            error: true,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionTriggerIndex().createIndex({
                        checkForUpdates: 1,
                        context: 1,
                        aggregate: 1,
                    },
                    {
                        name: "stats.checkForUpdates_true",
                        partialFilterExpression: {
                            checkForUpdates: true,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionTriggerIndex().createIndex({
                        running: 1,
                        context: 1,
                        aggregate: 1,
                    },
                    {
                        name: "stats.running_true",
                        partialFilterExpression: {
                            running: true,
                        },
                    });
                indexList.push(indexName);
            }
            {
                const indexName = await getCollectionTriggerIndex().createIndex({
                        paused: 1,
                        context: 1,
                        aggregate: 1,
                    },
                    {
                        name: "stats.paused_true",
                        partialFilterExpression: {
                            paused: true,
                        },
                    });
                indexList.push(indexName);
            }

            // ---------------------------------------------------------------------------------------------------------
            // Stats Context Aggregate
            {
                const indexName = await getCollectionStatsContextAggregate().createIndex({
                        type: 1,
                    },
                    {
                        name: "type",
                    });
                indexList.push(indexName);
            }


        } catch (e) {
            console.error("ERROR: checkIndexes():", e.message)
            await storeError(__filename, 437, "checkIndexes", e)
            return false
        }
    } else {

        // ---------------------------------------------------------------------------------------------------------
        // ---------------------------------------------------------------------------------------------------------
        // ---------------------------------------------------------------------------------------------------------
        // ---------------------------------------------------------------------------------------------------------
        // ---------------------------------------------------------------------------------------------------------
        // ---------------------------------------------------------------------------------------------------------

        // Data Stream
        {
            const indexName = await getCollectionDataStream().createIndex({
                    context: 1,
                    "dispatched": 1,
                    "createdAt": 1,
                },
                {
                    name: "Alice_findEventToDispatch_v2",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        // todo -> add drop index Alice_findEventToDispatch
        {
            const indexName = await getCollectionDataStream().createIndex({
                    "streamId": 1,
                    "sequenceNumber": -1,
                },
                {
                    name: "Alice_getLastDataEvent",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionDataStream().createIndex({
                    "streamId": 1,
                    "sequenceNumber": 1,
                },
                {
                    name: "Alice_findEventToProcess",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionDataStream().createIndex({
                    context: 1,
                    aggregate: 1,
                    dispatched: 1,
                    linkEventId: 1
                },
                {
                    name: "Alice_getDataIndexOverview",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        // Data Index
        {
            const indexName = await getCollectionDataIndex().createIndex({
                    context: 1,
                    aggregate: 1
                },
                {
                    name: "Alice_getDataIndexOverview",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        // Command Index
        {
            const indexName = await getCollectionCommandIndex().createIndex({
                    "context": 1,
                    "handled": 1,
                    "running": 1,
                    "paused": 1,
                    "priority": -1,
                    "createdAt": 1,
                },
                {
                    name: "Alice_findCommandToProcess_v2",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        // todo -> add drop index Alice_findCommandToProcess
        {
            const indexName = await getCollectionCommandIndex().createIndex({
                    context: 1,
                    aggregate: 1
                },
                {
                    name: "Alice_getCommandIndexOverview_1",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionCommandIndex().createIndex({
                    context: 1,
                    aggregate: 1,
                    ok: 1,
                },
                {
                    name: "Alice_getCommandIndexOverview_2",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionCommandIndex().createIndex({
                    context: 1,
                    aggregate: 1,
                    multiInvoke: 1,
                },
                {
                    name: "Alice_getCommandIndexOverview_3",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionCommandIndex().createIndex({
                    context: 1,
                    aggregate: 1,
                    handled: 1,
                },
                {
                    name: "Alice_getCommandIndexOverview_4",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionCommandIndex().createIndex({
                    context: 1,
                    aggregate: 1,
                    running: 1,
                },
                {
                    name: "Alice_getCommandIndexOverview_5",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionCommandIndex().createIndex({
                    context: 1,
                    aggregate: 1,
                    paused: 1,
                },
                {
                    name: "Alice_getCommandIndexOverview_6",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionCommandIndex().createIndex({
                    context: 1,
                    aggregate: 1,
                    command: 1,
                    subscription: 1,
                },
                {
                    name: "Alice_reInvokeSubscription",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        // Trigger Index
        {
            const indexName = await getCollectionTriggerIndex().createIndex({
                    "context": 1,
                    "checkForUpdates": 1,
                    "running": 1,
                    "error": 1,
                    "lastRunAt": 1,
                    "type": 1,
                },
                {
                    name: "Alice_findTriggerToProcess_v2",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        // todo -> add drop index Alice_findTriggerToProcess
        {
            const indexName = await getCollectionTriggerIndex().createIndex({
                    "streamType": 1,
                    "streamId": 1,
                },
                {
                    name: "Alice_updateTriggerIndex",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionTriggerIndex().createIndex({
                    context: 1,
                    aggregate: 1
                },
                {
                    name: "Alice_getTriggerIndexOverview_1",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionTriggerIndex().createIndex({
                    context: 1,
                    aggregate: 1,
                    ok: 1
                },
                {
                    name: "Alice_getTriggerIndexOverview_2",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionTriggerIndex().createIndex({
                    context: 1,
                    aggregate: 1,
                    checkForUpdates: 1
                },
                {
                    name: "Alice_getTriggerIndexOverview_3",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionTriggerIndex().createIndex({
                    context: 1,
                    aggregate: 1,
                    running: 1
                },
                {
                    name: "Alice_getTriggerIndexOverview_4",
                });
            log("DataStream().createIndex(%s)", indexName);
            indexList.push(indexName);
        }
    }

// streamId
    return indexList;
};

module.exports = {
    checkIndexes,
    // EVENT_STREAM_COLLECTION_PREFIX,
    // EVENT_STREAM_POSITION_COLLECTION_PREFIX,

};
