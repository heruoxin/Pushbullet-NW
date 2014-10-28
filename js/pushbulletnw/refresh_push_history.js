var https = require('https');
var save_history = require('./save_history');
var send_notification = require('./send_notification');

//pushbullet getting & saving push history

module.exports = function (time, cb) {

  var info;
  var token = process.argv.slice(2)[0];
  try {
    info = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.info.json');
  } catch (e) {
    return console.error('No info config file!');
  }
  if (!token) {
    token = info.token;
  }

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

  var http_req = function(o, cursor, pre_answers_pushes) {
    if (cursor) {
      if (o.path.indexOf("?") > 0) o.path += ('&cursor='+cursor);
      else o.path += ('?cursor='+cursor);
    }
    console.warn(o.path);
    var req = https.request(o, function(res) {
      var push_history ='';
      res.setEncoding('utf8');
      res.on('error', function(e){
        console.error(e);
      });
      res.on('data', function(d) {
        if (global.hasOwnProperty("ADD_PUSH_NUMBERS")){
          global.ADD_PUSH_NUMBERS();
        }
        push_history += d;
      });
      res.on('end', function(e){
        if (e) {return console.error(e);}
        var answers, p;
        try{
          answers = JSON.parse(push_history);
        } catch(error) {
          return console.error(error);
        }
        p = answers.pushes;
        console.log(answers);
        for (var k in pre_answers_pushes) {
          if (p.hasOwnProperty(k)) continue;
          p[k] = pre_answers_pushes[k];
        }
        if (answers.hasOwnProperty("cursor")){
          console.warn(answers.cursor);
          return http_req(o, answers.cursor, p);
        }
        //console.log(JSON.parse(push_history));
        if (time){
          if (time == 15){
            //it's a dirty hack.
            //          if (!info.options.this_device_iden) {
            //            var fs = require('fs');
            //            var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.info.json';
            //            for (var i in info.devices) {
            //              if (info.devices[i].type === "stream") {
            //                info.options.this_device_iden = info.devices[i].iden;
            //                fs.writeFile(file_path, JSON.stringify(info, null, 4), {encoding: 'utf8'}, function(e){console.error(e);});
            //                break;
            //              }
            //            }
            //          }
            if (p[0].target_device_iden === info.options.this_device_iden || (!p[0].target_device_iden)) { // target device is mac OR pushto evevryone
              if (Number(p[0].modified) - Number(p[0].created) < 3) { //is new push, not modified.
                send_notification(p[0]);
              }
            }
          }
          if (typeof cb === "function"){
            return save_history(p, undefined, cb);
          }
          return save_history(p);
        }
        if (typeof cb === "function") {
          return save_history(p, "refresh all", cb);
        }
        return save_history(p, "refresh all");
      });
    });
    req.end();
  };

  http_req(options);
};
