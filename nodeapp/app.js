const http = require('http');
const  os = require('os');
const fs = require('fs');


const podApp = process.env.APPNAME || process.argv[2] || "App Name not supplied in APPNAME nor argv[2] "; 
const port = process.env.PORT || 8080;

console.log("Pod App: " + podApp + " starting... Listening on port " + port);

const getRequestInfo = function(req) {
  var info = {
    "podApp" : podApp,
    "podHostName": os.hostname(),
    "remoteAddress" : "Request received from: "  + req.connection.remoteAddress 
                      + ":" + req.connection.remotePort,
    "requestHostHeader" : req.headers["host"],
    "time" : new Date().toUTCString()
  }
  var strInfo = JSON.stringify(info);
  console.dir(info);
  var logFile = '/applogs.txt'; 
  var logDir = "./logs";
  var filePath = logDir + logFile;
  if(!fs.existsSync(logDir))
    fs.mkdirSync(logDir)
  fs.open(filePath, 'a', function(err, fd) {
    if (err) {
       console.log(err);
    }
    fs.appendFile(filePath, strInfo +  "\n", function (err) {
      if (err) 
        console.log(err);
    });
  });
  //Return the  info
   return strInfo;
};

const requestHandler = function (req, res) {
  res.setHeader("Content-Type", "application/json");
  switch (req.url) {
      case "/info":
          res.writeHead(200);
          var strInfo = getRequestInfo(req);
          res.end(strInfo); //must be a string
          break
      case "/probe":
          res.writeHead(200);
          res.end(JSON.stringify({probeStatus:"alive"}));
          break
      default:
          res.writeHead(404);
          res.end(JSON.stringify({error:"Resource not found"}));
  }
}

var www = http.createServer(requestHandler);
www.listen(port);