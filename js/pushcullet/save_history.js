var fs = require('fs');
var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.history.json';

var write = function(d, cb){
  fs.writeFile(file_path, JSON.stringify(d, null, 4), function(e){
    if (e) {console.error(e);}
    if (cb) {cb();}
  });
};

//save push history

module.exports = function (j, option, cb) {

  var old_j = {};
  if (option !== 'refresh all'){ //refresh all
    try {
      old_j = require(file_path);
    } catch(e) {
      console.warn("No history file founded.");
    }
  }

  for (var i in j){
    var created = (9999999999 - Number(j[i].created.toString().split('.')[0])).toString();
    old_j[created] = j[i];
  }
  return write(old_j, cb);
};
