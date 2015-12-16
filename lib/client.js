/**
 * http://usejsdoc.org/
 */
'use strict';
var net = require('net'), Buffer = require('buffer').Buffer, protocol = require('./protocol.js'), command = require('./command.js'), Command = command.Command, responseAdapter = require('./resp_adapter'), exception = require('./exception.js');
var utils = require("./util/utils.js"), RedisKeyword = require("./keywords.js");
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

function toArray(arrays) {
	if (arrays === undefined || arrays === null) {
		return [];
	}
	if (!(arrays instanceof Array)) {
		arrays = [ arrays ];
	}
	return arrays;
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
		args = toArray(args);
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
	type : function(key, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.TYPE, [ key ]);
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
	scan : function(cursor, scanParams, callback) {
		var args = [ cursor ];
		if (scanParams !== undefined && scanParams !== null) {
			args = args.concat(scanParams.getParams());
		}
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToScanResult, resp, e);
		}, Command.prototype.SCAN, args);
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
		key = toArray(key);
		// if (key instanceof Array) {
		// args = key;
		// } else {
		// args = [ key ];
		// }
		args = key;
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
		if (start !== undefined && start !== null) {
			args.push(start.toString());
			if (end !== undefined && end !== null) {
				args.push(end.toString());
			}
		}
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.BITCOUNT, args);
	},
	bitop : function(bitOP, destKey, srcKeys, callback) {
		// if (!(srcKeys instanceof Array)) {
		// srcKeys = [ srcKeys ];
		// }
		srcKeys = toArray(srcKeys);
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
		// if (!(keys instanceof Array)) {
		// keys = [ keys ];
		// }
		keys = toArray(keys);
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
	hSet : function(key, field, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.HSET, [ key, field, value ]);
	},
	hSetNX : function(key, field, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.HSETNX, [ key, field, value ]);
	},
	hGet : function(key, field, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.HGET, [ key, field ]);
	},
	hGetAll : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToKVPairs, resp, err);
		}, Command.prototype.HGETALL, [ key ]);
	},
	hDel : function(key, field, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.HDEL, [ key, field ]);
	},
	hExist : function(key, field, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.HEXISTS, [ key, field ]);
	},
	hIncrBy : function(key, field, increment, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.HINCRBY, [ key, field, increment ]);
	},
	hIncrByFloat : function(key, field, increment, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.HINCRBYFLOAT, [ key, field, increment ]);
	},
	hKeys : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.HKEYS, [ key ]);
	},
	hVals : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.HVALS, [ key ]);
	},
	hLen : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.HLEN, [ key ]);
	},
	hMSet : function(key, fieldValuePairs, callback) {
		var args = command.combineFieldValueArgs(fieldValuePairs);
		args = [ key ].concat(args);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.HMSET, args);
	},
	hMGet : function(key, fields, callback) {
		var args = [ key ];
		// if (!(fields instanceof Array)) {
		// fields = [ fields ];
		// }
		fields = toArray(fields);
		args = args.concat(fields);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.HMGET, args);
	},
	hScan : function(key, cursor, scanParams, callback) {
		var args = [ key, cursor ];
		if (scanParams !== undefined && scanParams !== null) {
			args.concat(scanParams.getParams());
		}
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToHashScanResult, resp,
					err);
		}, Command.prototype.HSCAN, args);
	},
	lPush : function(key, values, callback) {
		// if (!(values instanceof Array)) {
		// values = [ values ];
		// }
		values = toArray(values);
		var args = [ key ].concat(values);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.LPUSH, args);
	},
	lPushX : function(key, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.LPUSHX, [ key, value ]);
	},
	lPop : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.LPOP, [ key ]);
	},
	rPush : function(key, values, callback) {
		// if (!(values instanceof Array)) {
		// values = [ values ];
		// }
		values = toArray(values);
		var args = [ key ].concat(values);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.RPUSH, args);
	},
	rPushX : function(key, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.RPUSHX, [ key, value ]);
	},
	rPop : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.RPOP, [ key ]);
	},
	blPop : function(keys, timeout, callback) {
		var args = [];
		if (keys instanceof Array) {
			args = args.concat(keys);
		} else {
			args.push(keys);
		}
		args.push(timeout);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.BLPOP, args);
	},
	brPop : function(keys, timeout, callback) {
		var args = [];
		if (keys instanceof Array) {
			args = args.concat(keys);
		} else {
			args.push(keys);
		}
		args.push(timeout);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.BRPOP, args);
	},
	lRange : function(key, start, end, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.LRANGE, [ key, start, end ]);
	},
	rPopLPush : function(srckey, destkey, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.RPOPLPUSH, [ srckey, destkey ]);
	},
	bRPopLPush : function(srckey, destkey, timeout, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.BRPOPLPUSH, [ srckey, destkey, timeout ]);
	},
	lIndex : function(key, index, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.LINDEX, [ key, index ]);
	},
	lInsert : function(key, value, pivot, isBefore, callback) {
		var args = [ key ];
		if (isBefore) {
			args.push(RedisKeyword.BEFORE);
		} else {
			args.push(RedisKeyword.AFTER);
		}
		args.push(pivot);
		args.push(value);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.LINSERT, args);
	},
	lLen : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.LLEN, [ key ]);
	},
	lrem : function(key, value, count, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.LREM, [ key, count, value ]);
	},
	lSet : function(key, index, value, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.LSET, [ key, index, value ]);
	},
	lTrim : function(key, start, end, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.LTRIM, [ key, start, end ]);
	},
	sAdd : function(key, members, callback) {
		// if (!(members instanceof Array)) {
		// members = [ members ];
		// }
		members = toArray(members);
		var args = [ key ];
		args = args.concat(members);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SADD, args);
	},
	sCard : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SCARD, [ key ]);
	},
	sPop : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.SPOP, [ key ]);
	},
	sRandMember : function(key, count, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.SRANDMEMBER, [ key, count ]);
	},
	sMembers : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.SMEMBERS, [ key ]);
	},
	sDiff : function(keys, callback) {
		// if (!(keys instanceof Array)) {
		// keys = [ keys ];
		// }
		keys = toArray(keys);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.SDIFF, keys);
	},
	sDiffStore : function(destKey, keys, callback) {
		// if (!(keys instanceof Array)) {
		// keys = [ keys ];
		// }
		keys = toArray(keys);
		var args = [ destKey ].concat(keys);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SDIFFSTORE, args);
	},
	sInter : function(keys, callback) {
		// if (!(keys instanceof Array)) {
		// keys = [ keys ];
		// }
		keys = toArray(keys);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.SINTER, keys);
	},
	sInterStore : function(destKey, keys, callback) {
		// if (!(keys instanceof Array)) {
		// keys = [ keys ];
		// }
		keys = toArray(keys);
		var args = [ destKey ].concat(keys);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SINTERSTORE, args);
	},
	sisMember : function(key, member, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SISMEMBER, [ key, member ]);
	},
	sRem : function(key, members, callback) {
		// if (!(members instanceof Array)) {
		// members = [ members ];
		// }
		members = toArray(members);

		var args = [ key ].concat(members);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SREM, args);

	},
	sMove : function(src, dest, member, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SMOVE, [ src, dest, member ]);
	},
	sUnion : function(keys, callback) {
		// if (!(keys instanceof Array)) {
		// keys = [ keys ];
		// }
		keys = toArray(keys);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.SUNION, keys);
	},
	sUnionStore : function(destKey, keys, callback) {
		// if (!(keys instanceof Array)) {
		// keys = [ keys ];
		// }
		keys = toArray(keys);
		var args = [ destKey ].concat(keys);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.SUNIONSTORE, args);
	},
	sScan : function(key, cursor, scanParams, callback) {
		var args = [ key, cursor ];
		if (scanParams !== undefined && scanParams !== null) {
			args = args.concat(scanParams.getParams());
		}
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToSetScanResult, resp,
					err);
		}, Command.prototype.SSCAN, args);
	},
	zAdd : function(key, scoreMemberPairs, callback) {
		var args = [ key ];
		// if (!(scoreMemberPairs instanceof Array)) {
		// scoreMemberPairs = [ scoreMemberPairs ];
		// }
		scoreMemberPairs = toArray(scoreMemberPairs);
		args = args.concat(command.combineScoreMemberArgs(scoreMemberPairs));
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToInt, resp, err);
		}, Command.prototype.ZADD, args);
	},
	zCard : function(key, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZCARD, [ key ]);
	},
	zCount : function(key, min, max, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZCOUNT, [ key, min, max ]);
	},
	zIncrBy : function(key, member, increment, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZINCRBY, [ key, increment, member ]);
	},
	zRange : function(key, start, end, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.ZRANGE, [ key, start, end ]);
	},
	zRangeWithScores : function(key, start, end, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToScoreMember, resp,
					err);
		}, Command.prototype.ZRANGE,
				[ key, start, end, RedisKeyword.WITHSCORES ]);
	},
	zRangeByScore : function(key, min, max, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.ZRANGEBYSCORE, [ key, min, max ]);
	},
	zRangeByScoreWithOffset : function(key, min, max, offset, count, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.ZRANGEBYSCORE, [ key, min, max,
				RedisKeyword.LIMIT, offset, count ]);
	},
	zRangeByScoreWithScores : function(key, min, max, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToScoreMember, resp,
					err);
		}, Command.prototype.ZRANGEBYSCORE, [ key, min, max,
				RedisKeyword.WITHSCORES ]);
	},
	zRangeByScoreWithScoresByOffset : function(key, min, max, offset, count,
			callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToScoreMember, resp,
					err);
		}, Command.prototype.ZRANGEBYSCORE, [ key, min, max,
				RedisKeyword.WITHSCORES, RedisKeyword.LIMIT, offset, count ]);
	},
	zRank : function(key, member, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZRANK, [ key, member ]);
	},
	zRem : function(key, members, callback) {
		var args = [ key ];
		// if (!(members instanceof Array)) {
		// members = [ members ];
		// }
		members = toArray(members);
		args = args.concat(members);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZREM, args);
	},
	zRemRangeByRank : function(key, start, end, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZREMRANGEBYRANK, [ key, start, end ]);
	},
	zRemRangeByScore : function(key, min, max, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZREMRANGEBYSCORE, [ key, min, max ]);
	},
	zRevRange : function(key, start, end, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.ZREVRANGE, [ key, start, end ]);
	},
	zRevRangeWithScores : function(key, start, end, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToScoreMember, resp,
					err);
		}, Command.prototype.ZREVRANGE, [ key, start, end,
				RedisKeyword.WITHSCORES ]);
	},
	zRevRangeByScore : function(key, max, min, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.ZREVRANGEBYSCORE, [ key, max, min ]);
	},
	zRevRangeByScoreByOffset : function(key, max, min, offset, count, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.ZREVRANGEBYSCORE, [ key, max, min,
				RedisKeyword.LIMIT, offset, count ]);
	},
	zRevRangeByScoreWithScores : function(key, max, min, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToScoreMember, resp,
					err);
		}, Command.prototype.ZREVRANGEBYSCORE, [ key, max, min,
				RedisKeyword.WITHSCORES ]);
	},
	zRevRangeByScoreWithScoresByOffset : function(key, max, min, offset, count,
			callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToScoreMember, resp,
					err);
		}, Command.prototype.ZREVRANGEBYSCORE, [ key, max, min,
				RedisKeyword.WITHSCORES, RedisKeyword.LIMIT, offset, count ]);
	},
	zRevRank : function(key, member, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZREVRANK, [ key, member ]);
	},
	zScore : function(key, member, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZSCORE, [ key, member ]);
	},
	zUnionStore : function(destKey, params, keys, callback) {
		var args = [ destKey ];
		// if (!(keys instanceof Array)) {
		// keys = [ keys ];
		// }
		keys = toArray(keys);
		var numberKeys = keys.length;
		args.push(numberKeys);
		args = args.concat(keys);
		if (params !== undefined && params !== null) {
			args = args.concat(params.params);
		}
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZUNIONSTORE, args);
	},
	zInterStore : function(destKey, params, keys, callback) {
		var args = [ destKey ];
		// if (!(keys instanceof Array)) {
		// keys = [ keys ];
		// }
		keys = toArray(keys);
		var numberKeys = keys.length;
		args.push(numberKeys);
		args = args.concat(keys);
		if (params !== undefined && params !== null) {
			args = args.concat(params.params);
		}
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToNumber, resp, err);
		}, Command.prototype.ZINTERSTORE, args);
	},
	zScan : function(key, cursor, scanParams, callback) {
		var args = [ key, cursor ];
		if (scanParams !== undefined && scanParams !== null) {
			args = args.concat(scanParams.getParams());
		}
		this.sendCommand(function(resp, err) {
			doCallback(callback,
					responseAdapter.convertToScoreMemberScanResult, resp, err);
		}, Command.prototype.ZSCAN, args);
	},
	select : function(index, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.SELECT, [ index ]);
	},
	auth : function(password, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.AUTH, [ password ]);
	},
	echo : function(message, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.ECHO, [ message ]);
	},
	ping : function(callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.PING);
	},
	quit : function(callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.QUIT);
	},
	flushAll : function(callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.FLUSHALL);
	},
	flushDB : function(callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.FLUSHDB);
	},
	eval : function(script, keyCount, params, callback) {
		params = toArray(params);
		var args = [ script, keyCount ].concat(params);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.EVAL, args);
	},
	evalSha : function(sha, keyCount, params, callback) {
		params = toArray(params);
		var args = [ sha, keyCount ].concat(params);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.EVALSHA, args);
	},
	scriptLoad : function(script, callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.SCRIPT, [ RedisKeyword.LOAD, script ]);
	},
	scriptExist : function(scripts, callback) {
		scripts = toArray(scripts);
		var args = [ RedisKeyword.EXISTS ].concat(scripts);
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToArray, resp, err);
		}, Command.prototype.SCRIPT, args);
	},
	scriptFlush : function(callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.SCRIPT, RedisKeyword.FLUSH);
	},
	scriptKill : function(callback) {
		this.sendCommand(function(resp, err) {
			doCallback(callback, responseAdapter.convertToStr, resp, err);
		}, Command.prototype.SCRIPT, RedisKeyword.KILL);
	}
};

function execShardCommand(clientNodePair, cmdFun, params, callback) {
	params = toArray(params);
	if (callback) {
		var f = function(resp, err) {
			callback(resp, err, clientNodePair.node);
		};
		params.push(f);
	}

	cmdFun.apply(clientNodePair.client, params);
}

// function execSharedCommand(clientNodePair, cmdFun, key, params, callback) {
// params = toArray(params);
// var transferParams = [ key ].concat(params);
//
// if (callback) {
// var f = function(resp, err) {
// callback(resp, err, clientNodePair.node);
// };
// transferParams.push(f);
// }
//
// cmdFun.apply(clientNodePair.client, transferParams);
// }

function ShardedClient(nodes) {
	if (!(this instanceof ShardedClient)) {
		return new ShardedClient(nodes);
	}
	this.nodes = nodes;
	this.hasher = new utils.ConsistHash(nodes);
	this.clientMapping = {};
}
ShardedClient.prototype = {
	setConnectTimeout : function(timeout) {
		this.timeout = timeout;
	},
	getClientAndNodeByKey : function(key) {
		var node = this.hasher.getNode(key);
		var client = this.getClientByNode(node);
		return {
			node : node,
			client : client
		};
	},
	getClientByKey : function(key) {
		var node = this.hasher.getNode(key);
		return this.getClientByNode(node);
	},
	getClientByNode : function(node) {
		var nodeDesc = node.toString();
		var client = this.clientMapping[nodeDesc];
		if (client) {
			return client;
		}
		var timeout = this.timeout;
		client = new Client({
			host : node.host,
			port : node.port,
			timeout : timeout
		});
		this.clientMapping[nodeDesc] = client;
		return client;
	},
	flushAll : function(callback) {
		if (!this.nodes) {
			return;
		}
		for (var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i];
			var client = this.getClientByNode(node);
			execShardCommand({
				node : node,
				client : client
			}, client.flushAll, null, callback);
		}
	},
	expire : function(key, seconds, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.expire, [ key,
				seconds ], callback);
	},
	expireAt : function(key, ts, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.expireAt, [ key,
				ts ], callback);
	},
	move : function(key, destDb, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.move, [ key,
				destDb ], callback);
	},
	objectRefcount : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.objectRefcount,
				key, callback);
	},
	objectIdletime : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.objectIdletime,
				key, callback);
	},
	objectEncoding : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.objectEncoding,
				key, callback);
	},
	persist : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.persist, key,
				callback);
	},
	pExpire : function(key, millSeconds, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.pExpire, [ key,
				millSeconds ], callback);
	},
	pExpireAt : function(key, millTs, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.pExpireAt, [
				key, millTs ], callback);
	},
	pTTL : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.pTTL, key,
				callback);
	},
	sort : function(key, sortingParams, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.sort, [ key,
				sortingParams, null ], callback);
	},
	set : function(key, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.set, [ key,
				value ], callback);
	},
	get : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.get, key,
				callback);
	},
	ttl : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.ttl, key,
				callback);
	},

	type : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.type, key,
				callback);
	},
	del : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.del, key,
				callback);
	},

	exists : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.exists, key,
				callback);
	},

	append : function(key, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.append, [ key,
				value ], callback);
	},

	setBit : function(key, offset, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.setBit, [ key,
				offset, value ], callback);
	},

	getBit : function(key, offset, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.getBit, [ key,
				offset ], callback);
	},

	bitCount : function(key, start, end, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.bitCount, [ key,
				start, end ], callback);
	},

	incr : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.incr, key,
				callback);
	},

	incrBy : function(key, increment, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.incrBy, [ key,
				increment ], callback);
	},

	incrByFloat : function(key, increment, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.incrByFloat, [
				key, increment ], callback);
	},

	decr : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.decr, key,
				callback);
	},

	decrBy : function(key, increment, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.decrBy, [ key,
				increment ], callback);
	},
	getRange : function(key, start, end, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.getRange, [ key,
				start, end ], callback);
	},

	getSet : function(key, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.getSet, [ key,
				value ], callback);
	},

	setNX : function(key, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.setNX, [ key,
				value ], callback);
	},

	setEX : function(key, seconds, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.setEX, [ key,
				seconds, value ], callback);
	},

	pSetEX : function(key, millSeconds, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.pSetEX, [ key,
				millSeconds, value ], callback);
	},

	setRange : function(key, offset, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.setRange, [ key,
				offset, value ], callback);
	},
	strLen : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.strLen, key,
				callback);
	},

	hSet : function(key, field, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hSet, [ key,
				field, value ], callback);
	},

	hSetNX : function(key, field, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hSetNX, [ key,
				field, value ], callback);
	},

	hGet : function(key, field, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hGet, [ key,
				field ], callback);
	},

	hGetAll : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hGetAll, key,
				callback);
	},

	hDel : function(key, field, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hDel, [ key,
				field ], callback);
	},

	hExist : function(key, field, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hExist, [ key,
				field ], callback);
	},

	hIncrBy : function(key, field, increment, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hIncrBy, [ key,
				field, increment ], callback);
	},

	hIncrByFloat : function(key, field, increment, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hIncrByFloat, [
				key, field, increment ], callback);
	},

	hKeys : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hKeys, key,
				callback);
	},

	hVals : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hVals, key,
				callback);
	},

	hLen : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.hLen, key,
				callback);
	},
	lPush : function(key, values, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		values = toArray(values);
		var params = [ key, values ];
		execShardCommand(clientNodePair, clientNodePair.client.lPush, params,
				callback);
	},

	lPushX : function(key, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.lPushX, [ key,
				value ], callback);
	},

	lPop : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.lPop, key,
				callback);
	},

	rPush : function(key, values, callback) {
		values = toArray(values);
		var params = [ key ].concat(values);
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.rPush, params,
				callback);
	},

	rPushX : function(key, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.rPushX, [ key,
				value ], callback);
	},

	rPop : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.rPop, key,
				callback);
	},

	blPop : function(key, timeout, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.blPop, [ key,
				timeout ], callback);
	},

	brPop : function(key, timeout, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.brPop, [ key,
				timeout ], callback);
	},

	lRange : function(key, start, end, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.lRange, [ key,
				start, end ], callback);
	},

	lIndex : function(key, index, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.lIndex, [ key,
				index ], callback);
	},

	lInsert : function(key, value, pivot, isBefore, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.lInsert, [ key,
				value, pivot, isBefore ], callback);
	},

	lLen : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.lLen, key,
				callback);
	},

	lrem : function(key, value, count, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.lrem, [ key,
				value, count ], callback);
	},

	lSet : function(key, index, value, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.lSet, [ key,
				index, value ], callback);
	},

	lTrim : function(key, start, end, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.lTrim, [ key,
				start, end ], callback);
	},

	sAdd : function(key, members, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		members = toArray(members);
		var params = [ key, members ];
		execShardCommand(clientNodePair, clientNodePair.client.sAdd, params,
				callback);
	},

	sCard : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.sCard, key,
				callback);
	},

	sPop : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.sPop, key,
				callback);
	},

	sRandMember : function(key, count, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.sRandMember, [
				key, count ], callback);
	},

	sMembers : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.sMembers, key,
				callback);
	},

	sisMember : function(key, member, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.sisMember, [
				key, member ], callback);
	},

	sRem : function(key, member, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.sRem, [ key,
				member ], callback);
	},

	zAdd : function(key, scoreMembers, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		scoreMembers = toArray(scoreMembers);
		var params = [ key, scoreMembers ];
		execShardCommand(clientNodePair, clientNodePair.client.zAdd, params,
				callback);
	},

	zCard : function(key, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.zCard, key,
				callback);
	},

	zCount : function(key, min, max, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.zCount, [ key,
				min, max ], callback);
	},

	zIncrBy : function(key, member, increment, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.zIncrBy, [ key,
				member, increment ], callback);
	},

	zRange : function(key, start, end, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.zRange, [ key,
				start, end ], callback);
	},

	zRangeWithScores : function(key, start, end, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair,
				clientNodePair.client.zRangeWithScores, [ key, start, end ],
				callback);
	},

	zRangeByScore : function(key, min, max, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.zRangeByScore, [
				key, min, max ], callback);
	},

	zRangeByScoreWithOffset : function(key, min, max, offset, count, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair,
				clientNodePair.client.zRangeByScoreWithOffset, [ key, min, max,
						offset, count ], callback);
	},

	zRangeByScoreWithScores : function(key, min, max, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair,
				clientNodePair.client.zRangeByScoreWithScores,
				[ key, min, max ], callback);
	},

	zRangeByScoreWithScoresByOffset : function(key, min, max, offset, count,
			callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair,
				clientNodePair.client.zRangeByScoreWithScoresByOffset, [ key,
						min, max, offset, count ], callback);
	},

	zRank : function(key, member, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.zRank, [ key,
				member ], callback);
	},

	zRem : function(key, members, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		members = toArray(members);
		var params = [ key, members ];
		execShardCommand(clientNodePair, clientNodePair.client.zRem, params,
				callback);
	},

	zRemRangeByRank : function(key, start, end, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.zRemRangeByRank,
				[ key, start, end ], callback);
	},

	zRemRangeByScore : function(key, min, max, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair,
				clientNodePair.client.zRemRangeByScore, [ key, min, max ],
				callback);
	},

	zRevRange : function(key, start, end, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.zRevRange, [
				key, start, end ], callback);
	},

	zRevRangeWithScores : function(key, start, end, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair,
				clientNodePair.client.zRevRangeWithScores, [ key, start, end ],
				callback);
	},

	zRevRangeByScore : function(key, max, min, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair,
				clientNodePair.client.zRevRangeByScore, [ key, max, min ],
				callback);
	},

	zRevRangeByScoreByOffset : function(key, max, min, offset, count, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair,
				clientNodePair.client.zRevRangeByScoreByOffset, [ key, max,
						min, offset, count ], callback);
	},

	zRevRangeByScoreWithScores : function(key, max, min, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair,
				clientNodePair.client.zRevRangeByScoreWithScores, [ key, max,
						min ], callback);
	},

	zRevRangeByScoreWithScoresByOffset : function(key, max, min, offset, count,
			callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair,
				clientNodePair.client.zRevRangeByScoreWithScoresByOffset, [
						key, max, min, offset, count ], callback);
	},

	zRevRank : function(key, member, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.zRevRank, [ key,
				member ], callback);
	},

	zScore : function(key, member, callback) {
		var clientNodePair = this.getClientAndNodeByKey(key);
		execShardCommand(clientNodePair, clientNodePair.client.zScore, [ key,
				member ], callback);
	}
};

module.exports.Client = Client;
module.exports.createClient = createClient;
module.exports.ShardedClient = ShardedClient;