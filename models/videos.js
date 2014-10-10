var restify = require('restify'),
    db = require('../lib/rethinkdb'),
    validation = require('../lib/validation'),
    slug = require('slug'),
    async = require('async'),
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
    dbArguments.fields = {'uid':true, 'title':true, 'description':true, 'thumbnails':true, 'slug':true, 'created': true, 'status':true};
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
    fields = {'uid':true, 'title':true, 'description':true, 'thumbnails':true, 'slug':true, 'files':true, 'created':true};
  } else {
    // get fields from parameter
    var fieldsSplit = rawFields.split(",");
    for (var i = 0; i < fieldsSplit.length; i++){
      fields[fieldsSplit[i]] = true;
    }
  }
  
  if(fields.all){
    db.getSingle('videos', id, function(err, item){
      if(err){
        return next(new restify.InternalError('Server error. Please try again later.'));
      } else if (item===null){
        return next(new restify.ResourceNotFoundError("Video not found"));
      } else {
        res.send(200, item);
      }
    });
  } else {
    db.getPlucked('videos', id, fields, function(err, item){
      if(err){
        return next(new restify.InternalError('Server error. Please try again later.'));
      } else if (item===null){
        return next(new restify.ResourceNotFoundError("Video not found"));
      } else {
        res.send(200, item);
      }
    });
  }
};

exports.getRelated = function(req, res, next) {
  var rawFields = req.params.fields;
  var fields = {};
  
  if(!rawFields){
    // default fields to return
    fields = {'uid':true, 'title':true, 'description':true, 'thumbnails':true, 'slug':true, 'status':true, 'channels':true};
  } else {
    // get fields from parameter
    var fieldsSplit = rawFields.split(",");
    for (var i = 0; i < fieldsSplit.length; i++){
      fields[fieldsSplit[i]] = true;
    }
  }
  
  var dbArguments = {model: 'videos', id: req.params.id, fields: fields, order: 'created'};
  
  // if a limit was set, make sure it's a number then pass it to the DB
  if(req.params.limit){
    if(validation.isInt(req.params.limit)){
      dbArguments.limit = parseInt(req.params.limit, 10);
    }
  }
  
  db.getSingle('videos', req.params.id, function(err, item){
    if(err){
      return next(new restify.InternalError('Server error. Please try again later.'));
    } else if (item===null){
      return next(new restify.ResourceNotFoundError("Video not found"));
    } else {
      async.parallel({
          studio: function(callback){
            var sArguments = JSON.parse(JSON.stringify(dbArguments));
            
            sArguments.studio = item.studio.uid;
            sArguments.indexKey = 'studioId';
            
            db.getRelated(sArguments, 'studio', function(err, items){
                if(err){
                  callback(err, null);
                } else {
                  callback(null, items);
                }
            });
          },
          channels: function(callback){
            var cArguments = JSON.parse(JSON.stringify(dbArguments));
            cArguments.channels = item.channels[0];
            
            db.getRelated(cArguments, 'channels', function(err, items){
                if(err){
                  callback(err, null);
                } else {
                  callback(null, items);
                }
            });
          }
      },
      function(err, results) {
          res.send(200, results);
      });
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
      if(err){
        return next(new restify.InternalError('Server error. Please try again later.'));
      } else {
        res.send(201, url);
        return next();
      }
    });
  });

};

exports.update = function(req, res, next) {
  var id = req.params.id,
      body = req.body;

  var date = new Date();
  body.updated = date.toISOString();

  db.getSingle('videos', id, function(err, oldItem){
    if(err){
      return next(new restify.InternalError('Server error. Please try again later.'));
    } else if(oldItem===null){
      return next(new restify.ResourceNotFoundError("Video not found"));
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
    console.log(err);
    console.log(returnCode);
    res.send(204);
    return next();
  });
};