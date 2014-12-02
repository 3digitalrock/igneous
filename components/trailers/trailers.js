var restify = require('restify'),
    db = require('../../lib/rethinkdb'),
    validation = require('../../lib/validation'),
    jsonpatch = require('fast-json-patch'),
    crypto = require('crypto');

exports.getAll = function(req, res, next) {
  var dbArguments = {model: 'trailers'};
  var rawFields = req.query.fields;
  dbArguments.fields = {};

  if(!rawFields){
    // default fields to return
    dbArguments.fields = {'uid':true, 'title':true, 'description':true, 'files':true, 'order':true};
  } else {
    // get fields from parameter
    var fieldsSplit = rawFields.split(",");
    for (var i = 0; i < fieldsSplit.length; i++){
      dbArguments.fields[fieldsSplit[i]] = true;
    }
  }
  
  dbArguments.order = 'order';

  db.getAll(dbArguments, function(err, items){
    if(err){
      res.send(404);
    } else {
      var envelope = {};
      
      envelope.items = items;
      res.send(200, envelope);
    }
  });
};

exports.create = function(req, res, next) {
  var required_fields = ['title','description','order'];
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
  
  req.body.uid = crypto.randomBytes(Math.ceil(12/2)).toString('hex').slice(0,12);
  
  db.create('trailers', req.body, function(err, url){
    if(err){
      return next(new restify.InternalError('Server error. Please try again later.'));
    } else {
      res.send(201, url);
      return next();
    }
  });
};

exports.update = function(req, res, next) {
  var id = req.params.id,
      body = req.body;

  db.getSingle('trailers', id, function(err, oldItem){
    if(err){
      return next(new restify.InternalError('Server error. Please try again later.'));
    } else if(oldItem===null){
      return next(new restify.ResourceNotFoundError("Trailer not found"));
    } else {
      if(jsonpatch.apply(oldItem, body)){
        db.update('trailers', id, oldItem, function(err, newItem){
          res.send(200,{message: 'Great Success!'});
          return next();
        });
      }
    }
  });
};

exports.delete = function(req, res, next) {
  var id = req.params.id;
  db.delete('trailers', id, function(err, returnCode){
    res.send(204);
    return next();
  });
};