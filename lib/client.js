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

function writeData(cmd, args, conn) {
	var commandObj = new Command(cmd, args);
	conn.write(protocol.genSendData(commandObj));
}

function toArray(arrays) {
	if (!(arrays instanceof Array)) {
		arrays = [ arrays ];
	}
	return arrays;
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
	select : function(index, callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.SELECT, [ index ]);
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
	brPop : function(key, timeout, keys, callback) {
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
				RedisKeyword.WITHSCORES, , RedisKeyword.LIMIT, offset, count ]);
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
	flushAll : function(callback) {
		this.sendCommand(function(resp, e) {
			doCallback(callback, responseAdapter.convertToStr, resp, e);
		}, Command.prototype.FLUSHALL);
	},
};

module.exports.Client = Client;
module.exports.createClient = createClient;