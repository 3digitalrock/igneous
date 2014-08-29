(function() {
  var r = require('rethinkdb'),
      connection;

  // Need to find a way of addressing a cluster once we scale.
  r.connect( {host: '127.0.0.1', db: 'dev', port: 28015, authKey: 'phedVtCuP9YhZI6Czuf6'}, function(err, conn) {
    if (err) throw err;
    connection = conn;
    r.dbCreate('dev').run(conn, function(err,res){
      if(err){
        if(err.name === "RqlRuntimeError"){
          console.log("db already exists. Skipping creation.");
        } else {
          console.log(err);
          throw err;
        }
      }
      else {
        console.log(res);
      }
    });
    r.db('dev').tableCreate('videos').run(conn, function(err, res) {
      if(err){
        if(err.name === "RqlRuntimeError") {
          console.log("Table already exists. Skipping creation.");
        } else {
          console.log(err);
          throw err;
        }
      } else {
        console.log(res);
      }
    });
  });
  
  var Videos = module.exports = function (options) {
    var self = this;
    options = (options !== null && options !== undefined && options.constructor === Object) ? options : {};
    Object.keys(options).forEach(function (key) {
      if (!self.__proto__.hasOwnProperty(key)) {
        self[key] = options[key];
      }
    });
  };

  Videos.prototype.index = {
    get: function (request, response) {
      r.table('videos').run(connection, function(err, cursor) {
          if (err) throw err;
          cursor.toArray(function(err, result) {
              if (err) throw err;
              response.serveJSON(result);
          });
      });
    }
  };

  Videos.prototype.video = {
    get: function(request, response) {
      var id = request.querystring.id;
      r.table('videos').get(id).
        run(connection, function(err, result) {
            if (err) throw err;
            response.serveJSON(result);
        });
    },
    create: function(request, response) {
      var presentation = request.body;
      r.table('videos').insert(presentation).
        run(connection, function(err, result) {
          if (err) throw err;
          response.serveJSON({success: true, location: '/videos/'+result.generated_keys[0]});
        });
    },
    update: function(request, response) {
      var presentation = request.body,
          id = request.querystring.id;
      r.table('videos').get(id).update(presentation).
        run(connection, function(err, result) {
          if (err) throw err;
          response.serveJSON({success: true});
        });
    },
    delete: function(request, response) {
      var id = request.querystring.id;
      r.table('videos').get(id).delete().
        run(connection, function(err, result) {
            if (err) throw err;
            response.serveJSON({success: true});
        });
    }
  };
})();