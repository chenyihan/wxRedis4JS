/**
 * http://usejsdoc.org/
 */
'use strict';
var utils = require('../lib/util/utils.js');
var ServerNode = require('../lib/node.js').ServerNode;
function test_md5() {
	var key = 'Hello world';
	var value = utils.hashByMD5(key);

	console.log(value);
}

function test_hashCode() {
	var number = 0.0265;
	console.log(utils.hashCode(number));

	number = 0;
	console.log(utils.hashCode(number));

	number = 19809.22454;
	console.log(utils.hashCode(number));

	number = -1.5556564560324;
	console.log(utils.hashCode(number));

	number = 1234787;
	console.log(utils.hashCode(number));

	number = 1;
	console.log(utils.hashCode(number));

	number = -1;
	console.log(utils.hashCode(number));

	var str = "abcdefg";
	console.log(utils.stringHashCode(str));

	console.log(utils.hashCode(utils.hashCode));

	console.log(utils.hashCode([ 1.223, 4545.6, 9.3 ]));

	console.log(utils.hashCode({
		a : 1,
		b : 2,
		c : "dcc"
	}));

}

function test_consistHash() {
	var nodes = [];
	var node1 = ServerNode();
	node1.setHost("192.168.1.101");
	node1.setPort(6379);
	var node2 = ServerNode();
	node2.setHost("192.168.1.102");
	node2.setPort(6379);
	var node3 = ServerNode();
	node3.setHost("192.168.1.103");
	node3.setPort(6379);
	var node4 = ServerNode();
	node4.setHost("192.168.1.104");
	node4.setPort(6379);
	var node5 = ServerNode();
	node5.setHost("192.168.1.105");
	node5.setPort(6379);
	var node6 = ServerNode();
	node6.setHost("192.168.1.106");
	node6.setPort(6379);
	var node7 = ServerNode();
	node7.setHost("192.168.1.107");
	node7.setPort(6379);
	var node8 = ServerNode();
	node8.setHost("192.168.1.108");
	node8.setPort(6379);
	var node9 = ServerNode();
	node9.setHost("192.168.1.109");
	node9.setPort(6379);
	var node10 = ServerNode();
	node10.setHost("192.168.1.100");
	node10.setPort(6379);
	nodes.push(node1);
	nodes.push(node2);
	nodes.push(node3);
	nodes.push(node4);
	nodes.push(node5);
	nodes.push(node6);
	nodes.push(node7);
	nodes.push(node8);
	nodes.push(node9);
	nodes.push(node10);

	var hash = new utils.ConsistHash(nodes);
	var testNumber = 100000;
	var result = {};
	for (var i = 0; i < testNumber; i++) {
		var key = 'key-' + i;
		var n = hash.getNode(key);
		var number = result[n.host] ? result[n.host] : 0;
		number++;
		result[n.host] = number;
		// console.log(n);
	}
	for ( var r in result) {
		console.log(r + ":" + result[r]);
	}
}
if (typeof describe == "function") {
	describe("util", function() {
		describe("#hashByMD5", function() {
			it("should generate md5 code of this key", function() {
				test_md5();
			})
		});
		describe("#hashCode", function() {
			it("generate hashcode", function() {
				test_hashCode();
			})
		});
		describe("#ConsistHash", function() {
			it("test consistence hash algorithm", function() {
				test_consistHash();
			})
		})
	});
} else {
	test_md5();
	test_hashCode();
	test_consistHash();
}
