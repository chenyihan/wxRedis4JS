/**
 * http://usejsdoc.org/
 */
'use strict';
var Client = require('../lib/client.js').Client;
var utils = require('util'), baseCmdTest = require('./BaseCmdTest'), assert = require("assert"), params = require("../lib/params.js");
function KeyCmdTest() {
	if (!(this instanceof KeyCmdTest)) {
		return new KeyCmdTest();
	}
	baseCmdTest.BaseCmdTest.call(this);
}
utils.inherits(KeyCmdTest, baseCmdTest.BaseCmdTest);
var baseProto = baseCmdTest.BaseCmdTest.prototype;
KeyCmdTest.prototype = {
	test_dump : function() {
		this.client.flushAll();

		this.client.dump("key1", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, "null");
			});
		});

		this.client.set("key1", "value1");

		this.client.dump("key1", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.notEqual(resp, "null");
			});
		});
	},
	test_expire : function() {
		this.client.flushAll();
		var seconds = 10;
		this.client.expire('key1', seconds, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.notEqual(resp, 1);
			});
		});

		this.client.set('key1', 'value1');
		this.client.expire('key1', seconds, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.ttl('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp <= seconds, true);
			});
		});
	},
	test_expireAt : function() {
		this.client.flushAll();
		var ts = 2355292000;
		this.client.expireAt('key1', ts, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.notEqual(resp, 1);
			});

		});

		this.client.set('key1', 'value1');
		this.client.expireAt('key1', ts, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.ttl('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp <= ts, true);
			});
		});
	},
	test_migrate : function() {
		this.client.flushAll();
		var destHost = '192.168.1.105';
		var destPort = 6379;

		var destClient = new Client({
			host : destHost,
			port : destPort
		});
		destClient.flushAll();

		this.client.set('key1', 'value1');

		var cli = this.client;
		this.client.migrate('key1', destHost, destPort, 0, 10, function(resp,
				err) {
			if (!err) {

				cli.exists('key1', function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 0);
					});
				});

				destClient.get('key1', function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 'value1');
					});
				});
			}
		});
	},
	test_move : function() {
		var cli = this.client;
		cli.flushAll();

		cli.set('key1', 'value1');

		cli.move('key1', 1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});

		});

		cli.get('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'null');
			});
		});

	},
	test_object : function() {
		this.client.flushAll();

		this.client.set('key1', 'value1');
		this.client.objectRefcount('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.objectIdletime('key1', function(resp, err) {
			console.log("idle time:" + resp);
		});

		this.client.get('key1');
		this.client.objectIdletime('key1', function(resp, err) {
			console.log("idle time:" + resp);
		});

		this.client.objectEncoding('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'raw');
			});
		});

		this.client.set('key1', 158201332432423);
		this.client.objectEncoding('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'raw');
			});
		});

		this.client.set('key1', 20);
		this.client.objectEncoding('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'int');
			});
		});
	},
	test_persist : function() {
		this.client.flushAll();

		this.client.set('key1', 'value1');
		this.client.expire('key1', 10);

		this.client.ttl('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp > 0 && resp <= 10, true);
			});
		});

		this.client.persist('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, true);
			});
		});

		this.client.ttl('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, -1);
			});
		});
	},
	test_pexpire : function() {
		this.client.flushAll();
		var millSeconds = 10000;
		this.client.pExpire('key1', millSeconds, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, false);
			});
		});

		this.client.set('key1', 'value1');
		this.client.pExpire('key1', millSeconds, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, true);
			});
		});

		this.client.pTTL('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp <= millSeconds, true);
			});
		});
	},
	test_PExpireAt : function() {
		this.client.flushAll();
		var ts = 2355292000000;
		this.client.pExpireAt('key1', ts, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, false);
			});
		});

		this.client.set('key1', 'value1');
		this.client.pExpireAt('key1', ts, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, true);
			});
		});

		this.client.pTTL('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp <= ts, true);
			});
		});
	},
	test_randomKey : function() {
		this.client.flushAll();

		this.client.randomKey(function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'null');
			});
		});

		this.client.set('key1', 'value1');
		this.client.set('key2', 'value2');

		this.client.randomKey(function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.notEqual(resp, 'null');
				assert.equal(resp == 'key1' || resp == 'key2', true);
			});
		});
	},
	test_rename : function() {
		this.client.flushAll();

		this.client.rename('key1', 'key2', function(resp, err) {
			console.log(err.message);
		});

		this.client.set('key1', 'value1');
		this.client.rename('key1', 'key2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'OK');
			});
		});

		this.client.exists('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, false);
			});
		});

		this.client.exists('key2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, true);
			});
		});

		this.client.set('key3', 'value3');
		this.client.set('key4', 'value4');

		this.client.rename('key3', 'key4', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'OK');
			});
		});

		this.client.get('key3', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'null');
			});
		});

		this.client.get('key4', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value3');
			});
		});
	},
	test_renameNX : function() {
		this.client.flushAll();

		this.client.renameNX('key1', 'key2', function(resp, err) {
			console.log(err.message);
		});

		this.client.set('key1', 'value1');
		this.client.set('key2', 'value2');

		this.client.renameNX('key1', 'key2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.renameNX('key1', 'key3', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
	},
	test_restore : function() {
		var cli = this.client;
		cli.flushAll();

		cli.set('key1', 'value1');
		cli.dump('key1', function(resp, err) {
			cli.restore('key2', resp, 0, false, function(resp, err) {
				baseProto.dealCmdResult(resp, err, function() {
					assert.equal(resp, 'OK');
				});
			});
		});
	},
	test_sort : function() {
		this.client.flushAll();

		this.client.lPush('key1',
				[ '25', '3', '5', '4', '55', '34', '15', '2' ]);
		this.client.sort('key1', null, null, function(resp, err) {
			console.log(resp);
		});

		this.client.sort('key1', new params.SortingParams().desc(), null,
				function(resp, err) {
					console.log(resp);
				});

		this.client.sort('key1', new params.SortingParams().alpha(), null,
				function(resp, err) {
					console.log(resp);
				});

		this.client.sort('key1', new params.SortingParams().limit(2, 4), null,
				function(resp, err) {
					console.log(resp);
				});

		this.client.flushAll();
		this.client.lPush('key1',
				[ '25', '3', '5', '4', '55', '34', '15', '2' ]);

		this.client.sort('key1', null, 'key2', function(resp, err) {
			console.log(resp);
		});

	}
};

var tester = new KeyCmdTest();
if (typeof describe === "function") {
	describe("KeyCmdTest", function() {
		describe("#dump", function() {
			it("Redis dump command", function() {
				tester.test_dump();
			});
		});
		describe("#expire", function() {
			it("Redis expire command", function() {
				tester.test_expire();
			});
		});
		describe("#expireAt", function() {
			it("Redis expireAt command", function() {
				tester.test_expireAt();
			});
		});
		describe("#migrate", function() {
			it("Redis migrate command", function() {
				tester.test_migrate();
			});
		});
		describe("#move", function() {
			it("Redis move command", function() {
				tester.test_move();
			});
		});
		describe("#object", function() {
			it("Redis object command", function() {
				tester.test_object();
			});
		});
		describe("#persist", function() {
			it("Redis persist command", function() {
				tester.test_persist();
			});
		});
		describe("#pexpire", function() {
			it("Redis pexpire command", function() {
				tester.test_pexpire();
			});
		});
		describe("#PExpireAt", function() {
			it("Redis PExpireAt command", function() {
				tester.test_PExpireAt();
			});
		});
		describe("#randomKey", function() {
			it("Redis randomKey command", function() {
				tester.test_randomKey();
			});
		});
		describe("#rename", function() {
			it("Redis rename command", function() {
				tester.test_rename();
			});
		});
		describe("#renameNX", function() {
			it("Redis renameNX command", function() {
				tester.test_renameNX();
			});
		});
		describe("#restore", function() {
			it("Redis restore command", function() {
				tester.test_restore();
			});
		});
	});
} else {
	// tester.test_dump();
	// tester.test_expire();
	// tester.test_expireAt();
	// tester.test_migrate();
	// tester.test_move();
	// tester.test_object();
	// tester.test_persist();
	// tester.test_pexpire();
	// tester.test_PExpireAt();
	// tester.test_randomKey();
	// tester.test_rename();
	// tester.test_renameNX();
	// tester.test_restore();
	tester.test_sort();
}