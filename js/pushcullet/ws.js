var WebSocket = require('ws');

var token = process.argv.slice(2)[0];
if (!token) {
  token = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json').token;

}

var start_ws = function() {
  var heart_beat = 2;

  var connection = new WebSocket('wss://stream.pushbullet.com/websocket/' + token);
  connection.on('open', function(e) {
    console.log('open: %s', new Date());
  });
  connection.on('message', function(e) {
    e = JSON.parse(e);
    switch (e.type) {
      case 'nop': // HeartBeat
        console.log('HeartBeat', new Date());
        heart_beat += 1;
      break;
      case 'tickle': // Just a notification
        if (e.subtype === device){ //device list updated
      }
        break;
      case 'push': // Push or Android notification mirror
        break;
    }
  });
  connection.on('error', function(e) {
    console.log('error: %s',e);
    setTimeout(function(){
      return restart_ws();
    }, 10000);
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
      connection.close();
      return start_ws();
    }, 10000);
  };
};

start_ws();
