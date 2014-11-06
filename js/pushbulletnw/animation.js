var $ = global.$;

exports.fadein = function(id){
  $(id).removeClass('fadein');
  $(id).addClass('fadein');
  setTimeout(function(){
    $(id).removeClass('fadein');
  }, 400);
};

