if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;

$(window).keydown(function(event){
  console.log(event.which);
  //cmd = 91
  switch (event.which) {
    case 188: //cmd+, setting
      global.open_setting();
    break;
    case 78: //cmd+n add new card
    case 84: //cmd+t add new card
      global.add_new_push();
    break;
  }
});
