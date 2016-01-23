var bcrypt = require('bcrypt');
var _ = require('lodash');
var date = new Date();

var dbConfig = {
  host: process.env.RETHINK_HOST,
  port: parseInt(process.env.RETHINK_PORT),
  db  : process.env.NODE_ENV+'_api'
};
var thinky = require('thinky')(dbConfig);
var type = thinky.type;

var User = thinky.createModel("users", {
    created: type.string().default(date.toISOString()),
    displayName: type.string().default(function() {
        return this.username;
    }),
    email: type.string().email(),
    firstName: String,
    fullName: {
        _type: "virtual",
        default: function() {
            return this.firstName+" "+this.lastName;
        }
    },
    lastName: String,
    password: type.string().options({enforce_missing: true}),
    updated: type.string().default(date.toISOString()),
    username: type.string().min(3).options({enforce_missing: true})
},{
    pk: "username",
    enforce_extra: "remove"
});

User.pre('save', function(next) {
    var password = password;
    if(password) password = bcrypt.hashSync(password, 10);
    next();
});

User.defineStatic('getView', function() {
    return this.without('password');
});

User.define('getPassword', function() {
    return this.password;
});

module.exports = User;