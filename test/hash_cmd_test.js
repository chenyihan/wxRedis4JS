/**
 * http://usejsdoc.org/
 */

var Client = require('../lib/client.js').Client;
var utils = require('util'), baseCmdTest = require('./base_cmd_test'), assert = require("assert"), params = require("../lib/params.js");
function HashCmdTest() {
	if (!(this instanceof HashCmdTest)) {
		return new HashCmdTest();
	}
	baseCmdTest.BaseCmdTest.call(this);

}
utils.inherits(HashCmdTest, baseCmdTest.BaseCmdTest);
var baseProto = baseCmdTest.BaseCmdTest.prototype;
HashCmdTest.prototype = {
	test_hset : function() {
		this.client.flushAll();

		this.client.hSet('key1', 'field1', 'value1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.hSet('key1', 'field1', 'value1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.hSet('key1', 'field2', 'value2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
	},
	test_hsetNX : function() {
		this.client.flushAll();

		this.client.hSetNX('key1', 'field1', 'value1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.hSetNX('key1', 'field1', 'value2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});
	},
	test_hget : function() {
		this.client.flushAll();

		this.client.hGet('hkey1', 'field1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'null');
			});
		});

		this.client.hSet('hkey1', 'field1', 'value1');

		this.client.hGet('hkey1', 'field1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value1');
			});
		});
	},
	test_hgetall : function() {
		this.client.flushAll();

		this.client.hSet('hkey1', 'field1', 'value1');
		this.client.hSet('hkey1', 'field2', 'value2');
		this.client.hSet('hkey1', 'field3', 'value3');

		this.client.hGetAll('hkey1', function(resp, err) {
			console.log(resp);
		});
	},
	test_hdel : function() {
		this.client.flushAll();

		this.client.hSet('hkey1', 'field1', 'value1');

		this.client.hGet('hkey1', 'field1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value1');
			});
		});

		this.client.hDel('hkey1', 'field1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
		this.client.hGet('hkey1', 'field1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'null');
			});
		});

		this.client.hDel('hkey1', 'field1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});
	},
	test_hexist : function() {
		this.client.flushAll();

		this.client.hExist('hkey1', 'field1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.hSet('hkey1', 'field1', 'value1');
		this.client.hExist('hkey1', 'field1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
	},
	test_hincrby : function() {
		this.client.flushAll();

		this.client.hIncrBy('hkey1', 'hfield1', 200, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 200);
			});
		});

		this.client.hSet('hkey1', 'hfield1', 2);
		this.client.hIncrBy('hkey1', 'hfield1', 200, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 202);
			});
		});
	},
	test_hincrByFloat : function() {
		this.client.flushAll();

		this.client.hIncrByFloat('hkey1', 'hfield1', 200.01,
				function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 200.01);
					});
				});

		this.client.hSet('hkey1', 'hfield1', 2.2);
		this.client.hIncrByFloat('hkey1', 'hfield1', 200.01,
				function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 202.21);
					});
				});
	},
	test_hkeys : function() {
		this.client.flushAll();

		this.client.hKeys('hkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.hSet('hkey1', 'field1', 'value1');
		this.client.hSet('hkey1', 'field2', 'value2');
		this.client.hSet('hkey1', 'field3', 'value3');

		this.client.hKeys('hkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
			});
		});
	},
	test_hvals : function() {
		this.client.flushAll();

		this.client.hVals('hkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 0);
			});
		});

		this.client.hSet('hkey1', 'field1', 'value1');
		this.client.hSet('hkey1', 'field2', 'value2');
		this.client.hSet('hkey1', 'field3', 'value3');

		this.client.hVals('hkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
			});
		});
	},
	test_hlen : function() {
		this.client.flushAll();

		this.client.hLen('hkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.hSet('hkey1', 'field1', 'value1');
		this.client.hSet('hkey1', 'field2', 'value2');
		this.client.hSet('hkey1', 'field3', 'value3');

		this.client.hLen('hkey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});
	},
	test_hmset : function() {
		this.client.flushAll();

		this.client.hMSet('hkey1', [ {
			field : "hfield1",
			value : "hvalue1"
		}, {
			field : "hfield2",
			value : "hvalue2"
		}, {
			field : "hfield3",
			value : "hvalue3"
		} ], function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'OK');
			});
		});

		this.client.hGetAll('hkey1', function(resp, err) {
			console.log(resp);
		});
	},
	test_hmget : function() {
		this.client.flushAll();

		this.client.hMSet('hkey1', [ {
			field : "hfield1",
			value : "hvalue1"
		}, {
			field : "hfield2",
			value : "hvalue2"
		}, {
			field : "hfield3",
			value : "hvalue3"
		} ]);
		this.client.hMGet('hkey1',
				[ 'hfield1', 'hfield3', 'hfield3', 'hfield4' ], function(resp,
						err) {
					console.log(resp);
				});
	},
	test_hscan : function() {
		this.client.flushAll();

		this.client.hSet('key1', 'field1', 'value1');
		this.client.hSet('key1', 'field2', 'value2');
		this.client.hSet('key1', 'field3', 'value3');
		this.client.hSet('key1', 'field4', 'value4');
		this.client.hSet('key1', 'field5', 'value5');
		this.client.hSet('key1', 'field6', 'value6');
		this.client.hSet('key1', 'field7', 'value7');
		this.client.hSet('key1', 'field8', 'value8');
		this.client.hSet('key1', 'field9', 'value9');
		this.client.hSet('key1', 'field10', 'value10');
		this.client.hSet('key1', 'field11', 'value11');
		this.client.hSet('key1', 'field12', 'value12');
		this.client.hSet('key1', 'field13', 'value13');
		this.client.hSet('key1', 'field14', 'value14');
		this.client.hSet('key1', 'field15', 'value15');
		this.client.hSet('key1', 'field16', 'value16');
		this.client.hSet('key1', 'field17', 'value17');
		this.client.hSet('key1', 'field18', 'value18');
		this.client.hSet('key1', 'field19', 'value19');
		this.client.hSet('key1', 'field20', 'value20');
		this.client.hSet('key1', 'field21', 'value21');
		this.client.hSet('key1', 'field22', 'value22');
		this.client.hSet('key1', 'field23', 'value23');
		this.client.hSet('key1', 'field24', 'value24');
		this.client.hSet('key1', 'field25', 'value25');
		this.client.hSet('key1', 'field26', 'value26');
		this.client.hSet('key1', 'field27', 'value27');
		this.client.hSet('key1', 'field28', 'value28');
		this.client.hSet('key1', 'field29', 'value29');
		this.client.hSet('key1', 'field30', 'value30');

		var cursor = 0;
		var count = 5;

		this.client.hScan('key1', cursor, new params.ScanParams().count(count),
				function(resp, err) {
					console.log("cursor:" + resp.cursor);
					// console.log("results:" + resp.results);
					var results = resp.results;
					for (var i = 0; i < results.length; i++) {
						console.log(results[i]);
					}
					// console.log("resp" + resp);
				});
	}
};
var tester = new HashCmdTest();
if (typeof describe === "function") {
	describe("HashCmd", function() {
		describe("#hSet", function() {
			it("Redis hSet command", function() {
				tester.test_hset();
			});
		});
		describe("#hsetNX", function() {
			it("Redis hsetNX command", function() {
				tester.test_hsetNX();
			});
		});
		describe("#hget", function() {
			it("Redis hget command", function() {
				tester.test_hget();
			});
		});
		describe("#hgetall", function() {
			it("Redis hgetall command", function() {
				tester.test_hgetall();
			});
		});
		describe("#hdel", function() {
			it("Redis hdel command", function() {
				tester.test_hdel();
			});
		});

		describe("#hexist", function() {
			it("Redis hexist command", function() {
				tester.test_hexist();
			});
		});
		describe("#hincrby", function() {
			it("Redis hincrby command", function() {
				tester.test_hincrby();
			});
		});
		describe("#hincrbyfloat", function() {
			it("Redis hincrbyfloat command", function() {
				tester.test_hincrByFloat();
			});
		});
		describe("#hkeys", function() {
			it("Redis hkeys command", function() {
				tester.test_hkeys();
			});
		});
		describe("#hvals", function() {
			it("Redis hvals command", function() {
				tester.test_hvals();
			});
		});
		describe("#hlen", function() {
			it("Redis hlen command", function() {
				tester.test_hlen();
			});
		});
		describe("#hmset", function() {
			it("Redis hmset command", function() {
				tester.test_hmset();
			});
		});
		describe("#hmget", function() {
			it("Redis hmget command", function() {
				tester.test_hmget();
			});
		});
		describe("#hscan", function() {
			it("Redis hscan command", function() {
				tester.test_hscan();
			});
		});
	});
} else {
	tester.test_hset();
	tester.test_hsetNX();
	tester.test_hget();
	tester.test_hgetall();
	tester.test_hdel();
	tester.test_hexist();
	tester.test_hincrby();
	tester.test_hincrByFloat();
	tester.test_hkeys();
	tester.test_hvals();
	tester.test_hlen();
	tester.test_hmset();
	tester.test_hmget();
	tester.test_hscan();
}