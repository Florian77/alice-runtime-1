const R = require("ramda");
const dc = require("node-dev-console");


const callLog = () => {
    /** @type {array} */
    let _callLog = [];

    /**
     * add entry to call log
     * @param {string} callType
     * @param {*} payload
     */
    const add = (callType, payload) => {
        _callLog.push({
            callType,
            payload,
        })
    };

    /**
     * return array of log entries with given call type
     * @param {string} callType
     * @return {array}
     */
    const getByCallType = callType => {
        return R.pipe(
            R.filter(R.propEq("callType", callType)),
            R.map(R.prop("payload"))
        )(_callLog);
    };

    /**
     * clear current call log
     */
    const clear = () => {
        _callLog = [];
    };

    /**
     * returns full call log
     * @return {Array}
     */
    const getAll = () => _callLog;

    /**
     * internal default display log entry function
     * @param {string} callType
     * @param {object} payload
     */
    const displayLogEntry = ({callType, payload}) => dc.j(payload, `Log: ${callType}`);

    /**
     * display all log entries with given function fn
     * @param {function} fn
     */
    const displayAll = (fn = displayLogEntry) => R.map(fn, _callLog);

    return {
        add,
        getByCallType,
        clear,
        getAll,
        displayAll,
    }
};


module.exports = {
    callLog
};