/**
 * http://usejsdoc.org/
 */

'use strict';
var buffer = require('buffer');

function convertToStr(bytes) {
	if (!bytes) {
		return null;
	}
	var buff = new buffer.Buffer(bytes);
	return buff.toString();
}

module.exports.convertToStr = convertToStr;