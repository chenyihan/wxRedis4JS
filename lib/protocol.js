/**
 * http://usejsdoc.org/
 */
'use strict';

var utils = require('./util/utils.js'), Buffer = require('buffer').Buffer, ReplayableBuffer = require('./buffer.js').ReplayableBuffer, exception = require('./exception.js');

const
DOLLAR_BYTE = '$';// 36;
const
ASTERISK_BYTE = '*';// 42;
const
PLUS_BYTE = '+';// 43;
const
MINUS_BYTE = '-';// 45;
const
COLON_BYTE = ':';// 58;
const
NULL = "null";
const
SIZETABLE = [ 9, 99, 999, 9999, 99999, 999999, 9999999, 99999999, 999999999,
		Number.MAX_VALUE ];

const
DIGIT_TENS = [ '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1',
		'1', '1', '1', '1', '1', '1', '1', '2', '2', '2', '2', '2', '2', '2',
		'2', '2', '2', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '4',
		'4', '4', '4', '4', '4', '4', '4', '4', '4', '5', '5', '5', '5', '5',
		'5', '5', '5', '5', '5', '6', '6', '6', '6', '6', '6', '6', '6', '6',
		'6', '7', '7', '7', '7', '7', '7', '7', '7', '7', '7', '8', '8', '8',
		'8', '8', '8', '8', '8', '8', '8', '9', '9', '9', '9', '9', '9', '9',
		'9', '9', '9' ];
const
DIGIT_ONES = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2',
		'3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6',
		'7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
		'1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4',
		'5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8',
		'9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2',
		'3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6',
		'7', '8', '9' ];

const
DIGITS = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', '', 'c', 'd',
		'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
		's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ];
const
BACKSLASH_R_BYTES = 13; // \r

const
BACKSLASH_N_BYTES = 10;// \n

function writeCrLf() {
	var buf = new Buffer('\r\n');
	return buf;
}

function writeIntCrLf(value) {
	var str = '';
	if (value < 0) {
		// data.push(45); // -
		str += '-';
		value = -value;
	}
	var size = 0;
	while (value > SIZETABLE[size]) {
		size += 1;
	}

	size += 1;
	var q = 0, r = 0;
	var num = '';
	while (value >= 65536) {
		q = value;
		r = value - ((q << 6) + (q << 5) + (q << 2));
		value = q;
		num = DIGIT_ONES[r] + num;
		num = DIGIT_TENS[r] + num;
	}
	while (true) {
		q = (value * 52429) >> (16 + 3);
		r = value - ((q << 3) + (q << 1));
		num = DIGITS[r] + num;
		value = q;
		if (value === 0) {
			break;
		}
	}

	str += num + '\r\n';
	var buf = new Buffer(str);
	return buf;
}

function readLine(buf) {
	// var str = '';
	var bytes = [];
	while (true) {
		var b = buf.readByte();
		if (b == BACKSLASH_R_BYTES) {
			var c = buf.readByte();
			if (c == BACKSLASH_N_BYTES) {
				break;
			}
			bytes.push(b);
			bytes.push(c);
		} else {
			bytes.push(b);
		}
	}
	if (bytes.length === 0) {
		throw new Error('It seems like server has closed the connection.');
	}
	return new Buffer(bytes).toString();
}

function parseStatusCodeReply(buffer) {
	return readLine(buffer);
}

function parseError(buffer) {
	var msg = readLine(buffer);
	throw new exception.ProtocolError(msg);
}

function parseInteger(buffer) {
	return parseInt(readLine(buffer));
}

function parseBulkReply(buffer) {
	var length = parseInt(readLine(buffer));
	if (length == -1) {
		return NULL;
	}
	var readBytes = buffer.readBytes(length);
	// pass \r and \n
	buffer.readByte();
	buffer.readByte();
	return readBytes;
}

function parseMultiBulkReply(buffer) {
	var num = parseInt(readLine(buffer));
	if (num == -1) {
		return [];
	}
	var ret = [];
	for (var i = 0; i < num; i++) {
		try {
			ret.push(readResponse(buffer));
		} catch (e) {
			// noop
		}
	}
	return ret;
}

function parseResponse(buffer) {
	var buffer = new ReplayableBuffer(buffer, 0);
	// var b = buffer.readByte();
	// b = String.fromCharCode(b);
	// switch (b) {
	// case MINUS_BYTE:
	// parseError(buffer);
	// break;
	// case ASTERISK_BYTE:
	// return parseMultiBulkReply(buffer);
	// break;
	// case COLON_BYTE:
	// return parseInteger(buffer);
	// break;
	// case DOLLAR_BYTE:
	// return parseBulkReply(buffer);
	// break;
	// case PLUS_BYTE:
	// return parseStatusCodeReply(buffer);
	// break;
	// default:
	// throw new exception.ProtocolError('Unknown reply:' + b);
	// break;
	// }
	return readResponse(buffer);
}

function readResponse(replayableBuffer) {
	var buffer = replayableBuffer;
	var b = buffer.readByte();
	b = String.fromCharCode(b);
	switch (b) {
	case MINUS_BYTE:
		parseError(buffer);
		break;
	case ASTERISK_BYTE:
		return parseMultiBulkReply(buffer);
		break;
	case COLON_BYTE:
		return parseInteger(buffer);
		break;
	case DOLLAR_BYTE:
		return parseBulkReply(buffer);
		break;
	case PLUS_BYTE:
		return parseStatusCodeReply(buffer);
		break;
	default:
		throw new exception.ProtocolError('Unknown reply:' + b);
		break;
	}
}

function isNull(text) {
	return text == NULL;
}

function genSendData(commands) {
	var command = commands.command;
	var args = commands.args;

	var buffer1 = new Buffer(ASTERISK_BYTE);
	var argsLen = args ? args.length + 1 : 1;
	var buffer2 = writeIntCrLf(argsLen);
	var buffer3 = new Buffer(DOLLAR_BYTE);
	var buffer4 = writeIntCrLf(command.length);
	var buffer5 = command;
	var buffer6 = writeCrLf();
	var bufList = [ buffer1, buffer2, buffer3, buffer4, buffer5, buffer6 ];
	var totalLength = buffer1.length + buffer2.length + buffer3.length
			+ buffer4.length + buffer5.length + buffer6.length;
	if (args) {
		args.forEach(function(item, index, array) {
			var buffer7 = new Buffer(DOLLAR_BYTE);
			bufList.push(buffer7);
			var buffer8 = writeIntCrLf(item.length);
			bufList.push(buffer8);
			var buffer9 = item;
			bufList.push(buffer9);
			var buffer10 = writeCrLf();
			bufList.push(buffer10);
			totalLength += buffer7.length + buffer8.length + buffer9.length
					+ buffer10.length;
		});
	}
	return Buffer.concat(bufList, totalLength);
}

module.exports.isNull = isNull;
module.exports.genSendData = genSendData;
module.exports.parseResponse = parseResponse;