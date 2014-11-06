var fs = require('fs');

exports.refreshInfo = function(){
  var info = JSON.parse(
    fs.readFileSync(
      process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.info.json',
      {encoding: 'utf8'}
    )
  );
  global.INFO = info;
  return info;
};

exports.getInfo = function(){
  if (!global.INFO) return exports.refreshInfo();
  return global.INFO;
};
