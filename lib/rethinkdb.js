// https://github.com/rethinkdb/rethinkdb-example-nodejs-chat/blob/master/README.md

var r = require('rethinkdb');

// #### Connection details

// RethinkDB database settings. Defaults can be overridden using environment variables.
var dbConfig = {
  host: process.env.RDB_HOST || 'localhost',
  port: parseInt(process.env.RDB_PORT) || 28015,
  db  : process.env.RDB_DB || 'dev',
  authKey: 'phedVtCuP9YhZI6Czuf6',
  tables: {
    'videos': 'id',
    'channels': 'id',
    'studios': 'id'
  }
};

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
module.exports.getAll = function (model, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table(model).run(connection, function(err, cursor) {
      if(err) {
        console.log("[ERROR][%s][get %s] %s:%s\n%s", connection['_id'], model, err.name, err.msg, err.message);
        callback(null, null);
      }
      else {
        cursor.toArray(function(err, results) {
            callback(null, results);
        });
      }
      connection.close();
    });    
  });
};

module.exports.getSingle = function (model, id, callback) {
  onConnect(function (err, connection) {
    console.log("[INFO][%s][get %s] {id: %s}", connection['_id'], model, id);
    
    r.db(dbConfig.db).table(model).get(id).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][getVideo][collect] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      } else {
        callback(null, result);
      }
      connection.close();
    });
  });
};

module.exports.create = function (model, id, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table(model).insert(id).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][create %s] %s:%s\n%s", connection['_id'], model, err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if(result.inserted === 1) {
          callback(null, {location: '/videos/'+result.generated_keys[0]});
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};

module.exports.update = function (model, id, changes, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table(model).get(id).update(changes).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][update %s] %s:%s\n%s", connection['_id'], model, err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if(result.replaced === 1) {
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


/*** CHANNELS ***/

module.exports.getChannels = function (callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('channels').run(connection, function(err, cursor) {
      if(err) {
        console.log("[ERROR][%s][getChannels] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(null, null);
      }
      else {
        cursor.toArray(function(err, results) {
            callback(null, results);
        });
      }
      connection.close();
    });    
  });
};

module.exports.getChannel = function (channel, callback) {
  onConnect(function (err, connection) {
    console.log("[INFO][%s][getChannel] Video {id: %s}", connection['_id'], channel);
    
    r.db(dbConfig.db).table('channels').get(channel).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][getChannel][collect] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      } else {
        callback(null, result);
      }
      connection.close();
    });
  });
};

module.exports.createChannel = function (channel, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('channels').insert(channel).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][createChannel] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if(result.inserted === 1) {
          callback(null, {location: '/channel/'+result.generated_keys[0]});
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};

module.exports.updateChannel = function (channel, changes, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('videos').get(channel).update(changes).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][updateChannel] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if(result.replaced === 1) {
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

module.exports.deleteChannel = function (channel, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('channels').get(channel).delete().run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][deleteChannel] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
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


/*** STUDIOS ***/

module.exports.getStudios = function (callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('studios').run(connection, function(err, cursor) {
      if(err) {
        console.log("[ERROR][%s][getStudios] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(null, null);
      }
      else {
        cursor.toArray(function(err, results) {
            callback(null, results);
        });
      }
      connection.close();
    });    
  });
};

module.exports.getStudio = function (studio, callback) {
  onConnect(function (err, connection) {
    console.log("[INFO][%s][getStudio] Studio {id: %s}", connection['_id'], studio);
    
    r.db(dbConfig.db).table('studios').get(studio).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][getStudio][collect] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      } else {
        callback(null, result);
      }
      connection.close();
    });
  });
};

module.exports.createStudio = function (studio, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('studios').insert(studio).run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][createVideo] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
        callback(err);
      }
      else {
        if(result.inserted === 1) {
          callback(null, {location: '/studios/'+result.generated_keys[0]});
        }
        else {
          callback(null, false);
        }
      }
      connection.close();
    });
  });
};

module.exports.deleteStudio = function (studio, callback) {
  onConnect(function (err, connection) {
    r.db(dbConfig['db']).table('studios').get(studio).delete().run(connection, function(err, result) {
      if(err) {
        console.log("[ERROR][%s][deleteStudio] %s:%s\n%s", connection['_id'], err.name, err.msg, err.message);
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
  r.connect({host: dbConfig.host, port: dbConfig.port, authKey: dbConfig.authKey }, function(err, connection) {
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