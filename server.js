var express = require('express');
var ws   = require('ws');

var host = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

var expressApp = express();
expressApp.use(express.static(__dirname + '/public'));
expressApp.listen(port, host);

wsServerConfig = {server: expressApp.server};
if(host == 'localhost')
	wsServerConfig.port = 8000;
wsServer = new ws.Server(wsServerConfig);
wsServer.on('connection', function (websocket) {
    websocket.on('message', function (message) {
        console.log('received: %s', message);
    });
    websocket.send('hello browser');
});
