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
	return typeof data === 'number';
}

function isArray(data) {
	return data instanceof Array;
}

function isBoolean(data) {
	return typeof data === "boolean";
}

function isObject(data) {
	return typeof data === "object";
}

function hashCode(value) {
	if (value === null || value === undefined) {
		return 0;
	}
	if (isNumberType(value)) {
		var rawBits = numberToRawBits(value);
		return rawBits.hRawBits ^ rawBits.lRawbits;
	}
	if (isStringType(value)) {
		return stringHashCode(value);
	}
	if (isBoolean(value)) {
		return booleanHashCode(value);
	}
	if (isObject(value)) {
		return objectHashCode(value);
	}
	if (isArray(value)) {
		return arrayHashCode(value);
	}
	return hashCode(value.toString());
}

function objectHashCode(obj) {
	if (str === null || str === undefined) {
		return 0;
	}
	var h = 1;
	for ( var k in obj) {
		var v = obj[k];
		h = 31 * h + hashCode(v);
	}
	return h;
}

function booleanHashCode(b) {
	return b ? 1231 : 1237;
}

function arrayHashCode(array) {
	if (str === null || str === undefined) {
		return 0;
	}
	var hashcode = 1;
	for (var i = 0; i < array.length; i++) {
		var val = array[i];
		hashCode = 31 * hashcode + hashCode(val);
	}
	return hashcode;
}

function stringHashCode(str) {
	if (str === null || str === undefined) {
		return 0;
	}
	var hash = 0;
	for (var i = 0; i < str.length; i++) {
		hash = 31 * hash + str.charCodeAt(i);
	}
	return hash;
}

function numberToRawBits(number) {
	if (number === 0) {
		return {
			hRawBits : 0,
			lRawbits : 0
		};
	}
	var s = number >= 0 ? 0 : 1;
	var e = 0;
	var m = number;
	var absM;
	while (!((absM = Math.abs(m)) >= 1 && absM < 2)) {
		if (absM >= 2) {
			m = m / 2;
			e++;
		} else if (absM < 1) {
			m = m * 2;
			e--;
		}
	}
	m = m > 0 ? m : -m;
	if (m >= 1) {
		m--;
	}
	var M1 = "";
	for (var i = 0; i < 20; i++) {
		m = m * 2;
		if (m >= 1) {
			m--;
			M1 += "1";
		} else {
			M1 += "0";
		}
	}

	var M2 = "";
	for (var i = 20; i < 52; i++) {
		m = m * 2;
		if (m >= 1) {
			m--;
			M2 += "1";
		} else {
			M2 += "0";
		}
	}
	var E = e + 1023;
	M1 = parseInt(M1, 2);
	var hRawBits = (s << 31) | ((E & 0x7FF) << 20) | (M1 & 0xFFFFF);
	var lRawbits = M2;
	console.log("hRawBits:" + hRawBits.toString(2));
	console.log("lRawbits:" + lRawbits.toString(2));
	return {
		hRawBits : hRawBits,
		lRawbits : lRawbits
	};

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
		// key = hashCode(key).toString();
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
module.exports.hashCode = hashCode;
module.exports.stringHashCode = stringHashCode;
module.exports.booleanHashCode = booleanHashCode;
module.exports.arrayHashCode = arrayHashCode;
module.exports.objectHashCode = objectHashCode;
module.exports.numberToRawBits = numberToRawBits;
module.exports.hashByMD5 = hashByMD5;
module.exports.ConsistHash = ConsistHash;