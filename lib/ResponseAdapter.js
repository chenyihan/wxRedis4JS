/**
 * http://usejsdoc.org/
 */

'use strict';
var buffer = require('buffer');

function convertToStr(data) {
	if (data === undefined || data === null) {
		return null;
	}
	if (typeof data === "string") {
		return data;
	}
	if (typeof data === "number" || typeof data === "boolean") {
		return data.toString();
	}
	var buff = new buffer.Buffer(data);
	return buff.toString();
}

// function convertToInt(data) {
// if (data instanceof Array) {
// var str = convertToStr(data);
// return parseInt(str);
// }
// return parseInt(data);
// }

function convertToNumber(data) {
	if (data instanceof Array) {
		var str = convertToStr(data);
		return Number(str);
	}
	return Number(data);
}

function convertToArray(data) {
	if (!(data instanceof Array)) {
		return [ convertToStr(data) ];
	}
	var result = [];
	for (var i = 0; i < data.length; i++) {
		result.push(convertToStr(data[i]));
	}
	return result;
}

module.exports.convertToStr = convertToStr;
// module.exports.convertToInt = convertToInt;
module.exports.convertToArray = convertToArray;
module.exports.convertToNumber = convertToNumber;