var WebSocket = require('ws');
var send_notification = require('./send_notification');

try {
  var token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json').token;
} catch(e) {
  return console.error(e);
}

var start_ws = function() {
  var heart_beat = 2;

  var connection = new WebSocket('wss://stream.pushbullet.com/websocket/' + token);
  connection.on('open', function(e) {
    console.log('ws open: %s', new Date());
  });
  connection.on('message', function(e) {
    e = JSON.parse(e);
    console.log(e);
    switch (e.type) {
      case 'nop': // HeartBeat
        console.log('HeartBeat', new Date());
      heart_beat += 1;
      break;
      case 'tickle':
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
    return restart_ws();
  });

  setInterval(function(){ //HeartBeat check
    if (heart_beat <= 0){
      return restart_ws();
    }
    heart_beat -= 1;
  },30000);
  var restart_ws = function(){
    setTimeout(function(){
      start_ws();
      connection.close();
    }, 10000);
  };
};

start_ws();
