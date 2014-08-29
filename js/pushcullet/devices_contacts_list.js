module.exports = function(){
  var info = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.info.json');

  var _out = [];

  _out.push('<div id="devices-bar">');
  _out.push('<hr/><h4 class="title">Devices</h4><hr/>');

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
  _out.push('<hr/><h4 class="title">Contacts</h4><hr/>');

  //contacts list.
  for (var j in info.contacts){
    if (!info.contacts[j].active){continue;}
    var contact = [
      '<div class="menber ',
      'contacts',
      '" id="',
      info.contacts[j].iden,
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

  return _out.join('').toString();
};
