(function (global) {
	"use strict";
		
	function abDatepicker (input, options, onComplete) {
		var dateOptions = {
			weekDayFormat: 'narrow',
			inputFormat: options.dateFormat,
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

	global.abDatepicker = abDatepicker;
}(this));