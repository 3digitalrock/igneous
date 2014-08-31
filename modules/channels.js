(function() {
  var r = require('rethinkdb'),
      connection;

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
    r.db('dev').tableCreate('channels').run(conn, function(err, res) {
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

  exports.getAll = function(req, res, next) {
    r.table('channels').run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            if (err) throw err;
            res.send(200, result);
        });
    });
    return next();
  };

  exports.getSingle = function(req, res, next) {
    var id = req.params.id;
    r.table('channels').get(id).
      run(connection, function(err, result) {
          if (err) throw err;
          result.status = 'ok';
          res.send(200, result);
      });
    return next();
  };

  exports.create = function(req, res, next) {
    var presentation = req.body;
    r.table('channels').insert(presentation).
      run(connection, function(err, result) {
        if (err) throw err;
        res.send(201, {status: 'ok', location: '/channels/'+result.generated_keys[0]});
      });
    return next();
  };

  exports.update = function(req, res, next) {
    var presentation = req.body,
        id = req.params.id;
    r.table('channels').get(id).update(presentation).
      run(connection, function(err, result) {
        if (err) throw err;
        res.send(200, {status: 'ok'});
      });
    return next();
  };

  exports.delete = function(req, res, next) {
    var id = req.params.id;
    r.table('channels').get(id).delete().
      run(connection, function(err, result) {
          if (err) throw err;
          res.send(204);
      });
    return next();
  };

})();