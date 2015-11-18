/**
 * http://usejsdoc.org/
 */
'use strict';

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
module.exports.stringToBytes = stringToBytes;
module.exports.isStringType = isStringType;
module.exports.bytesToString = bytesToString;
module.exports.isNumberType = isNumberType;