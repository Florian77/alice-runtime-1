const alice = require('../../../index');
const R = require("ramda");
const {clearDatabase} = require('alice-runtime-test-helper');
const {resolve} = require("path");
const expect = require('chai').expect;

process.env.DEV_CONSOLE_ON = 1;
const dc = require("node-dev-console");

// const testHandler = require('./handler');

alice.loadRuntimeConfig(__dirname, "local");

let doClearDatabase = false;
// doClearDatabase = true;

// const functionPath = resolve(__dirname, "app"),
//     context = "CNTXT",
//     aggregate = "aggt",
//     command = "doIt";

// TODO -> add async !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const resultOkTrue = {ok: true};

const testHandler = function* (command, env) {
    // dc.j(command, "testHandler().command");
    const res1 = yield env.callback("callback-key-1").emitCommand({command: "ABC"});
    dc.j(res1, "res1");
    // res1 -> emitCommand Error
    // res1 -> emitCommand Result
    const res2 = yield env.callback("callback-key-2").emitCommand({command: "XYZ"});
    dc.j(res2, "res2");
    return resultOkTrue;
};
const testHandlerNoYield = function* (command, env) {
    // dc.j(command, "testHandler().command");
    return resultOkTrue;
};
const mockCommandEnvironment = () => {
    let lastKey = null;

    let emitCommandLog = {};
    const emitCommand = (command) => {
        dc.j(command, "emitCommand()");
        // TODO basic command validation
        // TODO check: darf nicht doppelt existieren
        // sonst -> fatal error
        emitCommandLog[lastKey] = command;
        return lastKey; //"emitCommand().result";
    };
    const getEmitCommandLog = () => {
        return emitCommandLog;
    };
    const callback = (key) => {
        dc.l("callback(key=%s)", key);
        lastKey = key;
        return {
            emitCommand
        };
    };
    let callbackDb = {};
    const dbAddCallbackResult = (key, data) => {
        callbackDb[key] = data;
    };
    const dbGetCallbackResult = key => callbackDb[key];
    const dbHasCallbackResult = R.has(R.__, callbackDb);
    const dbLogData = () => {
        dc.j(callbackDb, "callbackDb");
    };
    return {
        callback,
        dbAddCallbackResult,
        dbHasCallbackResult,
        dbGetCallbackResult,
        dbLogData,
        getEmitCommandLog,
    }
};
const testProcess = (handler, command, env) => {

    const gen = handler(command, env);
    let counter = 0;

    // first call
    const genResult = gen.next();

    if (genResult.done) {
        return {
            done: true,
            counter,
            result: genResult.value,
        }
    }

    let {done, value: callbackKey} = genResult;


    while (!done) {

        // later calls -> check result exists
        if (env.dbHasCallbackResult(callbackKey)) {
            dc.l("dbHasCallbackResult(%s) === TRUE", callbackKey);
            counter += 1;

            const input = env.dbGetCallbackResult(callbackKey);
            dc.j(input, `input[${counter}]`);
            const genResult = gen.next(input);
            done = genResult.done;
            callbackKey = genResult.value;
            dc.l("next() [done=%s] [genResult.value=%s]", genResult.done, genResult.value);
            if (genResult.done) {
                return {
                    done: true,
                    error: false,
                    counter,
                    result: genResult.value,
                }
            }

        } else {
            dc.l("dbHasCallbackResult(%s) === FALSE", callbackKey);
            return {
                done: false,
                error: false,
                counter,
                result: null,
            }
        }

        if (counter > 100) {
            done = true;
        }
    }

    // TODO -> Make better
    return {
        done: true,
        error: true,
        counter,
        result: null,
    }
};

const command = {
    invokeId: "id=12&u=abc-123",
    payload: {
        aggregateId: "id=12"
    },
};

describe('process development v1', function () {


    // -------------------------------------------------------------------------------------------------------
    it('start process, empty ENV', async function () {
        const env = mockCommandEnvironment();

        const processResult = testProcess(testHandler, command, env);

        dc.j(processResult, "processResult");
        expect(processResult).to.be.deep.equal({
            done: false,
            counter: 0,
            result: null
        });

        dc.j(env.getEmitCommandLog(), "env.getEmitCommandLog()");
        expect(env.getEmitCommandLog()).to.be.deep.equal({
            "callback-key-1": {
                command: "ABC"
            }
        });
    });

    // -------------------------------------------------------------------------------------------------------
    it('continue process, first result ENV', async function () {
        const env = mockCommandEnvironment();
        env.dbAddCallbackResult("callback-key-1", {
            ok: true,
            resultMsg: ["successful command result message"]
        });
        // env.dbLogData();

        const processResult = testProcess(testHandler, command, env);

        dc.j(processResult, "processResult");
        expect(processResult).to.be.deep.equal({
            done: false,
            counter: 1,
            result: null
        });

    });

    // -------------------------------------------------------------------------------------------------------
    it('continue process, all result ENV', async function () {
        const env = mockCommandEnvironment();
        env.dbAddCallbackResult("callback-key-1", {
            ok: true,
            resultMsg: ["successful command result message"]
        });
        env.dbAddCallbackResult("callback-key-2", {
            ok: true,
            resultMsg: ["successful command result message"]
        });
        // env.dbLogData();

        const processResult = testProcess(testHandler, command, env);

        dc.j(processResult, "processResult");
        expect(processResult).to.be.deep.equal({
            done: true,
            counter: 2,
            result: resultOkTrue
        });

    });


    // -------------------------------------------------------------------------------------------------------
    it('process without yield in handler', async function () {
        const env = mockCommandEnvironment();

        const processResult = testProcess(testHandlerNoYield, command, env);

        dc.j(processResult, "processResult");
        expect(processResult).to.be.deep.equal({
            done: true,
            counter: 0,
            result: resultOkTrue
        });
    });


});

