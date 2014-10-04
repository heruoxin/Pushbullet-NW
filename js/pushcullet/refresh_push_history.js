var https = require('https');
var save_history = require('./save_history');
var send_notification = require('./send_notification');

var token = process.argv.slice(2)[0];
if (!token) {
  token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json').token;

}

var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.history.json';

//pushbullet getting & saving push history

module.exports = function (time, cb) {

  //time = 604800 为最近一周

  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64')
    }
  };

  if (time) {
    options.path = '/v2/pushes?modified_after=' + (Date.parse(new Date())/1000 - time);
  } else {
    options.path = '/v2/pushes';
  }

  var req = https.request(options, function(res) {
    var push_history ='';
    res.setEncoding('utf8');
    res.on('data', function(d) {
      if (global.hasOwnProperty("ADD_PUSH_NUMBERS")){
        global.ADD_PUSH_NUMBERS();
      }
      push_history += d;
    });
    res.on('end', function(e){
      if (e) {return console.error(e);}
      var p = JSON.parse(push_history).pushes;
      //console.log(JSON.parse(push_history));
      if (p) {
        send_notification(p[0]);
      }
      if (time){
        if (cb){
          return save_history(p, undefined, cb);
        }
        return save_history(p);
      }
      if (cb) {
        return save_history(p, "refresh all", cb);
      }
      return save_history(p, "refresh all");
    });
  });
  req.end();


};
