var gui = require('nw.gui');
var Notification = require('node-notifier');

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
    require('./js/pushcullet/login');
  }
};

global.refresh_history = function(time){
  try {
    return require('./js/pushcullet/refresh_push_history')(time, function(){
      show_history(ID);
    });
  } catch (e) {
    //    global.add_error_card("Refresh push history error", e);
    console.log(e);
  }
};

var show_info = function(){
  try {
    return require('./js/pushcullet/show_devices_contacts_list')();
  } catch (e) {
    //    global.add_error_card("Refresh devices list error", e);
  }
};

var show_history = function(id){
  try {
    ID = id;
    console.log('show_history:',id);
    require('./js/pushcullet/show_push_history')(id);
    $.get('./html/addpushcard.html', function(data){
      $("#push-list").prepend(data);
    });
  } catch (e) {
    //    global.add_error_card("Show push history error", e);
    console.log(e);
  }
};

var menubar_click = function (){
  $(".menber").on("click", function(obj){
    console.log('.menber click:',obj.currentTarget.id);
    show_history(obj.currentTarget.id);
    card_button();
    card_expand();
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
    console.log(id, "Delete");
    $('#'+id).remove();
    return require('./js/pushcullet/delete_push')(id);
  });
};

//card expand
var card_expand = function(){
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
show_history();
global.refresh_info();
global.refresh_history();
$(document).ready(function(){
  setTimeout(function(){
    card_button();
    card_expand();
    traffic_light();
    //start ws
    require('./js/pushcullet/ws');
  }, 200);
});

require('nw.gui').Window.get().showDevTools();
