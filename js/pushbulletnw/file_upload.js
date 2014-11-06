var $ = global.$;
var mime = require('mime');
var bl = require('bl');
var fs = require('fs');
var formData = require('form-data');
var https = require('https');
var getInfo = require('./getInfo');

var upload_request = function(token ,file, cb){
  var post_data = JSON.stringify({
    file_name: file.name,
    file_type: file.type,
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
      upload(token, file, answer, cb);
    }));
  });
  req.write(post_data);
  req.end();

};

var upload = function(token, file, answer, cb){
  console.log("START UPLOAD");
  var form = new formData();
  for (var i in answer.data){
    form.append(i, answer.data[i]);
  }
  form.append('file', fs.createReadStream(file.path));
  form.submit(answer.upload_url, function(err, res) {
    if (err) return console.error("upload:", err);
    res.pipe(bl(function(e, d){
      if (e) return console.error("Error:", e);
      console.log(d);
    }));
    var file_info = {
      type: 'file',
      file_name: file.name,
      file_type: file.type,
      file_url: answer.file_url,
    };
    global.UPLOAD_FILE = undefined;
    if (typeof cb === 'function') cb(file_info);
  });
};

module.exports = function(file, cb){
  fs.exists(file.path, function (exists) {
    if (exists) {
      var token = getInfo.getInfo().token;
      return upload_request(token, file, cb);
    }
    return console.error("file dont exist: ", file.path);
  });
};
