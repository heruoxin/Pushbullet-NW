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
  '<form class="savetoken" method="get">',
  '<input type="text" class="tokenbox" name="token" />',
  '<img class="loadinggif" src="../img/loading.gif" style="display:none"/>',
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

$("#push-list").append(login_card);

$('.openweb').on('click', function(){
  exec('open https://www.pushbullet.com/account', function(err, stdout, stderr){
  });
  return false;
});
$('.savetoken').submit(function(e){
  $('.loadinggif').css("display", "inline");
  var token = $('.tokenbox').val();
  console.log('token',token);
  global.refresh_info(token, function(status, info){
    $('.loadinggif').css("display", "none");
    $('.logininfo').html(info);
    console.log(status, info);
    if (status) {
      global.refresh_history(604800);
    }
  });
  return false;
});
