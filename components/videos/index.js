var controller = require('./videos');

module.exports = function (server) {
    server.get('/videos', function(req, res, next){controller.getAll(req, res, next)});
    server.post('/videos', function(req, res, next){controller.create(req, res, next)});
    server.get('/videos/:id', function(req, res, next){controller.getSingle(req, res, next)});
    server.get('/videos/:id/related', function(req, res, next){controller.getRelated(req, res, next)});
    server.patch('/videos/:id', function(req, res, next){controller.update(req, res, next)});
    server.del('/videos/:id', function(req, res, next){controller.delete(req, res, next)});
};