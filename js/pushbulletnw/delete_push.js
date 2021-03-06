var https = require('https');
var bl = require('bl');
var save_history = require('./save_history');
var getInfo = require('./getInfo');

var token = getInfo.getInfo().token;
//pushbullet delete push

module.exports = function (iden, created, cb) {
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
      save_history({created: {
        "active": false,
        "iden": iden,
        "created": created,
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
