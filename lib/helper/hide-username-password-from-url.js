const dc = require("node-dev-console");

const hideUsernamePasswordFromUrl = url => {
    // dc.l("INPUT", url);
    try {
        const urlParts = new URL(url);

        // dc.j(urlParts.protocol);
        // dc.j(urlParts.username);
        // dc.j(urlParts.password, "password");
        // dc.j(urlParts.host);
        // dc.j(urlParts.pathname);
        // dc.j(urlParts.search);
        // dc.j(urlParts.hash);
        //
        // let newParts = [];
        // if (!R.isEmpty(urlParts.protocol)) {
        //     newParts.push(urlParts.protocol)
        // }
        // newParts.push("//");
        //
        // const retUrl = (urlParts.protocol ? urlParts.protocol : "" )
        //     + "//"
        //     + (urlParts.username !== "" ? markUsername(urlParts.username) : "")
        //     + (urlParts.password !== "" ? ":xxx" : "")
        //    + (urlParts.username !== "" || urlParts.password !== "" ? "@" : "")
        //     + urlParts.hostname
        //     + urlParts.pathname
        //     + urlParts.search
        //     + urlParts.hash;

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
    // const rUrl = urlParts.toString();
    // dc.j(rUrl, "rUrl");
    // return rUrl;
};

module.exports = {
    hideUsernamePasswordFromUrl
};