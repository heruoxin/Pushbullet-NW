var conversation = require('./conversation.js');
var dismiss = require('./dismiss_notification.js');
var exec = require('child_process').exec;
var fs = require('fs');
global.notifications = {};
global.message_history = {};

var getid = function(e) {
  return String(e.notification_id).replace("-", "no");
};

var openApp = function(name) {
  fs.readdir('/Applications/', function(err, files){
    if (err) return console.log(err);
    for (var i in files){
      if(files[i].toLowerCase().indexOf(name.toLowerCase()) === -1) continue;
      return exec("open /Applications/"+files[i]);
    }
    exec("open 'https://www.google.com/webhp?#btnI=I&q="+name+"'");
  });
};

module.exports = function(e, time){
  console.log("Notification: ", e);
  if (e.active === false) return;
  if (e.type === "dismissal") {
    try {
      global.notifications[getid(e)].close();
    } catch (error) {
      console.warn("Notification remove error", error);
    }
    global.notifications[getid(e)] = undefined;
    return;
  }

  var options = {
    body: e.body || e.url || e.address || e.file_url || "",
  };
  if (e.type === 'list') {
    var body = [];
    for (var i in e.items) {
      body.push(e.items[i].text);
    }
    options.body = body.join(' ');
  }
  if (e.icon){
    options.icon = "data:image/png;base64,"+e.icon;
  } else if (e.type){
    options.icon = "./icons/"+e.type+".png";
  }
  if (!(e.title || e.type)) return console.error("push obj error:", e);
  var notification = new window.Notification(e.title || e.type, options);
  if (time) {
    setTimeout(function(){
      notification.close();
    }, time);
  }
  if (e.notification_id) {
    global.notifications[getid(e)] = notification;
  }

  if (e.active) { // push
    notification.onclick = function (){
      global.show_history(e.target_device_iden || e.receiver_email_normalized.replace(".", "DoTDoTDoT").replace("@", "AtAtAt"));
      notification.close();
    };
  } else { // notification
    dismiss_options = {
      type: "dismissal",
      package_name: e.package_name,
      notification_id: e.notification_id,
      notification_tag: (e.notification_tag || null),
      source_user_iden: e.source_user_iden
    };

    if (e.conversation_iden) { // click to reply
      if (global.message_history.hasOwnProperty(e.conversation_iden)) {
        global.message_history[e.conversation_iden] += '<p class="reply-message">'+e.body.replace('↵','</p><p class="reply-message">')+'</p>';
      } else {
        global.message_history[e.conversation_iden] = '<p class="reply-message">'+e.body.replace('↵','</p><p class="reply-message">')+'</p>';
      }
    }

    notification.onclick = function(){
      if (e.conversation_iden) { // click to reply
        conversation.newWindow(e);
      } else {
        openApp(e.application_name);
      }
      dismiss(dismiss_options);
      notification.close();
    };
    notification.onclose = function(){
      dismiss(dismiss_options);
    };
  }

};

