/* Here is the place to declare an application.
 * An appliction is a directory that includes:
 *  1. 'public' subdirectory with static content ('index.html' must be here)
 *  2. node.js javascript file with the same name as the app
 *     this file must export 'WebSocketHandle' class like one is shown below
 */

// list of applictions - add here your applications
var appList = [
	"chat",
	"quad-world"
];

// WebSocketHandle class example
function WebSocketHandle(websocket) {
	var self = this;
	this.websocket = websocket;
	this.open = function() {
		// add open listener code instead
		for(var i = 0; i < appList.length; ++i) {
			self.websocket.send(appList[i]);
		}
		websocket.close(1000, 'Apps List Loaded');
	}
	this.close = function(code, message) {
		// add close listener code here
	}
	this.receive = function(message, flags) {
		// add receive listener code here
	}
	this.error = function(error) {
		// add error listener code here
	}
}

module.exports.list = appList;
module.exports.WebSocketHandle = WebSocketHandle;