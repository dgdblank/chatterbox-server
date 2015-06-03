var fs = require('fs');
var index = fs.readFile('../client/index.html');
// information to include in response header
var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10,
  'Content-Type': "application/json" // Seconds.
};

// responds with statusCode and data
var sendResponse = function(response, statusCode, data) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

// initalize database
var database;

// reads data saved in txt file
fs.readFile('serverData.txt', function(err, data){
  if(err) throw err;
  database = JSON.parse(data);
})

// handles requests OPTIONS, GET, POST
var requestHandler = function(request, response) {
  if( (/\/classes\/\w{1,}/).test(request.url) ){
    if( request.method === 'OPTIONS'){
      sendResponse(response);
    }
    else {
      if( request.method === "GET" ){
        sendResponse(response, 200, database)
      }

      if( request.method === "POST" ){
        var body = '';
        request.on('data', function(data) {
          body += data;
        });

        request.on('end', function() {
          // pushes POST into database
          database.results.push(JSON.parse(body));
          // saves POST into outside textfile
          fs.writeFile('serverData.txt', JSON.stringify(database), function(err){
            if(err) console.log("ERROR");
            console.log("SUCCESS");
          })
        });

        sendResponse(response, 201, database);
      }
    }

  }
  else if( (/\//).test(request.url) ) {
    console.log("HOME PAGE");
  }
  else {
    console.log(request.url);
    response.writeHead(404, headers);
    response.end();
  }

};

exports.requestHandler = requestHandler;
