var WebSocket = require('ws');
var send_notification = require('./send_notification');
var getInfo = require('./getInfo');
var clipboard = require('./clipboard');
var $ = global.$;

var trans_green = "#cff6c2";
var trans_yellow = "#feeaac";
var trans_gray = "#f6f6f6";

var go_success = function(){
  global.CONNCETED = true;
  if (!global.NEW_PUSH_TYPE) {
    $('.add-new').css({'display': 'block'});
  }
  setTimeout(function(){
    $('.control-window').css({'background-color': trans_green});
    $('#menu-bar').css({'background-color': trans_green});
  }, 10);
  setTimeout(function(){
    $('.control-window').css({'background-color': trans_gray});
    $('#menu-bar').css({'background-color': trans_gray});
  }, 620);
};

var go_failed = function(){
  global.CONNCETED = false;
  $('.control-window').css({'background-color': trans_yellow});
  $('#menu-bar').css({'background-color': trans_yellow});
  $('.control-window p').html("connect or login error");
  $('.add-new').css({'display': 'none'});
  setTimeout(function(){
    if (global.CONNCETED === true) return;
    $('.control-window p').html("offline");
  }, 5000);
};

global.CONNCETED = false;

var start_ws = function() {
  global.HEART_BEAT = 2;
  var info, token;
  try {
    info = getInfo.getInfo();
    token = info.token;
  } catch(e) {
    return console.error("No token file:", e);
  }
  var connection = new WebSocket('wss://stream.pushbullet.com/websocket/' + token);
  connection.on('open', function(e) {
    console.log('ws open: %s', new Date());
    go_success();
  });
  connection.on('message', function(e) {
    $('.control-window p').html(" ");
    $('.control-window').css({'background-color': trans_gray});
    $('#menu-bar').css({'background-color': trans_gray});
    e = JSON.parse(e);
    console.log(e);
    switch (e.type) {
      case 'nop': // HeartBeat
        //console.log('HeartBeat', new Date());
        global.HEART_BEAT += 1;
      break;
      case 'tickle':
        go_success();
        if (e.subtype === 'device'){ // device list updated
          global.refresh_info();
        } else { // pushes updated
          global.refresh_history(15);
        }
      break;
      case 'push': // Android notification mirror
        if (e.push.type === "messaging_extension_reply") break;
        if (e.push.type === "clip"){
          if (e.push.source_device_iden !== info.options.this_device_iden){
            clipboard.set(e.push.body);
          }
          break;
        }
        send_notification(e.push);
      break;
    }
  });
  connection.on('error', function(e) {
    console.log('ws error: %s', e);
    console.log(e);
  });
  connection.on('close', function(e) {
    console.log('close: %s', new Date());
  });
  return connection;
};

global.restart_ws = function(){
  global.HEART_BEAT = 2;
  try {
    global.ws.close();
  } catch(e) {}
  global.ws = new start_ws();
};

var onLine = true;
global.restart_ws();
setInterval(function(){ //HeartBeat check
  if (global.HEART_BEAT-- <= 0 || global.window.navigator.onLine !== onLine){
    go_failed();
    console.warn("ws try to restart", new Date());
    global.restart_ws();
  }
  onLine = global.window.navigator.onLine;
}, 30000);

