/**
 * http://usejsdoc.org/
 */

'use strict';
var utils = require('util'), baseCmdTest = require('./BaseCmdTest'), assert = require("assert"), RedisKeyword = require("../lib/Keywords.js");
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
	},
	test_exists : function() {
		this.client.flushAll();
		this.client.exists("key1", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});
		this.client.set("key1", "value1");
		this.client.exists("key1", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
	},
	test_append : function() {
		this.client.flushAll();
		this.client.append("key1", "111", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});
		this.client.append("key1", "222", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 6);
			});
		});
	},
	test_bit : function() {
		this.client.flushAll();
		this.client.setBit("key1", 10086, 1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});
		this.client.getBit("key1", 10086, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
		this.client.bitCount("key1", null, null, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
		this.client.setBit("key1", 10086, 0, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
		this.client.getBit("key1", 10086, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});
		this.client.bitCount("key1", null, null, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

	},
	test_bitOp : function() {
		this.client.flushAll();

		this.client.setBit('key1', 0, 1);
		this.client.setBit('key1', 3, 1);
		this.client.setBit('key2', 0, 1);
		this.client.setBit('key2', 1, 1);
		this.client.setBit('key2', 3, 1);

		this.client.bitop(RedisKeyword.AND, 'key3', [ 'key1', 'key2' ],
				function(resp, err) {
					console.log(resp);
				});

		this.client.bitop(RedisKeyword.XOR, 'key4', [ 'key1', 'key2' ],
				function(resp, err) {
					console.log(resp);
				});

		this.client.bitop(RedisKeyword.OR, 'key5', [ 'key1', 'key2' ],
				function(resp, err) {
					console.log(resp);
				});

		this.client.bitop(RedisKeyword.NOT, 'key6', 'key1',
				function(resp, err) {
					console.log(resp);
				});
	},
	test_incr : function() {
		this.client.flushAll();
		this.client.incr("key1", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.set("key2", 43);
		this.client.incr("key2", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 44);
			});
		});

	},
	test_incrby : function() {
		this.client.flushAll();

		this.client.incrBy("key1", 2, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2);
			});
		});

		this.client.set("key2", 43);
		this.client.incrBy("key2", 4, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 47);
			});
		});
	},
	test_incrbyfloat : function() {
		this.client.flushAll();

		this.client.incrByFloat("key1", 2.1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2.1);
			});
		});

		this.client.set("key2", 43);
		this.client.incrByFloat("key2", 3.11, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 46.11);
			});
		});
	},
	test_decr : function() {
		this.client.flushAll();
		this.client.decr('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, -1);
			});
		});

		this.client.set('key2', 43);
		this.client.decr('key2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 42);
			});
		});
	},
	test_decrby : function() {
		this.client.flushAll();
		this.client.decrBy('key1', 2, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, -2);
			});
		});

		this.client.set('key2', 43)
		this.client.decrBy('key2', 2, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 41);
			});
		});
	},
	test_getrange : function() {
		this.client.flushAll();

		this.client.set('key1', 'hello, my friend');
		this.client.getRange('key1', 0, 4, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'hello');
			});
		});

		this.client.getRange('key1', -1, -5, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, '');
			});
		});

		this.client.getRange('key1', -3, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'end');
			});
		});

		this.client.getRange('key1', 0, -1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'hello, my friend');
			});
		});

		this.client.getRange('key1', 0, 1008611, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'hello, my friend');
			});
		});
	},
	test_getset : function() {
		this.client.flushAll();

		this.client.getSet('key1', 'value1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'null');
			});
		});

		this.client.get('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value1');
			});
		});

		this.client.getSet('key1', 'value2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value1');
			});
		});

		this.client.get('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value2');
			});
		});
	},
	test_mgetAndMset : function() {
		this.client.flushAll();

		this.client.mSet([ {
			key : "key1",
			value : "value1"
		}, {
			key : "key2",
			value : "value2"
		}, {
			key : "key3",
			value : "value3"
		} ], function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'OK');
			});
		});

		this.client.get('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value1');
			});
		});
		this.client.get('key2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value2');
			});
		});
		this.client.get('key3', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value3');
			});
		});

		this.client.mGet([ 'key1', 'key2', 'key3', 'key4' ],
				function(resp, err) {
					console.log(resp);
				});

		this.client.set('key1', 'value1')
		this.client.mGet('key1', function(resp, err) {
			console.log(resp);
		});

		this.client.mSetNX([ {
			key : "key1",
			value : "value1"
		}, {
			key : "key4",
			value : "value4"
		} ], function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});
		this.client.mSetNX([ {
			key : "key5",
			value : "value5"
		}, {
			key : "key4",
			value : "value4"
		} ], function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
		this.client.setNX("key5", "value5", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});
		this.client.setNX("key6", "value6", function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
	},
	test_setEX : function() {
		this.client.flushAll();

		this.client.setEX('key1', 100, 'value1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'OK');
			});
		});

		this.client.get('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value1');
			});
		});

		// this.client.ttl('key1', function(resp, err) {
		// console.log(resp);
		// });
	},
	test_psetEX : function() {
		this.client.flushAll();

		this.client.pSetEX('key1', 100000, 'value1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'OK');
			});
		});

		this.client.get('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'value1');
			});
		});

		// this.client.pTTL('key1', function(resp, err) {
		// console.log(resp);
		// });
	},
	test_setrange : function() {
		this.client.flushAll()

		this.client.set('key1', 'hello world')

		this.client.setRange('key1', 6, 'Redis', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 11);
			});
		});

		this.client.get('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, "hello Redis");
			});
		});
	},
	test_strlen : function() {
		this.client.flushAll()

		this.client.set('key1', 'Hello world')

		this.client.strLen('key1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 11);
			});
		});
	}
};

var tester = new StringCmdTest();
if (typeof describe === "function") {
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
		describe("#exists", function() {
			it("redis exists command", function() {
				tester.test_exists();
			})
		});
		describe("#append", function() {
			it("redis append command", function() {
				tester.test_append();
			})
		});
		describe("#setBit,#getBit,#bitCount", function() {
			it("redis setbit , getbit and bitcount command", function() {
				tester.test_bit();
			})
		});
		describe("#setbitOp", function() {
			it("redis bitOp command", function() {
				tester.test_bit();
			})
		});
		describe("#incr", function() {
			it("redis incr command", function() {
				tester.test_incr();
			})
		});
		describe("#incrby", function() {
			it("redis incrby command", function() {
				tester.test_incrby();
			})
		});
		describe("#incrbyfloat", function() {
			it("redis incrbyfloat command", function() {
				tester.test_incrbyfloat();
			})
		});

		describe("#decr", function() {
			it("redis decr command", function() {
				tester.test_decr();
			})
		});
		describe("#decrby", function() {
			it("redis decrby command", function() {
				tester.test_decrby();
			})
		});
		describe("#getrange", function() {
			it("redis getrange command", function() {
				tester.test_getrange();
			})
		});
		describe("#getset", function() {
			it("redis getset command", function() {
				tester.test_getset();
			})
		});
		describe("#mset,#mget,#msetNX,#setNX", function() {
			it("redis mset,mget command", function() {
				tester.test_mgetAndMset();
			})
		});
		describe("#setEX", function() {
			it("redis setEX command", function() {
				tester.test_setEX();
			})
		});
		describe("#psetEX", function() {
			it("redis psetEX command", function() {
				tester.test_psetEX();
			})
		});
		describe("#setrange", function() {
			it("redis setrange command", function() {
				tester.test_setrange();
			})
		});
		describe("#strlen", function() {
			it("redis strlen command", function() {
				tester.test_strlen();
			})
		});
	});
} else {
	tester.test_set();
	tester.test_get();
	tester.test_del();
	tester.test_keys();
	tester.test_exists();
	tester.test_append();
	tester.test_bit();
	tester.test_bitOp();
	tester.test_incr();
	tester.test_incrby();
	tester.test_incrbyfloat();
	tester.test_decr();
	tester.test_decrby();
	tester.test_getrange();
	tester.test_getset();
	tester.test_mgetAndMset();
	tester.test_setEX();
	tester.test_psetEX();
	tester.test_setrange();
	tester.test_strlen();
}