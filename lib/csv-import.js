const R = require("ramda");
const csvToJson = require('csvtojson');
const request = require('request');
const FtpClient = require('ftp');
const {createReadStream} = require("fs");
const {emitCommand} = require("./emit-command");
const dc = require("node-dev-console");


const ftpStream = ({connection, filePath}) => {
    return new Promise((resolve, reject) => {

        const client = new FtpClient();
        client.on('ready', () => {
            client.get(filePath, (err, stream) => {
                if (err) {
                    reject(err)
                }

                stream.once('close', () => {
                    client.end();
                });

                resolve(stream);
                // stream.pipe(fs.createWriteStream('foo.local-copy.txt'));
            });
        });
        // connect to localhost:21 as anonymous
        client.connect(connection);

    })
};

const csvImport = async (importJobList, options = {}) => {

    // Make array if not provided
    importJobList = R.is(Array, importJobList) ? importJobList : [importJobList];
    // dcl("csvImport(importJobList:%s, options:%s)", dc.stringify(importJobList), dc.stringify(options));

    // TODO -> Filter importJobList active !== true

    const importResult = await Promise.all(R.map(
        async importJob => {
            // dcl("importJob", dc.stringify(importJob));
            const {
                active = true,
                importMaxRows = false, // For Debugging and first imports
                context,
                aggregate,
                command,
                invokeId = false,
                invokeIdFunction = false,
                priority = null,
                paused = null,
                source,
                csvOptions,
                useItemFilterFunction = false,
                itemFilterFunction = () => false,
                useConvertPayloadFunction = false,
                convertPayloadFunction = payload => payload,
            } = importJob;

            if (!active) {
                // dcl("%s/%s [command=%s] -> [active=%s]", context, aggregate, command, active);
                return {
                    active,
                    context,
                    aggregate,
                    command,
                    total: 0,
                    importMaxRows,
                };
            }


            let stream = false;
            switch (source.type) {
                case "file":
                    stream = createReadStream(source.filePath);
                    break;
                case "request.get":
                    stream = request.get(source.url);
                    break;
                case "ftp":
                    stream = await ftpStream(source);
                    break;
            }
            if (!stream) {
                // TODO -> Handle Error
                return [];
            }

            let result = await csvToJson(csvOptions).fromStream(stream);
            // dcl("%s/%s [command=%s] -> result.length=%s", context, aggregate, command, R.length(result));
            // dcl("%s/%s [command=%s] -> result[0]", context, aggregate, command, dc.stringify(result[0]));

            if (importMaxRows && importMaxRows > 0) {
                result = R.slice(0, importMaxRows, result);
                // dcl("%s/%s [command=%s] -> [importMaxRows=]", context, aggregate, command, importMaxRows);
            }

            let commandConfig = {};
            if(!R.isNil(priority)){
                commandConfig["priority"] = priority;
            }
            if(!R.isNil(paused)){
                commandConfig["paused"] = paused;
            }

            const useFilterFunction = (useItemFilterFunction === true && isFunction(itemFilterFunction));
            for (let item of result) {
                // dc.j(item, "item");
                // dc.l("itemFilterFunction(item)=%s", itemFilterFunction(item));
                if (
                    useFilterFunction === false
                    || itemFilterFunction(item)
                ) {
                    let payload = {...item};
                    if (useConvertPayloadFunction) {
                        payload = convertPayloadFunction(payload);
                    }
                    const result = await emitCommand({
                        context,
                        aggregate,
                        command,
                        invokeId: (invokeId)
                            ? invokeId
                            : (invokeIdFunction instanceof Function)
                                ? invokeIdFunction(item)
                                : null,
                        ...commandConfig,
                        payload: {
                            ...payload
                        }
                    });
                    // dcl("emitCommand().result", dc.stringify(result));
                }

            }

            return {
                active,
                context,
                aggregate,
                command,
                total: R.length(result),
                importMaxRows,
            }
        },
        importJobList
    ));
    // dcl("importResult", dc.stringify(importResult));

    // TODO -> Add Option -> commit after all successful imported

    return importResult;
};

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

module.exports = {
    csvImport,
};
