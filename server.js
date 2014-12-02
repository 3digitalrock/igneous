var dotenv = require('dotenv');
dotenv._getKeysAndValuesFromEnvFilePath('./config/.env');
dotenv._setEnvs();

var restify = require('restify'),
    bunyan = require('bunyan'),
    bunyanLogentries = require('bunyan-logentries'),
    packageinfo = require('./package.json');

var Analytics = require('analytics-node');
var analytics = new Analytics(process.env.SEGMENT_WRITEKEY);

var Chance = require('chance'),
    chance = new Chance();
    
var anonId = chance.string({length: 10, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'});
    
var log = bunyan.createLogger({
  name: 'igneous',
  streams: [
    {
      level: 'info',
      stream: bunyanLogentries.createStream({token: process.env.BUNYAN_TOKEN}),  // log INFO and above to bunyanLogentries
      type: 'raw'
    },
    {
      level: 'error',
      path: './error.log'  // log ERROR and above to a file
    }
  ]
});

var server = module.exports = restify.createServer({
  name: 'igneous',
  version: packageinfo.version,
  log: log
});

// API v1
server.use(restify.fullResponse());
server.use(restify.bodyParser({mapParams:false}));
server.use(restify.queryParser({mapParams:false}));

server.use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);

// Load all of the models' routes and controllers
require('./components')(server);

server.use(function(err, req, res, next) {
    log.error(err);
    res.send(err.status || 500);
});

if(dotenv.keys_and_values.PORT) process.env.PORT=dotenv.keys_and_values.PORT;

server.listen(process.env.PORT, function () {
    console.info(' ✈ ApiServer listening at http://localhost:'+process.env.PORT);
});