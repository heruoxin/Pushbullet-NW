var gui = require('nw.gui');
var fs = require('fs');
var exec = require('child_process').exec;
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
      global.show_info();
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
    card_button();
  } catch (e) {
    //    global.add_error_card("Show push history error", e);
    console.log(e);
  }
};

global.show_info = function(){
  try {
    return require('./js/pushcullet/show_devices_contacts_list')(menubar_click);
  } catch (e) {
    //    global.add_error_card("Refresh devices list error", e);
  }
};

var menubar_click = function (){

  $(".menber").on("click", function(obj){
    console.log('.menber click:',obj.currentTarget.id);
    $('#push-list').html('');
    if (obj.currentTarget.id !== "msf") return global.show_history(obj.currentTarget.id);
    //more setting cards should add to here.
    about_me();
    login();
    card_button();
  });

};

var about_me = function(){
  fs.readFile(process.env.PWD+'/html/aboutme.html',{encoding: 'utf8'}, function(e, d){
    if (e) return console.log;
    $("#push-list").prepend(d);
  });
};

var push_type_selecter = function(){
};

var new_push = function(){
};

var cancel_push = function(){
  $('.push-card.new-card').remove();
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
  $('.add-new').on("click", function(){
    fs.readFile(process.env.PWD+"/html/addpushcard.html", {encoding: 'utf8'}, function(e, d){
      if (e) return console.log;
      $("#push-list").prepend(d);
    });
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
var card_button = function(){
  setTimeout(function(){
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
    $("a").on("click", function(obj){
      if (global.HREF === obj.currentTarget.href) return false;
      if (obj.currentTarget.href.indexOf(".app/Contents/Resources/app.nw") >= 0) return false;
      global.HREF = obj.currentTarget.href;
      console.log("a click: ", obj.currentTarget.href);
      exec("open "+obj.currentTarget.href, function(err, stdout, stderr){});
      return false;
    });
    //new card
    $(".bodybox").submit(function(){
      new_push();
    });
    $(".send").on("click", function(){
      new_push();
    });
    $(".cancel").on("click", function(){
      cancel_push();
    });
  }, 100);
};


global.show_info();
global.show_history();
global.refresh_info();
global.refresh_history();
process.on("uncaughtException", function(e){
  console.error("uncaughtException:", e);
});

$(document).ready(function(){
  setTimeout(function(){
    traffic_light();
    //start ws
    require('./js/pushcullet/ws');
  }, 200);
});

require('nw.gui').Window.get().showDevTools();
