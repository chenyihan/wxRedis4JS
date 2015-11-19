/**
 * http://usejsdoc.org/
 */
'use strict';

var crypto = require('crypto');
function bytesToString(bytes) {
	var str = '';
	bytes.forEach(function(item, index, array) {
		str += String.fromCharCode(item);
	})
	return str;
}
function stringToBytes(str) {
	var charCode, bytes = [], tempBytes;
	for (var i = 0; i < str.length; i++) {
		charCode = str.charCodeAt(i);
		tempBytes = [];
		do {
			tempBytes.push(charCode & 0xFF);
			charCode >>= 8;
		} while (charCode);
		bytes = bytes.concat(tempBytes.reverse());
	}
	return bytes;
}

function isStringType(data) {
	return typeof data === 'string';
}

function isNumberType(data) {
	return typeof data == 'number';
}

function isArray(data) {
	return data instanceof Array;
}

function removeFromArray(array, item) {
	if (!array || item) {
		return -1;
	}
	var matchedIdx;
	for (var i = 0; i < array.length; i++) {
		var currItem = array[i];
		if (currItem == item) {
			matchedIdx = i;
		}
	}
	if (matchedIdx) {
		array.splice(matchedIdx, 1);
	}
	return matchedIdx;
}

function hashByMD5(data) {
	var md5 = crypto.createHash('md5');
	md5.update(data);
	return md5.digest('hex');
}

function ConsistHash(nodes, replicas) {
	if (!(this instanceof ConsistHash)) {
		return new ConsistHash(nodes);
	}
	this.nodes = nodes;
	this.sortedMap = {};
	this.sortedKeys = [];
	this.replicas = replicas;
	if (!this.replicas) {
		this.replicas = 3;
	}
	if (nodes) {
		for (var i = 0; i < nodes.length; i++) {
			this.addNode(nodes[i]);
		}
	}
}

ConsistHash.prototype = {
	addNode : function(node) {
		for (var i = 0; i < this.replicas; i++) {
			var key = this.gen_nodekey(node, 0);
			this.sortedMap[key] = node;
			this.sortedKeys.push(key);
		}
		this.sortedKeys.sort();
	},
	removeNode : function(node) {
		for (i = 0; i < this.replicas; i++) {
			var key = this.gen_nodekey(node, 0);
			delete this.sortedMap[key];
			removeFromArray(this.sortedKeys, key);
		}
	},
	getNodeAndPosOfKey : function(key) {
		if (!key) {
			return {
				node : null,
				pos : null
			};
		}
		var k = hashByMD5(key);
		for (var i = 0; i < this.sortedKeys.length; i++) {
			var nodeKey = this.sortedKeys[i];
			if (k <= nodeKey) {
				return {
					node : this.sortedMap[nodeKey],
					pos : i
				};
			}
		}
		return {
			pos : 0,
			node : this.sortedMap[this.sortedKeys[0]]
		};
	},
	getNode : function(key) {
		return this.getNodeAndPosOfKey(key).node;
	},
	gen_nodekey : function(node, i) {
		return hashByMD5(node.toString() + ":" + i);
	}
};
module.exports.stringToBytes = stringToBytes;
module.exports.isStringType = isStringType;
module.exports.bytesToString = bytesToString;
module.exports.isNumberType = isNumberType;
module.exports.hashByMD5 = hashByMD5;
module.exports.ConsistHash = ConsistHash;