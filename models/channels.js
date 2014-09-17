var db = require('../lib/rethinkdb'),
    validation = require('../lib/validation'),
    chance = require('chance').Chance(Math.floor(Math.random()*(100-1+1)+1));

exports.getAll = function(req, res, next) {
  var dbArguments = {model: 'channels'};
  if(req.params.limit){
    if(validation.isInt(req.params.limit)){
      dbArguments.limit = parseInt(req.params.limit, 10);
    }
  }
  
  db.getAll(dbArguments, function(err, items){
    var envelope = {};
    
    envelope.items = items;
    res.send(200, envelope);
    return next();
  });
};

exports.getChannelVideos = function(req, res, next) {
  // default fields to return
  var fields = {'uid':true, 'title':true, 'description':true, 'thumbnails':true, 'slug':true};
  var dbArguments = {model: 'videos', comparison: 'channels', id: req.params.id, fields: fields};
  
  // if a limit was set, make sure it's a number then pass it to the DB
  if(req.params.limit){
    if(validation.isInt(req.params.limit)){
      dbArguments.limit = parseInt(req.params.limit, 10);
    }
  }

  db.getSome(dbArguments, function(err, items){
    var envelope = {};
    
    envelope.items = items;
    res.send(200, envelope);
  });
};

exports.getSingle = function(req, res, next) {
  var uid = req.params.id;
  db.getSingle('channels', uid, function(err, item){
    if(item===null){
      res.send(404);
    } else {
      res.send(200, item);
    }
  });
};

exports.create = function(req, res, next) {
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
  
  req.body.uid = req.body.name.replace(/\s+/g, '_');
  req.body.uid = req.body.uid.toLowerCase();

  // no missing fields, so send to the db
  db.create('channels', req.body, function(err, url){
    res.send(201, url);
    return next();
  });
};

exports.update = function(req, res, next) {
  var changes = req.body,
      uid = req.params.uid;
  db.update('channels', uid, changes, function(err, item){
    res.send(200, item);
    return next();
  });
};

exports.delete = function(req, res, next) {
  var uid = req.params.uid;
  db.delete('channels', uid, function(err, returnCode){
    res.send(204);
    return next();
  });
};