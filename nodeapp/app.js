const http = require('http');
const  os = require('os');
const fs = require('fs');


const podApp = process.env.APPNAME || process.argv[2]; 
const port = process.env.PORT || 8080;

console.log("Pod App: " + podApp + " starting... Listening on port " + port);

var handler = function(request, response) {
  var msg = {
    "podApp" : podApp,
    "podHostName": os.hostname(),
    "remoteAddress" : "Request received from: "  + request.connection.remoteAddress 
                      + ":" + request.connection.remotePort,
    "requestHostHeader" : request.headers["host"],
    "time" : new Date().toUTCString()
  }
  var strMsg = JSON.stringify(msg);
  console.dir(msg);
  response.writeHead(200);
  var logFile = './logs/applogs.txt'; //Source code root directory  - works fine
  fs.open(logFile, 'a', function(err, fd) {
    if (err) {
       console.log(err);
    }
    fs.appendFile(logFile, strMsg +  "\n", function (err) {
      if (err) 
        console.log(err);
    });
  });
  response.end(strMsg);
};

var www = http.createServer(handler);
www.listen(port);