var fs = require('fs');
var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.history.json';

var old_j = {};
try {
 old_j = require(file_path);
} catch(e) {
  console.warn("No history file founded.");
}

//save push history

module.exports = function (j) {

  var modified;
  for (var i in j){
    modified = (9999999999 - Number(j[i].modified.toString().split('.')[0])).toString();
    old_j[modified] = j[i];
  }

  fs.writeFile(file_path, JSON.stringify(old_j, null, 4), function(e){
    if (e) {console.error(e);}
  });

};
