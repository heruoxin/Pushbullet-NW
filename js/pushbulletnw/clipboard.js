var https = require('https');
var bl = require('bl');
var getInfo = require('./getInfo');
var gui = global.gui;

var clipboard = gui.Clipboard.get();

exports.set = function(text) {
  clipboard.set(text.toString(), 'text');
};

exports.get = function() {
  return clipboard.get('text');
};

exports.onChange = function(cb) {
  var text = "";
  return setInterval(function(){
    if (text !== clipboard.get('text')) {
      text = clipboard.get('text');
      cb(text);
    }
  }, 3000);

};

exports.uploadClipboard = function(text, cb) {
  var info = getInfo.getInfo();
  var postData = JSON.stringify({
    "type": "push",
    "push": {
      type: "clip",
      body: text,
      device_iden: info.options.this_device_iden,
      source_device_iden: info.options.this_device_iden,
      //source_user_iden: info.token.substr(token.length - 5)
    }
  });
  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/ephemerals',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + new Buffer(info.token+':').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(e, d){
      if (e) {return console.error("Error:", e);}
      d = JSON.parse(d);
      if (cb){cb(d);}
    }));
  });
  req.write(postData);
  req.end();
};

exports.startListen = function() {
  var listener = exports.onChange(exports.uploadClipboard);
  return listener;
};
