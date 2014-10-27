// https://github.com/rethinkdb/rethinkdb-example-nodejs-chat/blob/master/README.md

var r = require('rethinkdb'),
    crypto = require('crypto');

// #### Connection details

// RethinkDB database settings. Defaults can be overridden using environment variables.
var dbConfig = {
  host: process.env.RETHINK_HOST,
  port: parseInt(process.env.RETHINK_PORT),
  db  : process.env.NODE_ENV+'_api',
  tables: {
    'videos': 'uid',
    'channels': 'name',
    'studios': 'uid'
  }
};

// Used to generate the ID for videos
function randomValueHex (len) {
    return crypto.randomBytes(Math.ceil(len/2))
        .toString('hex') // convert to hexadecimal format
        .slice(0,len);   // return required number of characters
}

/**
 * Connect to RethinkDB instance and perform a basic database setup:
 *
 * - create the `RDB_DB` database (defaults to `dev`)
 * - create tables `videos`, `channels`, `studios` in this database
 */
module.exports.setup = function() {
  r.connect({host: dbConfig.host, port: dbConfig.port, authKey: dbConfig.authKey }, function (err, connection) {
    r.dbCreate(dbConfig.db).run(connection, function(err, result) {
      if(err) {
        console.log("[DEBUG] RethinkDB database '%s' already exists (%s:%s)\n%s", dbConfig.db, err.name, err.msg, err.message);
      }
      else {
        console.log("[INFO] RethinkDB database '%s' created", dbConfig.db);
      }

      for(var tbl in dbConfig.tables) {
        (function (tableName) {
          r.db(dbConfig.db).tableCreate(tableName, {primaryKey: dbConfig.tables[tbl]}).run(connection, function(err, result) {
            if(err) {
              console.log("[DEBUG] RethinkDB table '%s' already exists (%s:%s)\n%s", tableName, err.name, err.msg, err.message);
            }
            else {
              console.log("[INFO] RethinkDB table '%s' created", tableName);
            }
          });
        })(tbl);
      }
    });
  });
};

/**
 * Every user document is assigned a unique id when created. Retrieving
 * a document by its id can be done using the
 * [`get`](http://www.rethinkdb.com/api/javascript/get/) function.
 *
 * RethinkDB will use the primary key index to fetch the result.
 *
 * @param {String} userId 
 *    The ID of the user to be retrieved.
 *
 * @param {Function} callback
 *    callback invoked after collecting all the results 
 * 
 * @returns {Object} the user if found, `null` otherwise
 */
module.exports.getAll = function (options, callback) {
  if(!options.limit){options.limit=20;}
  if(!options.offset){options.offset=0}
  onConnect(function (err, connection) {
    console.log("[INFO][%s][getAll %s]", connection['_id'], options.model);
    
    if(!options.order){
      r.db(dbConfig['db']).table(options.model).skip(options.offset).limit(options.limit).pluck(options.fields).run(connection, function(err, cursor) {
        if(err) {
          console.log("[ERROR][%s][get %s] %s:%s\n%s", connection['_id'], options.model, err.name, err.msg, err.message);
          callback(null, null);
        }
        else {
          cursor.toArray(function(err, results) {
              callback(null, results);
          });
        }
        connection.close();
      });
    } else {
      if(!options.orderAsc){
        options.orderOptions = {index: r.desc(options.order)};
      } else {
        options.orderOptions = {index: options.order};
      }
      r.db(dbConfig['db']).table(options.model).orderBy(options.orderOptions).skip(options.offset).limit(options.limit).pluck(options.fields).run(connection, function(err, cursor) {
        if(err) {
          console.log("[ERROR][%s][get %s] %s:%s\n%s", connection['_id'], options.model, err.name, err.msg, err.message);
          callback(null, null);
        }
        else {
          cursor.toArray(function(err, results) {
              callback(null, results);
          });
        }
        connection.close();
      });
    }
  });
};

module.exports.getSome = function (options, callback) {
  if(!options.limit){options.limit=10;}
  onConnect(function (err, connection) {
    console.log("[INFO][%s][get %s from %s %s]", connection['_id'], options.model, options.id, options.comparison);
    
    if(!options.order){
      r.db(dbConfig['db']).table(options.model).filter(options.filter).pluck(options.fields).limit(options.limit).run(connection, function(err, cursor) {
        if(err) {
          console.log("[ERROR][%s][get %s] %s:%s\n%s", connection['_id'], options.model, err.name, err.msg, err.message);
          callback(null, null);
        }
        else {
          cursor.toArray(function(err, results) {
              callback(null, results);
          });
        }
        connection.close();
      });
    } else {
      r.db(dbConfig['db']).table(options.model).orderBy({index: r.desc(options.order)}).filter(options.filter).pluck(options.fields).limit(options.limit).run(connection, function(err, cursor) {
        if(err) {
          console.log("[ERROR][%s][get %s] %s:%s\n%s", connection['_id'], options.model, err.name, err.msg, err.message);
          callback(null, null);
        }
        else {
          cursor.toArray(function(err, results) {
              callback(null, results);
          });
        }
        connection.close();
      });
    }
  });
};

module.exports.getRelated = function (options, related, callback) {
  if(!options.limit){options.limit=10;}
  onConnect(function (err, connection) {
    console.log("[INFO][%s][get related %s from %s %s]", connection['_id'], options.model, options.id);
    
    if(related=="studio"){
      r.db(dbConfig['db']).table(options.model).getAll(options.studio, {index: options.indexKey}).filter(r.not(r.row('uid').eq(options.id))).pluck(options.fields).limit(options.limit).run(connection, function(err, cursor) {
        if(err) {
          console.log("[ERROR][%s][get related %s] %s:%s\n%s", connection['_id'], options.model, err.name, err.msg, err.message);
          callback(null, null);
        }
        else {
          cursor.toArray(function(err, results) {
              callback(null, results);
          });
        }
        connection.close();
      });
    } else if(related=="channels"){
      r.db(dbConfig['db']).table(options.model).filter(r.row('channels').contains(options.channels).and(r.not(r.row('uid').eq(options.id)))).pluck(options.fields).limit(options.limit).run(connection, function(err, cursor) {
          if(err) {
            console.log("[ERROR][%s][get related %s] %s:%s\n%s", connection['_id'], options.model, err.name, err.msg, err.message);
            callback(null, null);
          }
          else {
            cursor.toArray(function(err, results) {
                callback(null, results);
            });
          }
          connection.close();
        });
    }
  });
};

module.exports.getChannelVideos = function (options, callback) {
  if(!options.limit){options.limit=10;}
  onConnect(function (err, connection) {
    console.log("[INFO][%s][get videos from %s %s]", connection['_id'], options.id, options.comparison);
      if(!options.approved){
        r.db(dbConfig['db']).table('videos').orderBy({index: r.desc(options.order)}).filter(r.row('channels').contains(options.id).and(r.row('status').eq('1'))).pluck(options.fields).limit(options.limit).run(connection, function(err, cursor) {
          if(err) {
            console.log("[ERROR][%s][get %s] %s:%s\n%s", connection['_id'], options.model, err.name, err.msg, err.message);
            callback(null, null);
          }
          else {
            cursor.toArray(function(err, results) {
                callback(null, results);
            });
          }
          connection.close();
        });
      } else {
        r.db(dbConfig['db']).table('videos').orderBy({index: r.desc(options.order)}).filter(r.row('channels').contains(options.id)).pluck(options.fields).limit(options.limit).run(connection, function(err, cursor) {
          if(err) {
            console.log("[ERROR][%s][get %s] %s:%s\n%s", connection['_id'], options.model, err.name, err.msg, err.message);
            callback(null, null);
          }
          else {
            cursor.toArray(function(err, results) {
                callback(null, results);
            });
          }
          connection.close();
        });
      }
  });
};

var getSingle = module.exports.getSingle = function (model, id, callback) {
  onConnect(function (err, connection) {
    console.log("[INFO][%s][get %s][%s]", connection['_id'], model, id);
    
    r.db(dbConfig.db).table(model).get(id).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][get %s] %s:%s\n%s", connection['_id'], model, err.name, err.msg, err.message);
        callback(err);
      } else {
        callback(null, result);
      }
      connection.close();
    });
  });
};

module.exports.getPlucked = function (model, id, fields, callback) {
  onConnect(function (err, connection) {
    console.log("[INFO][%s][get %s][%s]", connection['_id'], model, id);
    
    r.db(dbConfig.db).table(model).get(id).pluck(fields).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][get %s] %s:%s\n%s", connection['_id'], model, err.name, err.msg, err.message);
        callback(err);
      } else {
        callback(null, result);
      }
      connection.close();
    });
  });
};

module.exports.getStudio = function (uid, callback) {
  onConnect(function (err, connection) {
    console.log("[INFO][%s][get studio][%s]", connection['_id'], uid);
    
    r.db(dbConfig['db']).table('studios').get(uid).merge({'videos': r.db(dbConfig['db']).table('videos').filter({'studio': {'uid': uid}}).pluck('uid','title','description').coerceTo('array')}).run(connection, function(err, result){
      if(err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
      connection.close();
    });
  });
};

module.exports.create = function (model, body, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table(model).insert(body).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][create %s] %s:%s\n%s", connection['_id'], model, err.name, err.msg, err.message);
        callback(err);
      } else {
        // if successfully inserted, carry on
        if(result.inserted === 1) {
          // return result of inserted object to cut down on API calls
          getSingle(model, body.uid, function(err, response){
            response._links = { "self": '/'+model+'/'+body.uid };
            callback(null, response);
          });
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};

module.exports.update = function (model, id, newModel, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table(model).get(id).replace(newModel).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][update %s] %s:%s\n%s", connection['_id'], model, err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if(result.replaced === 1) {
          console.log("[INFO][%s][update %s] {id: %s}", connection['_id'], model, id);
          callback(null, {status: 'ok'});
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};

module.exports.delete = function (model, id, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table(model).get(id).delete().run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][delete %s] %s:%s\n%s", connection['_id'], model, err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if(result.inserted === 1) {
          callback(null, true);
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};

// #### Helper functions

/**
 * A wrapper function for the RethinkDB API `r.connect`
 * to keep the configuration details in a single function
 * and fail fast in case of a connection error.
 */ 
function onConnect(callback) {
  r.connect({host: dbConfig.host, port: dbConfig.port}, function(err, connection) {
    connection['_id'] = Math.floor(Math.random()*10001);
    callback(err, connection);
  });
}

// #### Connection management
//
// This application uses a new connection for each query needed to serve
// a user request. In case generating the response would require multiple
// queries, the same connection should be used for all queries.
//
// Example:
//
//     onConnect(function (err, connection)) {
//         if(err) { return callback(err); }
//
//         query1.run(connection, callback);
//         query2.run(connection, callback);
//     }
//