# WebSocket Server

This server designed to host and run user [Node.js](https://nodejs.org/) web applications.

Example instance of server you can find at [wsapps-nthend.rhcloud.com](https://wsapps-nthend.rhcloud.com/). 

Server provides for appliction:
* Access to static content of application (.html, .css, .js files, images and etc.) via `http` or `https`
* Evaluation of server-side Node.js code through some interface (see below).
* WebSocket connection from client (secure `wss` or insecure `ws` protocol)
* MongoDB collection to store data.

## Run the server

You can run this server at your local machine (you need to have `nodejs` and `npm` installed):
```bash
git clone https://github.com/nthend/websocket-server.git
cd websocket-server
./prepare.sh
./start.sh
```

Or you can host it on some hosting servers (for example [OpenShift](https://www.openshift.com/) is a free one)

## Deploy your application

An appliction is a directory in `./apps/` that may include:
* `public` subdirectory with static client-side content (`index.html` may be placed here)
* `index.js` file for server-side execution, that may export `Client` and `setDBCollection`.

Server already has some example applications deployed.
To create your application you need to do these few steps:

* Create new directory `appname` in the './apps/' directory of the server, where `appname` is the name of your application.

Now your application can be detected by the server. Inside `./apps/appname` directory do following things:

* Create `index.js` file. This file may export `Client` and `setDBCollection` functions. You can see example below. 
* Create `public` directory. Here you can put static content accessible via `http` or `https` using address: `http(s)://hostname/appname/filename`. 
* In the `public` directory create `about.json` with fields that shown below. Also create `index.html` here as main page of your application. You can open websockets from this page via javascript. For this purpose you can use `/websocket.js` file from `/public`.

After all run `./prepare.sh; ./start.sh` and visit `http://localhost:8080/` in your browser to see new application added to the list of apps. Click it to load it. Here you will see your main page from where you can open websocket connection to the server.

## Exported symbols

An application may exports some symbols for interacting with the server and, therefore, clients.

### Client

`Client` is a constructor function. Server creates new `Client` instance on incoming websocket connection and binds methods of these new object to websocket events.

Example of `Client` declaration in `index.js`:
```javascript
function Client(websocket) {
	var self = this;
	self.websocket = websocket;
	self.open = function() {
		// add open listener code here
	}
	self.close = function(code, message) {
		// add close listener code here
	}
	self.receive = function(message, flags) {
		// add receive listener code here
	}
	self.error = function(error) {
		// add error listener code here
	}
}
module.exports.Client = Client;
```

### setDBCollection

`setDBCollection` function is used to bind MongoDB database collection to your application. Server creates collection for each appliction that exports this function and passes the collection to 'setDBCollection'. After that you can use it as regular MongoDB collection.

```javascript
var dbcoll = null;
function setDBCollection(coll) {
	dbcoll = coll;
}
module.exports.setDBCollection = setDBCollection;
```

## Application description

Application description is contained in `public/about.json` file inside your app dir. 

Structure of `public/about.json`:
```json
{
	"name": "App Name",
	"description": "Short description of your app",
	"image": "path/to/64x64_icon.png"
}
```
Icons must be placed somewhere inside public dir.

## Examples

There are some example applications for this server:
* [websocket-chat](https://github.com/nthend/websocket-chat)
* [js-quad-world](https://github.com/nthend/js-quad-world)
* [js-roosters](https://github.com/nthend/js-roosters)
* ... coming soon
