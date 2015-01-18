var fs = require('fs');
var $ = require('jquery');

var infoPath = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.info.json';

exports.refreshInfo = function(){
  if (!fs.existsSync(infoPath)) return {};
  var info = JSON.parse(fs.readFileSync(infoPath, {encoding: 'utf8'}));
  global.INFO = info;
  return info;
};

exports.getInfo = function(){
  if (!global.INFO) return exports.refreshInfo();
  return global.INFO;
};

exports.saveInfo = function(newInfo, cb) {
  var oldInfo = exports.getInfo();
  $.extend(true, oldInfo, newInfo);
  fs.writeFile(
    infoPath,
    JSON.stringify(oldInfo, null, 4),
    {encoding: 'utf8'},
    function(e){
      if (e) return console.error("saveInfo", e);
      if (cb) cb(true, "Success");
      setTimeout(exports.refreshInfo, 5);
    });
};
