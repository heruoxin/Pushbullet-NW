var fs = require('fs');
var crypto = require('crypto');
if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;

var check_type = function(obj){
  if (obj.model.indexOf('OS X') >= 0){
    return 'mac';
  }
  return obj.type;
};

var md5 = function(text){
  return crypto.createHash('md5').update(String(text)).digest('hex');
};

module.exports = function(cb){

  var info = JSON.parse( fs.readFileSync(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json', {encoding: 'utf8'}) );
  var _out = [];

  _out.push(

    [
    '<div class="menber" id="everypush">',
    '<img src="./icons/everything.png"/>',
    '<img class="hide" src="./icons/green-menu-bar/everything.png"/>',
    '<div class="detail">',
    '<h5>',
    'Everything',
    '</h5>',
    '<p>',
    'All of your pushes',
    '</p>',
    '</div>',
    '</div>',
    //   '<hr/><p class="title">Devices</p><hr/>',
    '<hr>',
  ].join('')

  );

  //devices list.
  for (var i in info.devices){
    if (!info.devices[i].active){continue;}
    var device = [
      '<div class="menber ',
      '" id="',
      info.devices[i].iden,
      '">',
      '<img src="./icons/',
      check_type(info.devices[i]),
      '.png"/>',
      '<img class="hide" src="./icons/green-menu-bar/',
      check_type(info.devices[i]),
      '.png"/>',
      '<div class="detail">',
      '<h5>',
      info.devices[i].nickname,
      '</h5>',
      '<p>',
      info.devices[i].manufacturer,
      ' ',
      info.devices[i].model,
      '</p>',
      '</div>',
      '</div>',
    ];
    _out.push(device.join(''));
  }

  //  _out.push('<hr/><p class="title">Contacts</p><hr/>');
  _out.push('<hr/>');

  //contacts list.
  for (var j in info.contacts){
    if (!info.contacts[j].active){continue;}
    var contact = [
      '<div class="menber ',
      '" id="',
      info.contacts[j].email_normalized.replace(".", "DoTDoTDoT").replace("@", "AtAtAt"),
      '">',
      '<img src="./icons/contacts.png"/>',
      //Gravatar
      '<img class="hide" src="https://cdn.v2ex.com/gravatar/',
      md5(info.contacts[j].email_normalized),
      '.png?s=150&d=https%3A%2F%2Fraw.githubusercontent.com%2Fheruoxin%2FPushbullet-NW%2Fmaster%2Ficons%2Fgreen-menu-bar%2Fcontacts.png" />',
      //
      '<div class="detail">',
      '<h5>',
      info.contacts[j].name,
      '</h5>',
      '<p>',
      info.contacts[j].email_normalized.replace("@", "<wbr>"+"@"),
      '</p>',
      '</div>',
      '</div>',
    ];
    _out.push(contact.join(''));
  }

  $("#menu-list").html(_out.join('').toString());
  if (typeof cb === "function") cb();
};
