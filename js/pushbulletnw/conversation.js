var gui = global.gui;
var console = global.console;

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
    //for (var i in trafficeLights) {
    //  trafficeLights[i].className = trafficeLights[i].className.replace("deactivate", "");
    //}
  });
  win.on('blur', function() {
    //$('.traffice-light a').addClass('deactivate');
    var trafficeLights = document.getElementById('traffice-light').getElementsByTagName('a');
    trafficeLights[0].className += " deactivate";
    trafficeLights[1].className += " deactivate";
    //for (var i in trafficeLights) {
    //  trafficeLights[i].className += "deactivate";
    //}
  });
};
