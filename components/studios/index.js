var controller = require("./studios");

module.exports = function (server) {
    server.get('/studios', function(req, res, next){controller.getAll(req, res, next)});
    server.post('/studios', function(req, res, next){controller.create(req, res, next)});
    server.get('/studios/:id', function(req, res, next){controller.getSingle(req, res, next)});
    server.get('/studios/:id/videos', function(req, res, next){controller.getStudioVideos(req, res, next)});
    server.patch('/studios/:id', function(req, res, next){controller.update(req, res, next)});
    server.del('/studios/:id', function(req, res, next){controller.delete(req, res, next)});
};