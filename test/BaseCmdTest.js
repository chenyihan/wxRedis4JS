/**
 * http://usejsdoc.org/
 */

'use strict';
var client = require('../lib/client.js');
function BaseCmdTest() {
	var host = "192.168.1.107";
	var port = 6379;
	this.client = new client.Client({
		host : host,
		port : port
	});
}

BaseCmdTest.prototype = {
	dealCmdResult : function(resp, err, assert) {
		if (resp) {
			console.log(resp);
			if (typeof assert == "function") {
				assert();
			}
		}
		if (err) {
			console.log(err.message || err.code);
		}
	}
}

module.exports.BaseCmdTest = BaseCmdTest;