const R = require("ramda");
const dc = require("node-dev-console");
const yup = require("yup");

const querySchema = yup.object().shape({
    page: yup.number().integer().min(0).max(1000).default(0),
    rows: yup.number().integer().min(1).max(500).default(25),
});




const fn = async (alice, entityConfig, {query, body}) => {
    // dc.j(query, "query");

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


    const queryData = querySchema.cast(query);
    // dc.j(queryData, "queryData");

    const {page, rows} = queryData;
    const skip = Number(page) * Number(rows);

    let indexQuery = {
        context,
        aggregate,
        "index.deleted": false
    };

    let orList = [];
    if(R.propEq("isNew", "1", query)) {
        orList.push({
            "index.isNew": true
        });
    }
    if(R.propEq("isPartial", "1", query)) {
        orList.push({
            "index.isPartial": true
        });
    }
    if(R.propEq("isComplete", "1", query)) {
        orList.push({
            "index.isComplete": true
        });
    }
    if (!R.isEmpty(orList)) {
        indexQuery["$or"] = orList;
    }
    const searchQuery = R.propOr(null, "searchQuery", query);
    // dc.t(searchQuery, "searchQuery");
    if (!R.isNil(searchQuery) && !R.isEmpty(searchQuery)) {
        indexQuery["aggregateId"] = {
            $regex: searchQuery
        };
    }
    // dc.j(indexQuery, "indexQuery");


    let sortSequenceNumber = -1; // default: sequenceNumber|desc
    if(R.propEq("sort", "sequenceNumber|asc", query)) {
        sortSequenceNumber = 1;
    }
    // dc.t(sortSequenceNumber, "sortSequenceNumber");

    const queryResult = await alice.queryDataIndex(indexQuery, {
        getLastEvent: true,
        skip: skip,
        limit: rows,
        sort: {
            sequenceNumber: sortSequenceNumber
        }
    });
    // dc.j(queryResult, "queryResult");


    const entityList = R.map(entity => ({
        id: alice.utility.getAggregateId(entity),
        parsedId: alice.utility.parseAggregateId(entity),
        data: alice.utility.getPayload(entity),
        sequenceNumber: entity.sequenceNumber,
    }), queryResult);
    // dc.j(entityList, "entityList");

    const entityCount = await alice.countDataIndex(indexQuery);

    return {
        statusCode: 200,
        body: {
            entityList: [
                ...entityList
            ],
            entityCount,
            entityId,
            entityValue,
        }
    };


};


module.exports = fn;
