const dc = require("node-dev-console");
const R = require("ramda");
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
const {storeError} = require("./database");


// todo -> check docs

// https://docs.mongodb.com/manual/core/index-compound/
// https://docs.mongodb.com/manual/tutorial/manage-indexes/
// https://docs.mongodb.com/manual/core/index-wildcard/
// https://docs.mongodb.com/manual/core/index-partial/
// https://docs.mongodb.com/manual/core/index-sparse
//
//

async function checkIndexes() {
    const result = await listCollections({"type": "collection"}, {nameOnly: true}).toArray();
    // dcl("getContextList().listCollections().result", dc.stringify(result));
    const existingCollections = R.map(R.prop("name"), result);
    // dcl("existingCollections", dc.stringify(existingCollections));
    for (const collection of COLLECTION_LIST) {
        if (!R.includes(collection, existingCollections)) {
            await createCollection(collection);
            // dcl("createCollection(%s)", collection);
        }
    }
    let indexList = [];

    try {

        // ---------------------------------------------------------------------------------------------------------
        // Command Index
        // const dropCommandIndexList = [
        //     "stats.multiInvoke_true",
        //     "stats.running_true",
        //     "stats.paused_true",
        //     "stats.ok_false",
        //     "stats.handled_false",
        //     "stats.handled_false_paused_false",
        // ];
        // for (let indexName of dropCommandIndexList) {
        //     try {
        //         if (await getCollectionCommandIndex().indexExists(indexName)) {
        //             const dropResult = await getCollectionCommandIndex().dropIndex(indexName);
        //             // console.log("dropResult", dropResult)
        //         }
        //     } catch (e) {
        //         console.error("getCollectionCommandIndex().dropIndex()", indexName, e);
        //         await storeError(__filename, 59, "checkIndexes", e)
        //     }
        // }
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
        // // Command Index -> STATS
        // {
        //     const indexName = await getCollectionCommandIndex().createIndex({
        //             multiInvoke: 1,
        //             context: 1,
        //             aggregate: 1,
        //             command: 1,
        //         },
        //         {
        //             name: "stats.multiInvoke_true_v2",
        //             partialFilterExpression: {
        //                 multiInvoke: true,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        // {
        //     const indexName = await getCollectionCommandIndex().createIndex({
        //             running: 1,
        //             context: 1,
        //             aggregate: 1,
        //             command: 1,
        //         },
        //         {
        //             name: "stats.running_true_v2",
        //             partialFilterExpression: {
        //                 running: true,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        // {
        //     const indexName = await getCollectionCommandIndex().createIndex({
        //             paused: 1,
        //             context: 1,
        //             aggregate: 1,
        //             command: 1,
        //         },
        //         {
        //             name: "stats.paused_true_v2",
        //             partialFilterExpression: {
        //                 paused: true,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        // {
        //     const indexName = await getCollectionCommandIndex().createIndex({
        //             ok: 1,
        //             context: 1,
        //             aggregate: 1,
        //             command: 1,
        //         },
        //         {
        //             name: "stats.ok_false_v2",
        //             partialFilterExpression: {
        //                 ok: false,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        // {
        //     const indexName = await getCollectionCommandIndex().createIndex({
        //             handled: 1,
        //             context: 1,
        //             aggregate: 1,
        //             command: 1,
        //         },
        //         {
        //             name: "stats.handled_false_v2",
        //             partialFilterExpression: {
        //                 handled: false,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        // {
        //     const indexName = await getCollectionCommandIndex().createIndex({
        //             handled: 1,
        //             paused: 1,
        //             context: 1,
        //             aggregate: 1,
        //             command: 1,
        //         },
        //         {
        //             name: "stats.handled_false_paused_false_v2",
        //             partialFilterExpression: {
        //                 handled: false,
        //                 paused: false,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        //
        //
        // // ---------------------------------------------------------------------------------------------------------
        // // Data Stream
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
        // {
        //     const indexName = await getCollectionDataStream().createIndex({
        //             streamId: 1,
        //             sequenceNumber: -1,
        //         },
        //         {
        //             name: "getLastDataEvent",
        //         });
        //     indexList.push(indexName);
        // }
        {
            const indexName = await getCollectionDataStream().createIndex({
                    context: 1,
                    aggregate: 1,
                    aggregateId: 1,
                    sequenceNumber: -1,
                },
                {
                    name: "dataEventByAggregateId",
                });
            indexList.push(indexName);
        }
        {
            const indexName = await getCollectionDataStream().createIndex({
                    context: 1,
                    aggregate: 1,
                    aggregateSequenceNumber: -1,
                },
                {
                    name: "dataEventByAggregate",
                });
            indexList.push(indexName);
        }
        // {
        //     const indexName = await getCollectionDataStream().createIndex({
        //             dispatched: 1,
        //             streamId: 1,
        //             sequenceNumber: 1,
        //         },
        //         {
        //             name: "findEventToProcess",
        //             partialFilterExpression: {
        //                 dispatched: true,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        // // Data Stream -> STATS
        // {
        //     const indexName = await getCollectionDataStream().createIndex({
        //             dispatched: 1,
        //             context: 1,
        //             aggregate: 1,
        //         },
        //         {
        //             name: "stats.dispatched_false",
        //             partialFilterExpression: {
        //                 dispatched: false,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        //
        //
        // // ---------------------------------------------------------------------------------------------------------
        // // Data Index
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
        //
        //
        // // ---------------------------------------------------------------------------------------------------------
        // // Trigger Index
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
                        // running: false,
                        // error: false,
                        // paused: false,
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
        // // Trigger Index -> STATS
        // {
        //     const indexName = await getCollectionTriggerIndex().createIndex({
        //             error: 1,
        //             context: 1,
        //             aggregate: 1,
        //         },
        //         {
        //             name: "stats.error_true",
        //             partialFilterExpression: {
        //                 error: true,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        // {
        //     const indexName = await getCollectionTriggerIndex().createIndex({
        //             checkForUpdates: 1,
        //             context: 1,
        //             aggregate: 1,
        //         },
        //         {
        //             name: "stats.checkForUpdates_true",
        //             partialFilterExpression: {
        //                 checkForUpdates: true,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        // {
        //     const indexName = await getCollectionTriggerIndex().createIndex({
        //             running: 1,
        //             context: 1,
        //             aggregate: 1,
        //         },
        //         {
        //             name: "stats.running_true",
        //             partialFilterExpression: {
        //                 running: true,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        // {
        //     const indexName = await getCollectionTriggerIndex().createIndex({
        //             paused: 1,
        //             context: 1,
        //             aggregate: 1,
        //         },
        //         {
        //             name: "stats.paused_true",
        //             partialFilterExpression: {
        //                 paused: true,
        //             },
        //         });
        //     indexList.push(indexName);
        // }
        //
        // // ---------------------------------------------------------------------------------------------------------
        // // Stats Context Aggregate
        // {
        //     const indexName = await getCollectionStatsContextAggregate().createIndex({
        //             type: 1,
        //         },
        //         {
        //             name: "type",
        //         });
        //     indexList.push(indexName);
        // }


    } catch (e) {
        console.error("ERROR: checkIndexes():", e.message)
        await storeError(__filename, 437, "checkIndexes", e)
        return false
    }


// streamId
    return indexList;
}


module.exports = {
    checkIndexes,
    // EVENT_STREAM_COLLECTION_PREFIX,
    // EVENT_STREAM_POSITION_COLLECTION_PREFIX,

};
