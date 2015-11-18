/**
 * http://usejsdoc.org/
 */

'use strict';
var client = require('../client.js');
function BaseCmdTest() {
	var host = "192.168.1.107";
	var port = 6379;
	this.client = new client.Client({
		host : host,
		port : port
	});
}

module.exports.BaseCmdTest = BaseCmdTest;