var restify = require('restify'),
    db = require('../lib/rethinkdb'),
    validation = require('../lib/validation'),
    jsonpatch = require('fast-json-patch');

exports.getAll = function(req, res, next) {
  var dbArguments = {model: 'trailers'};
  var rawFields = req.query.fields;
  dbArguments.fields = {};

  if(!rawFields){
    // default fields to return
    dbArguments.fields = {'uid':true, 'title':true, 'description':true, 'thumbnails':true, 'files':true};
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

exports.getSingle = function(req, res, next) {
  var id = req.params.id;
  var rawFields = req.query.fields;
  var fields = {};
  
  if(!rawFields){
    // default fields to return
    fields = {'uid':true, 'title':true, 'description':true, 'thumbnails':true, 'files':true};
  } else {
    // get fields from parameter
    var fieldsSplit = rawFields.split(",");
    for (var i = 0; i < fieldsSplit.length; i++){
      fields[fieldsSplit[i]] = true;
    }
  }
  
  if(fields.all){
    db.getSingle('trailers', id, function(err, item){
      if(err){
        return next(new restify.InternalError('Server error. Please try again later.'));
      } else if (item===null){
        return next(new restify.ResourceNotFoundError("Trailer not found"));
      } else {
        res.send(200, item);
      }
    });
  } else {
    db.getPlucked('trailers', id, fields, function(err, item){
      if(err){
        return next(new restify.InternalError('Server error. Please try again later.'));
      } else if (item===null){
        return next(new restify.ResourceNotFoundError("Trailer not found"));
      } else {
        res.send(200, item);
      }
    });
  }
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
    console.log(err);
    console.log(returnCode);
    res.send(204);
    return next();
  });
};