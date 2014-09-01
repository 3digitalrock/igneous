var db = require('../lib/rethinkdb'),
    validation = require('../lib/validation');

exports.getAll = function(req, res, next) {
  db.getAll('videos', function(err, items){
    var envelope = {};
    
    envelope.videos = items;
    res.send(200, envelope);
    return next();
  });
};

exports.getSingle = function(req, res, next) {
  var id = req.params.id;
  db.getSingle('videos', id, function(err, item){
    res.send(200, item);
  });
};

exports.create = function(req, res, next) {
  var required_fields = ['title','description','channels','studio'];
  validation.doesExist(required_fields, req.body, function(exists, failed){
    // return missing fields if any are missing
    if(exists === false){
      var envelope = {};
      
      envelope.message = 'Missing fields';
      envelope.fields = failed;
      res.send(400, envelope);
      
      return next();
    } else {
      // no missing fields, so send to the db
      db.create('videos', req.body, function(err, url){
        res.send(201, url);
        return next();
      });
    }
  });
};

exports.update = function(req, res, next) {
  var changes = req.body,
      id = req.params.id;
  db.update('videos', id, changes, function(err, item){
    res.send(200, item);
    return next();
  });
};

exports.delete = function(req, res, next) {
  var id = req.params.id;
  db.delete('videos', id, function(err, returnCode){
    res.send(204);
    return next();
  });
};