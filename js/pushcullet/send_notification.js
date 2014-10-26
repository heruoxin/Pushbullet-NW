global.notifications = {};

var getid = function(e) {
  return String(e.notification_id).replace("-", "no");
};

module.exports = function(e){
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
  if (e.notification_id) {
    global.notifications[getid(e)] = notification;
  }

  if (e.active) {
    notification.onclick = function (){
      global.show_history(e.target_device_iden || e.receiver_email_normalized.replace(".", "DoTDoTDoT").replace("@", "AtAtAt"));
    };
  }
};

