(function (global) {
	"use strict";
		
	function abListbox (input, options, onComplete) {
		input.listbox({
			onSelected: function (value, text) {
				onComplete(value, text);
			}
		});
 	}

	global.abListbox = abListbox;
}(this));