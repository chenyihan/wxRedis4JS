/**
 * http://usejsdoc.org/
 */
'use strict';
var Client = require('../lib/client.js').Client;
var utils = require('util'), baseCmdTest = require('./base_cmd_test'), assert = require("assert"), params = require("../lib/params.js");
function SetCmdTest() {
	if (!(this instanceof SetCmdTest)) {
		return new SetCmdTest();
	}
	baseCmdTest.BaseCmdTest.call(this);
}

utils.inherits(SetCmdTest, baseCmdTest.BaseCmdTest);
var baseProto = baseCmdTest.BaseCmdTest.prototype;
SetCmdTest.prototype = {
	test_sadd : function() {
		this.client.flushAll();

		this.client.sAdd('skey1', 'svalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.sAdd('skey1', 'svalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.sAdd('skey1', 'svalue2', 'svalue3', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2);
			});
		});
	},
	test_spop : function() {
		this.client.flushAll();

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);

		this.client.sPop('skey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.notEqual(resp, 'null');
			});
		});

		this.client.sPop('skey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.notEqual(resp, 'null');
			});
		});

		this.client.sPop('skey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.notEqual(resp, 'null');
			});
		});

		this.client.sPop('skey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 'null');
			});
		});
	},
	test_srandmember : function() {
		this.client.flushAll();

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);

		this.client.sRandMember('skey1', 1, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 1);
			});
		});

		this.client.sRandMember('skey1', 2, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 2);
			});
		});

		this.client.sRandMember('skey1', 3, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
			});
		});

		this.client.sRandMember('skey1', 4, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
			});
		});

		this.client.sRandMember('skey1', -2, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 2);
			});
		});

		this.client.sRandMember('skey1', -3, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 3);
			});
		});

		this.client.sRandMember('skey1', -4, function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 4);
			});
		});
	},
	test_scard : function() {
		this.client.flushAll();

		this.client.sCard('skey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);

		this.client.sCard('skey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 3);
			});
		});
	},
	test_sdiff : function() {
		this.client.flushAll();

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);
		this.client.sAdd('skey2', [ 'svalue4', 'svalue2', 'svalue3' ]);

		this.client.sDiff([ 'skey1', 'skey2' ], function(resp, err) {
			console.log(resp);
		});
	},
	test_sdiffstore : function() {
		this.client.flushAll();

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);
		this.client.sAdd('skey2', [ 'svalue4', 'svalue2', 'svalue3' ]);

		this.client.sDiffStore('skey3', [ 'skey1', 'skey2' ], function(resp,
				err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.sMembers('skey3', function(resp, err) {
			console.log(resp);
		});
	},
	test_sinter : function() {
		this.client.flushAll();

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);
		this.client.sAdd('skey2', [ 'svalue4', 'svalue2', 'svalue3' ]);

		this.client.sInter([ 'skey1', 'skey2' ], function(resp, err) {
			console.log(resp);
		});
	},
	test_sinterstore : function() {
		this.client.flushAll();

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);
		this.client.sAdd('skey2', [ 'svalue4', 'svalue2', 'svalue3' ]);

		this.client.sInterStore('skey3', [ 'skey1', 'skey2' ], function(resp,
				err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 2);
			});
		});

		this.client.sMembers('skey3', function(resp, err) {
			console.log(resp);
		});
	},
	test_sismember : function() {
		this.client.flushAll();

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);

		this.client.sisMember('skey1', 'skey2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.sisMember('skey1', 'svalue2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});
	},
	test_smove : function() {
		this.client.flushAll();

		this.client.sMove('skey1', 'skey2', 'svalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 0);
			});
		});

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);

		this.client.sMembers('skey2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 0);
			});
		});

		this.client.sMove('skey1', 'skey2', 'svalue1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 1);
			});
		});

		this.client.sMembers('skey2', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 1);
			});
		});

		this.client.sMembers('skey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 2);
			});
		});
	},
	test_srem : function() {
		this.client.flushAll();
		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);

		this.client.sRem('skey1', [ 'svalue4', 'svalue2' ],
				function(resp, err) {
					baseProto.dealCmdResult(resp, err, function() {
						assert.equal(resp, 1);
					});
				});

		this.client.sMembers('skey1', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 2);
			});
		});
	},
	test_suion : function() {
		this.client.flushAll();

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);
		this.client.sAdd('skey2', [ 'svalue4', 'svalue2', 'svalue3' ]);

		this.client.sUnion([ 'skey1', 'skey2' ], function(resp, err) {
			console.log(resp);
		});
	},
	test_suionstore : function() {
		this.client.flushAll();

		this.client.sAdd('skey1', [ 'svalue1', 'svalue2', 'svalue3' ]);
		this.client.sAdd('skey2', [ 'svalue4', 'svalue2', 'svalue3' ]);

		this.client.sUnionStore('skey3', [ 'skey1', 'skey2' ], function(resp,
				err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp, 4);
			});
		});

		this.client.sMembers('skey3', function(resp, err) {
			baseProto.dealCmdResult(resp, err, function() {
				assert.equal(resp.length, 4);
			});
		});
	},
	test_sscan : function() {
		this.client.flushAll();

		this.client.sAdd('key1', 'value1');
		this.client.sAdd('key1', 'value2');
		this.client.sAdd('key1', 'value3');
		this.client.sAdd('key1', 'value4');
		this.client.sAdd('key1', 'value5');
		this.client.sAdd('key1', 'value6');
		this.client.sAdd('key1', 'value7');
		this.client.sAdd('key1', 'value8');
		this.client.sAdd('key1', 'value9');
		this.client.sAdd('key1', 'value10');
		this.client.sAdd('key1', 'value11');
		this.client.sAdd('key1', 'value12');
		this.client.sAdd('key1', 'value13');
		this.client.sAdd('key1', 'value14');
		this.client.sAdd('key1', 'value15');
		this.client.sAdd('key1', 'value16');
		this.client.sAdd('key1', 'value17');
		this.client.sAdd('key1', 'value18');
		this.client.sAdd('key1', 'value19');
		this.client.sAdd('key1', 'value20');

		var count = 5;
		var cursor = 0;
		this.client.sScan('key1', cursor, new params.ScanParams().count(count),
				function(resp, err) {
					console.log(resp);
				});
	}
};
var tester = new SetCmdTest();
if (typeof describe === "function") {
	describe("SetCmdTest", function() {
		describe("#sadd", function() {
			it("Redis sadd command", function() {
				tester.test_sadd();
			});
		});
		describe("#scard", function() {
			it("Redis scard command", function() {
				tester.test_scard();
			});
		});
		describe("#spop", function() {
			it("Redis spop command", function() {
				tester.test_spop();
			});
		});
		describe("#srandmember", function() {
			it("Redis srandmember command", function() {
				tester.test_srandmember();
			});
		});
		describe("#sdiff", function() {
			it("Redis sdiff command", function() {
				tester.test_sdiff();
			});
		});
		describe("#sdiffstore", function() {
			it("Redis sdiffstore command", function() {
				tester.test_sdiffstore();
			});
		});
		describe("#sinter", function() {
			it("Redis sinter command", function() {
				tester.test_sinter();
			});
		});
		describe("#sinterstore", function() {
			it("Redis sinterstore command", function() {
				tester.test_sinterstore();
			});
		});
		describe("#sismember", function() {
			it("Redis sismember command", function() {
				tester.test_sismember();
			});
		});
		describe("#smove", function() {
			it("Redis smove command", function() {
				tester.test_smove();
			});
		});
		describe("#srem", function() {
			it("Redis srem command", function() {
				tester.test_srem();
			});
		});
		describe("#suion", function() {
			it("Redis suion command", function() {
				tester.test_suion();
			});
		});
		describe("#suionstore", function() {
			it("Redis suionstore command", function() {
				tester.test_suionstore();
			});
		});
		describe("#sscan", function() {
			it("Redis sscan command", function() {
				tester.test_sscan();
			});
		});
	});
} else {
	tester.test_sadd();
	tester.test_spop();
	tester.test_srandmember();
	tester.test_scard();
	tester.test_sdiff();
	tester.test_sdiffstore();
	tester.test_sinter();
	tester.test_sinterstore();
	tester.test_sismember();
	tester.test_smove();
	tester.test_srem();
	tester.test_suion();
	tester.test_suionstore();
	 tester.test_sscan();
}