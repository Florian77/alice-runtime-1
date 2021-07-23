const dc = require("node-dev-console");
const u = require("../../../../lib/utility");
const R = require("ramda");
const {calcMetaData} = require("../_lib");


function backup_Command({
                            context,
                            aggregate,
                            // entityValue,
                        }) {

    return async (command, env) => {
        // dc.j(command, "backup_Command.command");

        const invokeId = u.getInvokeId(command);
        // dc.t(invokeId, "invokeId");

        const filter = {
            _id: invokeId,
        };

        const collectionView = env.getCollectionBackup(`entity_${context}_${aggregate}`);


        // ---------------------------------------------------------------------------------
        // Load -> this Aggregate
        const dataEvent = await env.getLastDataEvent({
            context,
            aggregate,
            aggregateId: u.getInvokeId(command),
        });


        // ---------------------------------------------------------------------------------
        // delete data
        if (!u.aggregateExists(dataEvent)) {
            const result = await collectionView.deleteOne(filter);
            // dc.j(result, "DELETE result");

            const dataDeleted = {
                action: "deleted",
                ok: R.pathOr(-1, ["result", "ok"], result),
                deletedCount: R.propOr(-1, "deletedCount", result), // verify ???
            };
            // dc.j(dataChanged, "dataChanged");

            return u.returnCmdSuccess({
                ...dataDeleted,
            });
        }


        // ---------------------------------------------------------------------------------
        // replace data
        const payload = u.getPayload(dataEvent);
        // dc.j(payload, "payload");

        // Store Data in Mongo
        const replace = {
            ...payload
        };
        const options = {
            upsert: true
        };
        // dc.l("replaceOne(filter:%s, replace:%s, options:%s)", dc.stringify(filter), dc.stringify(replace), dc.stringify(options));
        const result = await collectionView.replaceOne(filter, replace, options);
        // dc.j(result, "REPLACE result");
        // dc.l("replaceOne()", ftDev.mongoReplaceOne(result), dc.stringify(result));


        // ---------------------------------------------------------------------------------
        const dataReplaced = {
            action: "replaced",
            ok: R.pathOr(-1, ["result", "ok"], result),
            modifiedCount: R.propOr(-1, "modifiedCount", result),
            upsertedId: R.propOr(-1, "upsertedId", result),
            upsertedCount: R.propOr(-1, "upsertedCount", result),
            matchedCount: R.propOr(-1, "matchedCount", result),
        };
        // dc.j(dataChanged, "dataChanged");

        return u.returnCmdSuccess({
            ...dataReplaced,
        });

    };
}

module.exports = backup_Command;
