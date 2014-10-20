module.exports = function(e){
  console.log("Notification: ", e);
  if (e.type === "dismissal" || e.active === false) return;

  var options = {
    body: e.body || e.url || e.address || e.file_url || "",
  };
  if (e.icon){
    options.icon = "data:image/png;base64,"+e.icon;
  } else if (e.type){
    options.icon = "./icons/"+e.type+".png";
  }
  if (!(e.title || e.type)) return console.error("push obj error:", e);
  var notification = new window.Notification(e.title || e.type, options);

  if (e.active) {
    notification.onclick = function (){
      global.show_history(e.target_device_iden || e.receiver_email_normalized.replace(".", "DoTDoTDoT").replace("@", "AtAtAt"));
    };
  }
};

