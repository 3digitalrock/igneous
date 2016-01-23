var user = require('./model');

module.exports = function (server) {
    server.post('/users', function(req, res){
        var test = new user({ username: req.body.username, password: req.body.password });
        
        test.save().then(function(doc){
            res.send(200, doc);
        }).error(function(error){
            res.send(500, {message: error.toString()});
        });
    });
    
    server.get('/users', function(req, res){
        user.getView().execute(function(error, users){
          if(error)
          {
            res.send(500, {message: error.toString()});
          } else {
            res.send(200, users);
          }
        });
    });
};