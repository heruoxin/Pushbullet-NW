if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;
var mime = require('mime');
var bl = require('bl');
var fs = require('fs');
var formData = require('form-data');
var https = require('https');

var upload_request = function(token ,file_path, cb){
  var post_data = JSON.stringify({
    file_name: file_path.split('/').pop(),
    file_type: mime.lookup(file_path),
  });
  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/upload-request',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(post_data)
    }
  };
  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(e, d){
      if (e) return console.error("upload_request", e);
      var answer = JSON.parse(d);
      console.log(answer);
      upload(token, file_path, answer, cb);
    }));
  });
  req.write(post_data);
  req.end();

};

var upload = function(token, file_path, answer, cb){
  var form = new formData();
  for (var i in answer.data){
    form.append(i, answer.data[i]);
  }
  form.append('file', fs.createReadStream(file_path));
  form.submit(answer.upload_url, function(err, res) {
    if (err) return console.error("upload:", err);
    res.pipe(bl(function(e, d){
      if (e) return console.error("Error:", e);
      //console.log(d);
    }));
    var file_info = {
      file_name: file_path.split('/').pop(),
      file_type: mime.lookup(file_path),
      file_url: answer.file_url,
    };
    if (typeof cb === 'function') cb(file_info);
  });
};

module.exports = function(file_path, cb){
  fs.exists(file_path, function (exists) {
    if (exists) {
      var token = JSON.parse(fs.readFileSync(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.info.json', {encoding: 'utf8'})).token;
      return upload_request(token, file_path, cb);
    }
    return console.error("file dont exist: ", file_path);
  });
};
