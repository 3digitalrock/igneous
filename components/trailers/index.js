var controller = require("./trailers");

module.exports = function (server) {
    server.get('/trailers', function(req, res, next){controller.getAll(req, res, next)});
    server.post('/trailers', function(req, res, next){controller.create(req, res, next)});
    server.patch('/trailers/:id', function(req, res, next){controller.update(req, res, next)});
    server.del('/trailers/:id', function(req, res, next){controller.delete(req, res, next)});
};