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

var appNames = null;

var apps = {'': {Client: function (websocket) {
	var self = this;
	self.websocket = websocket;
	self.open = function() {
		// add open listener code instead
		var appInfoList = {};
		for(var i = 0; i < appNames.length; ++i) {
			var appName = appNames[i];
			var info = null;
			try {
				info = require('./apps/' + appName + '/public/about.json');
			} catch(e){}
			appInfoList[appNames[i]] = info;
		}
		self.websocket.send(JSON.stringify(appInfoList));
		websocket.close(1000, 'Apps List Loaded');
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
}}};

var fs = require('fs');

fs.readdir('./apps/', function(err, dirs) {
	console.log('loading apps ...');
	if(err) {
		console.error('cannot list files in "apps" dir: ' + err);
		return;
	}
	appNames = dirs;
	for(var i = 0; i < appNames.length; ++i) {
		var appName = appNames[i];
		var app = null;
		console.log('"%s" app:', appName);
		try {
			app = require('./apps/' + appName);
		} catch(e) {
			console.error('\tcannot load server-side part of "' + appName + '": ' + e/* + ', file: ' + e.fileName + ', line: ' + e.lineNumber*/);
		}
		apps[appName] = app;

		expressApp.use('/' + appName, express.static(__dirname + '/apps/' + appName + '/public'));
		
		if(app) {
			if(!app.Client) {
				console.log('\t"%s" does not implement "Client" class', appName);
			}

			if(!app.setDBCollection) {
				console.error('\t"%s" does not provide "setDBCollection" function', appName);
			}
		}

		console.log('\t"%s" loaded', appName);
	}
});
console.log('');


// initialize database

var mongodb = require('mongodb');
var db = null;
mongodb.MongoClient.connect(mongodbUrl + mongodbDb, function(err, mdb) {
	console.log('db: conecting database at ' + mongodbUrl + ' ...');
	if(err) {
		console.err("db: cannot connect mongodb: " + err);
		return;
	}
	console.log("db: mongodb connected");
	db = mdb;
	for(var appName in apps) {
		var app = apps[appName];
		if(app && app.setDBCollection) {
			(function(appName, setColl) {
				db.createCollection(appName, function(err, coll) {
					if(err) {
						console.log('db: cannot create "' + appName + '" collection: ' + err);
						return;
					}
					console.log('db: "' + appName + '" collection successfully created or it already exists');
					setColl(coll);
				});
			})(appName, app.setDBCollection);
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
	var app = apps[appName];
	if(app) {
		var Client = app.Client;
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
	}
});


// setup termination handlers

function terminate() {
	console.log('closing db');
	db.close();
	console.log('server stopped');
};

process.on('exit', function() { terminate(); });

['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function(element, index, array) {
	process.on(element, function() { 
		console.log('received %s - terminating server ...', element);
		process.exit(1);
	});
});
