var dotenv = require('dotenv');
dotenv._getKeysAndValuesFromEnvFilePath('./config/.env');
dotenv._setEnvs();

var restify = require('restify'),
    models = require('./models'),
    bunyan = require('bunyan'),
    bunyanLogentries = require('bunyan-logentries');

var Analytics = require('analytics-node');
var analytics = new Analytics(process.env.SEGMENT_WRITEKEY, { flushAt: 1 });

var Chance = require('chance'),
    chance = new Chance();
    
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
  version: '0.1.0',
  log: log
});

// API v1
server.use(restify.fullResponse());
server.use(restify.bodyParser({mapParams:false}));
server.use(restify.queryParser({mapParams:false}));

server.get('/videos', function(req, res, next){
  analytics.track({
    anonymousId: chance.string({length: 10, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'}),
    event: 'Get videos'
  });
  models.Videos.getAll(req, res, next)});

server.post('/videos', function(req, res, next){models.Videos.create(req, res, next)});
server.get('/videos/:id', function(req, res, next){
  analytics.track({
    anonymousId: chance.string({length: 10, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'}),
    event: 'Get video',
    properties: {
      videoID: req.params.id
    }
  });
  models.Videos.getSingle(req, res, next)});
  
server.get('/videos/:id/related', function(req, res, next){models.Videos.getRelated(req, res, next)});
server.patch('/videos/:id', function(req, res, next){models.Videos.update(req, res, next);});
server.del('/videos/:id', function(req, res, next){models.Videos.delete(req, res, next)});

server.get('/channels', function(req, res, next){models.Channels.getAll(req, res, next)});
server.post('/channels', function(req, res, next){models.Channels.create(req, res, next)});
server.get('/channels/:id', function(req, res, next){models.Channels.getSingle(req, res, next)});
server.get('/channels/:id/videos', function(req, res, next){models.Channels.getChannelVideos(req, res, next)});
server.patch('/channels/:id', function(req, res, next){models.Channels.update(req, res, next)});
server.del('/channels/:id', function(req, res, next){models.Channels.delete(req, res, next)});

server.get('/studios', function(req, res, next){models.Studios.getAll(req, res, next)});
server.post('/studios', function(req, res, next){models.Studios.create(req, res, next)});
server.get('/studios/:id', function(req, res, next){models.Studios.getSingle(req, res, next)});
server.get('/studios/:id/videos', function(req, res, next){models.Studios.getStudioVideos(req, res, next)});
server.patch('/studios/:id', function(req, res, next){models.Studios.update(req, res, next)});
server.del('/studios/:id', function(req, res, next){models.Studios.delete(req, res, next)});

server.use(function(err, req, res, next) {
    log.error(err);
    res.send(err.status || 500);
});

if(dotenv.keys_and_values.PORT) process.env.PORT=dotenv.keys_and_values.PORT;

server.listen(process.env.PORT, function () {
    console.info(' ✈ ApiServer listening at http://localhost:'+process.env.PORT);
});