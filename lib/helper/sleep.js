function sleep(milliseconds) {
    return new Promise(r => setTimeout(r, milliseconds))
}

module.exports = {
    sleep,
};
