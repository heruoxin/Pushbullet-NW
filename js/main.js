var show_menu_bar_list = require('./js/pushcullet/show_devices_contacts_list');
var show_push_history = require('./js/pushcullet/show_push_history');
var gui = require('nw.gui');

var mb = new gui.Menu({type:"menubar"});
mb.createMacBuiltin("your-app-name");
gui.Window.get().menu = mb;

$("#menu-bar").html(show_menu_bar_list());
$("#push-list").html(show_push_history());

