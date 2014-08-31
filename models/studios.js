var db = require('../lib/rethinkdb');

exports.getAll = function(req, res, next) {
  db.getAll('studios', function(err, items){
    res.send(200, items);
    return next();
  });
};

exports.getSingle = function(req, res, next) {
  var id = req.params.id;
  db.getVideo('studios', id, function(err, item){
    res.send(200, item);
  });
};

exports.create = function(req, res, next) {
  var info = req.body;
  db.createVideo('studios', info, function(err, videoUrl){
    res.send(201, videoUrl);
    return next();
  });
};

exports.update = function(req, res, next) {
  var changes = req.body,
      id = req.params.id;
  db.updateVideo('studios', id, changes, function(err, item){
    res.send(200, item);
    return next();
  });
};

exports.delete = function(req, res, next) {
  var id = req.params.id;
  db.deleteVideo('studios', id, function(err, returnCode){
    res.send(204);
    return next();
  });
};