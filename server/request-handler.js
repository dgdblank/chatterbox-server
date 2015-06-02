var headers = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
  "access-control-allow-headers": "content-type, accept",
  "access-control-max-age": 10,
  'Content-Type': "application/json" // Seconds.
};

var sendResponse = function(response, statusCode, data) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(JSON.stringify(data));
};

var database = {"results": []};

var requestHandler = function(request, response) {
  if( !(/\/classes\/\w{1,}/).test(request.url) ){
    response.writeHead(404, headers);
    response.end();
  }

  if( request.method === 'OPTIONS'){
    sendResponse(response);
  } else {

    if( request.method === "GET" ){
      sendResponse(response, 200, database)
    }

    if( request.method === "POST" ){
      var body = '';
      request.on('data', function(data) {
        body += data;
      });

      request.on('end', function() {
        database.results.push(JSON.parse(body));
      });

      sendResponse(response, 201, database)
    }
  }
};

exports.requestHandler = requestHandler;
