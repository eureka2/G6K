(function (global) {
	"use strict";

	function abCoupledDatepicker (input, options, onComplete) {
		var input2 = coupledDatepicker(input);
		if (input2 !== false) {
			input2.datepicker('previous', input);
			var dateOptions = {
				weekDayFormat: 'narrow',
				inputFormat: options.dateFormat,
				next: input2,
				theme: 'default',
				onUpdate: function (value) {
					onComplete(value, value);
				}
			};
			var g6k = input.data('g6k');
			if (input[0].hasAttribute('data-min')) {
				var min = g6k.evaluate(input.attr('data-min'));
				if (min !== false) {
					dateOptions.min = min;
				}
			}
			if (input[0].hasAttribute('data-max')) {
				var max = g6k.evaluate(input.attr('data-max'));
				if (max !== false) {
					dateOptions.max = max;
				}
			}
			input.datepicker(dateOptions);
			input.on('input propertychange', function(event) {
				g6k.triggerChange($(this), true, true);
			});
		}
	}

	function coupledDatepicker(input) {
		var fields = input.closest('form').find('input.date[data-widget]');
		var index = fields.index( input[0] );
		if ( index > -1 && ( index + 1 ) < fields.length && fields.eq( index + 1 ).attr('data-widget') == 'abDatepicker' ) {
			return fields.eq( index + 1 );
		}
		return false;
	}

	global.abCoupledDatepicker = abCoupledDatepicker;
}(this));