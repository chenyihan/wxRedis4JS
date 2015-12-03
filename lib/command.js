/**
 * http://usejsdoc.org/
 */
'use strict';

var utils = require('./util/utils.js'), buffer = require('buffer');
function combineKeyValueArgs(keyValuePairs) {
	var args = [];
	if (keyValuePairs === undefined || keyValuePairs === null) {
		return args;
	}
	if (!(keyValuePairs instanceof Array)) {
		keyValuePairs = [ keyValuePairs ];
	}
	for (var i = 0; i < keyValuePairs.length; i++) {
		var kvPair = keyValuePairs[i];
		args = args.concat([ kvPair.key, kvPair.value ]);
	}
	return args;
}
function combineFieldValueArgs(fieldValuePairs) {
	var args = [];
	if (fieldValuePairs === undefined || fieldValuePairs === null) {
		return args;
	}

	if (!(fieldValuePairs instanceof Array)) {
		fieldValuePairs = [ fieldValuePairs ];
	}
	for (var i = 0; i < fieldValuePairs.length; i++) {
		var fvPair = fieldValuePairs[i];
		args = args.concat([ fvPair.field, fvPair.value ]);
	}
	return args;
}
function Command(command, args) {
	if (!(this instanceof Command)) {
		return new Command(command, args);
	}
	this.command = new buffer.Buffer(command);
	if (args) {
		this.args = [];
		for (var i = 0; i < args.length; i++) {
			var arg = args[i];
			if (typeof arg === "number") {
				arg = arg.toString();
			}
			this.args.push(new buffer.Buffer(arg));
		}
	}
}

Command.prototype = {
	PING : 'PING',
	SET : 'SET',
	GET : 'GET',
	QUIT : 'QUIT',
	EXISTS : 'EXISTS',
	DEL : 'DEL',
	TYPE : 'TYPE',
	FLUSHDB : 'FLUSHDB',
	KEYS : 'KEYS',
	RANDOMKEY : 'RANDOMKEY',
	RENAME : 'RENAME',
	RENAMENX : 'RENAMENX',
	RENAMEX : 'RENAMEX',
	DBSIZE : 'DBSIZE',
	EXPIRE : 'EXPIRE',
	EXPIREAT : 'EXPIREAT',
	TTL : 'TTL',
	SELECT : 'SELECT',
	MOVE : 'MOVE',
	FLUSHALL : 'FLUSHALL',
	GETSET : 'GETSET',
	MGET : 'MGET',
	SETNX : 'SETNX',
	SETEX : 'SETEX',
	MSET : 'MSET',
	MSETNX : 'MSETNX',
	DECRBY : 'DECRBY',
	DECR : 'DECR',
	INCRBY : 'INCRBY',
	INCR : 'INCR',
	APPEND : 'APPEND',
	SUBSTR : 'SUBSTR',
	HSET : 'HSET',
	HGET : 'HGET',
	HSETNX : 'HSETNX',
	HMSET : 'HMSET',
	HMGET : 'HMGET',
	HINCRBY : 'HINCRBY',
	HEXISTS : 'HEXISTS',
	HDEL : 'HDEL',
	HLEN : 'HLEN',
	HKEYS : 'HKEYS',
	HVALS : 'HVALS',
	HGETALL : 'HGETALL',
	RPUSH : 'RPUSH',
	LPUSH : 'LPUSH',
	LLEN : 'LLEN',
	LRANGE : 'LRANGE',
	LTRIM : 'LTRIM',
	LINDEX : 'LINDEX',
	LSET : 'LSET',
	LREM : 'LREM',
	LPOP : 'LPOP',
	RPOP : 'RPOP',
	RPOPLPUSH : 'RPOPLPUSH',
	SADD : 'SADD',
	SMEMBERS : 'SMEMBERS',
	SREM : 'SREM',
	SPOP : 'SPOP',
	SMOVE : 'SMOVE',
	SCARD : 'SCARD',
	SISMEMBER : 'SISMEMBER',
	SINTER : 'SINTER',
	SINTERSTORE : 'SINTERSTORE',
	SUNION : 'SUNION',
	SUNIONSTORE : 'SUNIONSTORE',
	SDIFF : 'SDIFF',
	SDIFFSTORE : 'SDIFFSTORE',
	SRANDMEMBER : 'SRANDMEMBER',
	ZADD : 'ZADD',
	ZRANGE : 'ZRANGE',
	ZREM : 'ZREM',
	ZINCRBY : 'ZINCRBY',
	ZRANK : 'ZRANK',
	ZREVRANK : 'ZREVRANK',
	ZREVRANGE : 'ZREVRANGE',
	ZCARD : 'ZCARD',
	ZSCORE : 'ZSCORE',
	MULTI : 'MULTI',
	DISCARD : 'DISCARD',
	EXEC : 'EXEC',
	WATCH : 'WATCH',
	UNWATCH : 'UNWATCH',
	SORT : 'SORT',
	BLPOP : 'BLPOP',
	BRPOP : 'BRPOP',
	AUTH : 'AUTH',
	SUBSCRIBE : 'SUBSCRIBE',
	PUBLISH : 'PUBLISH',
	UNSUBSCRIBE : 'UNSUBSCRIBE',
	PSUBSCRIBE : 'PSUBSCRIBE',
	PUNSUBSCRIBE : 'PUNSUBSCRIBE',
	PUBSUB : 'PUBSUB',
	ZCOUNT : 'ZCOUNT',
	ZRANGEBYSCORE : 'ZRANGEBYSCORE',
	ZREVRANGEBYSCORE : 'ZREVRANGEBYSCORE',
	ZREMRANGEBYRANK : 'ZREMRANGEBYRANK',
	ZREMRANGEBYSCORE : 'ZREMRANGEBYSCORE',
	ZUNIONSTORE : 'ZUNIONSTORE',
	ZINTERSTORE : 'ZINTERSTORE',
	SAVE : 'SAVE',
	BGSAVE : 'BGSAVE',
	BGREWRITEAOF : 'BGREWRITEAOF',
	LASTSAVE : 'LASTSAVE',
	SHUTDOWN : 'SHUTDOWN',
	INFO : 'INFO',
	MONITOR : 'MONITOR',
	SLAVEOF : 'SLAVEOF',
	CONFIG : 'CONFIG',
	STRLEN : 'STRLEN',
	SYNC : 'SYNC',
	LPUSHX : 'LPUSHX',
	PERSIST : 'PERSIST',
	RPUSHX : 'RPUSHX',
	ECHO : 'ECHO',
	LINSERT : 'LINSERT',
	DEBUG : 'DEBUG',
	BRPOPLPUSH : 'BRPOPLPUSH',
	SETBIT : 'SETBIT',
	GETBIT : 'GETBIT',
	BITPOS : 'BITPOS',
	SETRANGE : 'SETRANGE',
	GETRANGE : 'GETRANGE',
	EVAL : 'EVAL',
	EVALSHA : 'EVALSHA',
	SCRIPT : 'SCRIPT',
	SLOWLOG : 'SLOWLOG',
	OBJECT : 'OBJECT',
	BITCOUNT : 'BITCOUNT',
	BITOP : 'BITOP',
	SENTINEL : 'SENTINEL',
	DUMP : 'DUMP',
	RESTORE : 'RESTORE',
	PEXPIRE : 'PEXPIRE',
	PEXPIREAT : 'PEXPIREAT',
	PTTL : 'PTTL',
	INCRBYFLOAT : 'INCRBYFLOAT',
	PSETEX : 'PSETEX',
	CLIENT : 'CLIENT',
	TIME : 'TIME',
	MIGRATE : 'MIGRATE',
	HINCRBYFLOAT : 'HINCRBYFLOAT',
	SCAN : 'SCAN',
	HSCAN : 'HSCAN',
	SSCAN : 'SSCAN',
	ZSCAN : 'ZSCAN',
	WAIT : 'WAIT',
	CLUSTER : 'CLUSTER',
	ASKING : 'ASKING',
	PFADD : 'PFADD',
	PFCOUNT : 'PFCOUNT',
	PFMERGE : 'PFMERGE'

};

module.exports.combineKeyValueArgs = combineKeyValueArgs;
module.exports.combineFieldValueArgs = combineFieldValueArgs;
module.exports.Command = Command;
