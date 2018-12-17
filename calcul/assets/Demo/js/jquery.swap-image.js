(function($) {
  'use strict';

    /* au survol ou focus d'une certaine classe', on cherche l'image et on remplace la source */

    // définition du plugin jQuery
    $.fn.swapImage = function(options) {

    function swapImg(e) {

        var that = (this.tagName == "A" || this.tagName == "BUTTON") ? $(this).children("img") : $(this);

        if (that.attr("src").match("-off")) {
          that.attr("src", that.attr("src").replace("-off", "-on"));
        } else {
          that.attr("src", that.attr("src").replace("-on", "-off"));
        }

    };

    function elemWrapper(that){

      // Ajout d'un listener d'événement hover au passage de la souris sur l'image
      that.hover(swapImg, swapImg);
      // Ajout d'un listener d'événement à la prise et à la sortie du focus sur le lien de l'image
      that.focusin(swapImg);
      that.focusout(swapImg);

    }

    for (var i = 0; i <= this.length-1; i++) {
      var that = $(this[i]);
      elemWrapper(that);
    };

  };
})(jQuery);

$('.btn-swap').swapImage();
