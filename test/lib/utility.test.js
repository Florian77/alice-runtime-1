const expect = require('chai').expect;
const dc = require("node-dev-console");
const {utility} = require("../../index");

dc.activate();


describe('lib/utility.js', function () {

    it('get_id', function () {
        {
            const result = utility.get_id({_id: "ID"});
            dc.j(result, "get_id -> result");
            expect(result).to.be.equal("ID");
        }
        {
            const result = utility.get_id({});
            dc.j(result, "get_id -> result");
            expect(result).to.be.null;
        }
    });

    it('getStreamId', function () {
        {
            const result = utility.getStreamId({streamId: "STREAM/ID"});
            dc.j(result, "getStreamId -> result");
            expect(result).to.be.equal("STREAM/ID");
        }
        {
            const result = utility.getStreamId({});
            dc.j(result, "getStreamId -> result");
            expect(result).to.be.null;
        }
    });

    it('getContext', function () {
        {
            const result = utility.getContext({context: "CONTEXT_NAME"});
            dc.j(result, "getContext -> result");
            expect(result).to.be.equal("CONTEXT_NAME");
        }
        {
            const result = utility.getContext({});
            dc.j(result, "getContext -> result");
            expect(result).to.be.null;
        }
    });

    it('getAggregate', function () {
        {
            const result = utility.getAggregate({aggregate: "AGGREGATE_NAME"});
            dc.j(result, "getAggregate -> result");
            expect(result).to.be.equal("AGGREGATE_NAME");
        }
        {
            const result = utility.getAggregate({});
            dc.j(result, "getAggregate -> result");
            expect(result).to.be.null;
        }
    });

    it('getAggregateId', function () {
        {
            const result = utility.getAggregateId({aggregateId: "AGGREGATE_ID"});
            dc.j(result, "getAggregateId -> result");
            expect(result).to.be.equal("AGGREGATE_ID");
        }
        {
            const result = utility.getAggregateId({});
            dc.j(result, "getAggregateId -> result");
            expect(result).to.be.null;
        }
    });

    it('getCommand', function () {
        {
            const result = utility.getCommand({command: "COMMAND"});
            dc.j(result, "getCommand -> result");
            expect(result).to.be.equal("COMMAND");
        }
        {
            const result = utility.getCommand({});
            dc.j(result, "getCommand -> result");
            expect(result).to.be.null;
        }
    });

    it('getInvokeId', function () {
        {
            const result = utility.getInvokeId({invokeId: "INVOKE_ID"});
            dc.j(result, "getInvokeId -> result");
            expect(result).to.be.equal("INVOKE_ID");
        }
        {
            const result = utility.getInvokeId({});
            dc.j(result, "getInvokeId -> result");
            expect(result).to.be.null;
        }
    });

    it('getUniqueId', function () {
        {
            const result = utility.getUniqueId({uniqueId: "INVOKE_ID"});
            dc.j(result, "getUniqueId -> result");
            expect(result).to.be.equal("INVOKE_ID");
        }
        {
            const result = utility.getUniqueId({});
            dc.j(result, "getUniqueId -> result");
            expect(result).to.be.null;
        }
    });

    it('getVersion', function () {
        {
            const result = utility.getVersion({version: "1"});
            dc.j(result, "getVersion -> result");
            expect(result).to.be.equal("1");
        }
        {
            const result = utility.getVersion({});
            dc.j(result, "getVersion -> result");
            expect(result).to.be.a("string");
            expect(result).to.be.empty;
        }
    });

    it('getPayload', function () {
        {
            const result = utility.getPayload({payload: {data: true}});
            dc.j(result, "getPayload -> result");
            expect(result).to.be.deep.equal({data: true});
        }
        {
            const result = utility.getPayload({});
            dc.j(result, "getPayload -> result");
            expect(result).to.be.a("object");
            expect(result).to.be.empty;
        }
    });

    it('getSequenceNumber', function () {
        {
            const result = utility.getSequenceNumber({sequenceNumber: 1});
            dc.j(result, "getSequenceNumber -> result");
            expect(result).to.be.equal(1);
        }
        {
            const result = utility.getSequenceNumber({});
            dc.j(result, "getSequenceNumber -> result");
            expect(result).to.be.null;
        }
    });

    it('getSubscription', function () {
        {
            const result = utility.getSubscription({subscription: ["idString"]});
            dc.j(result, "getSubscription -> result");
            expect(result).to.be.deep.equal(["idString"]);
        }
        {
            const result = utility.getSubscription({});
            dc.j(result, "getSubscription -> result");
            expect(result).to.be.a("array");
            expect(result).to.be.empty;
        }
    });

    it('isSubscriptionEmpty', function () {
        {
            const result = utility.isSubscriptionEmpty({subscription: ["idString"]});
            dc.j(result, "isSubscriptionEmpty -> result");
            expect(result).to.be.false;
        }
        {
            const result = utility.isSubscriptionEmpty({subscription: []});
            dc.j(result, "isSubscriptionEmpty -> result");
            expect(result).to.be.true;
        }
        {
            const result = utility.isSubscriptionEmpty({});
            dc.j(result, "isSubscriptionEmpty -> result");
            expect(result).to.be.true;
        }
    });

    it('getCallbackFrom', function () {
        {
            const result = utility.getCallbackFrom({callbackFrom: ["idString"]});
            dc.j(result, "getCallbackFrom -> result");
            expect(result).to.be.deep.equal(["idString"]);
        }
        {
            const result = utility.getCallbackFrom({});
            dc.j(result, "getCallbackFrom -> result");
            expect(result).to.be.a("array");
            expect(result).to.be.empty;
        }
    });

    it('isCallbackFromEmpty', function () {
        {
            const result = utility.isCallbackFromEmpty({callbackFrom: ["idString"]});
            dc.j(result, "isCallbackFromEmpty -> result");
            expect(result).to.be.false;
        }
        {
            const result = utility.isCallbackFromEmpty({callbackFrom: []});
            dc.j(result, "isCallbackFromEmpty -> result");
            expect(result).to.be.true;
        }
        {
            const result = utility.isCallbackFromEmpty({});
            dc.j(result, "isCallbackFromEmpty -> result");
            expect(result).to.be.true;
        }
    });

    it('isMultiInvokeCommand', function () {
        {
            const result = utility.isMultiInvokeCommand({multiInvoke: true});
            dc.j(result, "isMultiInvokeCommand -> result");
            expect(result).to.be.true;
        }
        {
            const result = utility.isMultiInvokeCommand({multiInvoke: false});
            dc.j(result, "isMultiInvokeCommand -> result");
            expect(result).to.be.false;
        }
        {
            const result = utility.isMultiInvokeCommand({});
            dc.j(result, "isMultiInvokeCommand -> result");
            expect(result).to.be.false;
        }
    });

    it('aggregateExists', function () {
        {
            const result = utility.aggregateExists(false);
            dc.j(result, "aggregateExists -> result");
            expect(result).to.be.false;
        }
        {
            const result = utility.aggregateExists({
                event: "Deleted"
            });
            dc.j(result, "aggregateExists -> result");
            expect(result).to.be.false;
        }
        {
            const result = utility.aggregateExists({});
            dc.j(result, "aggregateExists -> result");
            expect(result).to.be.true;
        }
    });

    it('makeSubscriptionId', function () {
        {
            const result = utility.makeSubscriptionId({
                context: "CXT",
                aggregate: "aggt",
                aggregateId: "id=1234",
            });
            dc.j(result, "makeSubscriptionId -> result");
            expect(result).to.be.equal("CXT/aggt?id=1234");
        }
    });

    it('parseAggregateId', function () {
        const result = utility.parseAggregateId({aggregateId: "x=1&y=2"});
        dc.j(result, "parseAggregateId -> result");
        expect(result).to.be.deep.equal({
            "x": "1",
            "y": "2"
        });
    });

    it('parseInvokeId, happy path', function () {
        const result = utility.parseInvokeId({invokeId: "x=1&y=2", payload: {}});
        dc.j(result, "parseInvokeId -> result");
        expect(result).to.be.deep.equal({
            "x": "1",
            "y": "2"
        });
    });

    it('parseInvokeId, missing prop invokeId', function () {
        const result = utility.parseInvokeId({payload: {}});
        dc.j(result, "parseInvokeId -> result");
        expect(result).to.be.deep.equal({});
    });

    // todo -> split test - with proper names
    it('stringifyId', function () {
        {
            const result = utility.stringifyId(["foo", "bar"], {bar: 123, foo: "abc", notUsed: "irrelevant"});
            dc.j(result, "stringifyId -> result 1");
            expect(result).to.be.equal("foo=abc&bar=123");
        }
        {
            const result = utility.stringifyId("bar", {bar: 123, foo: "abc", notUsed: "irrelevant"});
            dc.j(result, "stringifyId -> result 2");
            expect(result).to.be.equal("bar=123");
        }
        {
            try {
                const result = utility.stringifyId("bar", {foo: "abc"});
            } catch (e) {
                dc.j(e.message, "stringifyId -> result 3 e.message");
                expect(e.message).to.be.equal("stringifyId(): key [bar] missing in values");
            }
        }
        {
            const result = utility.stringifyId("bar", 123);
            dc.j(result, "stringifyId -> result 4");
            expect(result).to.be.equal("bar=123");
        }
    });

    // todo -> split test - with proper names
    it('returnCmdSuccess', function () {
        const resultValue = {
            ok: true,
            warning: false,
            resultMsg: ["message text"],
            subscription: ["id=123"],
            paused: false,
        };
        {
            const result = utility.returnCmdSuccess("message text", {subscription: "id=123"});
            dc.j(result, "returnCmdSuccess -> result 1");
            expect(result).to.be.deep.equal(resultValue);
        }
        {
            const result = utility.returnCmdSuccess(["message text"], {subscription: ["id=123"]});
            dc.j(result, "returnCmdSuccess -> result 2");
            expect(result).to.be.deep.equal(resultValue);
        }
        {
            const result = utility.returnCmdSuccess("my warning message", {warning: true, paused: true});
            dc.j(result, "returnCmdSuccess -> result 3");
            expect(result).to.be.deep.equal({ok: true, warning: true, resultMsg: ["my warning message"], subscription: [], paused: true});
        }
    });

    // todo -> split test - with proper names
    it('returnCmdError', function () {
        const resultValue = {
            ok: false,
            errorMsg: ["message text"],
            subscription: ["id=123"],
            paused: false,
        };
        {
            const result = utility.returnCmdError("message text", {subscription: "id=123"});
            dc.j(result, "returnCmdError -> result 1");
            expect(result).to.be.deep.equal(resultValue);
        }
        {
            const result = utility.returnCmdError(["message text"], {subscription: ["id=123"]});
            dc.j(result, "returnCmdError -> result 2");
            expect(result).to.be.deep.equal(resultValue);
        }
        {
            const result = utility.returnCmdError("message text", {paused: true});
            dc.j(result, "returnCmdError -> result 2");
            expect(result).to.be.deep.equal({
                ok: false,
                errorMsg: ["message text"],
                subscription: [],
                paused: true,
            });
        }
    });

});
