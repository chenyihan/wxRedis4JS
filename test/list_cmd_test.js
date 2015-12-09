/**
 * http://usejsdoc.org/
 */
'use strict';
var Client = require('../lib/client.js').Client;
var utils = require('util'), baseCmdTest = require('./base_cmd_test'), assert = require("assert"), params = require("../lib/params.js");
function ListCmdTest() {
	if (!(this instanceof ListCmdTest)) {
		return new ListCmdTest();
	}
	baseCmdTest.BaseCmdTest.call(this);
}

utils.inherits(ListCmdTest, baseCmdTest.BaseCmdTest);
var baseProto = baseCmdTest.BaseCmdTest.prototype;
ListCmdTest.prototype = {
	test_lpush : function() {
		this.client.flushAll();

		this.client.lPush('llkey1', 'llvalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.flushAll();
		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2' ], function(resp,
				err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2);
			});
		});
	},
	test_lpushX : function() {
		this.client.flushAll();

		this.client.lPushX('llkey1', 'llvalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2' ]);
		this.client.lPushX('llkey1', 'llvalue3', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});
	},
	test_lpop : function() {
		this.client.flushAll();

		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2' ]);

		this.client.lPop('llkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'llvalue2');
			});
		});

		this.client.lPop('llkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'llvalue1');
			});
		});
	},
	test_rpush : function() {
		this.client.flushAll();

		this.client.rPush('lrkey1', 'lrvalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.flushAll();
		this.client.rPush('lrkey1', [ 'lrvalue1', 'lrvalue2' ], function(resp,
				err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2);
			});
		});
	},
	test_rpushX : function() {
		this.client.flushAll();

		this.client.rPushX('lrkey1', 'lrvalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.rPush('lrkey1', [ 'lrvalue1', 'lrvalue2' ]);
		this.client.rPushX('lrkey1', 'llvalue3', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});
	},
	test_rpop : function() {
		this.client.flushAll();

		this.client.rPush('lrkey1', [ 'lrvalue1', 'lrvalue2' ]);

		this.client.rPop('lrkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'lrvalue2');
			});
		});
		this.client.rPop('lrkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'lrvalue1');
			});
		});
	},
	test_blpop : function() {
		this.client.flushAll();

		// this.client.blPop([ 'lrkey1', 'lrkey2' ], 5, function(resp, err) {
		// baseProto.dealCmdResult(resp, err, function() {
		// assert.equal(resp.length, 0);
		// });
		// });
		this.client.rPush('lrkey1', [ 'lrvalue1', 'lrvalue2' ]);
		this.client.blPop('lrkey1', 30, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 2);
				assert.equal(resp[0], 'lrkey1');
				assert.equal(resp[1], 'lrvalue1');
			});
		});
	},
	test_brpop : function() {
		this.client.flushAll();

		// this.client.brPop([ 'lrkey1', 'lrkey2' ], 5, function(resp, err) {
		// baseProto.dealCmdResult(resp, err, function() {
		// assert.equal(resp.length, 0);
		// });
		// });

		this.client.rPush('lrkey1', [ 'lrvalue1', 'lrvalue2' ]);
		this.client.brPop([ 'lrkey1', 'lrkey2' ], 5, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 2);
				assert.equal(resp[0], 'lrkey1');
				assert.equal(resp[1], 'lrvalue2');
			});
		});
	},
	test_lrange : function() {
		this.client.flushAll();

		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2', 'llvalue3' ]);

		this.client.lRange('llkey1', 0, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
				assert.equal(resp[0], 'llvalue3');
				assert.equal(resp[1], 'llvalue2');
				assert.equal(resp[2], 'llvalue1');
			});
		});

		this.client.lRange('llkey1', 0, 1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 2);
				assert.equal(resp[0], 'llvalue3');
				assert.equal(resp[1], 'llvalue2');
			});
		});

		this.client.lRange('llkey1', 0, 2, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
				assert.equal(resp[0], 'llvalue3');
				assert.equal(resp[1], 'llvalue2');
				assert.equal(resp[2], 'llvalue1');
			});
		});

		this.client.lRange('llkey1', 0, 3, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
				assert.equal(resp[0], 'llvalue3');
				assert.equal(resp[1], 'llvalue2');
				assert.equal(resp[2], 'llvalue1');
			});
		});
	},
	test_rpoplpush : function() {
		this.client.flushAll();
		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2', 'llvalue3' ]);
		this.client.lPush('llkey2', [ 'llvalue21', 'llvalue22', 'llvalue23' ]);

		this.client.rPopLPush([ 'llkey1', 'llkey2' ], function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'llvalue1');
			});
		});

		this.client.lRange('llkey1', 0, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
				assert.equal(resp[0], 'llvalue3');
				assert.equal(resp[1], 'llvalue2');
				assert.equal(resp[2], 'llvalue1');
			});
		});

		this.client.lRange('llkey2', 0, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
				assert.equal(resp[0], 'llvalue23');
				assert.equal(resp[1], 'llvalue22');
				assert.equal(resp[2], 'llvalue21');
			});
		});
	},
	test_brpoplpush : function() {
		this.client.flushAll();
		// this.client.bRPopLPush('llkey1', 'llkey2', 5);

		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2', 'llvalue3' ]);
		this.client.lPush('llkey2', [ 'llvalue21', 'llvalue22', 'llvalue23' ]);

		this.client.bRPopLPush('llkey1', 'llkey2', 5, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'llvalue1');
			});
		});
	},
	test_lindex : function() {
		this.client.flushAll();
		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2', 'llvalue3' ]);

		this.client.lIndex('llkey1', 0, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'llvalue3');
			});
		});

		this.client.lIndex('llkey1', 2, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'llvalue1');
			});
		});

		this.client.lIndex('llkey1', 4, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'null');
			});
		});
	},
	test_linsert : function() {
		this.client.flushAll();
		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2', 'llvalue3' ]);

		this.client.lInsert('llkey2', 'llvalue4', 'llvalue5', true, function(
				resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.lInsert('llkey1', 'llvalue4', 'llvalue5', true, function(
				resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, -1);
			});
		});

		this.client.lInsert('llkey1', 'llvalue4', 'llvalue2', true, function(
				resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 4);
			});
		});

		this.client.lRange('llkey1', 0, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 4);
			});
		});

		this.client.lInsert('llkey1', 'llvalue5', 'llvalue2', false, function(
				resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 5);
			});
		});

		this.client.lRange('llkey1', 0, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 5);
			});
		});
	},
	test_llen : function() {
		this.client.flushAll();

		this.client.lLen('llkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2', 'llvalue3' ]);

		this.client.lLen('llkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});
	},
	test_lrem : function() {
		this.client.flushAll();

		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2', 'llvalue3' ]);

		this.client.lrem('llkey1', 'llvalue1', 0, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.lRange('llkey1', 0, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 2);
			});
		});
	},
	test_lset : function() {
		this.client.flushAll();

		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2', 'llvalue3' ]);
		this.client.lSet('llkey1', 1, 'llvalue22', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, "OK");
			});
		});

		this.client.lRange('llkey1', 0, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
			});
		});

		this.client.lSet('llkey1', 3, 'llvalue4', function(resp, err) {
			console.log(resp);

		});

		this.client.lRange('llkey1', 0, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
			});
		});
	},
	test_ltrim : function() {
		this.client.flushAll();

		this.client.lPush('llkey1', [ 'llvalue1', 'llvalue2', 'llvalue3' ]);

		this.client.lTrim('llkey1', 1, 2, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, "OK");
			});
		});

		this.client.lRange('llkey1', 0, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 2);
			});
		});
	}
};
var tester = new ListCmdTest();
if (typeof describe === "function") {
	describe("ListCmd", function() {
		describe("#lpush", function() {
			it("Redis lpush command", function() {
				tester.test_lpush();
			});
		});
		describe("#lpushx", function() {
			it("Redis lpushx command", function() {
				tester.test_lpushX();
			});
		});
		describe("#lpop", function() {
			it("Redis lpop command", function() {
				tester.test_lpop();
			});
		});
		describe("#rpush", function() {
			it("Redis rpush command", function() {
				tester.test_rpush();
			});
		});
		describe("#rpushx", function() {
			it("Redis rpushx command", function() {
				tester.test_rpushX();
			});
		});
		describe("#rpop", function() {
			it("Redis rpop command", function() {
				tester.test_rpop();
			});
		});
		describe("#blpop", function() {
			it("Redis blpop command", function() {
				tester.test_blpop();
			});
		});
		describe("#blpop", function() {
			it("Redis blpop command", function() {
				tester.test_blpop();
			});
		});
		describe("#lrange", function() {
			it("Redis lrange command", function() {
				tester.test_lrange();
			});
		});
		describe("#rpoplpush", function() {
			it("Redis rpoplpush command", function() {
				tester.test_rpoplpush();
			});
		});
		describe("#brpoplpush", function() {
			it("Redis brpoplpush command", function() {
				tester.test_brpoplpush();
			});
		});
		describe("#lindex", function() {
			it("Redis lindex command", function() {
				tester.test_lindex();
			});
		});
		describe("#linsert", function() {
			it("Redis linsert command", function() {
				tester.test_linsert();
			});
		});
		describe("#llen", function() {
			it("Redis llen command", function() {
				tester.test_llen();
			});
		});
		describe("#lrem", function() {
			it("Redis lrem command", function() {
				tester.test_lrem();
			});
		});
		describe("#lset", function() {
			it("Redis lset command", function() {
				tester.test_lset();
			});
		});
		describe("#ltrim", function() {
			it("Redis ltrim command", function() {
				tester.test_ltrim();
			});
		});
	});
} else {
	tester.test_lpush();
	tester.test_lpushX();
	tester.test_lpop();
	tester.test_rpush();
	tester.test_rpushX();
	tester.test_rpop();
	tester.test_brpop();
	tester.test_blpop();
	tester.test_lrange();
	tester.test_rpoplpush();
	tester.test_brpoplpush();
	tester.test_lindex();
	tester.test_linsert();
	tester.test_llen();
	tester.test_lrem();
	tester.test_lset();
	tester.test_ltrim();
}