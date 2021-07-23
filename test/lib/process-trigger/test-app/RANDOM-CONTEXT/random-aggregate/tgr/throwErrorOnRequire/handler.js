
require("package-that-not-exists-123");

throw Error("my Error");

const throwErrorOnRequire = async (event, env) => {
};


module.exports = throwErrorOnRequire;


