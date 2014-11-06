var $ = global.$;

$(window).keydown(function(event){
  //cmd = 91
  //console.log(event.which);
  switch (event.which) {
    case 188: //cmd+, setting
      global.open_setting();
    break;
    case 78: //cmd+n add new card
    case 84: //cmd+t add new card
      global.add_new_push();
    break;
    case 73: //cmd+opt+i show dev tools
      global.show_dev_tools();
    break;
    case 27: //esc cancel push
      global.cancel_push();
    break;
  }
});
