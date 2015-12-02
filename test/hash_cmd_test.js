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
	}
};
var tester = new HashCmdTest();
if (typeof describe === "function") {
	describe("HashCmdTest", function() {
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
	});
} else {
	tester.test_hset();
	tester.test_hsetNX();
	tester.test_hget();
	tester.test_hgetall();
	tester.test_hdel();
}