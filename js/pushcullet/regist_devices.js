var https = require('https');
var fs = require('fs');
var os = require('os');
var bl = require('bl');
var refresh_devices_contacts = require('./refresh_devices_contacts');

//regist a new device
module.exports = function () {

  var fingerprint = {};
  require('getmac').getMac(function(err,macAddress){
    if (err)  throw err;
    fingerprint.mac_address = macAddress;
    fingerprint.cpu = os.cpus()[0].model;
    fingerprint = JSON.stringify(fingerprint).replace(/"/g, '\\"');
    console.log(fingerprint);
  });

  info = JSON.parse( fs.readFileSync(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json', {encoding: 'utf8'}) );

  for (var i in info.devices){
    if (info.devices[i].fingerprint == fingerprint){ //has registed
      return console.warn('this devices has registed.');
    }
  }

  var post_data = JSON.stringify({
    "type": "stream",
    "kind": "mac",
    "nickname": os.hostname(),
    "manufacturer": "Apple",
    "model": "Mac OS X 10."+(os.release().split('.')[0]-4),
    //    "fingerprint": fingerprint,
  });

  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/devices',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + new Buffer(info.token+':').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': post_data.length
    }
  };


  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(e, d){
      d = JSON.parse(d);
      if (e) {return console.error(e);}
      console.log(d);
      refresh_devices_contacts();
    }));
  });
  req.write(post_data);
  req.end();

};

module.exports();
