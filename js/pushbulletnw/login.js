if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;

var login_card = [
  '          <div class="push-card">',
  '        <div class="card-main">',
  '          <div class="card-logo login">',
//  '            <img src="icons/error.png" />',
  '          </div>',
  '          <div class="card-content">',
  '            <h2 class="content-title login">',
  'Login',
  '            </h2>',
  '            <div class="content-body login">',

  '<p>Copy Token <a href="https://www.pushbullet.com/account">from this link</a> and Paste here:</p>',
  '<p style="color: white;font-size: 5px;height: 5px;"> _(:3 」∠)_ </p>',
  '<form id="loginform" action="">',
  '<input type="text" id="tokenbox" name="token" />',
  '</form>',
  '<p class="login-info"></p>',

  '          </div>',
  '          </div>',
  '        </div>',
  '        <div class="card-control">',
  '            <a class="control expand" id="loginsave">Save</a>',
  '        </div>',
  '      </div>',
].join('');

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
  $("#push-list").append(login_card);

  global.PUSH_NUMBERS = 0;
  setTimeout(function(){
    $('#loginsave').click(form_action);
    $('#loginform').submit(form_action);
  }, 1000);
};
