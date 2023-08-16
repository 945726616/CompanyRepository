/* eslint-disable */
let jNice = function ($) {
    $.fn.jNice = function (options) {
        /***************************
          Check Boxes
         ***************************/
        $('input:checkbox', this).each(function () {
            if ($(this).hasClass('jNiceHidden')) {
                if (this.checked) { $('a.jNiceCheckbox', $(this).parent()).addClass('jNiceChecked'); }
                else { $('a.jNiceCheckbox', $(this).parent()).removeClass('jNiceChecked'); }
                return;
            }
            $(this).addClass('jNiceHidden').wrap('<span></span>');
            var $wrapper = $(this).parent();
            $wrapper.prepend('<a href="#" class="jNiceCheckbox"></a>');
            /* Click Handler */
            $($(this).siblings('a.jNiceCheckbox')).bind("click", function () {
                var $a = $(this);
                var input = $a.siblings('input')[0];
                if (input.checked === true) {
                    input.checked = false;
                    $a.removeClass('jNiceChecked');
                }
                else {
                    input.checked = true;
                    $a.addClass('jNiceChecked');
                }

                if (options && options.callback)
                    options.callback();
                return false;
            });
            /* set the default state */
            if (this.checked) { $('a.jNiceCheckbox', $wrapper).addClass('jNiceChecked'); }
        });

        /***************************
          Radios
         ***************************/
        $('input:radio', this).each(function () {
            if ($(this).hasClass('jNiceHidden'))
                return;
            $input = $(this);
            $input.addClass('jNiceHidden').wrap('<span class="jRadioWrapper"></span>');
            var $wrapper = $input.parent();
            $wrapper.prepend('<a href="#" class="jNiceRadio" rel="' + this.name + '"></a>');
            /* Click Handler
            $('a.jNiceRadio', $wrapper).click(function(){
                var $a = $(this);
                $a.siblings('input')[0].checked = true;
                $a.addClass('jNiceChecked');
                // uncheck all others of same name
                $('a[rel="'+ $a.attr('rel') +'"]').not($a).each(function(){
                    $(this).removeClass('jNiceChecked').siblings('input')[0].checked=false;
                });
                return false;
            }); */
            /* set the default state */
            if (this.checked) { $('a.jNiceRadio', $wrapper).addClass('jNiceChecked'); }
        });
    };
    /* Automatically apply to any forms with class jNice */
}

export default jNice
