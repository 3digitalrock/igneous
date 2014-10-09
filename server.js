// load requirements
var restify = require('restify'),
    models = require('./models');

var server = restify.createServer({
  name: 'igneous',
  version: '0.1.0'
});

// API v1
server.use(restify.fullResponse());
server.use(restify.bodyParser({mapParams:false}));
server.use(restify.queryParser({mapParams:false}));

server.get('/videos', function(req, res, next){models.Videos.getAll(req, res, next)});
server.post('/videos', function(req, res, next){models.Videos.create(req, res, next)});
server.get('/videos/:id', function(req, res, next){models.Videos.getSingle(req, res, next)});
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

server.listen(3001, function () {
    console.info(' ✈ ApiServer listening at http://localhost:3001');
});