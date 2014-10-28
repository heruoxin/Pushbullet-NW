if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;

$(window).keydown(function(event){
  console.log(event.which);
  switch (event.which) {
    case 188: // setting
      global.open_setting();
    break;
  }
});
//$("input").keydown(function(event){
//  $("div").html("Key: " + event.which);
//});
