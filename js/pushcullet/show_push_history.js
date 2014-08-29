var https = require('https');


//pushbullet showing push history

var xml_p = function(s){
  return s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');
};

var echo_of_copy = function(){return '; echo has copied to clipboard.';};
var echo_of_browser = function(){return '; echo has opened in browser.';};

var info_type = {
  note: {
    arg: function(p){return ("echo '"+p.body+"' | pbcopy"+echo_of_copy());},
    subtitle: "body",
  },
  link: {
    arg: function(p){return ("open '"+p.url+"'"+echo_of_browser());},
    subtitle: "url",
  },
  address: {
    arg: function(p){return ("open 'https://maps.google.com/?q="+p.address+"'"+echo_of_browser());},
    subtitle: "address",
  },
  list: {
    arg: function(p){return ("open 'https://www.pushbullet.com/pushes?push_iden="+p.iden+"'"+echo_of_browser());},
    subtitle: undefined,
  },
  picture: {
    arg: function(p){return ("open '"+p.file_url+"'"+echo_of_browser());},
    subtitle: "file_url",
  },
  file: {
    arg: function(p){return ("open '"+p.file_url+"'"+echo_of_browser());},
    subtitle: "file_url",
  },
};

(function print_list(j){
  console.log('<?xml version="1.0"?><items>');
  var pushes = j.pushes;
  for (var i in pushes){
    if (!pushes[i].active) {continue;}
    var tmp_string = [
      '<item uid="',
      xml_p(pushes[i].iden),
      '" arg="',
      xml_p(info_type[pushes[i].type].arg(pushes[i])),
      '" valid="yes"><title>',
      xml_p(pushes[i].title || pushes[i].type),
      '</title><subtitle>',
      xml_p(pushes[i][info_type[pushes[i].type].subtitle] || "View details on web"),
      '</subtitle>',
      '<icon>icons/',
      xml_p(pushes[i].type),
      '.png</icon>',
      '</item>'
    ];
    console.log(tmp_string.join(''));
  }
  console.log('</items>');
})(require(process.env.HOME+'/Library/Preferences/com.1ittlecup.pushcullet.history.json'));
