# WebSocket Server

This server designed to host and run user [Node.js](https://nodejs.org/) web applications.

Example instance of server you can find at [wsapps-nthend.rhcloud.com](http://wsapps-nthend.rhcloud.com/). 

Server provides for appliction:
* Access to static content of application (.html, .css, .js files, images and etc.) via `http` or `https`
* Evaluation of server-side Node.js code through some interface (see below).
* WebSocket connection from client (secure `wss` or insecure `ws` protocol)

### Run the server

You can run this server at your local machine (you heed to have `nodejs` and `npm` installed):
```bash
git clone https://github.com/nthend/websocket-server.git
cd websocket-server
npm install
./start-local.sh
```

Or you can host it on some hosting servers (for example [OpenShift](https://www.openshift.com/) is a free one)

### Deploy your application

Server already has some example applications deployed.
To deploy your application you need to do these few steps:

* In the root directory of the server find the file `apps.js`. In this file find `appList` array add an entry `"appname"`to it, where "appname" is the name of your application.

* Create new directory `appname` in the root directory of the server (where `server.js` and `apps.js` are located). 
* Create `index.js` file inside this directory. This file must export `WebSocketHandle` class. You can see example below. 
* Create `public` directory. Here you can put static content accessible via `http` or `https` using address: `http(s)://hostname/appname/filename`. 
* In the `appname/public` directory create `about.json` with fields that shown below. Also create `index.html` as main page of your application. You can open websockets from this page via javascript. For this purpose you can use `/websocket.js` file from `root/public`.

* Visit `http(s)://hostname/` in your browser to see new application added to the list of apps. Run your application using `http(s)://hostname/appname/`. Here you will see your main page from where you can open websocket connection to the server.

Example of `WebSocketHandle` declaration in `index.js` and export:
```javascript
function WebSocketHandle(websocket) {
	var self = this;
	this.websocket = websocket;
	this.open = function() {
		// add open listener code here
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

module.exports.WebSocketHandle = WebSocketHandle;
```

Structure of `public/about.json`:
```json
{
	"name": "App Name",
	"description": "Short description of your app",
	"image": "64x64_icon_of_app.png"
}
```
Icon must be placed in public dir.

### Examples

There are some example applications for this server:
* [websocket-chat](https://github.com/nthend/websocket-chat)
* ... coming soon
