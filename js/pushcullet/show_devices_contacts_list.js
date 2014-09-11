var $ = require('jquery');
var info = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json');
module.exports = function(){

  var _out = [];

  _out.push(

    [
    '<div class="menber all">',
    '<h5>',
    'All',
    '</h5>',
    '<p>',
    'All of your pushes',
    '</p>',
    '</div>',
    '<div id="devices-bar">',
    '<hr/><p class="title">Devices</p><hr/>',
  ].join('')

  );

  //devices list.
  for (var i in info.devices){
    if (!info.devices[i].active){continue;}
    var device = [
      '<div class="menber ',
      info.devices[i].type,
      '" id="',
      info.devices[i].iden,
      '">',
      '<h5>',
      info.devices[i].nickname,
      '</h5>',
      '<p>',
      info.devices[i].manufacturer,
      ' ',
      info.devices[i].model,
      '</p>',
      '</div>',
    ];
    _out.push(device.join(''));
  }
  _out.push('</div>');

  _out.push('<div id="contacts-bar">');
  _out.push('<hr/><p class="title">Contacts</p><hr/>');

  //contacts list.
  for (var j in info.contacts){
    if (!info.contacts[j].active){continue;}
    var contact = [
      '<div class="menber ',
      'contacts',
      '" id="',
      info.contacts[j].email_normalized,
      '">',
      '<h5>',
      info.contacts[j].name,
      '</h5>',
      '<p>',
      info.contacts[j].email_normalized,
      '</p>',
      '</div>',
    ];
    _out.push(contact.join(''));
  }
  _out.push('</div>');

  return $("#menu-list").html(_out.join('').toString());
};
