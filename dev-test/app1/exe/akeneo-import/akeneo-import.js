require('../../app1-env');
const ftDev = require('ftws-node-dev-tools');
const {jsonString} = ftDev;
const alice = require('../../../../index');

// Command: updateAggregateIfChanged ???

require("debug").log = console.log.bind(console);
const _loggerNs = "app:exe:akeneoImport";
const _logger = require("debug")(_loggerNs);
const log = _logger.extend("log");
const debug = _logger.extend("debug");
require("debug").enable(""
    + ",*:log"
    // +",*:debug"
    + `,${_loggerNs}:log`
    + `,${_loggerNs}:debug`
    // + ",alice:processTrigger:debug"
    // + ",alice:processCommands:debug"
    // + ",alice:storeDataEvent:debug"
    + ",alice:db:connect"
);

(async () => {
    log("start process");
    try {
        await alice.connect(); // Connect to Database

        const command = {
            context: "akeneo",
            aggregate: "import-products",
            command: "updateOnChange",
            invokeId: "sku=401511",
            payload: {
                sku: "401511",
                data: {
                    "name": "Stahl Briefkasten UPDATE " + (new Date()).toISOString(),
                    "description": "Dieser pulverbeschichtete Stahlbriefkasten mit seiner klaren Linie.",
                    "shortDescription": "Dieser pulverbeschichtete Stahlbriefkasten .",
                    "shipment": "<ul><li>Briefkasten mit 2 Schlüsseln</li><li>Montagematerial</li></ul>",
                    "technicality": "<ul><li>Totalmaße (BxTxH): ca. 215 x 90 x 320 mm</li><li>Namensfenster (BxH): ca. 75 x 30 mm</li></ul>",
                    "highlight1": "Stahlbriefkasten pulverbeschichtet",
                    "highlight2": "Front mit Namensschild",
                    "highlight3": "Montage mit mehreren Briefkästen zu einer Briefkastenanlage möglich",
                }
            }
        };
        debug("alice.emitCommand(%s)", jsonString(command));
        const result = await alice.emitCommand(command);
        debug("alice.emitCommand().result", jsonString(result));

        {
            const command = {
                context: "akeneo",
                aggregate: "import-products",
                command: "updateOnChange",
                invokeId: "sku=203040",
                payload: {
                    sku: "203040",
                    data: {
                        "name": "ALU Briefkasten " + (new Date()).toISOString(),
                        "description": "super geil!",
                        "shortDescription": "Briefkasten",
                        "shipment": "<ul><li>Briefkasten</li></ul>",
                        "technicality": "<ul><li>Totalmaße (BxTxH): ca. 215 x 90 x 320 mm</li><li>Namensfenster (BxH): ca. 75 x 30 mm</li></ul>",
                        "highlight1": "Stahlbriefkasten pulverbeschichtet",
                        "highlight2": "Front mit Namensschild",
                        "highlight3": "Montage mit mehreren Briefkästen zu einer Briefkastenanlage möglich",
                    }
                }
            };
            debug("alice.emitCommand(%s)", jsonString(command));
            const result = await alice.emitCommand(command);
            debug("alice.emitCommand().result", jsonString(result));
        }

    } catch (e) {
        console.error(e);
    }
    await alice.disconnect();
    log("process completed");
})();
