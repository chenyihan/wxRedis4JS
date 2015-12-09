/**
 * http://usejsdoc.org/
 */
'use strict';
var Client = require('../lib/client.js').Client;
var utils = require('util'), baseCmdTest = require('./base_cmd_test'), assert = require("assert"), params = require("../lib/params.js"), RedisKeyword = require("../lib/keywords.js");
function SortSetCmdTest() {
	if (!(this instanceof SortSetCmdTest)) {
		return new SortSetCmdTest();
	}
	baseCmdTest.BaseCmdTest.call(this);
}
utils.inherits(SortSetCmdTest, baseCmdTest.BaseCmdTest);
var baseProto = baseCmdTest.BaseCmdTest.prototype;
SortSetCmdTest.prototype = {
	test_zadd : function() {
		this.client.flushAll();

		this.client.zAdd('zkey1', [ {
			score : 2,
			member : "zsvalue1"
		} ], function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.zAdd('zskey1', [ {
			score : 1,
			member : "zsvalue2"
		}, {
			score : 4,
			member : "zsvalue1"
		} ], function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2);
			});
		});
	},
	test_zscore : function() {
		this.client.flushAll();

		this.client.zAdd('zskey1', [ {
			score : 2.1,
			member : "zsvalue1"
		}, {
			score : 1.2,
			member : "zsvalue2"
		}, {
			score : 4.5,
			member : "zsvalue3"
		} ]);
		this.client.zScore('zskey1', 'zsvalue11', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, -1);
			});
		});
		this.client.zScore('zskey1', 'zsvalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2.1);
			});
		});
		this.client.zScore('zskey1', 'zsvalue2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1.2);
			});
		});
		this.client.zScore('zskey1', 'zsvalue3', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 4.5);
			});
		});
	},
	test_zcard : function() {
		this.client.flushAll();

		this.client.zAdd('zskey1', [ {
			score : 2.1,
			member : "zsvalue1"
		}, {
			score : 1.2,
			member : "zsvalue2"
		}, {
			score : 4.5,
			member : "zsvalue3"
		} ]);

		this.client.zCard('zskey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});
	},
	test_zcount : function() {
		this.client.flushAll();
		this.client.zAdd('zskey1', [ {
			score : 2.1,
			member : "zsvalue1"
		}, {
			score : 1.2,
			member : "zsvalue2"
		}, {
			score : 4.5,
			member : "zsvalue3"
		} ]);

		this.client.zCount('zskey1', 0.1, 2.8, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2);
			});
		});
	},
	test_zincrby : function() {
		this.client.flushAll();

		this.client.zIncrBy('zskey1', 'zsvalue1', 1.1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1.1);
			});
		});

		this.client.zIncrBy('zskey1', 'zsvalue1', 2.1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3.2);
			});
		});
	},
	test_zrange : function() {
		this.client.flushAll();
		this.client.zAdd('zskey1', [ {
			score : 2.1,
			member : "zsvalue1"
		}, {
			score : 1.2,
			member : "zsvalue2"
		}, {
			score : 4.5,
			member : "zsvalue3"
		} ]);

		this.client.zRange('zskey1', 0, -1, function(resp, err) {
			console.log(resp);
		});

		this.client.zRangeWithScores('zskey1', 0, -1, function(resp, err) {
			console.log(resp);
		});
	},
	test_zrangebyscore : function() {
		this.client.flushAll();
		this.client.zAdd('zskey1', [ {
			score : 2.1,
			member : "zsvalue1"
		}, {
			score : 1.2,
			member : "zsvalue2"
		}, {
			score : 4.5,
			member : "zsvalue3"
		} ]);

		this.client.zRangeByScore('zskey1', 2, 5, function(resp, err) {
			console.log(resp);
		});

		this.client.zRangeByScoreWithOffset('zskey1', 2, 5, 1, 1, function(
				resp, err) {
			console.log(resp);
		});

		this.client.zRevRangeWithScores('zskey1', 2, 5, function(resp, err) {
			console.log(resp);
		});

		this.client.zRevRangeByScoreWithScores('zskey1', 5, 2, function(resp,
				err) {
			console.log(resp);
		});

		this.client.zRevRangeByScoreWithScoresByOffset('zskey1', 5, 2, 1, 1,
				function(resp, err) {
					console.log(resp);
				});
	},
	test_zrank : function() {
		this.client.flushAll();
		this.client.zAdd("zskey1", [ {
			score : 2,
			member : "zsvalue1"
		}, {
			score : 1,
			member : "zsvalue2"
		}, {
			score : 4,
			member : "zsvalue3"
		}, {
			score : 7,
			member : "zsvalue4"
		}, {
			score : 8,
			member : "zsvalue5"
		} ]);

		this.client.zRank('zskey1', 'zsvalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
		this.client.zRank('zskey1', 'zsvalue2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});
		this.client.zRank('zskey1', 'zsvalue3', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2);
			});
		});
		this.client.zRank('zskey1', 'zsvalue4', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});
		this.client.zRank('zskey1', 'zsvalue5', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 4);
			});
		});
		this.client.zRank('zskey1', 'zsvalue7', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, -1);
			});
		});
	},
	test_zrem : function() {
		this.client.flushAll();
		this.client.zAdd("zskey1", [ {
			score : 2,
			member : "zsvalue1"
		}, {
			score : 1,
			member : "zsvalue2"
		}, {
			score : 4,
			member : "zsvalue3"
		}, {
			score : 7,
			member : "zsvalue4"
		}, {
			score : 8,
			member : "zsvalue5"
		} ]);

		this.client.zRem('zskey1', 'zsvalue2', 'zsvalue1', 'zsvalue6',
				function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 2);
					});
				});

		this.client.zRange('zskey1', 0, -1, function(resp, err) {
			console.log(resp);
		});
	},
	test_zremrangebyrank : function() {
		this.client.flushAll();

		this.client.zAdd("zskey1", [ {
			score : 2,
			member : "zsvalue1"
		}, {
			score : 1,
			member : "zsvalue2"
		}, {
			score : 4,
			member : "zsvalue3"
		}, {
			score : 7,
			member : "zsvalue4"
		}, {
			score : 8,
			member : "zsvalue5"
		} ]);
		this.client.zRemRangeByRank('zskey1', 1, 3, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});

		this.client.zRange('zskey1', 0, -1, function(resp, err) {
			console.log(resp);
		});
	},
	test_zremrangebyscore : function() {
		this.client.flushAll();

		this.client.zAdd("zskey1", [ {
			score : 2,
			member : "zsvalue1"
		}, {
			score : 1,
			member : "zsvalue2"
		}, {
			score : 4,
			member : "zsvalue3"
		}, {
			score : 7,
			member : "zsvalue4"
		}, {
			score : 8,
			member : "zsvalue5"
		} ]);

		this.client.zRemRangeByScore('zskey1', 4, 10, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});

		this.client.zRange('zskey1', 0, -1, function(resp, err) {
			console.log(resp);
		});
	},
	test_zrevrange : function() {
		this.client.flushAll();

		this.client.zAdd("zskey1", [ {
			score : 2,
			member : "zsvalue1"
		}, {
			score : 1,
			member : "zsvalue2"
		}, {
			score : 4,
			member : "zsvalue3"
		}, {
			score : 7,
			member : "zsvalue4"
		}, {
			score : 8,
			member : "zsvalue5"
		} ]);
		this.client.zRevRange('zskey1', 0, -1, function(resp, err) {
			console.log(resp);
		});

		this.client.zRevRangeWithScores('zskey1', 0, -1, function(resp, err) {
			console.log(resp);
		});
	},
	test_zRevRangeByScore : function() {
		this.client.flushAll();

		this.client.zAdd("zskey1", [ {
			score : 2,
			member : "zsvalue1"
		}, {
			score : 1,
			member : "zsvalue2"
		}, {
			score : 4,
			member : "zsvalue3"
		}, {
			score : 7,
			member : "zsvalue4"
		}, {
			score : 8,
			member : "zsvalue5"
		} ]);
		this.client.zRevRangeByScore('zskey1', 8, 4, function(resp, err) {
			console.log(resp);
		});

		this.client.zRevRangeByScoreByOffset('zskey1', 8, 4, 2, 1, function(
				resp, err) {
			console.log(resp);
		});

		this.client.zRevRangeByScoreWithScores('zskey1', 8, 4, function(resp,
				err) {
			console.log(resp);
		});

		this.client.zRevRangeByScoreWithScoresByOffset('zskey1', 8, 4, 2, 1,
				function(resp, err) {
					console.log(resp);
				});
	},
	test_zRevRank : function() {
		this.client.flushAll();

		this.client.zAdd("zskey1", [ {
			score : 2,
			member : "zsvalue1"
		}, {
			score : 1,
			member : "zsvalue2"
		}, {
			score : 4,
			member : "zsvalue3"
		}, {
			score : 7,
			member : "zsvalue4"
		}, {
			score : 8,
			member : "zsvalue5"
		} ]);
		this.client.zRevRank('zskey1', 'zsvalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});

		this.client.zRevRank('zskey1', 'zsvalue2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 4);
			});
		});

		this.client.zRevRank('zskey1', 'zsvalue6', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, -1);
			});
		});
	},
	test_zUnionStore : function() {
		this.client.flushAll();

		this.client.zAdd("zskey1", [ {
			score : 52,
			member : "zsvalue1"
		}, {
			score : 15,
			member : "zsvalue2"
		}, {
			score : 34,
			member : "zsvalue3"
		}, {
			score : 74,
			member : "zsvalue4"
		}, {
			score : 18,
			member : "zsvalue5"
		} ]);

		this.client.zAdd("zskey2", [ {
			score : 32,
			member : "zsvalue21"
		}, {
			score : 12,
			member : "zsvalue22"
		}, {
			score : 14,
			member : "zsvalue3"
		}, {
			score : 27,
			member : "zsvalue24"
		}, {
			score : 28,
			member : "zsvalue25"
		} ]);

		this.client.zUnionStore('zskey3', null, [ 'zskey1', 'zskey2' ],
				function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 9);
					});
				});

		this.client.zRangeWithScores('zskey3', 0, -1, function(resp, err) {
			console.log(resp);
		});

		this.client.zUnionStore('zskey4', new params.SortedSetParams()
				.weights([ 1, 3 ]), [ 'zskey1', 'zskey2' ],
				function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 9);
					});
				});

		this.client.zRangeWithScores('zskey4', 0, -1, function(resp, err) {
			console.log(resp);
		});

		this.client.zUnionStore('zskey5', new params.SortedSetParams().weights(
				[ 1, 3 ]).aggregate(RedisKeyword.MAX), [ 'zskey1', 'zskey2' ],
				function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 9);
					});
				});

		this.client.zRangeWithScores('zskey5', 0, -1, function(resp, err) {
			console.log(resp);
		});
	},
	test_zinterstore : function() {
		this.client.flushAll();

		this.client.zAdd("zskey1", [ {
			score : 52,
			member : "zsvalue1"
		}, {
			score : 15,
			member : "zsvalue2"
		}, {
			score : 34,
			member : "zsvalue3"
		}, {
			score : 74,
			member : "zsvalue4"
		}, {
			score : 18,
			member : "zsvalue5"
		} ]);

		this.client.zAdd("zskey2", [ {
			score : 32,
			member : "zsvalue21"
		}, {
			score : 12,
			member : "zsvalue22"
		}, {
			score : 14,
			member : "zsvalue3"
		}, {
			score : 27,
			member : "zsvalue24"
		}, {
			score : 28,
			member : "zsvalue25"
		} ]);
		this.client.zInterStore('zskey3', null, [ 'zskey1', 'zskey2' ],
				function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 1);
					});
				});

		this.client.zRangeWithScores('zskey3', 0, -1, function(resp, err) {
			console.log(resp);
		});

		this.client.zInterStore('zskey4', new params.SortedSetParams()
				.weights([ 1, 3 ]), [ 'zskey1', 'zskey2' ],
				function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 1);
					});
				});

		this.client.zRangeWithScores('zskey4', 0, -1, function(resp, err) {
			console.log(resp);
		});

		this.client.zInterStore('zskey5', new params.SortedSetParams().weights(
				[ 1, 3 ]).aggregate(RedisKeyword.MIN), [ 'zskey1', 'zskey2' ],
				function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 1);
					});
				});

		this.client.zRangeWithScores('zskey5', 0, -1, function(resp, err) {
			console.log(resp);
		});
	},
	test_zscan : function() {
		this.client.flushAll();

		var cursor = 0;
		var count = 5;
		this.client.zAdd('key1', {
			score : 10,
			member : 'value1'
		});
		this.client.zAdd('key1', {
			score : 2,
			member : 'value2'
		});
		this.client.zAdd('key1', {
			score : 3,
			member : 'value3'
		});
		this.client.zAdd('key1', {
			score : 4,
			member : 'value4'
		});
		this.client.zAdd('key1', {
			score : 15,
			member : 'value5'
		});
		this.client.zAdd('key1', {
			score : 6,
			member : 'value6'
		});
		this.client.zAdd('key1', {
			score : 7,
			member : 'value7'
		});
		this.client.zAdd('key1', {
			score : 8,
			member : 'value8'
		});
		this.client.zAdd('key1', {
			score : 91,
			member : 'value9'
		});
		this.client.zAdd('key1', {
			score : 10,
			member : 'value10'
		});
		this.client.zAdd('key1', {
			score : 11,
			member : 'value11'
		});
		this.client.zAdd('key1', {
			score : 12,
			member : 'value12'
		});
		this.client.zAdd('key1', {
			score : 13,
			member : 'value13'
		});
		this.client.zAdd('key1', {
			score : 14,
			member : 'value14'
		});
		this.client.zAdd('key1', {
			score : 15,
			member : 'value15'
		});
		this.client.zAdd('key1', {
			score : 16,
			member : 'value16'
		});
		this.client.zAdd('key1', {
			score : 17,
			member : 'value17'
		});
		this.client.zAdd('key1', {
			score : 18,
			member : 'value18'
		});
		this.client.zAdd('key1', {
			score : 19,
			member : 'value19'
		});
		this.client.zAdd('key1', {
			score : 20,
			member : 'value20'
		});

		this.client.zScan('key1', cursor, null, function(resp, err) {
			console.log(resp.cursor);
			console.log(resp.results);
		});

		this.client.zScan('key1', cursor, new params.ScanParams().count(count),
				function(resp, err) {
					console.log(resp.cursor);
					console.log(resp.results);
				});

		this.client.zScan('key1', cursor, new params.ScanParams().count(count),
				function(resp, err) {
					console.log(resp.cursor);
					console.log(resp.results);
				});
	}
};
var tester = new SortSetCmdTest();
if (typeof describe === "function") {
	describe("SortSetCmd", function() {
		describe("#zadd", function() {
			it("Redis zadd command", function() {
				tester.test_zadd();
			});
		});
		describe("#zscore", function() {
			it("Redis zscore command", function() {
				tester.test_zscore();
			});
		});
		describe("#zcard", function() {
			it("Redis zcard command", function() {
				tester.test_zcard();
			});
		});
		describe("#zcount", function() {
			it("Redis zcount command", function() {
				tester.test_zcount();
			});
		});
		describe("#zincrby", function() {
			it("Redis zincrby command", function() {
				tester.test_zincrby();
			});
		});
		describe("#zrange", function() {
			it("Redis zrange command", function() {
				tester.test_zrange();
			});
		});
		describe("#zrangebyscore", function() {
			it("Redis zrangebyscore command", function() {
				tester.test_zrangebyscore();
			});
		});
		describe("#zrank", function() {
			it("Redis zrank command", function() {
				tester.test_zrank();
			});
		});
		describe("#zrem", function() {
			it("Redis zrem command", function() {
				tester.test_zrem();
			});
		});

		describe("#zremrangebyrank", function() {
			it("Redis zremrangebyrank command", function() {
				tester.test_zremrangebyrank();
			});
		});
		describe("#zremrangebyscore", function() {
			it("Redis zremrangebyscore command", function() {
				tester.test_zremrangebyscore();
			});
		});
		describe("#zrevrange", function() {
			it("Redis zrevrange command", function() {
				tester.test_zrevrange();
			});
		});
		describe("#zRevRangeByScore", function() {
			it("Redis zRevRangeByScore command", function() {
				tester.test_zRevRangeByScore();
			});
		});
		describe("#zRevRank", function() {
			it("Redis zRevRank command", function() {
				tester.test_zRevRank();
			});
		});
		describe("#zUnionStore", function() {
			it("Redis zUnionStore command", function() {
				tester.test_zUnionStore();
			});
		});
		describe("#zinterstore", function() {
			it("Redis zinterstore command", function() {
				tester.test_zinterstore();
			});
		});
		describe("#zscan", function() {
			it("Redis zscan command", function() {
				tester.test_zscan();
			});
		});
	});
} else {
	tester.test_zadd();
	tester.test_zscore();
	tester.test_zcard();
	tester.test_zcount();
	tester.test_zincrby();
	tester.test_zrange();
	tester.test_zrangebyscore();
	tester.test_zrank();
	tester.test_zrem();
	tester.test_zremrangebyrank();
	tester.test_zremrangebyscore();
	tester.test_zrevrange();
	tester.test_zRevRangeByScore();
	tester.test_zRevRank();
	tester.test_zUnionStore();
	tester.test_zinterstore();
	tester.test_zscan();
}