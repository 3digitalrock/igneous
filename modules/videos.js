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

  exports.findAll = function(req, res) {
    r.table('videos').run(connection, function(err, cursor) {
        if (err) throw err;
        cursor.toArray(function(err, result) {
            if (err) throw err;
            res.send(JSON.stringify(result, null, 2));
        });
    });
  };

  exports.findById = function(req, res) {
    var id = req.params.id;
    r.table('videos').get(id).
      run(connection, function(err, result) {
          if (err) throw err;
          res.send(JSON.stringify(result, null, 2));
      });
  };

  exports.create = function(req, res) {
    var presentation = req.body;
    console.log("videos ", JSON.stringify(req.body));
    r.table('videos').insert(presentation).
      run(connection, function(err, result) {
        if (err) throw err;
        res.send(JSON.stringify({status: 'ok', location: '/videos/'+result.generated_keys[0]}));
      });
  };

  exports.update = function(req, res) {
    var presentation = req.body,
        id = req.params.id;
    r.table('videos').get(id).update(presentation).
      run(connection, function(err, result) {
        if (err) throw err;
        res.send(JSON.stringify({status: 'ok'}));
      });    
  };

  exports.delete = function(req, res) {
    var id = req.params.id;
    r.table('videos').get(id).delete().
      run(connection, function(err, result) {
          if (err) throw err;
          res.send(JSON.stringify({status: 'ok'}));
      });
  };
})();