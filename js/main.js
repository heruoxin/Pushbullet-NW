var gui = require('nw.gui');
global.console = console;
global.gui = gui;
global.mainWin = gui.Window.get();
global.CWD = process.cwd();
global.$ = require('jquery');
var $ = global.$;
var fs = require('fs');
var mime = require('mime');
var path = require('path');
var exec = require('child_process').exec;
var login = require('./js/pushbulletnw/login');
var new_push = require('./js/pushbulletnw/new_push');
var send_notification = require('./js/pushbulletnw/send_notification');
var regist_devices = require('./js/pushbulletnw/regist_devices');
var refresh_devices_contacts = require('./js/pushbulletnw/refresh_devices_contacts');
var refresh_push_history = require('./js/pushbulletnw/refresh_push_history');
var show_push_history = require('./js/pushbulletnw/show_push_history');
var animate = require('./js/pushbulletnw/animation');
var keybind = require('./js/pushbulletnw/keybind');
var drag_file = require('./js/pushbulletnw/drag_file');
var getInfo = require('./js/pushbulletnw/getInfo');
var clipboard = require('./js/pushbulletnw/clipboard');

var mb = new gui.Menu({type:"menubar"});
mb.createMacBuiltin("Pushbullet-NW");
global.mainWin.menu = mb;

global.refresh_info = function(token, options, cb){
  try {
    refresh_devices_contacts(token, options, function(status, info){
      if (typeof cb === 'function'){
        cb(status, info);
      }
      regist_devices();
      global.show_info();
    });
  } catch (e) {
    console.error("global.refresh_info:", e);
  }
};

global.refresh_history = function(time){
  try {
    if (time === "syncing_changes"){
      var file_path = process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.history.json';
      fs.stat(file_path, function (err, stats) {
        if (err) throw err;
        time = Number(new Date())/1000 - Number(new Date(stats.mtime))/1000;
        return refresh_push_history(time, function(){
          global.show_history(global.ID);
        });
      });
    } else {
      return refresh_push_history(time, function(){
        global.show_history(global.ID);
      });
    }
  } catch (e) {
    console.error('global.refresh_history:', e);
  }
};

global.show_history = function(id){
  global.cancel_push();
  try {
    global.ID = id || "everypush";
    $(".menber").removeClass("star");
    $("#"+global.ID).addClass("star");
    //console.log('show_history:',global.ID);
    if (global.ID === "everypush"){
      show_push_history();
    } else {
      show_push_history(global.ID);
    }
    animate.fadein('#push-list');
    card_button();
  } catch (e) {
    console.error('global.show_history:',e);
  }
};

global.show_info = function(){
  try {
    return require('./js/pushbulletnw/show_devices_contacts_list')(menubar_click);
  } catch (e) {
    console.error("global.show_info", e);
  }
};

global.open_setting = function(){
  $('#push-list').html('');
  $(".menber").removeClass("star");
  $("#setting").addClass("star");
  global.ID = "setting";
  login();
  if (!global.SETTING_SHOW) {
    //more setting cards should add to here.
    alfred_workflow();
    universal_copy();
    about_me();
  }
  animate.fadein('#push-list');
  global.SETTING_SHOW = true;
  setTimeout(function(){
    global.SETTING_SHOW = undefined;
    window.Waves.displayEffect();
  }, 10);
  card_button();
};

global.add_new_push = function(){
  if (!global.CONNCETED) return;
  var pushable = $('#'+global.ID).attr("pushable");
  if (pushable !== "true") {
    global.show_history(undefined);
    return console.log("Cannot add card here.");
  }
  $('.add-new').css({'display': 'none'});
  $('#type-selector').css({'display': 'block'});
  global.NEW_PUSH_TYPE = 'note';
  fs.readFile(global.CWD + "/html/addpushcard.html", {encoding: 'utf8'}, function(e, d){
    if (e) return console.error("Read addpushcard.html:", e);
    if ($(document).has('#card-top').length !== 0) {
      $("#main").animate({
        scrollTop: $("#card-top").offset().top - $("#main").offset().top + $("#main").scrollTop()
      });
      return console.log("Already adding");
    }
    $("#push-list").prepend(d);
    //show devices list for send sms
    var selectList = "";
    var devicesList = getInfo.getInfo().devices;
    for (var i in devicesList) {
      if (devicesList[i].type != "android") continue;
      if (!devicesList[i].active) continue;
      selectList += '<option value="'+devicesList[i].iden+'">'+devicesList[i].nickname+'</option>';
    }
    $('.bodybox.sms select').html(selectList);
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

global.cancel_push = function(){
  global.NEW_PUSH_TYPE = undefined;
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

global.show_dev_tools = function(){
  global.mainWin.showDevTools();
};
var change_new_push_type = function(){
  $('.selectorbox').on("click", function(){
    var type = $(this).attr("type");
    $(".imgbox").css({display: "none"});
    $(".bodybox").css({display: "none"});
    $(".titlebox").attr("type", "text");
    $("."+type).css({display: "block"});
    $("#main").animate({
      scrollTop: $("#card-top").offset().top - $("#main").offset().top + $("#main").scrollTop()
    });
    $(".hide").css({display: "none"});
    $(".no-hide").css({display: "block"});
    $(".hide."+type).css({display: "block"});
    $(".no-hide."+type).css({display: "none"});
    if (!$('.titlebox').val()) $('.titlebox').attr("placeholder", type+" title");
    switch (type) {
      case "sms":
        $(".titlebox").attr("type", "number");
      $('.titlebox').attr("placeholder", "Phone Number");
      $('.new-card').css({'max-height': '200px'});
      $(".bodybox."+type).css({display: "none"});
      setTimeout(function(){$(".bodybox."+type).css({display: "block"});},300);
      break;
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
    global.NEW_PUSH_TYPE = type;
  });
};

var menubar_click = function (){
  $(".menber").removeClass("star");
  $("#"+global.ID).addClass("star");
  $(".menber").on("click", function(obj){
    if (obj.currentTarget.id !== "setting") return global.show_history(obj.currentTarget.id);
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

var universal_copy = function(){
  fs.readFile(process.cwd()+'/html/universalcp.html',{encoding: 'utf8'}, function(e, d){
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
    case "sms":
      data.message = $('.bodybox.sms textarea').val();
    data.source_device_iden = $('.bodybox.sms select').val();
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
    global.cancel_push();
    return global.refresh_history(3);
  });
};

var traffic_light = function(){
  //button behave
  $('.close').on("click", function(){
    global.mainWin.close();
  });
  $('.minimize').on("click", function(){
    global.mainWin.minimize();
  });
  $('.maximize').on("click", function(){
    global.mainWin.toggleFullscreen();
  });
  $('.add-new').on("click", function(){
    global.add_new_push();
  });
  //window active or not
  global.mainWin.on('focus', function() {
    $('#traffice-light a').removeClass('deactivate');
  });
  global.mainWin.on('blur', function() {
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
        }, 3000);
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
    //catch error
    process.on("uncaughtException", function(e){
      console.error("uncaughtException:", e);
    });
    //show & bind
    global.show_info();
    global.show_history();
    global.refresh_info(undefined, undefined, function(status, info){
      if (info == "Login Error. Check your token or network") {
        $("#push-list").html('');
        login();
        card_button();
      }
    });
    global.refresh_history("syncing_changes");
    traffic_light();
    drag_file.disable_drag_in(document);
    //start ws
    require('./js/pushbulletnw/ws');
    //start listen clipboard
    if (getInfo.getInfo().options.universalCP) {
      clipboard.startListen();
    }
  }, 10);
});
