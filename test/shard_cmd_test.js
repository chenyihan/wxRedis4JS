/**
 * http://usejsdoc.org/
 */

var ShardedClient = require('../lib/client.js').ShardedClient, baseCmdTest = require('./base_cmd_test'), ServerNode = require('../lib/node').ServerNode;
function ShardCmdTest() {
	if (!(this instanceof ShardCmdTest)) {
		return new ShardCmdTest();
	}
	var nodes = [ new ServerNode("192.168.1.106", "6379"),
			new ServerNode("192.168.1.107", "6379") ];
	this.shardClient = new ShardedClient(nodes);
}
var baseProto = baseCmdTest.BaseCmdTest.prototype;
ShardCmdTest.prototype = {
	testSetAndGet : function() {
		this.shardClient.flushAll();

		var tests = 100;
		var setCB = function(resp, err, node) {
			console.log("Set to " + node + ":" + resp);
		};
		var getCB = function(resp, err, node) {
			console.log("Get from " + node + ":" + resp);
		};
		var getRangeCB = function(resp, err, node) {
			console.log("GetRange from " + node + ":" + resp);
		};
		var getSetCB = function(resp, err, node) {
			console.log("GetSet from " + node + ":" + resp);
		};
		var setRangeCB = function(resp, err, node) {
			console.log("setRange from " + node + ":" + resp);
		};
		var strLenCB = function(resp, err, node) {
			console.log("strLen from " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.set(key, value, setCB);
			this.shardClient.get(key, getCB);
			this.shardClient.getRange(key, 0, 2, getRangeCB);
			this.shardClient.getSet(key, value, getSetCB);
			this.shardClient.setRange(key, 6, "Redis", setRangeCB);
			this.shardClient.strLen(key, strLenCB);

		}
	},
	testExpire : function() {
		this.shardClient.flushAll();

		var tests = 100;

		var expireCB = function(resp, err, node) {
			console.log("Expire " + node + ":" + resp);
		};
		var ttlCB = function(resp, err, node) {
			console.log("TTL " + node + ":" + resp);
		};
		var expireAtCB = function(resp, err, node) {
			console.log("Expire At " + node + ":" + resp);
		};
		var pExpireCB = function(resp, err, node) {
			console.log("pExpire " + node + ":" + resp);
		};
		var pttlCB = function(resp, err, node) {
			console.log("PTTL " + node + ":" + resp);
		};

		var pExpireAtCB = function(resp, err, node) {
			console.log("PExpire At " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.set(key, value);

			this.shardClient.expire(key, 100, expireCB);
			this.shardClient.ttl(key, ttlCB);
			this.shardClient.expireAt(key, 2355292000, expireAtCB);
			this.shardClient.ttl(key, ttlCB);
			this.shardClient.pExpire(key, 100000, pExpireCB);
			this.shardClient.pTTL(key, pttlCB);
			this.shardClient.pExpireAt(key, 2355292000, pExpireCB);
			this.shardClient.pTTL(key, pttlCB);
		}
	},
	test_move : function() {
		this.shardClient.flushAll();

		var tests = 100;
		var moveCB = function(resp, err, node) {
			console.log("Move " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.set(key, value);
			this.shardClient.move(key, 1, moveCB);
		}
	},
	test_object : function() {
		this.shardClient.flushAll();

		var tests = 100;
		var objectRefcount_cb = function(resp, err, node) {
			console.log("objectRefcount " + node + ":" + resp);
		};
		var objectIdletime_cb = function(resp, err, node) {
			console.log("objectIdletime " + node + ":" + resp);
		};
		var objectEncoding_cb = function(resp, err, node) {
			console.log("objectEncoding " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.set(key, value);
			this.shardClient.objectRefcount(key, objectRefcount_cb);
			this.shardClient.objectIdletime(key, objectIdletime_cb);
			this.shardClient.objectEncoding(key, objectEncoding_cb);
		}
	},
	test_persist : function() {
		this.shardClient.flushAll();

		var tests = 100;
		var persist_cb = function(resp, err, node) {
			console.log("persist " + node + ":" + resp);
		};
		var ttlCB = function(resp, err, node) {
			console.log("TTL " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.set(key, value);
			this.shardClient.expire(key, 100);
			this.shardClient.persist(key, persist_cb);
			this.shardClient.ttl(key, ttlCB);
		}
	},
	test_sort : function() {
		this.shardClient.flushAll();

		var tests = 100;
		var cb = function(resp, err, node) {
			console.log(node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			// var value = "value-" + i;
			this.shardClient.lPush(key, [ "25", "3", "5", "4", "55", "34",
					"15", "2" ]);
			this.shardClient.sort(key, null, cb);
		}
	},
	test_type : function() {
		this.shardClient.flushAll();

		var tests = 100;
		var type_cb = function(resp, err, node) {
			console.log("type " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.set(key, value);
			this.shardClient.type(key, type_cb);
		}
	},
	test_del : function() {
		this.shardClient.flushAll();

		var tests = 100;
		var del_cb = function(resp, err, node) {
			console.log("del " + node + ":" + resp);
		};
		var get_cb = function(resp, err, node) {
			console.log("get " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.set(key, value);
			this.shardClient.del(key, del_cb);
			this.shardClient.get(key, get_cb);
		}
	},
	test_exist : function() {
		this.shardClient.flushAll();

		var tests = 100;
		var exist_cb = function(resp, err, node) {
			console.log("exist " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.set(key, value);
			this.shardClient.exists(key, exist_cb);
		}
	},
	test_append : function() {
		this.shardClient.flushAll();

		var tests = 100;
		var append_cb = function(resp, err, node) {
			console.log("append " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.append(key, 111, append_cb);
			this.shardClient.append(key, 222, append_cb);
		}
	},
	test_bit : function() {
		this.shardClient.flushAll();

		var setBit_cb = function(resp, err, node) {
			console.log("setBit " + node + ":" + resp);
		};
		var getBit_cb = function(resp, err, node) {
			console.log("getBit " + node + ":" + resp);
		};
		var bitCount_cb = function(resp, err, node) {
			console.log("bitCount " + node + ":" + resp);
		};
		var tests = 100;
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			this.shardClient.setBit(key, 10086, 1, setBit_cb);
			this.shardClient.getBit(key, 10086, getBit_cb);
			this.shardClient.bitCount(key, null, null, bitCount_cb);
		}
	},
	test_incr : function() {
		this.shardClient.flushAll();
		var tests = 100;
		var incr_cb = function(resp, err, node) {
			console.log("incr " + node + ":" + resp);
		};
		var incrby_cb = function(resp, err, node) {
			console.log("incr " + node + ":" + resp);
		};
		var incrbyfloat_cb = function(resp, err, node) {
			console.log("incrbyfloat " + node + ":" + resp);
		};
		var decr_cb = function(resp, err, node) {
			console.log("decr " + node + ":" + resp);
		};
		var decrby_cb = function(resp, err, node) {
			console.log("decrby " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			this.shardClient.incr(key, incr_cb);
			this.shardClient.incrBy(key, i, incrby_cb);
			this.shardClient.incrByFloat(key, i + 0.1, incrbyfloat_cb);
			this.shardClient.decr(key, decr_cb);
			this.shardClient.decrBy(key, i + 0.01, decrby_cb);
		}
	},
	test_setnx : function() {
		this.shardClient.flushAll();
		var tests = 100;
		var setnx_cb = function(resp, err, node) {
			console.log("setnx " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.setNX(key, value, setnx_cb);
		}
	},
	set_setex : function() {
		this.shardClient.flushAll();
		var tests = 100;
		var setex_cb = function(resp, err, node) {
			console.log("setnx " + node + ":" + resp);
		};
		var psetex_cb = function(resp, err, node) {
			console.log("setnx " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var value = "value-" + i;
			this.shardClient.setEX(key, i + 100, value, setex_cb);
			this.shardClient.pSetEX(key, i + 100000, value, psetex_cb);
		}
	},
	test_hashcmd : function() {
		this.shardClient.flushAll();
		var tests = 100;
		var hset_cb = function(resp, err, node) {
			console.log("hset " + node + ":" + resp);
		};
		var hsetnx_cb = function(resp, err, node) {
			console.log("hsetnx " + node + ":" + resp);
		};
		var hget_cb = function(resp, err, node) {
			console.log("hget " + node + ":" + resp);
		};
		var hgetall_cb = function(resp, err, node) {
			console.log("hgetall " + node + ":" + resp);
		};
		var hexist_cb = function(resp, err, node) {
			console.log("hexist " + node + ":" + resp);
		};
		var hincrby_cb = function(resp, err, node) {
			console.log("hincrby " + node + ":" + resp);
		};
		var hincrbyfloat_cb = function(resp, err, node) {
			console.log("hincrbyfloat " + node + ":" + resp);
		};
		var hkeys_cb = function(resp, err, node) {
			console.log("hkeys " + node + ":" + resp);
		};
		var hvals_cb = function(resp, err, node) {
			console.log("hvals " + node + ":" + resp);
		};
		var hlen_cb = function(resp, err, node) {
			console.log("hlen " + node + ":" + resp);
		};
		var hdel_cb = function(resp, err, node) {
			console.log("hdel " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var field = "field-" + i;
			var value = i;
			this.shardClient.hSet(key, field, value, hset_cb);
			this.shardClient.hSetNX(key, field, value, hsetnx_cb);
			this.shardClient.hGet(key, field, hget_cb);
			this.shardClient.hGetAll(key, hgetall_cb);
			this.shardClient.hExist(key, field, hexist_cb);
			this.shardClient.hIncrBy(key, field, 1, hincrby_cb);
			this.shardClient.hIncrByFloat(key, field, 1.1, hincrbyfloat_cb);
			this.shardClient.hKeys(key, hkeys_cb);
			this.shardClient.hVals(key, hvals_cb);
			this.shardClient.hLen(key, hlen_cb);
			this.shardClient.hDel(key, field, hdel_cb);
		}
	},
	test_listcmd : function() {
		this.shardClient.flushAll();
		var tests = 100;
		var lpush_cb = function(resp, err, node) {
			console.log("lpush " + node + ":" + resp);
		};
		var lpushx_cb = function(resp, err, node) {
			console.log("lpushx " + node + ":" + resp);
		};
		var rpush_cb = function(resp, err, node) {
			console.log("rpush " + node + ":" + resp);
		};
		var rpushx_cb = function(resp, err, node) {
			console.log("rpushx " + node + ":" + resp);
		};
		var lrange_cb = function(resp, err, node) {
			console.log("lrange " + node + ":" + resp);
		};
		var lindex_cb = function(resp, err, node) {
			console.log("lindex " + node + ":" + resp);
		};
		var linsert_cb = function(resp, err, node) {
			console.log("linsert " + node + ":" + resp);
		};

		var llen_cb = function(resp, err, node) {
			console.log("llen " + node + ":" + resp);
		};

		var lrem_cb = function(resp, err, node) {
			console.log("lrem " + node + ":" + resp);
		};
		var lset_cb = function(resp, err, node) {
			console.log("lset " + node + ":" + resp);
		};
		var ltrim_cb = function(resp, err, node) {
			console.log("ltrim " + node + ":" + resp);
		};
		var lpop_cb = function(resp, err, node) {
			console.log("lpop " + node + ":" + resp);
		};
		var rpop_cb = function(resp, err, node) {
			console.log("rpop " + node + ":" + resp);
		};
		var blpop_cb = function(resp, err, node) {
			console.log("blpop " + node + ":" + resp);
		};
		var brpop_cb = function(resp, err, node) {
			console.log("brpop " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var values = [ "value-1" + i, "value-2" + i, "value-3" + i,
					"value-4" + i, "value-5" + i ];
			this.shardClient.lPush(key, values, lpush_cb);
			this.shardClient.lPushX(key, "value-", lpushx_cb);
			var rvalues = [ "rvalue-1" + i, "rvalue-2" + i, "rvalue-3" + i,
					"rvalue-4" + i, "rvalue-5" + i ];

			this.shardClient.rPush(key, rvalues, rpush_cb);
			this.shardClient.rPushX(key, "value-", rpushx_cb);
			this.shardClient.lRange(key, 0, -1, lrange_cb);
			this.shardClient.lIndex(key, 0, lindex_cb);
			this.shardClient.lInsert(key, "value-10", "value-16", true,
					linsert_cb);
			this.shardClient.lLen(key, llen_cb);
			this.shardClient.lrem(key, "value-11", 1, lrem_cb);
			this.shardClient.lSet(key, 1, "value-2" + i, lset_cb);
			this.shardClient.lTrim(key, 1, 2, ltrim_cb);
			this.shardClient.lPop(key, lpop_cb);
			this.shardClient.rPop(key, rpop_cb);
			this.shardClient.blPop(key, blpop_cb);
			this.shardClient.brPop(key, brpop_cb);
		}
	},
	test_setcmd : function() {
		this.shardClient.flushAll();
		var tests = 100;
		var sadd_cb = function(resp, err, node) {
			console.log("sadd " + node + ":" + resp);
		};
		var scard_cb = function(resp, err, node) {
			console.log("scard " + node + ":" + resp);
		};
		var srandmember_cb = function(resp, err, node) {
			console.log("sRandMember " + node + ":" + resp);
		};

		var smember_cb = function(resp, err, node) {
			console.log("sMembers " + node + ":" + resp);
		};
		var sisMember_cb = function(resp, err, node) {
			console.log("sisMember " + node + ":" + resp);
		};
		var sRem_cb = function(resp, err, node) {
			console.log("sRem " + node + ":" + resp);
		};
		var spop_cb = function(resp, err, node) {
			console.log("sPop " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var values = [ "value-1" + i, "value-2" + i, "value-3" + i,
					"value-4" + i, "value-5" + i ];
			this.shardClient.sAdd(key, values, sadd_cb);
			this.shardClient.sCard(key, scard_cb);
			this.shardClient.sRandMember(key, 1, srandmember_cb);
			this.shardClient.sMembers(key, smember_cb);
			this.shardClient.sisMember(key, "value-12", sisMember_cb);
			this.shardClient.sRem(key, "value-12", sRem_cb);
			this.shardClient.sPop(key, spop_cb);
		}
	},
	test_sortsetcmd : function() {
		this.shardClient.flushAll();
		var tests = 100;
		var zadd_cb = function(resp, err, node) {
			console.log("zadd " + node + ":" + resp);
		};
		var zcard_cb = function(resp, err, node) {
			console.log("zcard " + node + ":" + resp);
		};
		var zcount_cb = function(resp, err, node) {
			console.log("zcount " + node + ":" + resp);
		};
		var zincrby_cb = function(resp, err, node) {
			console.log("zincrby " + node + ":" + resp);
		};
		var zrange_cb = function(resp, err, node) {
			console.log("zrange " + node + ":" + resp);
		};
		var zrangewithscore_cb = function(resp, err, node) {
			console.log("zrangewithscore " + node + ":" + resp);
		};
		var zrangebyscore_cb = function(resp, err, node) {
			console.log("zrangebyscore " + node + ":" + resp);
		};
		var zRangeByScoreWithOffset_cb = function(resp, err, node) {
			console.log("zRangeByScoreWithOffset " + node + ":" + resp);
		};
		var zRangeByScoreWithScores_cb = function(resp, err, node) {
			console.log("zRangeByScoreWithScores " + node + ":" + resp);
		};
		var zRangeByScoreWithScoresByOffset_cb = function(resp, err, node) {
			console.log("zRangeByScoreWithScoresByOffset " + node + ":" + resp);
		};
		var zRank_cb = function(resp, err, node) {
			console.log("zRank " + node + ":" + resp);
		};
		var zRem_cb = function(resp, err, node) {
			console.log("zRem " + node + ":" + resp);
		};
		var zRemRangeByRank_cb = function(resp, err, node) {
			console.log("zRemRangeByRank " + node + ":" + resp);
		};
		var zRemRangeByScore_cb = function(resp, err, node) {
			console.log("zRemRangeByScore " + node + ":" + resp);
		};
		var zRevRange_cb = function(resp, err, node) {
			console.log("zRevRange " + node + ":" + resp);
		};
		var zRevRangeWithScores_cb = function(resp, err, node) {
			console.log("zRevRangeWithScores " + node + ":" + resp);
		};
		var zRevRangeByScore_cb = function(resp, err, node) {
			console.log("zRevRangeByScore " + node + ":" + resp);
		};
		var zRevRangeByScoreByOffset_cb = function(resp, err, node) {
			console.log("zRevRangeByScoreByOffset " + node + ":" + resp);
		};
		var zRevRangeByScoreWithScores_cb = function(resp, err, node) {
			console.log("zRevRangeByScoreWithScores " + node + ":" + resp);
		};
		var zRevRangeByScoreWithScoresByOffset_cb = function(resp, err, node) {
			console.log("zRevRangeByScoreWithScoresByOffset " + node + ":"
					+ resp);
		};
		var zRevRank_cb = function(resp, err, node) {
			console.log("zRevRank " + node + ":" + resp);
		};
		var zScore_cb = function(resp, err, node) {
			console.log("zScore " + node + ":" + resp);
		};
		for (var i = 1; i <= tests; i++) {
			var key = "key-" + i;
			var values = [ {
				score : 1,
				member : "value-1" + i
			}, {
				score : 2,
				member : "value-2" + i
			}, {
				score : 3,
				member : "value-3" + i
			}, {
				score : 4,
				member : "value-4" + i
			}, {
				score : 5,
				member : "value-5" + i
			} ];
			this.shardClient.zAdd(key, values, zadd_cb);
			this.shardClient.zCard(key, zcard_cb);
			this.shardClient.zCount(key, 3, 4, zcount_cb);
			this.shardClient.zIncrBy(key, "value-2" + i, 2, zincrby_cb);
			this.shardClient.zRange(key, 3, 5, zrange_cb);
			this.shardClient.zRangeWithScores(key, 1, 2, zrangewithscore_cb);
			this.shardClient.zRangeByScore(key, 4, 5, zrangebyscore_cb);
			this.shardClient.zRangeByScoreWithOffset(key, 4, 5, 2, 1,
					zRangeByScoreWithOffset_cb);
			this.shardClient.zRangeByScoreWithScores(key, 4, 5,
					zRangeByScoreWithScores_cb);
			this.shardClient.zRangeByScoreWithScoresByOffset(key, 4, 5, 1, 1,
					zRangeByScoreWithScoresByOffset_cb);
			this.shardClient.zRank(key, "value-5" + i, zRank_cb);
			this.shardClient.zRem(key, [ "value-3" + i, "value-4" + i ],
					zRem_cb);
			this.shardClient.zRemRangeByRank(key, 1, 2, zRemRangeByRank_cb);
			this.shardClient.zRemRangeByScore(key, 4, 5, zRemRangeByScore_cb);
			this.shardClient.zRevRange(key, 3, 5, zRevRange_cb);
			this.shardClient.zRevRangeWithScores(key, 2, 3,
					zRevRangeWithScores_cb);
			this.shardClient.zRevRangeByScore(key, 5, 4, zRevRangeByScore_cb);
			this.shardClient.zRevRangeByScoreByOffset(key, 5, 4, 1, 1,
					zRevRangeByScoreByOffset_cb);
			this.shardClient.zRevRangeByScoreWithScores(key, 5, 4,
					zRevRangeByScoreWithScores_cb);
			this.shardClient.zRevRangeByScoreWithScoresByOffset(key, 5, 4, 1,
					1, zRevRangeByScoreWithScoresByOffset_cb);
			this.shardClient.zRevRank(key, "value-5" + i, zRevRank_cb);
			this.shardClient.zScore(key, "value-5" + i, zScore_cb);
		}
	}
};
var tester = new ShardCmdTest();
if (typeof describe === "function") {
	describe("ShardCmd", function() {
		describe("#string&key", function() {
			it("Shard string and key command", function() {
				tester.testSetAndGet();
				tester.testExpire();
				tester.test_move();
				tester.test_object();
				tester.test_persist();
				tester.test_sort();
				tester.test_type();
				tester.test_del();
				tester.test_exist();
				tester.test_append();
				tester.test_bit();
				tester.test_incr();
				tester.test_setnx();
				tester.set_setex();
			})
		});

		describe("#hash", function() {
			it("Shard hash command", function() {
				tester.test_hashcmd();
			})
		});
		describe("#list", function() {
			it("Shard list command", function() {
				tester.test_listcmd();
			})
		});
		describe("#set", function() {
			it("Shard set command", function() {
				tester.test_setcmd();
			})
		});
		describe("#sortset", function() {
			it("Shard sort set command", function() {
				tester.test_sortsetcmd();
			})
		});

	})
} else {
	tester.testSetAndGet();
	tester.testExpire();
	tester.test_move();
	tester.test_object();
	tester.test_persist();
	tester.test_sort();
	tester.test_type();
	tester.test_del();
	tester.test_exist();
	tester.test_append();
	tester.test_bit();
	tester.test_incr();
	tester.test_setnx();
	tester.set_setex();
	tester.test_hashcmd();
	tester.test_listcmd();
	tester.test_setcmd();
	tester.test_sortsetcmd();

}