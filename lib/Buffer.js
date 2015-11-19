/**
 * http://usejsdoc.org/
 */
'use strict';
var exception = require('./Exception.js');
const
REPLAY = exception.ReplaySignal();
function ReplayableBuffer(buf, readIdx) {
	if (!(this instanceof ReplayableBuffer)) {
		return new ReplayableBuffer(buf, readIdx);
	}
	if (!buf) {
		throw new Error('The buf parameter must be nullable');
	}
	this.buf = buf;
	this.readIdx = readIdx ? readIdx : 0;
	this.checkpoint = 0;

}
var proto = ReplayableBuffer.prototype = {
	readByte : function() {
		if (this.readIdx >= this.buf.length) {
			this.reset();
			throw REPLAY;
		}
		return this.buf.readUInt8(this.readIdx++);
	},
	readBytes : function(length) {
		var len = length ? length : 1;
		var bytes = [];
		for (var i = 0; i < len; i++) {
			bytes.push(this.readByte());
		}

	},
	reset : function() {
		this.readIdx = this.checkpoint ? this.checkpoint : 0;
	},
	saveCheckPoint : function(checkpoint) {
		this.checkpoint = checkpoint;
	}
};
module.exports.ReplayableBuffer = ReplayableBuffer;