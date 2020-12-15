(function (global) {
	"use strict";

	function SquareRadioButton (input, options, onComplete) {
		if (typeof input === "object" && input && input["jquery"]) {
			input = input[0];
		}
		input.closest('.field-container').classList.add('SquareRadioButton-field');
	}

	global.SquareRadioButton = SquareRadioButton;
}(this));
