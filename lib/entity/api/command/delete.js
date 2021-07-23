const R = require("ramda");
const dc = require("node-dev-console");


const fn = async (alice, entityConfig, {query, body}, functionPath) => {

    const {
        context,
        aggregate,
        // entityId,
        // entityValue,
    } = entityConfig;


    const {id: aggregateId} = body;
    // dc.t(aggregateId, "aggregateId");

    // const requestData = requestSchema.cast(body);
    // dc.j(requestData, "requestData");

    const {_id: commandId} = await alice.emitCommand({
        context,
        aggregate,
        command: "delete",
        invokeId: aggregateId,
    });
    // dc.t(commandId, "commandId");

    await alice.process({functionPath});

    const commandResult = await alice.getCommand({commandId}); //getCollectionCommandIndex().findOne({_id});
    // dc.j(commandResult, "command result");

    // Error
    if (R.propEq("ok", false, commandResult)) {
        return {
            statusCode: 200,
            body: {ok: false, ack: "error", message: R.pathOr("Error without message", ["errorMsg", 0], commandResult)}
        };
    }

    // const orderId = R.pathOr(null, ["resultMsg", 0, "orderId"], commandResult);
    // dc.t(orderId, "orderId");

    return {
        statusCode: 200,
        body: {
            message: "command successful",
            result: R.propOr("", "resultMsg", commandResult)
        }
    };

};


module.exports = fn;
