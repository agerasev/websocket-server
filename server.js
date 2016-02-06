
var host = process.env.OPENSHIFT_NODEJS_IP   || process.env.IP   || 'localhost';
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
var wsport = process.env.WSPORT;


// initialize express

var express = require('express');

var expressApp = express();
expressApp.use(express.static(__dirname + '/public'));


// load apps

var apps = require('./apps.js');
var appsList = apps.list;
var appHandles = {'': apps.WebSocketHandle};

console.log('loading apps ...');
for(var i = 0; i < appsList.length; ++i) {
	var app = appsList[i];
	var Handle;
	try {
		Handle = require('./' + app + '/main.js').WebSocketHandle;
	} catch(e) {
		console.error('cannot find app "' + app + '": ' + e);
		continue;
	}
	expressApp.use('/' + app, express.static(__dirname + '/' + app + '/public'));
	console.log('"%s" loaded', app);
	if(Handle) {
		appHandles[app] = Handle;
	} else {
		console.error('"%s" does not have WebSocketHandle', app);
	}
}


// create http server

var http = require('http');

var httpServer = http.createServer(expressApp);
httpServer.listen(port, host);


// create websocket server

var ws = require('ws');

wsServerConfig = {server: httpServer};
if(wsport)
	wsServerConfig.port = wsport;
var wsServer = new ws.Server(wsServerConfig);
wsServer.on('connection', function (websocket) {
	var path = require('url').parse(websocket.upgradeReq.url).pathname;
	var app = path.replace(/\/+/,'/').replace(/\/+$/,'').replace(/^\//,'');
	var Handle = appHandles[app];
	if(Handle) {
		var wshandle = new Handle(websocket);
		wshandle.open();
		websocket.on('message', function (message, flags) {
			wshandle.receive(message, flags);
		});
		websocket.on('close', function (code, message) {
			wshandle.close(code, message);
		});
		websocket.on('error', function (error) {
			wshandle.error(error);
		});
	} else {
		console.error('unknown app "%s"', app);
		websocket.send('unknown app "' + app + '"');
		websocket.close(1003, 'No Such App');
	}
});
