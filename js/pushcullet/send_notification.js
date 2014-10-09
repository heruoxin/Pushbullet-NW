module.exports = function(e){
  console.log("Notification: ", e);
  if (e.type === "dismissal") return;

  var notification = new window.Notification(e.title, {
    body: e.body,
    icon: "data:image/png;base64,"+e.icon
  });

};

