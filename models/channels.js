var db = require('../lib/rethinkdb'),
    validation = require('../lib/validation'),
    chance = require('chance').Chance(Math.floor(Math.random()*(100-1+1)+1)),
    jsonpatch = require('fast-json-patch');

exports.getAll = function(req, res, next) {
  var dbArguments = {model: 'channels'};
  var rawFields = req.query.fields;
  dbArguments.fields = {};
  
  if(!rawFields){
    // default fields to return
    dbArguments.fields = {'uid':true, 'name':true, 'description':true};
  } else {
    // get fields from parameter
    var fieldsSplit = rawFields.split(",");
    for (var i = 0; i < fieldsSplit.length; i++){
      dbArguments.fields[fieldsSplit[i]] = true;
    }
  }
  
  if(req.query.limit){
    if(validation.isInt(req.query.limit)){
      dbArguments.limit = parseInt(req.query.limit, 10);
    }
  }
  
  if(req.query.offset){
    if(validation.isInt(req.query.offset)){
      dbArguments.offset = parseInt(req.query.offset, 10);
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
  var rawFields = req.params.fields;
  var fields = {};
  
  if(!rawFields){
    // default fields to return
    fields = {'uid':true, 'title':true, 'description':true, 'thumbnails':true, 'slug':true};
  } else {
    // get fields from parameter
    var fieldsSplit = rawFields.split(",");
    for (var i = 0; i < fieldsSplit.length; i++){
      fields[fieldsSplit[i]] = true;
    }
  }
  
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
  var rawFields = req.params.fields;
  var fields = {};
  
  if(!rawFields){
    // default fields to return
    fields = {'uid':true, 'name':true, 'description':true};
  } else {
    // get fields from parameter
    var fieldsSplit = rawFields.split(",");
    for (var i = 0; i < fieldsSplit.length; i++){
      fields[fieldsSplit[i]] = true;
    }
  }
  
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
  var id = req.params.id,
      body = req.body;

  db.getSingle('channels', id, function(err, oldItem){
    if(oldItem===null){
      res.send(404);
    } else {
      if(jsonpatch.apply(oldItem, body)){
        db.update('channels', id, oldItem, function(err, newItem){
          res.send(200,{message: 'Great Success!'});
          return next();
        });
      }
    }
  });
};

exports.delete = function(req, res, next) {
  var uid = req.params.uid;
  db.delete('channels', uid, function(err, returnCode){
    res.send(204);
    return next();
  });
};