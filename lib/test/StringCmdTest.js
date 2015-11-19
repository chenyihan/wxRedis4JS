/**
 * http://usejsdoc.org/
 */

'use strict';
var utils = require('util'), baseCmdTest = require('./BaseCmdTest');
function StringCmdTest() {
	baseCmdTest.BaseCmdTest.call(this);
}
utils.inherits(StringCmdTest, baseCmdTest.BaseCmdTest);

StringCmdTest.prototype = {
	test_set : function() {
		this.client.flushAll(function(resp, err) {
			if (resp) {
				console.log(resp);
			}
			if (err) {
				console.log(err.message || err.code);
			}
		});
		this.client.set("key1", "value1", function(resp, err) {
			if (resp) {
				console.log(resp);
			}
			if (err) {
				console.log(err.message || err.code);
			}
		});
		this.client.set("key2", "value2", function(resp, err) {
			if (resp) {
				console.log(resp);
			}
			if (err) {
				console.log(err.message || err.code);
			}
		});
	}
};

var tester = new StringCmdTest();
tester.test_set();