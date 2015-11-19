/**
 * http://usejsdoc.org/
 */
'use strict';

var net = require('net'), Buffer = require('buffer').Buffer, protocol = require('./protocol.js'), command = require('./Command.js'), responseAdapter = require('./ResponseAdapter'), exception = require('./Exception.js');
const
REPLAY = exception.ReplaySignal();

function Client(options) {
	if (!(this instanceof Client)) {
		return new Client(options);
	}
	if (!options.host) {
		throw new Error('You must pass host parameter');
	}
	if (!options.port) {
		throw new Error('You must pass port parameter');
	}
	this.options = options;
	this.conn = net.createConnection(this.options.port, this.options.host);
	this.conn.setKeepAlive(true);
}

function createClient(options) {
	return new Client(options);
}

Client.prototype = {
	sendCommand : function(callback, cmd, args) {
		var conn = net.connect(this.options.port, this.options.host,
				function() {
					writeData(cmd, args, conn);
				});
		var timeout = this.options.timeout;
		if (timeout) {
			conn.setTimeout(timeout);
		}

		var bufList = [];
		// conn.removeAllListeners('data');
		// conn.removeAllListeners('error');
		conn.on('data', function(data) {
			bufList.push(data);
			try {
				var resp = protocol.parseResponse(Buffer.concat(bufList));
				if (callback) {
					callback(resp, null);
				}
				bufList = [];
				conn.end();
			} catch (e) {
				if (e === REPLAY) {
					return;
				}
				if (callback) {
					callback(null, e);
				}
				bufList = [];
				conn.end();
			}
		});
		var ConnectionError = exception.ConnectionError;
		conn.on('timeout', function() {
			if (callback) {
				callback(null, new ConnectionError(ConnectionError.TIMEOUT));
			}
			conn.end();
		});
		conn.on('error', function(error) {
			if (callback) {
				callback(null, new ConnectionError(ConnectionError.ERROR));
			}
		});
	},
	/**
	 * Set key value, will fire the callback if response been parsed, the
	 * callback has two parameters response and exception, exception will be
	 * null when successfully, otherwise,response will be null
	 */
	set : function(key, value, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, command.Command.prototype.SET, [ key, value.toString() ]);
	},
	flushAll : function(callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, command.Command.prototype.FLUSHALL);
	},
};

function doCallback(callback, adapter, resp, e) {
	if (!callback) {
		return;
	}
	if (adapter) {
		resp = adapter(resp);
	}
	callback(resp, e);
}

function writeData(cmd, args, conn) {
	var commandObj = new command.Command(cmd, args);
	conn.write(protocol.genSendData(commandObj));
}
module.exports.Client = Client;
module.exports.createClient = createClient;