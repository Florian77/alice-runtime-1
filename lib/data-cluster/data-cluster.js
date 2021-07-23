const md5 = require('md5');
const R = require('ramda');
const baseConverter = require('./base-converter');


function DataCluster(depth) {

    const generateClusterId = R.pipe(
        R.toString,
        md5,
        R.slice(0, depth),
        baseConverter.hex2dec
    );

    // init dataStore cluster shelf's
    const dataStore = R.fromPairs(
        R.map(
            n => ([n, []])
        )(R.range(0, Math.pow(16, depth)))
    );

    const addData = (id, data) => {
        dataStore[generateClusterId(id)].push(data);
    };

    const getCluster = () => dataStore;

    const getClusterPairs = () => R.toPairs(dataStore);

    return {
        addData,
        getCluster,
        getClusterPairs
    }
}


module.exports = {
    DataCluster
};