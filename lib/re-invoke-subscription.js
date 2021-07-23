const dc = require("node-dev-console");
const R = require("ramda");
const {updateManyCommands} = require("./update-many-commands");


async function reInvokeSubscription({
                                        context,
                                        aggregate,
                                        command,
                                        subscription,
                                        priority = null,
                                    }) {

    let set = {
        handled: false
    };
    if (!R.isNil(priority) && R.is(Number, priority)) {
        set = R.assoc("priority", priority, set);
    }
    return updateManyCommands({
            context,
            aggregate,
            command,
        },
        set,
        {
            subscription
        });
}


module.exports = {
    reInvokeSubscription,
};
