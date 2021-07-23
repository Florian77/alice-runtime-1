const dc = require("node-dev-console");
const R = require("ramda");


function makeCommandId(context, aggregate, command, invokeId, uniqueId = null) {
    return R.join("/",
        R.filter(
            R.allPass([
                R.complement(R.isNil),
                R.complement(R.isEmpty),
            ]), [context, aggregate, command, invokeId, uniqueId]
        )
    );
}


module.exports = {
    makeCommandId
};
