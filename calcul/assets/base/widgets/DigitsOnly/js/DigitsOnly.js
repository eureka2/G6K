(function (global) {
	"use strict";

	var allowedKeys = [8, 9, 27, 35, 36, 37, 39, 40, 46, 48, 49, 50, 51,52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

	function DigitsOnly(input, options, onComplete) {
		var g6k = input.data('g6k');

		input.on("keydown", function(event) {
			var key = event.which || event.keyCode;
			if (allowedKeys.indexOf(key) < 0) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		input.on('blur', function(e) {
			if (input.val() != '') {
				if (! /\d+/.test(input.val())) {
					setError(Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("numbers only") }, 'messages'));
				}
			}
		});

		function setError(error) {
			g6k.setError(input.attr('name'), Translator.trans(error));
		}

		if (input.val() != '') {
			if (! /\d+/.test(input.val())) {
				setError(Translator.trans("This value is not in the expected format (%format%)",  { "format": Translator.trans("numbers only") }, 'messages'));
			}
		}
	}

	global.DigitsOnly = DigitsOnly;
}(this));