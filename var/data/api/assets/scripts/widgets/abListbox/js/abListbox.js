(function (global) {
	"use strict";

	function abListbox (input, options, onComplete) {
		if (/^bootstrap/.test(options.theme)) {
			if (typeof input === "object" && input && input["jquery"]) {
				input = input[0];
			}
			new Listbox(input, {
				theme: options.theme,
				onSelected: function (value, text) {
					onComplete(value, text);
				}
			});
		}
 	}

	global.abListbox = abListbox;
}(this));