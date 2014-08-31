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

server.listen(3001, function () {
    console.info(' ✈ ApiServer listening at http://localhst:3001');
});