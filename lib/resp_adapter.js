/**
 * http://usejsdoc.org/
 */

'use strict';
var buffer = require('buffer');
var protocol = require("./protocol");

function ScanResult(cursor, results) {
	if (!(this instanceof ScanResult)) {
		return new ScanResult(cursor, results);
	}
	this.cursor = cursor;
	this.results = results;
}

function ScoreMember(score, member) {
	if (!(this instanceof ScoreMember)) {
		return new ScoreMember(score, member);
	}
	this.score = score;
	this.member = member;
}

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

function convertToNumber(data) {
	if (data === "null") {
		data = -1;
	}
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
	return new ScanResult(newCursor, results);
}

function convertToHashScanResult(data) {
	if (data === undefined || data === null) {
		return new ScanResult(0, {});
	}
	if (!(data instanceof Array)) {
		var respStr = convertToStr(data);
		var r = {};
		r[respStr] = respStr;
		return new ScanResult(0, r);
	}
	if (data.length === 0) {
		return new ScanResult(0, {});
	}
	var cursor = convertToStr(data[0]);
	if (data.length === 1) {
		return new ScanResult(cursor, {});
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
	return new ScanResult(cursor, results);
}

function convertToSetScanResult(data) {
	if (data === undefined || data === null) {
		return new ScanResult(0, protocol.NULL);
	}
	if (!(data instanceof Array)) {
		return new ScanResult(0, convertToStr(data));
	}
	if (data.length === 0) {
		return new ScanResult(0, protocol.NULL);
	}
	var cursor = convertToStr(data[0]);
	if (data.length === 1) {
		return new ScanResult(cursor, protocol.NULL);
	}
	var rawResult = data[1];
	var results = [];
	var len = rawResult.length;
	for (var i = 0; i < len; i++) {
		results.push(convertToStr(rawResult[i]));
	}
	return new ScanResult(cursor, results);
}

function convertToScoreMember(data) {
	if (data === undefined || data === null) {
		return [];
	}
	if (!(data instanceof Array)) {
		return [];
	}
	var len = data.length;
	var result = [];
	for (var i = 0; i < len; i += 2) {
		var member = data[i];
		var score = 0;
		if (i < len - 1) {
			score = data[i + 1];
		}
		result.push(new ScoreMember(convertToNumber(score),
				convertToStr(member)));
	}
	return result;
}

function convertToScoreMemberScanResult(data) {
	if (data === null || data === undefined) {
		return new ScanResult(0, []);
	}

	if (!(data instanceof Array)) {
		return new ScanResult(0, new ScoreMember(0, 'null'));
	}

	if (data.length <= 1) {
		return new ScanResult(0, []);
	}

	var newCursor = data[0];
	var rawResults = data[1];
	var results = [];
	var len = rawResults.length;
	for (var i = 0; i < len; i += 2) {
		var field = rawResults[i];
		var value = 'null';
		if (i < len - 1) {
			value = rawResults[i + 1];
		}
		results.push(new ScoreMember(convertToNumber(value),
				convertToStr(field)));
	}
	return new ScanResult(convertToStr(newCursor), results);
}

module.exports.convertToStr = convertToStr;
// module.exports.convertToInt = convertToInt;
module.exports.convertToArray = convertToArray;
module.exports.convertToNumber = convertToNumber;
module.exports.ScanResult = ScanResult;
module.exports.convertToScanResult = convertToScanResult;
module.exports.convertToKVPairs = convertToKVPairs;
module.exports.convertToHashScanResult = convertToHashScanResult;
module.exports.convertToSetScanResult = convertToSetScanResult;
module.exports.convertToScoreMember = convertToScoreMember;
module.exports.convertToScoreMemberScanResult = convertToScoreMemberScanResult;
module.exports.ScoreMember = ScoreMember;