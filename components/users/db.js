var dbConfig = {
  host: process.env.RETHINK_HOST,
  port: parseInt(process.env.RETHINK_PORT),
  db  : process.env.NODE_ENV+'_api'
};
var r = require('rethinkdbdash')(dbConfig);
var date = new Date();

module.exports.getAll = function(callback){
    r.table("users").orderBy({index: r.desc('created')}).without('password').run().then(function(result) {
        callback(null, result);
    }).error(function(err) {
        callback(err, null);
    });
};

module.exports.getSingle = function(id, callback){
    r.table("users").get(id).without('password').run().then(function(result) {
        callback(null, 200, result);
        return;
    }).error(function(err) {
        if(err.message.indexOf("null") >-1){
            callback({code: '404', message: 'User does not exist'}, 404, null);
        } else {
            callback(err, 500, null);
        }
    });
};

module.exports.getPassword = function(id, callback){
    r.table("users").get(id).pluck('password').run().then(function(result) {
        callback(null, result.password);
    }).error(function(err) {
        callback(err, null);
    });
};

module.exports.create = function(user, callback){
    user.created = date.toISOString();
    
    r.table("users").insert(user, {returnChanges: true}).run().then(function(result){
        result = result.changes[0].new_val;
        delete result.password;
        callback(null, result);
    }).error(function(err) {
        callback(err, null);
    });
};