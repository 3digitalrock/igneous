// load requirements
var restify = require('restify'),
    modules = require('./modules');

var server = restify.createServer({
  name: 'igneous',
  version: '0.1.0'
});

// API v1
server.use(restify.bodyParser());
server.get('/videos', function(req, res, next){modules.Videos.getAll(req, res, next)});
server.post('/videos', function(req, res, next){modules.Videos.create(req, res, next)});
server.get('/videos/:id', function(req, res, next){modules.Videos.getSingle(req, res, next)});
server.patch('/videos/:id', function(req, res, next){modules.Videos.update(req, res, next)});
server.del('/videos/:id', function(req, res, next){modules.Videos.delete(req, res, next)});

server.get('/channels', function(req, res, next){modules.Channels.getAll(req, res, next)});
server.post('/channels', function(req, res, next){modules.Channels.create(req, res, next)});
server.get('/channels/:id', function(req, res, next){modules.Channels.getSingle(req, res, next)});
server.patch('/channels/:id', function(req, res, next){modules.Channels.update(req, res, next)});
server.del('/channels/:id', function(req, res, next){modules.Channels.delete(req, res, next)});

server.get('/studios', function(req, res, next){modules.Studios.getAll(req, res, next)});
server.post('/studios', function(req, res, next){modules.Studios.create(req, res, next)});
server.get('/studios/:id', function(req, res, next){modules.Studios.getSingle(req, res, next)});
server.patch('/studios/:id', function(req, res, next){modules.Studios.update(req, res, next)});
server.del('/studios/:id', function(req, res, next){modules.Studios.delete(req, res, next)});

server.listen(3001, function () {
    console.info(' ✈ ApiServer listening at http://localhst:3001');
});