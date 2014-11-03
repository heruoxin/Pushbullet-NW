var gui = global.gui;

exports.newWindow = function(e){
  global.CONVERSATION_DATA = e;
  return gui.Window.open('html/conversation.html', {
    position: "mouse",
    min_width: 200,
    min_height: 250,
    max_width: 450,
    max_height: 500,
    width: 250,
    height: 300,
    transparent: true,
    toolbar: false,
    frame: false
  });
};

exports.pageBind = function(document){
  var conversationData = {};
  for (var i in global.CONVERSATION_DATA) {
    conversationData[i] = global.CONVERSATION_DATA[i];
  }
  document.getElementById('conversation-title').innerHTML = conversationData.title;
  document.getElementById('conversation-body').innerHTML = global.message_history[conversationData.title];
  var win = gui.Window.get();
  //button behave
  $('.close').on("click", function(){
    win.close();
  });
  $('.minimize').on("click", function(){
    win.minimize();
  });
  $('.maximize').on("click", function(){
    win.toggleFullscreen();
  });
  $('.add-new').on("click", function(){
    global.add_new_push();
  });
  //window active or not
  win.on('focus', function() {
    $('.traffice-light a').removeClass('deactivate');
  });
  win.on('blur', function() {
    $('.traffice-light a').addClass('deactivate');
  });

};
