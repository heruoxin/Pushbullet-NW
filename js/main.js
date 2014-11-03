var gui = require('nw.gui');
global.console = console;
global.gui = gui;
var fs = require('fs');
var exec = require('child_process').exec;
var login = require('./js/pushbulletnw/login');
var new_push = require('./js/pushbulletnw/new_push');
var send_notification = require('./js/pushbulletnw/send_notification');
var regist_devices = require('./js/pushbulletnw/regist_devices');
var animate = require('./js/pushbulletnw/animation');
var keybind = require('./js/pushbulletnw/keybind');
var mime = require('mime');
var path = require('path');
var drag_file = require('./js/pushbulletnw/drag_file');
global.CWD = process.cwd();

if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;

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
    '            <div class="content-body">',
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

global.refresh_info = function(token, options, cb){
  try {
    require('./js/pushbulletnw/refresh_devices_contacts')(token, options, function(status, info){
      if (typeof cb === 'function'){
        cb(status, info);
      }
      regist_devices();
      global.show_info();
    });
  } catch (e) {
    //    global.add_error_card("Refresh account info error", e);
    $("#push-list").html('');
    console.error("global.refresh_info:", e);
    login();
    card_button();
  }
};

global.refresh_history = function(time){
  try {
    if (time === "syncing_changes"){
      var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.history.json';
      fs.stat(file_path, function (err, stats) {
        if (err) throw err;
        time = Number(new Date())/1000 - Number(new Date(stats.mtime))/1000;
        return require('./js/pushbulletnw/refresh_push_history')(time, function(){
          global.show_history(global.ID);
        });
      });
    } else {
      return require('./js/pushbulletnw/refresh_push_history')(time, function(){
        global.show_history(global.ID);
      });
    }
  } catch (e) {
    //    global.add_error_card("Refresh push history error", e);
    console.error('global.refresh_history:', e);
  }
};

global.show_history = function(id){
  try {
    global.ID = id || "everypush";
    $(".menber").removeClass("star");
    $("#"+global.ID).addClass("star");
    //console.log('show_history:',global.ID);
    if (global.ID === "everypush"){
      require('./js/pushbulletnw/show_push_history')();
    } else {
      require('./js/pushbulletnw/show_push_history')(global.ID);
    }
    animate.fadein('#push-list');
    global.cancel_push();
    card_button();
  } catch (e) {
    //    global.add_error_card("Show push history error", e);
    console.error('global.show_history:',e);
  }
};

global.show_info = function(){
  try {
    return require('./js/pushbulletnw/show_devices_contacts_list')(menubar_click);
  } catch (e) {
    //    global.add_error_card("Refresh devices list error", e);
    console.error("global.show_info", e);
  }
};

global.open_setting = function(){
  $('#push-list').html('');
  $(".menber").removeClass("star");
  $("#msf").addClass("star");
  global.ID = "setting";
  login();
  if (!global.SETTING_SHOW) {
    //more setting cards should add to here.
    alfred_workflow();
    about_me();
  }
  animate.fadein('#push-list');
  global.SETTING_SHOW = true;
  setTimeout(function(){
    global.SETTING_SHOW = undefined;
  }, 10);
  card_button();
};

global.add_new_push = function(){
  if (!global.CONNCETED) return;
  $('.add-new').css({'display': 'none'});
  $('#type-selector').css({'display': 'block'});
  global.NEW_PUSH_TYPE = 'note';
  fs.readFile(process.cwd()+"/html/addpushcard.html", {encoding: 'utf8'}, function(e, d){
    if (e) return console.error("Read addpushcard.html:", e);
    if (global.ID === "setting") {
      global.show_history(undefined);
      return console.log("Cannot add card in setting page");
    }
    if ($(document).has('#card-top').length !== 0) {
      $("#main").animate({
        scrollTop: $("#card-top").offset().top - $("#main").offset().top + $("#main").scrollTop()
      });
      return console.log("Already adding");
    }
    $("#push-list").prepend(d);
    //new card
    $("#main").animate({
      scrollTop: $("#card-top").offset().top - $("#main").offset().top + $("#main").scrollTop()
    });
    $(".imgbox").css({display: "none"});
    $(".bodybox").css({display: "none"});
    $(".note").css({display: "block"});
    $(".hide").css({display: "none"});
    $(".no-hide").css({display: "block"});
    $(".hide.note").css({display: "block"});
    $(".no-hide.note").css({display: "none"});
    $('.titlebox').attr("placeholder", "note title");
    change_new_push_type();
    list_expand_bind();
    select_file();
    drag_file.get_file_path('.bodybox.file');
    setTimeout(function(){
      $(".bodybox").submit(function(obj){
        if ($('.control.send').stop === "stop") return false;
        send_new_push();
      });
      $(".send").on("click", function(obj){
        if ($('.control.send').attr("stop") === "stop") return false;
        send_new_push();
      });
      $(".cancel").on("click", function(){
        global.cancel_push();
      });
    }, 100);
  });
};

global.show_dev_tools = function(){
  gui.Window.get().showDevTools();
};
var change_new_push_type = function(){
  $('.selectorbox').on("click", function(){
    var type = $(this).attr("type");
    $(".imgbox").css({display: "none"});
    $(".bodybox").css({display: "none"});
    $("."+type).css({display: "block"});
    switch (type) {
      case "file":
        $('.new-card').css({'max-height': '150px'});
        $(".bodybox."+type).css({display: "none"});
        setTimeout(function(){$(".bodybox."+type).css({display: "block"});},300);
      break;
      case "list":
        $('.new-card').css({'max-height': '500px'});
      break;
      case "note":
      case "address":
      case "link":
        $('.new-card').css({'max-height': '90px'});
      break;
    }
    $(".hide").css({display: "none"});
    $(".no-hide").css({display: "block"});
    $(".hide."+type).css({display: "block"});
    $(".no-hide."+type).css({display: "none"});
    if(!$('.titlebox').val()) $('.titlebox').attr("placeholder", type+" title");
    global.NEW_PUSH_TYPE = type;
  });
};

var menubar_click = function (){
  $(".menber").removeClass("star");
  $("#"+global.ID).addClass("star");
  $(".menber").on("click", function(obj){
    if (obj.currentTarget.id !== "msf") return global.show_history(obj.currentTarget.id);
    global.open_setting();
  });
};

var about_me = function(){
  fs.readFile(process.cwd()+'/html/aboutme.html',{encoding: 'utf8'}, function(e, d){
    if (e) return console.log;
    $("#push-list").prepend(d);
  });
};

var alfred_workflow = function(){
  fs.readFile(process.cwd()+'/html/alfredworkflow.html',{encoding: 'utf8'}, function(e, d){
    if (e) return console.log;
    $("#push-list").prepend(d);
  });
};

var send_new_push = function(){
  var data = {};
  data.title = $(".titlebox").val();
  data.type = global.NEW_PUSH_TYPE;
  switch (global.NEW_PUSH_TYPE) {
    case "note":
      data.body = $(".bodybox.note").val();
    break;
    case "link":
      data.url = $(".bodybox.link").val();
    break;
    case "address":
      data.address = $(".bodybox.address").val();
    break;
    case "list":
      data.items = [];
    $('.bodybox.list :text').each(function(i){
      if ($(this).val()) {
        data.items.push($(this).val());
      }
    });
    break;
    case "file":
      if (!global.UPLOAD_FILE) {
      $('.bodybox.file.file-box').addClass('loading');
      return setTimeout(function(){
        $('.bodybox.file.file-box').removeClass('loading');
      }, 500);
    } else {
      data.file = global.UPLOAD_FILE;
    }
    break;
  }
  $('.card-control.pre-send').html('<a class="control expand loading send" href="#" stop="stop" >Sending</a>');
  setTimeout(function(){
    $('.card-control.pre-send').html('<a class="control expand send" href="#">Resend ?</a>');
    $(".send").on("click", function(obj){
      if ($('.control.send').stop === "stop") return false;
      send_new_push();
    });
  }, function(ty){
    if (ty === "file") return 600000;
    return 15000;
  }(global.NEW_PUSH_TYPE));
  console.log(data);
  new_push(data, global.ID, function(d){
    console.log(d);
    global.NEW_PUSH_TYPE = undefined;
    return global.refresh_history(3);
  });
};

global.cancel_push = function(){
  if (global.CONNCETED) $('.add-new').css({'display': 'block'});
  $('#type-selector').css({'display': 'none'});
  $('.push-card.new-card').css({
    'max-height': 0,
    'min-height': 0,
  });
  global.NEW_PUSH_TYPE = undefined;
  setTimeout(function(){
    $('.push-card.new-card').remove();
  }, 801);
};

var traffic_light = function(){
  var win = global.gui.Window.get();
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
    global.add_new_push();
  });
  //window active or not
  win.on('focus', function() {
    $('#traffice-light a').removeClass('deactivate');
  });
  win.on('blur', function() {
    $('#traffice-light a').addClass('deactivate');
  });
};

//When new push's type is list, it should auto expand.
var list_expand_bind = function(){
  $(".list-expand").on("focus", function(){
    if (global.LIST_EXPAND) return;
    global.LIST_EXPAND = true;
    $(".list-expand").removeClass("list-expand");
    $('.bodybox.list').append('<input type="text" class="list-expand" name="list" placeholder="item (optional)" />');
    setTimeout(function(){
      global.LIST_EXPAND = false;
    }, 300);
    return list_expand_bind();
  });
};
//When new push's type is file, click to select file.
var select_file = function(){
  $('.bodybox.file.file-box').on("click", function(){
    if (global.FILE_SELECTED) return;
    global.FILE_SELECTED = true;
    $('#file-upload').click();
    setTimeout(function(){
      global.FILE_SELECTED = false;
    }, 300);
  });
  $('#file-upload').on("change", function(){
    global.UPLOAD_FILE = {
      path: this.value,
      name: path.basename(this.value),
      type: mime.lookup(this.value),
    };
    $('.bodybox.file h5').html(global.UPLOAD_FILE.name);
  });
};

//card button
var card_button = function(){
  setTimeout(function(){
    $('.open').on("click", function(obj){
      var e = $("#"+obj.currentTarget.id);
      console.log(obj.currentTarget.id, e);
      exec(e.attr("arg"), function(err, stdout, stderr){
        if (err || stderr) console.error("do open error:", err|| stderr);
        send_notification({
          title: e.attr('usage'),
          body: e.attr('info'),
          type: e.attr('type')
        });
      });
    });
    $('.delete').on("click", function(obj){
      var e = $("#"+obj.currentTarget.id);
      var id = obj.currentTarget.id.replace('delete','');
      var created = e.attr('created');
      console.log(id, "Delete:", created);
      //$('#'+id).remove();
      $('#'+id).css({
        'max-height': 0,
        'min-height': 0,
      });
      return require('./js/pushbulletnw/delete_push')(id, created);
    });
    //a click
    $("a").on("click", function(obj){
      if (global.HREF === obj.currentTarget.href) return false;
      if (obj.currentTarget.href.indexOf(".app/Contents/Resources/app.nw") >= 0) return false;
      global.HREF = obj.currentTarget.href;
      console.log("a click: ", obj.currentTarget.href);
      exec("open "+obj.currentTarget.href, function(err, stdout, stderr){});
      return false;
    });
    //checkbox click
    $(":checkbox").on("click", function(){
      var this_iden = $(this).parents('.push-card').attr("id");
      var code = JSON.parse($('#'+this_iden).attr("code"));
      $('#'+this_iden+' :checkbox').each(function(i){
        code.items[i].checked = $(this).is(':checked');
      });
      console.log(code);
      new_push(code, global.ID);
    });
  }, 100);
};


$(document).ready(function(){
  setTimeout(function(){
    //start ws
    require('./js/pushbulletnw/ws');
    //show & bind
    global.show_info();
    global.show_history();
    global.refresh_info();
    global.refresh_history("syncing_changes");
    traffic_light();
    drag_file.disable_drag_in(document);
    //catch error
    process.on("uncaughtException", function(e){
      console.error("uncaughtException:", e);
    });
  }, 10);
});
