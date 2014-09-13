var https = require('https');
var bl = require('bl');
var save_history = require('./save_history');

var token = process.argv.slice(2)[0];
if (!token) {
  token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json').token;
}

var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.history.json';

//pushbullet delete push

module.exports = function (iden, cb) {
  if (!iden) {return console.error("No iden!");}

  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/pushes/'+iden,
    method: 'DELETE',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64'),
    }
  };

  var isEmptyObject = function(obj){
    for ( var name in obj ) {
      return false;
    }
    return true;
  };

  var req = https.request(options, function(res) {
    res.pipe(bl(function(e, d){
      d = JSON.parse(d);
      save_history({iden: {
        "active": false,
        "iden": iden,
        "modified": Number(new Date())/1000.0,
      }},'delete');
      if (e) {return console.error(e);}
      if (!isEmptyObject(d)) {return console.error(d);}
      if (cb){cb(d);}
    }));
  });
  req.end();


};

//______

//module.exports('udfZpsjAur3vVNHU');
