if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;



module.exports = function(cb){

  try {
    var info = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json');
  } catch (e) {
    console.error(e);
    return;
  }
  var _out = [];

  _out.push(

    [
    '<div class="menber">',
    '<img src="./icons/undefined.png"/>',
    '<div class="detail">',
    '<h5>',
    'All',
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
      function(){
        if (info.devices[i].type !== 'stream'){
          return info.devices[i].type;
        }
        if (info.devices[i].model.indexOf('OS X') >= 0){
          return 'apple';
        }
      }(),
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
      info.contacts[j].email_normalized,
      '">',
      '<img src="./icons/contacts.png"/>',
      '<div class="detail">',
      '<h5>',
      info.contacts[j].name,
      '</h5>',
      '<p>',
      info.contacts[j].email_normalized,
      '</p>',
      '</div>',
      '</div>',
    ];
    _out.push(contact.join(''));
  }

  $("#menu-list").html(_out.join('').toString());
  if (typeof cb === "function") cb();
};
