var db = require('../lib/rethinkdb'),
    validation = require('../lib/validation'),
    chance = require('chance').Chance(Math.floor(Math.random()*(100-1+1)+1));

exports.getAll = function(req, res, next) {
  db.getAll('studios', function(err, items){
    var envelope = {};
    
    envelope.items = items;
    res.send(200, envelope);
    return next();
  });
};

exports.getSingle = function(req, res, next) {
  var id = req.params.id;
  db.getStudio(id, function(err, item){
    if(item===null){
      res.send(404);
    } else {
      res.send(200, item);
    }
  });
};

exports.create = function(req, res, next) {
  req.body.uid = chance.string({length: 12, pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'});
  var required_fields = ['name','description'];
  // check for missing fields
  validation.doesExist(required_fields, req.body, function(exists, failed){
    if(exists === false){
      var envelope = {};
      
      envelope.message = 'Missing fields';
      envelope.fields = failed;
      res.send(400, envelope);
      
      return next();
    }
  });

  // no missing fields, so send to the db
  db.create('studios', req.body, function(err, url){
    res.send(201, url);
    return next();
  });
};

exports.update = function(req, res, next) {
  var changes = req.body,
      id = req.params.id;
  db.update('studios', id, changes, function(err, item){
    res.send(200, item);
    return next();
  });
};

exports.delete = function(req, res, next) {
  var id = req.params.id;
  db.delete('studios', id, function(err, returnCode){
    res.send(204);
    return next();
  });
};