
//pushbullet showing push history

var xml_p = function(s){
  if (s) {
    return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
  }
};


var info_type = {
  note: {
    usage: "Copyed to Clipboard.",
    arg: function(p){return ("echo '"+p.body+"' | pbcopy");},
    subtitle: function(s){return ('<p>'+xml_p(s.body)+'</p>');},
  },
  link: {
    arg: function(p){return ("open '"+p.url+"'");},
    subtitle: function(s){return ('<a href="'+xml_p(s.url)+'">'+s.title+'</a>');},
  },
  address: {
    arg: function(p){return ("open 'https://maps.apple.com/?q="+p.address+"'");},
    subtitle: function(s){return ([
      '<div class="google-maps">',
      '<iframe src="https://www.google.com/maps/embed?q="',
      xml_p(s.address),
      '" width="400" height="120" frameborder="0" style="border:0"></iframe>',
      '</div>',
    ].join(''));},
  },
  list: {
    arg: function(p){return ("open 'https://www.pushbullet.com/pushes?push_iden="+p.iden+"'");},
    subtitle: function(s){return (undefined);},
  },
  file: {
    arg: function(p){return ("open '"+p.file_url+"'");},
    subtitle: function(s){
      if (s.file_type.indexOf("image") >= 0) {
        //for image
        return ([
          '<img src="',
          s.file_url,
          '"/>',
        ].join(''));
      } else {
        //for other file
        return ('<a href="'+s.file_url+'">'+'View '+s.file_name+' on web'+'</a>');
      }
    },
  },
};

module.exports = function (ids){
  var _out = [];
  var pushes = require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.history.json');
  for (var i in pushes){
    if (!pushes[i].active) {continue;}
    if (ids){
      if (pushes[i].target_device_iden !== ids && pushes[i].receiver_email_normalized !== ids) {continue;}
    }
    //    var tmp_string = [
    //      '<item uid="',
    //      xml_p(pushes[i].iden),
    //      '" arg="',
    //      xml_p(info_type[pushes[i].type].arg(pushes[i])),
    //      '" valid="yes"><title>',
    //      xml_p(pushes[i].title || pushes[i].type),
    //      '</title><subtitle>',
    //      xml_p(pushes[i][info_type[pushes[i].type].subtitle] || "View details on web"),
    //      '</subtitle>',
    //      '<icon>icons/',
    //      xml_p(pushes[i].type),
    //      '.png</icon>',
    //      '</item>'
    //    ];
    var tmp_string = [
      '<div class="push-card">',
      '<div class="card-left">',
      '<div class="card-logo">',
      '<img src="icons/',
      xml_p(pushes[i].type),
      '.png" />',
      '</div>',
      '<div class="card-content">',
      '<h2 class="content-title">',
      xml_p(pushes[i].title || pushes[i].file_name || pushes[i].name || pushes[i].type),
      '</h2>',
      '<hr class="card-hr-horizonal" />',
      info_type[pushes[i].type].subtitle(pushes[i]),
      '</div>',
      '</div>',
      '<div class="card-right">',
      '<div class="card-control">',
      '<span class="control open"',
      ' arg="',
      xml_p(info_type[pushes[i].type].arg(pushes[i])),
      '" id="',
      pushes[i].iden,
      '" type="',
      pushes[i].type,
      '" usage="',
      (info_type[pushes[i].type].usage || "Opened"),
      '" info="',
      xml_p(pushes[i].title || pushes[i].file_name || pushes[i].name || pushes[i].type),
      '" other="',
      '">Open</span>',
      '<hr class="card-hr-horizonal" />',
      '<span class="control delete">Delete</span>',
      '</div>',
      '</div>',
      '</div>',
    ];
    _out.push(tmp_string.join(''));
  }
  _out.push('</items>');
  return _out.join('');
};
