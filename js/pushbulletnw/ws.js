var WebSocket = require('ws');
var send_notification = require('./send_notification');
if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;

var go_success = function(){
  global.CONNCETED = true;
  if (!global.NEW_PUSH_TYPE) {
    $('.add-new').css({'display': 'block'});
  }
  setTimeout(function(){
    $('.control-window').css({'background-color': '#68c14f'});
    $('#menu-bar').css({'background-color': '#68c14f'});
  }, 10);
  setTimeout(function(){
    $('.control-window').css({'background-color': '#f6f6f6'});
    $('#menu-bar').css({'background-color': '#f6f6f6'});
  }, 620);
};

var go_failed = function(){
  global.CONNCETED = false;
  $('.control-window').css({'background-color': '#feeaac'});
  $('#menu-bar').css({'background-color': '#feeaac'});
  $('.control-window p').html("connect or login error");
  $('.add-new').css({'display': 'none'});
  setTimeout(function(){
    $('.control-window p').html("offline");
  }, 5000);
};

global.CONNCETED = false;

var start_ws = function() {
  global.HEART_BEAT = 2;
  var token;
  try {
    token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.info.json').token;
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
    $('.control-window').css({'background-color': '#f6f6f6'});
    $('#menu-bar').css({'background-color': '#f6f6f6'});
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
        send_notification(e.push);
      break;
    }
  });
  connection.on('error', function(e) {
    console.log('ws error: %s',e);
  });
  connection.on('close', function(e) {
    console.log('close: %s', new Date());
  });
  return connection;
};

global.restart_ws = function(){
  try {
    global.ws.close();
  } catch(e) {}
  global.ws = new start_ws();
};

global.HEART_BEAT = 2;
global.restart_ws();
setInterval(function(){ //HeartBeat check
  if (global.HEART_BEAT-- <= 0){
    global.HEART_BEAT = 2;
    go_failed();
    console.warn("ws try to restart", new Date());
    global.restart_ws();
  }
},30000);

