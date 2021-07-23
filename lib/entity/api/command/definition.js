const R = require("ramda");
const dc = require("node-dev-console");

const fn = async (alice, entityConfig, {query, body}) => {


    const {
        // context,
        // aggregate,
        entityId,
        entityValue,
    } = entityConfig;


    return {
        statusCode: 200,
        body: {
            entityId: {
                ...entityId
            },
            entityValue: {
                ...entityValue,
            }
        }
    };


};


module.exports = fn;
