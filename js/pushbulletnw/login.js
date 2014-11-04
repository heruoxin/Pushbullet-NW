var fs = require('fs');
if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;


global.ADD_PUSH_NUMBERS = function(){
  if (!global.LOGIN) {
    global.PUSH_NUMBERS += 1;
    $('.add-push-numbers').html(global.PUSH_NUMBERS);
  }
};
var form_action = function(){
  $('.card-logo.login').html('<img src="img/loading.gif" />');
  var token = $('#tokenbox').val();
  console.log('token',token);
  $('.control.expand').addClass('loading');
  $('.control.expand').html('<p>Saving...</p>');
  global.refresh_info(token, undefined, function(status, info){
    $('.content-title.login').html(info);
    console.log(status, info);
    if (status) {
      $('.content-body.login').html('Loading <div class="add-push-numbers">pushes</div>...');
      $('.control.expand').html('<p>Please wait...</p>');
      global.refresh_history();
      global.restart_ws();
    } else {
      $('.card-control').css('display', 'block');
      $('.content-title.login').html("Login error");
      $('.card-logo.login').html('<img src="icons/error.png" />');
      $('.control.expand').removeClass('loading');
      $('.control.expand').html('<p>Save</p>');
    }
  });
  return false;
};

module.exports = function(){
  var login_card = fs.readFileSync(global.CWD + "/html/login.html", {encoding: 'utf8'});
  $("#push-list").append(login_card);

  global.PUSH_NUMBERS = 0;
  setTimeout(function(){
    $('#loginsave').click(form_action);
    $('#loginform').submit(form_action);
  }, 1000);
};
