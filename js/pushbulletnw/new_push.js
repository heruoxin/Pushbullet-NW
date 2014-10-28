var https = require('https');
var bl = require('bl');
var save_history = require('./save_history');


//pushbullet send new push

module.exports = function (data, iden, cb) {

  var token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.info.json').token;

  if (!data) { return console.error("No data given!");}

  if (typeof(iden) === "function"){
    cb = iden;
  } else if ( iden !== "everypush"){
    if (iden.indexOf('DoTDoTDoT') >= 0){
      data.email = iden.replace("DoTDoTDoT", ".").replace("AtAtAt", "@");
    } else {
      data.device_iden = iden;
    }
  }

  var post_data = JSON.stringify(data);

  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/pushes',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(post_data)
    }
  };

  if (data.iden) {
    options.path = '/v2/pushes/'+data.iden;
  }

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(e, d){
      if (e) {return console.error("Error:", e);}
      d = JSON.parse(d);
      var created = d.created;
      save_history({created: d});
      if (cb){cb(d);}
    }));
  });
  req.write(post_data);
  req.end();


};

//______

//module.exports({
//  'type': 'note',
//  'title': '233',
//  'body': '23测试23233'
//},'udfZpddgpV', console.log);
