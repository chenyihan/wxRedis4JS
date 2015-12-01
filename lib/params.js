/**
 * http://usejsdoc.org/
 */
var RedisKeyword = require("./Keywords.js"), command = require("./Command.js");
function SortingParams() {
	if (!(this instanceof SortingParams)) {
		return new SortingParams();
	}
	this.params = [];
}
SortingParams.prototype = {
	by : function(pattern) {
		this.params.push(RedisKeyword.BY);
		this.params.push(pattern);
		return this;
	},
	nosort : function() {
		this.params.push(RedisKeyword.BY);
		this.params.push(RedisKeyword.NOSORT);
		return this;
	},
	desc : function() {
		this.params.push(RedisKeyword.DESC);
		return this;
	},
	asc : function() {
		this.params.push(RedisKeyword.ASC);
		return this;
	},
	limit : function(start, count) {
		this.params.push(RedisKeyword.LIMIT);
		this.params.push(start.toString());
		this.params.push(count.toString());
		return this;
	},
	alpha : function() {
		this.params.push(RedisKeyword.ALPHA);
		return this;
	},
	get : function(patterns) {
		if (!(patterns instanceof Array)) {
			patterns = [ patterns ];
		}
		for (var i = 0; i < patterns.length; i++) {
			var pattern = patterns[i];
			this.params.push(command.Command.prototype.GET);
			this.params.push(pattern);
		}
		return this;
	},
	getParams : function() {
		return this.params;
	}
};

module.exports.SortingParams = SortingParams;