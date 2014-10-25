var fs = require('fs');
if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;

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
  return "&nbsp";
};

var info_type = {
  note: {
    usage: "Copyed to Clipboard.",
    arg: function(p){return ("echo '"+p.body+"' | pbcopy");},
    subtitle: function(s){return ('<p>'+xml_p(s.body).replace('\n', '</p><p>')+'</p>');},
  },
  link: {
    arg: function(p){return ("open '"+p.url+"'");},
    subtitle: function(s){
      var message = "";
      if (s.body) {
        message = '<p>'+xml_p(s.body).replace('\n', '</p><p>')+'</p>';
      }
      return (message + '<a href="'+xml_p(s.url)+'">'+xml_p(s.url)+'</a>');
    },
  },
  address: {
    arg: function(p){return ("open 'https://maps.apple.com/?q="+xml_p(p.address)+"'");},
    subtitle: function(s){
      var message = "";
      if (s.body) {
        message = '<p>'+xml_p(s.body).replace('\n', '</p><p>')+'</p>';
      }
      return ([
        message,
        '<img src="http://maps.googleapis.com/maps/api/staticmap?center=',
        xml_p(s.address),
        '&zoom=12&size=300x240" />',
      ].join(''));
    },
  },
  list: {
    arg: function(p){return ("open 'https://www.pushbullet.com/pushes?push_iden="+p.iden+"'");},
    subtitle: function(s){
      var message = "";
      if (s.body) {
        message = '<p>'+xml_p(s.body).replace('\n', '</p><p>')+'</p>';
      }
      var lists = message+"";
      for (var i in s.items) {
        var checked = "";
        if (s.items[i].checked) checked = "checked";
        lists += '<div class="list-items">'+'<p>'+s.items[i].text+'</p>'+'<input type="checkbox" '+checked+' />'+'</div>';
      }
      return lists;
    },
  },
  file: {
    arg: function(p){return ("open '"+xml_p(p.file_url)+"'");},
    subtitle: function(s){
      var message = "";
      if (s.body) {
        message = '<p>'+xml_p(s.body).replace('\n', '</p><p>')+'</p>';
      }
      if (s.file_type.indexOf("image") >= 0) {
        //for image
        return ([
          message,
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
  var pushes = JSON.parse( fs.readFileSync(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.history.json', {encoding: 'utf8'}) );
  var pushes_index = [];
  for (var items in pushes){
    pushes_index.push(items);
  }
  pushes_index.sort();
  for (var index in pushes_index){
    var i = pushes_index[index];
    if (!pushes[i].active) {continue;}
    if (ids){
      var the_id = pushes[i].target_device_iden;
      var the_email = pushes[i].receiver_email_normalized.replace(".", "DoTDoTDoT").replace("@", "AtAtAt");
      if (the_id !== ids && the_email !== ids) {continue;}
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
      '<div class="push-card" id="',
      pushes[i].iden,
      '" code="',
      xml_p(JSON.stringify(pushes[i])),
      '">',
      '<div class="card-main">',
      '<div class="card-logo">',
      '<img src="icons/',
      xml_p(pushes[i].type),
      '.png" />',
      '</div>',
      '<div class="card-content">',
      '<h2 class="content-title">',
      xml_p(pushes[i].title || pushes[i].file_name || pushes[i].name || pushes[i].type) || "",
      '</h2>',
      '<div class="content-body">',
      info_type[pushes[i].type].subtitle(pushes[i]),
      '</div>',
      '</div>',
      '</div>',
      '<div class="card-control">',
      '<a href="#" class="control open"',
      ' arg="',
      xml_p(info_type[pushes[i].type].arg(pushes[i])),
      '" id="',
      pushes[i].iden + 'open',
      '" type="',
      pushes[i].type,
      '" usage="',
      (info_type[pushes[i].type].usage || "Opened"),
      '" info="',
      xml_p(pushes[i].body || pushes[i].title || pushes[i].url || pushes[i].file_name || pushes[i].name || pushes[i].type),
      '" created="',
      pushes[i].created,
      '" other="',
      '">Open</a>',
      '<a href="#" class="control delete" id="',
      pushes[i].iden+'delete',
      '" created="',
      pushes[i].created,
      '">Delete</a>',
      '</div>',
      '</div>',
    ];
    _out.push(tmp_string.join(''));
  }
  _out.push('</items>');
  _out.push('<div style="height: 24px"></div>');
  _out.push('');
  return $("#push-list").html(_out.join(''));
};
