const R = require("ramda");
const dc = require("node-dev-console");
const yup = require("yup");


const querySchema = yup.object().shape({
    id: yup.string().required(),
});

const fn = async (alice, entityConfig, {query, body}) => {

    if (!await querySchema.isValid(query)) {
        return {
            statusCode: 200,
            body: {ok: false, ack: "error", message: "invalid parameter"},
        };
    }

    const {
        context,
        aggregate,
        entityId,
        entityValue,
    } = entityConfig;



    const {id: aggregateId} = query;
    // dc.t(aggregateId, "aggregateId");

    const dataEvent = await alice.getLastDataEvent({
        context,
        aggregate,
        aggregateId,
    });
    // dc.t(dataEvent, "dataEvent");

    if (!alice.utility.aggregateExists(dataEvent)) {
        return {
            statusCode: 200,
            body: {ok: false, ack: "error", message: "entity not found"},
        };
    }

    const entityData = alice.utility.getPayload(dataEvent);
    // dc.j(entityData, "entityData");


    return {
        statusCode: 200,
        body: {
            id: alice.utility.getAggregateId(dataEvent),
            parsedId: alice.utility.parseAggregateId(dataEvent),
            entityData,
            entityId,
            entityValue,
        }
    };


};


module.exports = fn;
