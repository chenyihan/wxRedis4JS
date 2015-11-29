/**
 * http://usejsdoc.org/
 */

'use strict';
var util = require('util');
function ReplaySignal(name) {
	if (!(this instanceof ReplaySignal)) {
		return new ReplaySignal(name);
	}
	Error.call(this);
	this.name = name;
}

util.inherits(ReplaySignal, Error);

ReplaySignal.prototype = {
	toString : function() {
		return this.name;
	}
};

const
INSTANCE = new ReplaySignal('ReplaySignal');

function getReplaySignal() {
	return INSTANCE;
}

function ProtocolError(message) {
	if (!(this instanceof ProtocolError)) {
		return new ProtocolError(message);
	}
	Error.call(this, message);
}

util.inherits(ProtocolError, Error);

function ConnectionError(code) {
	if (!(this instanceof ConnectionError)) {
		return new ConnectionError(code);
	}
	Error.call(this);
	this.code = code;
}

util.inherits(ConnectionError, Error);

function IllegalArgsException(message) {
	if (!(this instanceof IllegalArgsException)) {
		return new IllegalArgsException(message);
	}
	Error.call(message);
	this.message = message;
}
util.inherits(IllegalArgsException, Error);

const
TIMEOUT = 1;
const
ERROR = 2;
ConnectionError.prototype = {
	isTimeout : function() {
		return this.code == TIMEOUT;
	}
}

module.exports.IllegalArgsException = IllegalArgsException;
module.exports.ReplaySignal = ReplaySignal;
module.exports.getReplaySignal = getReplaySignal;
module.exports.ProtocolError = ProtocolError;
module.exports.ConnectionError = ConnectionError;
module.exports.ConnectionError.TIMEOUT = TIMEOUT;
module.exports.ConnectionError.ERROR = ERROR;