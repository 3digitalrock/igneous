var db = require('../lib/rethinkdb'),
    validation = require('../lib/validation'),
    chance = require('chance').Chance(Math.floor(Math.random()*(100-1+1)+1));

Array.prototype.toLowerCase = function() { 
    for (var i = 0; i < this.length; i++) {
        this[i] = this[i].toString().toLowerCase(); 
    }
};

exports.getAll = function(req, res, next) {
  db.getAll('videos', function(err, items){
    var envelope = {};
    
    envelope.items = items;
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

  // check if channels is an array
  if(!validation.isArray(req.body.channels)){
    var envelope = {};
    
    envelope.message = 'Channels field should be a JSON list';
    envelope.fields = 'channels';
    res.send(400, envelope);
    
    return next();
  }
  
  // make channel array lowercase. just 'cause.
  req.body.channels.toLowerCase();

  // no missing fields, so send to the db
  db.create('videos', req.body, function(err, url){
    res.send(201, url);
    return next();
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