var fs = require('fs');
var https = require('https');

var token = process.argv.slice(2)[0];
if (!token) {
  token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json').token;

}

//pushbullet getting & saving push history

var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.history.json';

var modified_after = (Date.parse(new Date())/1000 - 604800); //请求一星期之内的记录

var options = {
  hostname: 'api.pushbullet.com',
  port: 443,
  path: '/v2/pushes?modified_after='+modified_after,
  method: 'GET',
  headers: {
    'Authorization': 'Basic ' + new Buffer(token+':').toString('base64')
  }
};

var req = https.request(options, function(res) {
  var push_history ='';
  res.setEncoding('utf8');
  res.on('data', function(d) {
    push_history += d;
  });
  res.on('end', function(e){
    if (e) {return console.error(e);}
    //console.log(JSON.parse(push_history));
    save_list(JSON.parse(push_history));
  });
});
req.end();

function save_list(i){
  fs.writeFile(file_path, JSON.stringify(i, null, 4), function(e){
    if (e) {console.error(e);}
  });
}
