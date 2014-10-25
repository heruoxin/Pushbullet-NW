var gui = require('nw.gui');
var fs = require('fs');
var exec = require('child_process').exec;
var login = require('./js/pushcullet/login');
var new_push = require('./js/pushcullet/new_push');
var send_notification = require('./js/pushcullet/send_notification');
var regist_devices = require('./js/pushcullet/regist_devices');

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
    console.error("global.refresh_info", e);
    login();
    card_button();
  }
};

global.refresh_history = function(time){
  try {
    return require('./js/pushcullet/refresh_push_history')(time, function(){
      global.show_history(global.ID);
    });
  } catch (e) {
    //    global.add_error_card("Refresh push history error", e);
    console.error(e);
  }
};

global.show_history = function(id){
  try {
    global.ID = id || "everypush";
    global.NEW_PUSH_TYPE = undefined;
    //
    console.log("the ID is:", global.ID);
    $(".menber").removeClass("star");
    $("#"+global.ID).addClass("star");
    //
    console.log('show_history:',global.ID);
    if (global.ID === "everypush"){
      require('./js/pushcullet/show_push_history')();
    } else {
      require('./js/pushcullet/show_push_history')(global.ID);
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
    global.NEW_PUSH_TYPE = undefined;
    $(".menber").removeClass("star");
    global.ID = "history";
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

var push_type_selecter_change = function(){
  $(".imgbox").css({display: "none"});
  $(".bodybox").css({display: "none"});
  $("."+global.NEW_PUSH_TYPE).css({display: "block"});
};

var push_type_selecter = function(){
  push_type_selecter_change();
  var push_type_list = ["note", "link", "address", "list"];
  $(".content-title img").on("click", function(){
    for (var i in push_type_list) {
      if (global.NEW_PUSH_TYPE == push_type_list[i]){
        global.NEW_PUSH_TYPE = push_type_list[Number(i)+1] || push_type_list[0];
        break;
      }
    }
    push_type_selecter_change();
  });
};

var send_new_push = function(){
  $('.card-control.pre-send').html('<a class="control expand loading send" href="#" stop="stop" >Sending</a>');
  setTimeout(function(){
    $('.card-control.pre-send').html('<a class="control expand send" href="#">Resend ?</a>');
    $(".send").on("click", function(obj){
      if ($('.control.send').stop === "stop") return false;
      send_new_push();
    });
  }, 9000);
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
          data.items.push({
            text: $(this).val(),
            checked: false,
          });
        }
      });
    break;
  }
  console.log(data);
  new_push(data, global.ID, function(d){
    console.log(d);
    global.NEW_PUSH_TYPE = undefined;
    return global.refresh_history(3);
  });
};

var cancel_push = function(){
  global.NEW_PUSH_TYPE = undefined;
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
      if (global.ID === "history") return console.log("In history Page, not allow to add card");
      if (global.NEW_PUSH_TYPE) {
        $("#main").animate({
          scrollTop: $("#card-top").offset().top - $("#main").offset().top + $("#main").scrollTop()
        });
        return console.log("Already adding");
      }
      global.NEW_PUSH_TYPE = 'note';
      $("#push-list").prepend(d);
      //new card
      $("#main").animate({
        scrollTop: $("#card-top").offset().top - $("#main").offset().top + $("#main").scrollTop()
      });
      push_type_selecter();
      setTimeout(function(){
        $(".bodybox").submit(function(obj){
          if ($('.control.send').stop === "stop") return false;
          send_new_push();
        });
        $(".send").on("click", function(obj){
          if ($('.control.send').stop === "stop") return false;
          send_new_push();
        });
        $(".cancel").on("click", function(){
          cancel_push();
        });
      }, 100);
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
        //23333
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
      return require('./js/pushcullet/delete_push')(id, created);
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
      //var val = [];
      $('#'+this_iden+' :checkbox').each(function(i){
        //val[i] = $(this).is(':checked');
        code.items[i].checked = $(this).is(':checked');
      });
      console.log(code);
      new_push(code, global.ID);
    });
  }, 100);
};

global.show_info();
global.show_history();
regist_devices(global.refresh_info);
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
