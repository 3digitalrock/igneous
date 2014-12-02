var controller = require("./channels");

module.exports = function (server) {
    server.get('/channels', function(req, res, next){controller.getAll(req, res, next)});
    server.post('/channels', function(req, res, next){controller.create(req, res, next)});
    server.get('/channels/:id', function(req, res, next){controller.getSingle(req, res, next)});
    server.get('/channels/:id/videos', function(req, res, next){controller.getChannelVideos(req, res, next)});
    server.patch('/channels/:id', function(req, res, next){controller.update(req, res, next)});
    server.del('/channels/:id', function(req, res, next){controller.delete(req, res, next)});
};