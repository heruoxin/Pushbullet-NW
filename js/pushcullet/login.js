var $ = require('jquery');
var exec = require('child_process').exec;

var login_card = [
  '          <div class="push-card">',
  '        <div class="card-main">',
  '          <div class="card-logo">',
  '            <img src="icons/error.png" />',
  '          </div>',
  '          <div class="card-content">',
  '            <h2 class="content-title">',
  'Please Login',
  '            </h2>',
  '            <hr class="card-hr-horizonal" />',
  '            <div class="content-main">',

  '<p>Copy <a id="openweb" href="https://www.pushbullet.com/account">Token</a>. Paste here:</p>',
  '<form action="">',
  '<input type="text" id="tokenbox" name="token" />',
  '</form>',
  '<p class="login-info"></p>',

  '          </div>',
  '          </div>',
  '        </div>',
  '        <div class="card-control">',
  '            <a class="control open" id="loginsave">Save</a>',
  '        </div>',
  '      </div>',
].join('');

$("#push-list").html(login_card);

global.PUSH_NUMBERS = 0;
global.ADD_PUSH_NUMBERS = function(){
  global.PUSH_NUMBERS += 1;
  $('.card-logo').html('<h1>'+global.PUSH_NUMBERS+'</h1>');
};

$('#push-list').ready(function(){
  $('#openweb').click(function(){
    exec('open https://www.pushbullet.com/account', function(err, stdout, stderr){
    });
    return false;
  });
  $('#loginsave').click(function(){
    $('.card-logo').html('<img src="img/loading.gif" />');
    var token = $('#tokenbox').val();
    console.log('token',token);
    $('.card-control').css('display', 'none');
    global.refresh_info(token, function(status, info){
      $('.content-title:first').html(info);
      console.log(status, info);
      if (status) {
        $('.content-main:first').html("Loading pushes...");
        global.refresh_history(2592000);
      } else {
        $('.card-control').css('display', 'block');
        $('.content-title:first').html("Login error");
        $('.card-logo:first').html('<img src="icons/error.png" />');
      }
    });
    return false;
  });
});
