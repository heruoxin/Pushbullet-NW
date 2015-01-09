var fs = require('fs');
var $ = global.$;

//pushbullet showing push history

var xml_p = function(s){
  if (s) {
    return String(s)
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
    title: function(p){return xml_p(p.title || p.file_name || p.name || p.type) || "";},
    usage: "Copyed to Clipboard.",
    arg: function(p){return ("echo '"+p.body+"' | pbcopy");},
    type: function(q) {return "note";},
    subtitle: function(s){return ('<p>'+xml_p(s.body).replace('\n', '</p><p>')+'</p>');},
  },
  link: {
    title: function(p){return xml_p(p.title || p.file_name || p.name || p.type) || "";},
    arg: function(p){
      return ("open '"+p.url+"'");
    },
    type: function(q) {return "link";},
    subtitle: function(s){
      var message = "";
      if (s.body) {
        message = '<p>'+xml_p(s.body).replace('\n', '</p><p>')+'</p>';
      }
      return (message + '<a href="'+xml_p(s.url)+'">'+xml_p(s.url)+'</a>');
    },
  },
  address: {
    title: function(p){return xml_p(p.title || p.file_name || p.name || p.type) || "";},
    arg: function(p){return ("open 'https://maps.apple.com/?q="+xml_p(p.address)+"'");},
    type: function(q) {return "address";},
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
    title: function(p){return xml_p(p.title || p.file_name || p.name || p.type) || "";},
    arg: function(p){return ("open 'https://www.pushbullet.com/pushes?push_iden="+p.iden+"'");},
    type: function(q) {return "list";},
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
    title: function(p){return xml_p(p.title || p.file_name || p.name || p.type) || "";},
    arg: function(p){return ("open '"+xml_p(p.file_url)+"'");},
    type: function(q) {
      if (q.file_type.indexOf("image") >= 0) {
        return "picture";
      } else {
        return "file";
      }
    },
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
        return ('<div class="file-box"><a href="'+s.file_url+'">'+s.file_name+'</a></div>');
      }
    },
  },
};

module.exports = function (ids){
  var _out = [];
  var pushes = JSON.parse( fs.readFileSync(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushbulletnw.history.json', {encoding: 'utf8'}) );
  var pushes_index = [];
  for (var items in pushes){
    pushes_index.push(items);
  }
  pushes_index.sort();
  for (var index in pushes_index){
    var i = pushes_index[index];
    if (!pushes[i].active) {continue;}
    if (pushes[i].hasOwnProperty('url') && pushes[i].url.indexOf('http') === -1){
      pushes[i].url = 'http://'+pushes[i].url;
    }
    if (ids){
      var the_id = pushes[i].target_device_iden;
      var the_channel_iden = pushes[i].channel_iden;
      var the_email;
      try {
      the_email = pushes[i].receiver_email_normalized.replace(".", "DoTDoTDoT").replace("@", "AtAtAt");
      } catch (e) {}
      if (the_id !== ids && the_email !== ids && the_channel_iden !== ids) {continue;}
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
      '<div class="waves-effect waves-block">',
      '<div class="push-card" id="',
      pushes[i].iden,
      '" code="',
      xml_p(JSON.stringify(pushes[i])),
      '">',
      '<div class="card-main">',
      '<div class="card-logo">',
      '<img src="icons/',
      info_type[pushes[i].type].type(pushes[i]),
      '.png" />',
      '</div>',
      '<div class="card-content">',
      '<h2 class="content-title">',
      info_type[pushes[i].type].title(pushes[i]),
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
      '</div>',
    ];
    _out.push(tmp_string.join(''));
  }
  if (_out.length === 0){ //#push-list is empty
    _out.push('<div class="center">No pushes</div>');
  } else { //height fix
    _out.push('<div style="height: 22px"></div>');
  }
  $("#push-list").html(_out.join(''));
  return window.Waves.displayEffect();
};
