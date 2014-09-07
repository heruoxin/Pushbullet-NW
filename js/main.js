var gui = require('nw.gui');
var Notification = require('node-notifier');

var mb = new gui.Menu({type:"menubar"});
mb.createMacBuiltin("your-app-name");
gui.Window.get().menu = mb;

var add_error_card = function(title, e){
  console.log(title, e);
  var error_card = [
    '          <div class="push-card">',
    '        <div class="card-left">',
    '          <div class="card-logo">',
    '            <img src="icons/error.png" />',
    '          </div>',
    '          <div class="card-content">',
    '            <h2 class="content-title">',
    title,
    '            </h2>',
    '            <hr class="card-hr-horizonal" />',
    '            <p class="content-text">',
    e.toString(),
    '            </p>',
    '          </div>',
    '        </div>',
    '        <div class="card-right">',
    '          <div class="card-control">',
    '            <span class="control-one" id="control-one">Refresh</span>',
    '            <hr class="card-hr-horizonal" />',
    '            <span class="control-two" id="control-two">Delete</span>',
    '          </div>',
    '        </div>',
    '      </div>',
  ].join('');
  $("#push-list").append(error_card);
};

var refresh_info = function(){
  try {
    return require('./js/pushcullet/refresh_devices_contacts')();
  } catch (e) {
    add_error_card("Refresh account info error", e);
  }
};

var refresh_history = function(time){
  try {
    return require('./js/pushcullet/refresh_push_history')(time);
  } catch (e) {
    add_error_card("Refresh push history error", e);
  }
};

var show_menu_bar_list = function(){
  try {
    return $("#menu-list").html(require('./js/pushcullet/show_devices_contacts_list')());
  } catch (e) {
    add_error_card("Refresh devices list error", e);
  }
};

var show_push_history = function(id){
  try {
    $("#push-list").html(require('./js/pushcullet/show_push_history')(id));
    $.get('./html/addpushcard.html', function(data){
      $("#push-list").prepend(data);
    });
  } catch (e) {
    add_error_card("Show push history error", e);
  }
};

var menubar_click = function (){
  $(".menber").click(function(obj){
    console.log(obj.currentTarget.id);
    show_push_history(obj.currentTarget.id);
  });
};


//window active or not
var win = gui.Window.get();
win.on('focus', function() {
  $('nav.control-window a').removeClass('deactivate');
});
win.on('blur', function() {
  $('nav.control-window a').addClass('deactivate');
});

//button behave
$('.close').click(function(){
  win.close();
});
$('.minimize').click(function(){
  win.minimize();
});
$('.maximize').click(function(){
  win.toggleFullscreen();
});


//card button
var exec = require('child_process').exec;
var card_button = function(){
  $('.open').click(function(obj){
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
};

//card expand
var card_expand = function(){
  $(".push-card").bind("click", function(){
    if ($(this).css("max-height") === "none"){
      $(this).css({"max-height": "150px"});
      return false;
    }
    $(this).css({"max-height": "none"});
    return false;
  });
};


//loading
setTimeout(function(){
  show_menu_bar_list();
  show_push_history();
  //  refresh_info();
  //  refresh_history();
  menubar_click();
  card_button();
  card_expand();
}, 200);

require('nw.gui').Window.get().showDevTools();
