var gui = global.gui;
var console = global.console;
var https = require('https');
var bl = require('bl');
var fs = require('fs');

exports.newWindow = function(e){
  global.CONVERSATION_DATA = e;
  return gui.Window.open('html/conversation.html', {
    position: "mouse",
    min_width: 210,
    min_height: 250,
    max_width: 450,
    max_height: 500,
    width: 255,
    height: 300,
    transparent: true,
    toolbar: false,
    frame: false
  });
};

exports.pageBind = function(document, win){

  //show message and title
  var conversationData = {};
  for (var i in global.CONVERSATION_DATA) {
    conversationData[i] = global.CONVERSATION_DATA[i];
  }
  document.getElementById('conversation-title').innerHTML = conversationData.title;
  document.getElementById('conversation-body').innerHTML = global.message_history[conversationData.title];

  var preSendReply = function(){
    document.getElementById('send-button').innerHTML = '<img src="../img/loading.gif" />';
    var message = document.getElementById('send-input').value;
    var postData = {
      "type": "push",
      "push": {
        "type": "messaging_extension_reply",
        "package_name": conversationData.package_name,
        "source_user_iden": conversationData.source_user_iden,
        "target_device_iden": conversationData.source_device_iden,
        "conversation_iden": conversationData.conversation_iden,
        "message": message
      }
    };
    sendReply(postData, function(d){
      document.getElementById('send-button').innerHTML = 'Send';
      document.getElementById('conversation-body').innerHTML = global.message_history[conversationData.title];
      console.log(d);
    });
  };
  document.getElementById('send-button').onclick = preSendReply;
  document.getElementById('send-input').onsubmit = preSendReply;


  //button behave
  document.getElementsByClassName('close')[0].onclick = function(){
    win.close();
  };
  document.getElementsByClassName('minimize')[0].onclick = function(){
    win.minimize();
  };
  //window active or not
  win.on('focus', function() {
    var trafficeLights = document.getElementById('traffice-light').getElementsByTagName('a');
    trafficeLights[0].className = trafficeLights[0].className.replace("deactivate", "");
    trafficeLights[1].className = trafficeLights[1].className.replace("deactivate", "");
  });
  win.on('blur', function() {
    //$('.traffice-light a').addClass('deactivate');
    var trafficeLights = document.getElementById('traffice-light').getElementsByTagName('a');
    trafficeLights[0].className += " deactivate";
    trafficeLights[1].className += " deactivate";
  });
};

var sendReply = function(postData, cb) {
  postData = JSON.stringify(postData);
  var token = JSON.parse(fs.readFileSync(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.info.json', {encoding: 'utf8'})).token;

  var options = {
    hostname: 'api.pushbullet.com',
    port: 443,
    path: '/v2/ephemerals',
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + new Buffer(token+':').toString('base64'),
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
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
      global.message_history[postData.conversation_iden] += '<p class="send-message">'+postData.message+'</p>';
      return console.log("Message Reply:", d);
    }));
  });
  req.write(postData);
  req.end();
};
