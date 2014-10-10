var gui = require('nw.gui');
var login = require('./js/pushcullet/login');

if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;

var ID;

var mb = new gui.Menu({type:"menubar"});
mb.createMacBuiltin("Pushbullet");
gui.Window.get().menu = mb;

global.add_error_card = function(title, e){
  console.log(title, e);
  var error_card = [
    '          <div class="push-card">',
    '        <div class="card-main">',
    '          <div class="card-logo">',
    '            <img src="icons/error.png" />',
    '          </div>',
    '          <div class="card-content">',
    '            <h2 class="content-title">',
    title,
    '            </h2>',
    '            <hr class="card-hr-horizonal" />',
    '            <div class="content-main">',
    '            <p>',
    e.toString(),
    '            </p>',
    '          </div>',
    '          </div>',
    '        </div>',
    '        <div class="card-control">',
    '            <a href="#" class="control open">Refresh</a>',
    '            <a href="#" class="control delete">Delete</a>',
    '        </div>',
    '      </div>',
  ].join('');
  $("#push-list").append(error_card);
};

global.refresh_info = function(token, cb){
  try {
    require('./js/pushcullet/refresh_devices_contacts')(token, function(status, info){
      if (typeof cb === 'function'){
        cb(status, info);
      }
      show_info();
    });
  } catch (e) {
    //    global.add_error_card("Refresh account info error", e);
    $("#push-list").html('');
    login();
  }
};

global.refresh_history = function(time){
  try {
    return require('./js/pushcullet/refresh_push_history')(time, function(){
      global.show_history(ID);
    });
  } catch (e) {
    //    global.add_error_card("Refresh push history error", e);
    console.log(e);
  }
};

global.show_history = function(id){
  try {
    ID = id || "everypush";
    //
    console.log("the ID is:", ID);
    $(".menber").removeClass("star");
    $("#"+ID).addClass("star");
    //
    console.log('show_history:',ID);
    if (ID === "everypush"){
      require('./js/pushcullet/show_push_history')();
    } else {
      require('./js/pushcullet/show_push_history')(ID);
    }
    $.get('./html/addpushcard.html', function(data){
      console.log(data);
      $("#push-list").prepend(data);
    });
    card_button();
  } catch (e) {
    //    global.add_error_card("Show push history error", e);
    console.log(e);
  }
};

var show_info = function(){
  try {
    return require('./js/pushcullet/show_devices_contacts_list')(menubar_click);
  } catch (e) {
    //    global.add_error_card("Refresh devices list error", e);
  }
};

var menubar_click = function (){
  $(".menber").on("click", function(obj){
    console.log('.menber click:',obj.currentTarget.id);
    if (obj.currentTarget.id === "msf") return;
    global.show_history(obj.currentTarget.id);
  });
  $("#menu-setting").on("click", function(){
    $("#push-list").html('');
    //more setting should add to here.
    login();
  });
};


var traffic_light = function(){
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
  //window active or not
  var win = gui.Window.get();
  win.on('focus', function() {
    $('.traffice-light a').removeClass('deactivate');
  });
  win.on('blur', function() {
    $('.traffice-light a').addClass('deactivate');
  });
};


//card button
var exec = require('child_process').exec;
var card_button = function(){
  $('.open').on("click", function(obj){
    var e = $("#"+obj.currentTarget.id);
    console.log(obj.currentTarget.id, e);
    exec(e.attr("arg"), function(err, stdout, stderr){
      var notifier = new Notification();
      notifier.notify({
        "title": e.attr("usage"),
        //        "subtitle": e.attr("usage"),
        "message": e.attr("info"),
        //        "sound": "Funk", // case sensitive
        "contentImage": './icons/'+e.attr("type")+'.png',
        "appIcon": './icons/'+e.attr("type")+'.png',
        //        "open": "file://" + __dirname + "/coulson.jpg"
      });
    });
  });
  $('.delete').on("click", function(obj){
    var id = obj.currentTarget.id.replace('delete','');
    var created = obj.currentTarget.created;
    console.log(id, "Delete");
    $('#'+id).remove();
    return require('./js/pushcullet/delete_push')(id, created);
  });
  //card expand
  $(".push-card").on("click", function(){
    console.log(".push-card click");
    //    if ($(this).css("height") === "100px"){
    //      $(this).css({"height": "150px"});
    //    } else {
    //    $(this).css({"height": "100px"});
    //    }
    return false;
  });
};


show_info();
global.show_history();
global.refresh_info();
global.refresh_history();
process.on("uncaughtException", function(e){
  console.error("uncaughtException:", e);
});

$(document).ready(function(){
  setTimeout(function(){
    traffic_light();
    menubar_click();
    //start ws
    require('./js/pushcullet/ws');
  }, 200);
});

require('nw.gui').Window.get().showDevTools();
