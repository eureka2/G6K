(function (global) {
	"use strict";

	function SquareRadioButton (input, options, onComplete) {
		input.closest('.field-container').addClass('SquareRadioButton-field');
	}

	global.SquareRadioButton = SquareRadioButton;
}(this));
