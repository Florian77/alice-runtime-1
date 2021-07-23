const R = require("ramda");
const dc = require("node-dev-console");


const fn = async (alice, entityConfig, {query, body}, functionPath) => {

    const {
        context,
        aggregate,
        entityId,
        // entityValue,
    } = entityConfig;


    let {idData, data: payload} = body;
    // dc.j(idData, "idData");
    // dc.j(payload, "payload");

    idData = R.pipe(
        R.toPairs,
        R.map(R.evolve({1: R.trim})),
        R.fromPairs
    )(idData)
    // dc.j(idData, "idData");

    for (let {code} of entityId.fieldList) {
        const value = R.propOr(null, code, idData);
        if (R.isNil(value) || R.isEmpty(value)) {
            return {
                statusCode: 200,
                body: {ok: false, ack: "error", message: `idData field [${code}] missing`}
            };
        }
    }

    const keyOrder = R.map(R.prop("code"), entityId.fieldList);
    // dc.j(keyOrder, "keyOrder");

    const aggregateId = alice.utility.stringifyId(keyOrder, idData);

    // const requestData = requestSchema.cast(body);
    // dc.j(requestData, "requestData");

    const {_id: commandId} = await alice.emitCommand({
        context,
        aggregate,
        command: "createIfNotExists",
        invokeId: aggregateId,
        payload: {
            ...payload
        }
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
            entityId: aggregateId,
            result: R.propOr("", "resultMsg", commandResult)
        }
    };

};


module.exports = fn;
