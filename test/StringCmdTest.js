/**
 * http://usejsdoc.org/
 */

'use strict';
var utils = require('util'), baseCmdTest = require('./BaseCmdTest'), assert = require("assert");
function StringCmdTest() {
	baseCmdTest.BaseCmdTest.call(this);
}
utils.inherits(StringCmdTest, baseCmdTest.BaseCmdTest);

var baseProto = baseCmdTest.BaseCmdTest.prototype;
StringCmdTest.prototype = {
	test_set : function() {
		this.client.flushAll();
		this.client.set("key1", "value1", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, "OK");
			});
		});
		this.client.set("key2", "value2", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, "OK");
			});
		});
	},
	test_get : function() {
		this.client.flushAll();
		var cli = this.client;
		cli.set("key1", "value1");
		cli.get("key1", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, "value1");
			});
		});
		cli.get("key2", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, "null");
			});
		});
	},
	test_del : function() {
		this.client.flushAll();
		this.client.del("key1", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});
		this.client.set("key1", "value1");
		this.client.del("key1", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
		this.client.set("key1", "value1");
		this.client.set("key2", "value2");

		this.client.del([ "key1", "key2" ], function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2);
			});
		});
	},
	test_keys : function() {
		this.client.flushAll();
		this.client.keys("key*", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 0);
			});
		});
		this.client.set("key1", "value1");
		this.client.set("key2", "value2");

		this.client.keys("key*", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 2);
			});
		});
	}
};

var tester = new StringCmdTest();
if (typeof describe == "function") {
	describe("StringCmd", function() {
		describe("#set", function() {
			it("redis set command", function() {
				tester.test_set();
			})
		});
		describe("#get", function() {
			it("redis get command", function() {
				tester.test_get();
			})
		});
		describe("#del", function() {
			it("redis del command", function() {
				tester.test_del();
			})
		});
		describe("#keys", function() {
			it("redis keys command", function() {
				tester.test_keys();
			})
		});
	});
} else {
	tester.test_set();
	tester.test_get();
	tester.test_del();
	tester.test_keys();
}