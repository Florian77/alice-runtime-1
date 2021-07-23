const dc = require("node-dev-console");

const hideUsernamePasswordFromUrl = url => {
    // dc.l("INPUT", url);
    try {
        const urlParts = new URL(url);

        if (urlParts.username !== "") {
            const username = String(urlParts.username);
            urlParts.username = username.length > 6 ? username.slice(0, 3).concat("xxx") : "xxx";
        }
        if (urlParts.password !== "") {
            urlParts.password = "xxx";
        }

        return urlParts.toString();
    } catch (e) {
        // dc.l(e);
        return url;
    }
};

module.exports = {
    hideUsernamePasswordFromUrl
};
