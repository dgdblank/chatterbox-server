/* Import node's http module: */
var http = require("http");
var handleRequest = require("./request-handler.js");
var fs = require('fs');

var port = 3000;
var ip = "127.0.0.1";

var server = http.createServer(handleRequest.requestHandler);
console.log("Listening on http://" + ip + ":" + port);
server.listen(port, ip);

// To start this server, run:
//
//   node basic-server.js
//
// on the command line.
//
// To connect to the server, load http://127.0.0.1:3000 in your web
// browser.
//
// server.listen() will continue running as long as there is the
// possibility of serving more requests. To stop your server, hit
// Ctrl-C on the command line.

