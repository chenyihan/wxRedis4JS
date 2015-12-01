/**
 * http://usejsdoc.org/
 */
'use strict';
function ServerNode(host, port, name) {
	if (!(this instanceof ServerNode)) {
		return new ServerNode(host, port, name);
	}
	this.setHost(host);
	this.setPort(port);
	this.setName(name);
}

ServerNode.prototype = {
	setHost : function(host) {
		if (host == undefined) {
			return;
		}
		this.host = host;
	},
	setPort : function(port) {
		if (port == undefined) {
			return;
		}
		this.port = port;
	},
	setName : function(name) {
		if (name == undefined) {
			return;
		}
		this.name = name;
	},
	toString : function() {
		return this.host + ":" + this.port;
	}
};

module.exports.ServerNode = ServerNode;