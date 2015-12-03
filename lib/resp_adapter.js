/**
 * http://usejsdoc.org/
 */

'use strict';
var buffer = require('buffer');

// function ScanResult(cursor, results) {
// if (!(this instanceof ScanResult)) {
// return new ScanResult(cursor, results);
// }
// this.cursor = cursor;
// this.results = results;
// }

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

function convertToKVPairs(data) {
	var result = {};
	if (data === undefined || data === null) {
		return result;
	}
	if (!(data instanceof Array)) {
		result["_"] = convertToStr(data);
		return result;
	}
	var len = data.length;
	for (var i = 0; i < len; i += 2) {
		var field = data[i];
		var value = null;
		if (i < len - 1) {
			value = data[i + 1];
		}
		field = convertToStr(field);
		value = convertToStr(value);
		result[field] = value;
	}
	return result;
}

function convertToScanResult(data) {
	var newCursor = convertToStr(data[0]);
	var rawResults = data[1];
	var results = [];
	for (var i = 0; i < rawResults.length; i++) {
		results.push(convertToStr(rawResults[i]));
	}
	// return new ScanResult(newCursor, results);
	return {
		cursor : newCursor,
		results : results
	};
}

function convertToHashScanResult(data) {
	if (data === undefined || data === null) {
		return {
			cursor : 0,
			results : {}
		};
	}
	if (!(data instanceof Array)) {
		var respStr = convertToStr(data);
		var r = {};
		r[respStr] = respStr;
		return {
			cursor : 0,
			results : r
		};
	}
	if (data.length === 0) {
		return {
			cursor : 0,
			results : {}
		};
	}
	var cursor = convertToStr(data[0]);
	if (data.length === 1) {
		return {
			cursor : cursor,
			results : {}
		};
	}
	var rawResults = data[1];
	var results = [];
	var len = rawResults.length;
	for (var i = 0; i < len; i += 2) {
		var result = {};
		var field = convertToStr(rawResults[i]);
		var value = null;
		if (i < len - 1) {
			value = convertToStr(rawResults[i + 1]);
		}
		result[field] = value;
		results.push(result);
	}
	return {
		cursor : cursor,
		results : results
	};
}

module.exports.convertToStr = convertToStr;
// module.exports.convertToInt = convertToInt;
module.exports.convertToArray = convertToArray;
module.exports.convertToNumber = convertToNumber;
// module.exports.ScanResult = ScanResult;
module.exports.convertToScanResult = convertToScanResult;
module.exports.convertToKVPairs = convertToKVPairs;
module.exports.convertToHashScanResult = convertToHashScanResult;