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

  if (option === 'delete'){ //delete option
    console.log("start delete");
    for (var k in j){
      if (j[k].active === false){
        for (var q in old_j){
          if (old_j[q].iden === j[k].iden){
            old_j[q].active = false;
            return write(old_j, cb);
          }
        }
      }
    }
  }


  var modified;
  for (var i in j){
    modified = (9999999999 - Number(j[i].modified.toString().split('.')[0])).toString();
    old_j[modified] = j[i];
  }
  return write(old_j, cb);
};
