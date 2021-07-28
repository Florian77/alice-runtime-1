function someThingProcessed(result) {
    return result.totalProcessedCommands > 0
        || result.totalsDispatchedEvents > 0
        || result.totalProcessedTrigger > 0
        || result.totalProcessedEvents > 0;
}


module.exports = {
    someThingProcessed
};
