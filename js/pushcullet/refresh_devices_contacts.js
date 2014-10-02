module.exports = function(token, next){
  var fs = require('fs');
  var https = require('https');

  if (!token) {
    token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json').token;
  }


  var info = {
    token: token,
  };

  //pushbullet getting devices list
  var devices_options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/devices',
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64')
    }
  };
  var req = https.request(devices_options, function(res) {
    var d = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      d += chunk;
    });
    res.on('end', function(e) {
      if (e) {return console.error(e);}
      if (JSON.parse(d).hasOwnProperty('error')){
        if (next){
          return next(false, "Login Error. Check your token or network");
        }
      }
      info.devices = JSON.parse(d).devices;
      save();
    });
  });
  req.end();

  //pushbullet getting contacts list
  var contacts_options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/contacts',
    method: 'GET',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64')
    }
  };
  var req_2 = https.request(contacts_options, function(res) {
    var d = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      d += chunk;
    });
    res.on('end', function(e) {
      if (e) {return console.error(e);}
      info.contacts = JSON.parse(d).contacts;
      save();
    });
  });
  req_2.end();

  var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json';
  var save = function(){
    if (info.hasOwnProperty("devices") && info.hasOwnProperty("contacts")){
      fs.writeFile(file_path, JSON.stringify(info, null, 4), function(e){
        if (e) {return console.error(e);}
        if (next){
          return next(true, "Success");
        }
      });
    }
  };
};
