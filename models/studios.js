var db = require('../lib/rethinkdb'),
    validation = require('../lib/validation'),
    chance = require('chance').Chance(Math.floor(Math.random()*(100-1+1)+1)),
    jsonpatch = require('fast-json-patch');

exports.getAll = function(req, res, next) {
  var dbArguments = {model: 'studios'};
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

exports.getSingle = function(req, res, next) {
  var id = req.params.id;
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
  var id = req.params.id,
      body = req.body;

  db.getSingle('studios', id, function(err, oldItem){
    if(oldItem===null){
      res.send(404);
    } else {
      if(jsonpatch.apply(oldItem, body)){
        db.update('studios', id, oldItem, function(err, newItem){
          res.send(200,{message: 'Great Success!'});
          return next();
        });
      }
    }
  });
};

exports.delete = function(req, res, next) {
  var id = req.params.id;
  db.delete('studios', id, function(err, returnCode){
    res.send(204);
    return next();
  });
};