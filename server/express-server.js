var express = require('../node_modules/express');
var handleRequest = require('request-handler.js')
var http = require('http');
// var path = require('path');
// var index

var app = express();
app.use(express.static('../client'))
var server = http.createServer(app);
var port = 3000;
var ip = "127.0.0.1";

app.get('/', handleRequest.requestHandler);
app.get('/classes/chatterbox', handleRequest.requestHandler);
app.post('/classes/chatterbox', handleRequest.requestHandler);


server.listen(port, ip);
