var Notification = require('node-notifier');

module.exports = function(e){
  var notifier = new Notification();
  notifier.notify({
    "title": e.title,
    //        "subtitle": e.attr("usage"),
    "message": e.body,
    //        "sound": "Funk", // case sensitive
    "contentImage": './icons/'+e.type+'.png',
    "appIcon": './icons/'+e.type+'.png',
    //        "open": "file://" + __dirname + "/coulson.jpg"
  });

};

