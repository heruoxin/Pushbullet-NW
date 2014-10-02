var gui = require('nw.gui');
var Notification = require('node-notifier');
var JQ = require('jquery');

var mb = new gui.Menu({type:"menubar"});
mb.createMacBuiltin("Pushbullet");
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
    '            <span class="control open" id="control-one">Refresh</span>',
    '            <hr class="card-hr-horizonal" />',
    '            <span class="control delete" id="control-two">Delete</span>',
    '          </div>',
    '        </div>',
    '      </div>',
  ].join('');
  JQ("#push-list").append(error_card);
};

var refresh_info = function(){
  try {
    require('./js/pushcullet/refresh_devices_contacts')();
  } catch (e) {
    add_error_card("Refresh account info error", e);
    var new_win = gui.Window.get(
      window.open('./html/login.html', {
      position: 'center',
      width: 100,
      height: 100
    })
    );
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
    return require('./js/pushcullet/show_devices_contacts_list')();
  } catch (e) {
    add_error_card("Refresh devices list error", e);
  }
};

var show_push_history = function(id){
  try {
    console.log('show_push_history:',id);
    require('./js/pushcullet/show_push_history')(id);
    JQ.get('./html/addpushcard.html', function(data){
      JQ("#push-list").prepend(data);
    });
  } catch (e) {
    add_error_card("Show push history error", e);
  }
};

var menubar_click = function (){
  JQ(".menber").on("click", function(obj){
    console.log('.menber click:',obj.currentTarget.id);
    show_push_history(obj.currentTarget.id);
    card_button();
    card_expand();
  });
};


//window active or not
var win = gui.Window.get();
win.on('focus', function() {
  JQ('.traffice-light a').removeClass('deactivate');
});
win.on('blur', function() {
  JQ('.traffice-light a').addClass('deactivate');
});

//button behave
JQ('.close').click(function(){
  win.close();
});
JQ('.minimize').click(function(){
  win.minimize();
});
JQ('.maximize').click(function(){
  win.toggleFullscreen();
});


//card button
var exec = require('child_process').exec;
var card_button = function(){
  JQ('.open').click(function(obj){
    var e = JQ("#"+obj.currentTarget.id);
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
  JQ('.delete').click(function(obj){
    var id = obj.currentTarget.id.replace('delete','');
    console.log(id, "Delete");
    JQ('#'+id).remove();
    return require('./js/pushcullet/delete_push')(id);
  });
};

//card expand
var card_expand = function(){
  JQ(".push-card").bind("click", function(){
    //    if (JQ(this).css("height") === "100px"){
    //      JQ(this).css({"height": "150px"});
    //    } else {
    //    JQ(this).css({"height": "100px"});
    //    }
    return false;
  });
};


//loading
setTimeout(function(){
}, 200);
JQ(document).ready(function(){
  refresh_info();
  show_menu_bar_list();
  show_push_history();
  refresh_history();
  menubar_click();
  card_button();
  card_expand();
});

//start ws
require('./js/pushcullet/ws');

require('nw.gui').Window.get().showDevTools();
