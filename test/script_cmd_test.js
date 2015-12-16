/**
 * http://usejsdoc.org/
 */
var Client = require('../lib/client.js').Client;
var utils = require('util'), baseCmdTest = require('./base_cmd_test'), assert = require("assert"), params = require("../lib/params.js");
var fs = require('fs');
function ScriptCmdTest() {
	if (!(this instanceof ScriptCmdTest)) {
		return new ScriptCmdTest();
	}
	baseCmdTest.BaseCmdTest.call(this);

}
utils.inherits(ScriptCmdTest, baseCmdTest.BaseCmdTest);
var baseProto = baseCmdTest.BaseCmdTest.prototype;

ScriptCmdTest.prototype = {
	testScript : function() {
		this.client.flushAll();

		this.client.eval('return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}', 2, [
				'key1', 'key2', 'first', 'second' ], function(resp, err) {
			console.log(resp);
		});
	},
	testScript1 : function() {
		this.client.flushAll();

		var lua_file = 'str_cmd.lua';

		var script = fs.readFileSync(lua_file, "utf-8");

		this.client.eval(script, 1, [ 'key1', 'value1' ], function(resp, err) {
			console.log(resp);
		});
		this.client.get('key1', function(resp, err) {
			console.log(resp);
		});
	},
	testScript2 : function() {
		this.client.flushAll();
		var key = 'key';
		for (var i = 0; i < 97; i++) {
			var value = "value-" + i;
			this.client.lPush(key, value);
		}

		var lua_file = 'list_lru_cmd.lua';
		var maxLen = 100;
		var script = fs.readFileSync(lua_file, "utf-8");
		this.client.eval(script, 1, [ 'key', 'value98', maxLen ]);
		this.client.eval(script, 1, [ 'key', 'value99', maxLen ]);
		this.client.eval(script, 1, [ 'key', 'value100', maxLen ]);
		this.client.eval(script, 1, [ 'key', 'value101', maxLen ]);
		this.client.eval(script, 1, [ 'key', 'value102', maxLen ]);

		this.client.lLen(key, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 100);
			});
		});
	},
	testScript3 : function() {
		this.client.flushAll();
		this.client.scriptFlush();
		var lua_file = 'list_lru_cmd.lua';
		var maxLen = 100;
		var script = fs.readFileSync(lua_file, "utf-8");
		var cli = this.client;
		this.client.scriptLoad(script, function(resp, err) {
			var sha = resp;
			cli.evalSha(sha, 1, [ 'key', 'value98', maxLen ]);
			cli.scriptExist(sha, function(resp, err) {
				console.log(resp);
			});
		});
	},
	testScript4 : function() {
		this.client.flushAll();
		this.client.scriptFlush();
		var lua_file = 'list_lru_clear.lua';
		var key1 = 'key1';
		for (var i = 1; i < 105; i++) {
			var value = "value1" + i;
			this.client.lPush(key1, value);
		}
		var key2 = 'key2';
		for (i = 1; i < 105; i++) {
			var value2 = "value2" + i;
			this.client.lPush(key2, value2);
		}
		var script = fs.readFileSync(lua_file, "utf-8");
		this.client.eval(script, 0, function(resp, err) {
			console.log(resp);
		});

		this.client.lLen(key1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 100);
			});
		});

		this.client.lLen(key2, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 100);
			});
		});
	}
};
var tester = new ScriptCmdTest();
if (typeof describe === "function") {
	describe("ScriptCmd", function() {
		describe("#eval", function() {
			it("eval command", function() {
				tester.testScript();
			});
		});
	});
	describe("ScriptCmd", function() {
		describe("#eval", function() {
			it("eval command", function() {
				tester.testScript1();
			});
		});
	});
	describe("ScriptCmd", function() {
		describe("#eval", function() {
			it("eval command", function() {
				tester.testScript2();
			});
		});
	});
	describe("ScriptCmd", function() {
		describe("#scriptFlush,#scriptLoad,#evalSha,#scriptExist", function() {
			it("eval command", function() {
				tester.testScript3();
			});
		});
	});
	describe("ScriptCmd", function() {
		describe("#scriptFlush,#scriptFlush", function() {
			it("eval command", function() {
				tester.testScript4();
			});
		});
	});
} else {
	tester.testScript();
	tester.testScript1();
	tester.testScript2();
	tester.testScript3();
	tester.testScript4();
}