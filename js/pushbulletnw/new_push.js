var https = require('https');
var bl = require('bl');
var save_history = require('./save_history');
var fs = require('fs');
var file_upload = require('./file_upload');
var getInfo = require('./getInfo');
var conversation = require('./conversation');


module.exports = function (data, iden, cb) {
  //pushbullet send new push
  var token = getInfo.getInfo().token;
  if (data.type === "file") {
    file_upload(data.file, function(d){
      d.title = data.title;
      d.body = data.body;
      post(d, iden, cb);
    });
  } else if (data.type === "sms") {
    var postData = {
      "type": "push",
      "push": {
        "type": "messaging_extension_reply",
        "package_name": "com.pushbullet.android",
        "source_user_iden": token.substr(token.length - 5),
        "target_device_iden": data.source_device_iden,
        "conversation_iden": data.title,
        "message": data.message
      }
    };
    conversation.sendSMS(postData, cb);
  } else {
    post(token ,data, iden, cb);
  }
};
var post = function (token, data, iden, cb) {

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
