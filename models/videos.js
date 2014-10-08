var db = require('../lib/rethinkdb'),
    validation = require('../lib/validation'),
    slug = require('slug'),
    chance = require('chance').Chance(Math.floor(Math.random()*(100-1+1)+1)),
    jsonpatch = require('fast-json-patch');

Array.prototype.toLowerCase = function() { 
    for (var i = 0; i < this.length; i++) {
        this[i] = this[i].toString().toLowerCase(); 
    }
};

exports.getAll = function(req, res, next) {
  var dbArguments = {model: 'videos'};
  var rawFields = req.query.fields;
  dbArguments.fields = {};

  if(!rawFields){
    // default fields to return
    dbArguments.fields = {'uid':true, 'title':true, 'description':true, 'thumbnails':true, 'slug':true, 'created': true};
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
  
  dbArguments.order = 'created';
  
  db.getAll(dbArguments, function(err, items){
    var envelope = {};
    
    envelope.items = items;
    res.send(200, envelope);
    return next();
  });
};

exports.getSingle = function(req, res, next) {
  var id = req.params.id;
  var rawFields = req.params.fields;
  var fields = {};
  
  if(!rawFields){
    // default fields to return
    fields = {'uid':true, 'title':true, 'description':true, 'thumbnails':true, 'slug':true, 'created':true};
  } else {
    // get fields from parameter
    var fieldsSplit = rawFields.split(",");
    for (var i = 0; i < fieldsSplit.length; i++){
      fields[fieldsSplit[i]] = true;
    }
  }
  
  db.getSingle('videos', id, function(err, item){
    if(item===null){
      res.send(404);
    } else {
      res.send(200, item);
    }
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
  
  // "slugify" the title
  req.body.slug = slug(req.body.title.toLowerCase(), {symbols: false});
  
  var date = new Date();
  req.body.created = req.body.updated = date.toISOString();
  req.body.status = "0";
  
  var fields = ['uid','name'];
  db.getPlucked('studios', req.body.studio, fields, function(err, result){
    req.body.studio = { 'uid': result.uid, 'name': result.name };
    
    db.create('videos', req.body, function(err, url){
      res.send(201, url);
      return next();
    });
  });

};

exports.update = function(req, res, next) {
  var id = req.params.id,
      body = req.body;

  var date = new Date();
  body.updated = date.toISOString();

  db.getSingle('videos', id, function(err, oldItem){
    if(oldItem===null){
      res.send(404);
    } else {
      if(jsonpatch.apply(oldItem, body)){
        db.update('videos', id, oldItem, function(err, newItem){
          res.send(200,{message: 'Great Success!'});
          return next();
        });
      }
    }
  });
};

exports.delete = function(req, res, next) {
  var id = req.params.id;
  db.delete('videos', id, function(err, returnCode){
    res.send(204);
    return next();
  });
};