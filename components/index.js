// Dynamically load each component subdirectory. Includes routes and controllers.

var fs = require('fs');
 
var requireFiles = function (directory, server) {
  fs.readdirSync(directory).forEach(function (fileName) {
    // Only require the next-level subdirectory
    if(fs.lstatSync(directory + '/' + fileName).isDirectory()) {
      require(directory + '/' + fileName)(server);
    } else {
      // If not a directory, please continue
      return;
    }
  });
  return exports;
};
 
module.exports = function (server) {
  return requireFiles(__dirname, server);
};