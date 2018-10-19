(function (global) {
	"use strict";
		
	function abDatepicker (input, onComplete) {
		input.datepicker({
			weekDayFormat: 'narrow',
			inputFormat: 'd/M/y',
			theme: 'default',
			onUpdate: function (value) {
				onComplete(value, value);
			}
		});
 	}

	global.abDatepicker = abDatepicker;
}(this));