if (!global.hasOwnProperty("$")){
  global.$ = require('jquery');
}
var $ = global.$;


exports.disable_drag_in = function(selector){
  $(function(){
    //阻止浏览器默认行。
    $(selector).on({
      dragleave:function(e){    //拖离
        e.preventDefault();
      },
      drop:function(e){  //拖后放
        e.preventDefault();
      },
      dragenter:function(e){    //拖进
        e.preventDefault();
      },
      dragover:function(e){    //拖来拖去
        e.preventDefault();
      },
    });
  });
};

exports.get_file_path = function(selector){
  $(selector).on("drop", function(e){
    e.preventDefault();
    e.stopPropagation();
    global.UPLOAD_FILE = e.originalEvent.dataTransfer.files[0];
    $('.bodybox.file h5').html(global.UPLOAD_FILE.name);
  });
};
