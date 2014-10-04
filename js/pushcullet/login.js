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

  '<p>Copy your <a class="openweb" href="https://www.pushbullet.com/account">Token</a> and Paste here:</p>',
  '<form id="savetoken" action="">',
  '<input type="text" class="tokenbox" name="token" />',
  '<input type="submit" value="Save" />',
  '</form>',
  '<p class="login-info"></p>',

  '          </div>',
  '          </div>',
  '        </div>',
  //  '        <div class="card-control">',
  //  '            <a class="control open">Refresh</a>',
  //  '            <a class="control delete">Delete</a>',
  //  '        </div>',
  '      </div>',
].join('');

$("#push-list").html(login_card);

$('#push-list').ready(function(){
  $('.openweb').click(function(){
    exec('open https://www.pushbullet.com/account', function(err, stdout, stderr){
    });
    return false;
  });
  $('form#savetoken').submit(function(e){
    $('.card-logo').html('<img src="img/loading.gif" />');
    var token = $('.tokenbox').val();
    console.log('token',token);
    global.refresh_info(token, function(status, info){
      $('.content-title:first').html(info);
      console.log(status, info);
      if (status) {
        $('.content-main:first').html("Loading pushes...");
        global.refresh_history();
      } else {
        $('.card-logo:first').html('<img src="icons/error.png" />');
      }
    });
    return false;
  });
});
