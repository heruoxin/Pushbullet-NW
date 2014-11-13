var getInfo = require('./getInfo');
var https = require('https');
var bl = require('bl');

module.exports = function(data, cb) {
  var token = getInfo.getInfo().token;
  var postData = {
    type: "push",
    push: data
  };
  post = JSON.stringify(postData);

  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/ephemerals',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(post)
    }
  };

  var req = https.request(options, function(res) {
    res.setEncoding('utf8');
    res.pipe(bl(function(e, d){
      if (e) {
        if (cb) cb(d);
        return console.error("Error:", e);
      }
      d = JSON.parse(d);
      if (cb) cb(d);
    }));
  });
  req.write(post);
  req.end();

};
