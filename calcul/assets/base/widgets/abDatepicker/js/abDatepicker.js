(function (global) {
	"use strict";
		
	function abDatepicker (input, options, onComplete) {
		input.datepicker({
			weekDayFormat: 'narrow',
			inputFormat: options.dateFormat,
			theme: 'default',
			onUpdate: function (value) {
				onComplete(value, value);
			}
		});
 	}

	global.abDatepicker = abDatepicker;
}(this));