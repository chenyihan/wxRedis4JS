/**
 * http://usejsdoc.org/
 */
'use strict';
var net = require('net'), Buffer = require('buffer').Buffer, protocol = require('./protocol.js'), command = require('./Command.js'), Command = command.Command, responseAdapter = require('./ResponseAdapter'), exception = require('./Exception.js');
var utils = require("./util/utils.js"), RedisKeyword = require("./Keywords.js");
const
REPLAY = exception.ReplaySignal();

function doCallback(callback, adapter, resp, e) {
	if (!callback) {
		return;
	}
	if (!e && adapter) {
		resp = adapter(resp);
	}
	if (utils.isFunction(callback)) {
		callback(resp, e);
	}

}

function writeData(cmd, args, conn) {
	var commandObj = new Command(cmd, args);
	conn.write(protocol.genSendData(commandObj));
}

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
	// this.conn = net.createConnection(this.options.port, this.options.host);
	// this.conn.setKeepAlive(true);
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
	dump : function(key, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, null, resp, e);
		}, Command.prototype.DUMP, [ key ]);
	},
	expire : function(key, seconds, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.EXPIRE, [ key, seconds ]);
	},
	expireAt : function(key, ts, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.EXPIREAT, [ key, ts ]);
	},
	migrate : function(key, destHost, destPort, destDb, timeout, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.MIGRATE, [ key, destHost, destPort, destDb,
				timeout ]);
	},
	move : function(key, destDb, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.MOVE, [ key, destDb ]);
	},
	objectRefcount : function(key, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.OBJECT, [ RedisKeyword.REFCOUNT, key ]);
	},
	objectIdletime : function(key, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.OBJECT, [ RedisKeyword.IDLETIME, key ]);
	},
	objectEncoding : function(key, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.OBJECT, [ RedisKeyword.ENCODING, key ]);
	},
	persist : function(key, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.PERSIST, [ key ]);
	},
	ttl : function(key, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.TTL, [ key ]);
	},
	pExpire : function(key, millSeconds, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.PEXPIRE, [ key, millSeconds ]);
	},
	pExpireAt : function(key, millTs, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.PEXPIREAT, [ key, millTs ]);
	},
	pTTL : function(key, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.PTTL, [ key ]);
	},
	randomKey : function(callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.RANDOMKEY);
	},
	rename : function(key, newKey, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.RENAME, [ key, newKey ]);
	},
	renameNX : function(key, newKey, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.RENAMENX, [ key, newKey ]);
	},
	restore : function(key, serialValue, millTTL, replace, callback) {
		var args = [ key, millTTL, serialValue ];
		if (replace === true) {
			args.push(RedisKeyword.REPLACE);
		}
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.RESTORE, args);
	},
	sort : function(key, sortParams, destKey, callback) {
		var args = [ key ];
		var restore = false;
		if (sortParams !== undefined && sortParams !== null) {
			args = args.concat(sortParams.getParams());
		}
		if (destKey !== undefined && destKey !== null) {
			args.push(RedisKeyword.STORE);
			args.push(destKey);
			restore = true;
		}
		var respAdapter = restore ? responseAdapter.convertToInt
				: responseAdapter.convertToArray;
		this.sendCommand(function(resp, e) {
			doCallback(callback, respAdapter, resp, e);
		}, Command.prototype.SORT, args);
	},
	exists : function(key, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToNumber, resp, e);
		}, Command.prototype.EXISTS, [ key ]);
	},
	select : function(index, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.SELECT, [ index ]);
	},
	/**
	 * Set key value, will fire the callback if response been parsed, the
	 * callback has two parameters response and exception, exception will be
	 * null when successfully, otherwise,response will be null
	 */
	set : function(key, value, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.SET, [ key, value.toString() ]);
	},
	get : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.GET, [ key ]);
	},
	del : function(key, callback) {
		var args;
		if (key instanceof Array) {
			args = key;
		} else {
			args = [ key ];
		}
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.DEL, args);
	},
	keys : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.KEYS, [ key ]);
	},
	exists : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.EXISTS, [ key ]);
	},
	append : function(key, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.APPEND, [ key, value ]);
	},
	setBit : function(key, offset, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SETBIT,
				[ key, offset.toString(), value.toString() ]);
	},
	getBit : function(key, offset, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.GETBIT, [ key, offset.toString() ]);
	},
	bitCount : function(key, start, end, callback) {
		var args = [ key ];
		if (start != undefined && start != null) {
			args.push(start.toString());
			if (end != undefined && end != null) {
				args.push(end.toString());
			}
		}
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.BITCOUNT, args);
	},
	bitop : function(bitOP, destKey, srcKeys, callback) {
		if (!(srcKeys instanceof Array)) {
			srcKeys = [ srcKeys ];
		}
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.BITOP, [ bitOP, destKey ].concat(srcKeys));
	},
	incr : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.INCR, [ key ]);
	},
	incrBy : function(key, increment, callback) {
		var incr = increment ? increment : 0;
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.INCRBY, [ key, incr.toString() ]);
	},
	incrByFloat : function(key, increment, callback) {
		var incr = increment ? increment : 0;
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.INCRBYFLOAT, [ key, incr.toString() ]);
	},
	decr : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.DECR, [ key ]);
	},
	decrBy : function(key, increment, callback) {
		var incr = increment ? increment : 0;
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.DECRBY, [ key, incr.toString() ]);
	},
	getRange : function(key, start, end, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.GETRANGE, [ key, start, end ]);
	},
	getSet : function(key, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.GETSET, [ key, value ]);
	},
	mSet : function(keyValuePairs, callback) {
		if (keyValuePairs === undefined || keyValuePairs === null
				|| !keyValuePairs.length) {
			throw new command.IllegalArgsException(
					"Must pass at least one key value pair");
		}
		var args = command.combineKeyValueArgs(keyValuePairs);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.MSET, args);
	},
	mGet : function(keys, callback) {
		if (keys === undefined || keys === null || !keys.length) {
			throw new command.IllegalArgsException(
					"Must pass at least one key value pair");
		}
		if (!(keys instanceof Array)) {
			keys = [ keys ];
		}
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.MGET, keys);
	},
	mSetNX : function(keyValuePairs, callback) {
		if (keyValuePairs === undefined || keyValuePairs === null
				|| !keyValuePairs.length) {
			throw new command.IllegalArgsException(
					"Must pass at least one key value pair");
		}
		var args = command.combineKeyValueArgs(keyValuePairs);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.MSETNX, args);
	},
	setNX : function(key, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SETNX, [ key, value ]);
	},
	setEX : function(key, seconds, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.SETEX, [ key, seconds, value ]);
	},
	pSetEX : function(key, millSeconds, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.PSETEX, [ key, millSeconds, value ]);
	},
	setRange : function(key, offset, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SETRANGE, [ key, offset, value ]);
	},
	strLen : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.STRLEN, [ key ]);
	},
	lPush : function(key, values, callback) {
		if (!(values instanceof Array)) {
			values = [ values ];
		}
		var args = [ key ].concat(values);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.LPUSH, args);
	},
	flushAll : function(callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.FLUSHALL);
	},
};

module.exports.Client = Client;
module.exports.createClient = createClient;