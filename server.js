var http = require('http');
var url  = require('url');
var fs   = require('fs');
var mmm  = require('mmmagic');
var ws   = require('ws');

var host = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
var extMime = {
	'js' : 'application/javascript',
	'css': 'text/css',
	'xml': 'text/xml',
	'svg': 'image/svg+xml'
};
function getExt(path) {
	var file = path.split('/').pop();
	var ext = path.split('.');
	if(ext.length > 1) {
		return ext.pop();
	}
	return undefined;
}
function getExtMime(ext) {
	if(ext) {
		return extMime[ext];
	}
	return undefined;
}

httpServer = http.createServer(function (req, res) {
	var headers = {};
	var path = '.' + url.parse(req.url).pathname;
	
	// write headers and content
	function sendData(code, head, data) {
		res.writeHead(code, head);
		res.end(data);
	}

	function error(code, desc) {
		sendData(code, {'Content-Type': 'text/plain'}, code + ' ' + desc);
	}

	// load file content and get its MIME type
	function loadFile(head, callback, error) {
		fs.readFile(path, function (err, data) {
			if(err) {
				error(403, 'Forbidden');
			} else {
				head['Content-Length'] = data.length;
				var mime = getExtMime(getExt(path));
				if(mime) {
					head['Content-Type'] = mime;
					callback(head, data);
				} else {
					magic.detect(data, function (err, result) {
						if(err) {
							error(415, 'Unsupported Media Type');
						} else {
							head['Content-Type'] = result;
							callback(head, data);
						}
					});
				}
			}
		});
	}

	// check file existance
	function checkFile(callback, error) {
		function notFound () { 
			error(404, 'Not Found'); 
		}
		fs.stat(path, function (err, stat) {
			if(err) {
				notFound();
			} else if(stat.isDirectory()) {
				if(path[path.length - 1] != '/') {
					notFound();
				} else {
					path += '/index.html';
					fs.stat(path, function (err, stat) {
						if(err || !stat.isFile()) {
							notFound();
						} else {
							callback();
						}
					});
				}
			} else if(!stat.isFile()) {
				notFound();
			}
			callback();
		});
	}

	checkFile(function () {
		loadFile(headers, function (head, data) {
			sendData(200, head, data);
		}, error);
	}, error);

}).listen(port, host);

wsServerConfig = {server: httpServer};
if(host == 'localhost')
	wsServerConfig.port = 8000;
wsServer = new ws.Server(wsServerConfig);
wsServer.on('connection', function (websocket) {
    websocket.on('message', function (message) {
        console.log('received: %s', message);
    });
    websocket.send('hello browser');
});
