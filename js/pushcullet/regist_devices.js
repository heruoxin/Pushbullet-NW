var https = require('https');
var fs = require('fs');
var os = require('os');
var bl = require('bl');

//regist a new device
module.exports = function (cb) {

  var fingerprint = {};
  require('getmac').getMac(function(err,macAddress){
    if (err)  throw err;
    fingerprint.mac_address = macAddress;
    fingerprint.cpu = os.cpus()[0].model;
    fingerprint = JSON.stringify(fingerprint).replace(/"/g, '\\"');
  });

  var info;
  try {
    info = JSON.parse( fs.readFileSync(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json', {encoding: 'utf8'}) );
  } catch (e) {
    if (typeof cb === 'function') cb();
    return console.error("read info error:", e);
  }

  var post_data = {
    "type": "stream",
    "kind": "mac",
    "nickname": os.hostname(),
    "manufacturer": "Apple",
    "model": "Mac OS X 10."+(os.release().split('.')[0]-4),
    //    "fingerprint": fingerprint,
  };

  for (var i in info.devices) {
    if (info.devices[i].model === post_data.model) { //has registed
      //这个要重写！！！
      if (typeof cb === 'function') cb();
      return console.warn('this devices has registed.');
    }
  }

  post_data = JSON.stringify(post_data);

  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/devices',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + new Buffer(info.token+':').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(post_data)
    }
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(e, d){
      d = JSON.parse(d);
      if (e) {return console.error(e);}
      console.log(d);
      global.refresh_info(info.token, {this_device_iden: d.iden});
      if (typeof cb === 'function') cb(d.iden);
    }));
  });
  req.write(post_data);
  req.end();

};
