var gui = global.gui;

var clipboard = gui.Clipboard.get();

exports.set = function(text) {
  clipboard.set(text.toString(), 'text');
};

exports.get = function() {
  return clipboard.get('text');
};

exports.onChange = function(cb) {
  var text = "";
  setInterval(function(){
    if (text !== clipboard.get('text')) {
      text = clipboard.get('text');
      cb(text);
    }
  }, 3000);

};
