const {expect} = require('chai');
const dc = require("node-dev-console");
const R = require('ramda');
const {DataCluster} = require('../../../index');

dc.activate();


describe('lib/data-cluster', function () {

    // -----------------------------------------------------------------------------------------------------------------------------
    beforeEach(async function () {
        dc.l("---------------", this.currentTest.title, "---------------");
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('Empty Cluster(1)', async function () {
        const cluster = new DataCluster(1);

        const result = cluster.getCluster();
        dc.j(result, "TEST result");

        expect(result).to.deep.equal({
            "0": [],
            "1": [],
            "2": [],
            "3": [],
            "4": [],
            "5": [],
            "6": [],
            "7": [],
            "8": [],
            "9": [],
            "10": [],
            "11": [],
            "12": [],
            "13": [],
            "14": [],
            "15": []
        });
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('Cluster(1) with 10 items', async function () {
        const cluster = new DataCluster(1);
        R.range(0,10).forEach( n => {
            cluster.addData(n, n);
        });

        const result = cluster.getCluster();
        dc.j(result, "TEST result");

        expect(result).to.deep.equal(require("./data/cluster-1-10_result.json"));
    });

    // -----------------------------------------------------------------------------------------------------------------------------
    it('Cluster(2) with 100 items', async function () {
        const cluster = new DataCluster(2);
        R.range(0,100).forEach( n => {
            cluster.addData(n, n);
        });

        const result = cluster.getCluster();
        dc.j(result, "TEST result");

        expect(result).to.deep.equal(require("./data/cluster-2-100_result.json"));
    });


});

