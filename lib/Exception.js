/**
 * http://usejsdoc.org/
 */

'use strict';
var util = require('util');
function ReplaySignal(name) {
	if (!this instanceof ReplaySignal) {
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

module.exports.ReplaySignal = ReplaySignal;
module.exports.getReplaySignal = getReplaySignal;
