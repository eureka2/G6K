(function (global) {
	"use strict";
		
	function abListbox (input, onComplete) {
		input.listbox({
			onSelected: function (value, text) {
				onComplete(value, text);
			}
		});
 	}

	global.abListbox = abListbox;
}(this));