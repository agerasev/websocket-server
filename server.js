// import envvars

var host = process.env.OPENSHIFT_NODEJS_IP   || process.env.IP   || 'localhost';
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;
var wsport = process.env.WSPORT;

var mongodbUrl = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGODB_URL;
var mongodbDb = process.env.OPENSHIFT_APP_NAME || process.env.MONGODB_DB;


// initialize express

var express = require('express');

var expressApp = express();
expressApp.use(express.static(__dirname + '/public'));


// load apps

var appNames = require('./apps.json').list;

var apps = {'': {Client: function (websocket) {
	var self = this;
	this.websocket = websocket;
	this.open = function() {
		// add open listener code instead
		for(var i = 0; i < appNames.length; ++i) {
			self.websocket.send(appNames[i]);
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
}}};

console.log('loading apps ...');
for(var i = 0; i < appNames.length; ++i) {
	var appName = appNames[i];
	var app = null;
	try {
		app = require('./' + appName);
	} catch(e) {
		console.error('[error] cannot find app "' + appName + '": ' + e + ', file: ' + e.fileName + ', line: ' + e.lineNumber);
		continue;
	}

	expressApp.use('/' + appName, express.static(__dirname + '/' + appName + '/public'));
	console.log('[info] "%s" loaded', appName);

	if(!app.Client) {
		console.log('[warning] "%s" does not implement "Client" class', appName);
	}

	if(!app.setDBCollection) {
		console.error('[warning] "%s" does not provide "setDBCollection" function', appName);
	}

	apps[appName] = app;
}


// initialize database

var mongodb = require('mongodb');
var db = null;
console.log('[info] conecting database at ' + mongodbUrl + ' ...');
mongodb.MongoClient.connect(mongodbUrl + mongodbDb, function(err, mdb) {
	if(err) {
		console.err("[error] db: cannot connect mongodb: " + err);
	} else {
		console.log("[info] db: mongodb connected");
		db = mdb;
		for(var appName in apps) {
			var app = apps[appName];
			(function(setColl) {
				if(setColl) {
					db.createCollection(appName, function(err, coll) {
						if(err) {
							console.log('[error] db: cannot create "' + appName + '" collection: ' + err);
						} else {
							console.log('[info] db: "' + appName + '" collection successfully created or it already exists');
							if(setColl)
								setColl(coll);
						}
					});
				}
			})(app.setDBCollection);
		}
	}
});


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
	var appName = path.replace(/\/+/,'/').replace(/\/+$/,'').replace(/^\//,'');
	var Client = apps[appName].Client;
	if(Client) {
		var client = new Client(websocket);
		client.open();
		websocket.on('message', function (message, flags) {
			client.receive(message, flags);
		});
		websocket.on('close', function (code, message) {
			client.close(code, message);
		});
		websocket.on('error', function (error) {
			client.error(error);
		});
	} else {
		console.error('unknown app "%s"', appName);
		websocket.send('unknown app "' + appName + '"');
		websocket.close(1003, 'No Such App');
	}
});


// setup termination handlers

function terminate() {
	db.close();
    console.log('[info] server stopped');
};

process.on('exit', function() { terminate(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function(element, index, array) {
    process.on(element, function() { 
    	console.log('[info] received %s - terminating server ...', element);
    	terminate(); 
    });
});