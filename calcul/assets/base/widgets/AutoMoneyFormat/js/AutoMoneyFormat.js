(function (global) {
	"use strict";

	function AutoMoneyFormat (input, options, onComplete) {
		input.css('text-align', 'right');
	// https://github.com/autoNumeric/autoNumeric/
		new AutoNumeric(input[0], {
			currencySymbol: '',
			currencySymbolPlacement: options.symbolPosition == 'before' ? 'p' : 's',
			decimalCharacter: options.decimalPoint,
			digitGroupSeparator: options.thousandsSeparator
		});
		input[0].addEventListener("autoNumeric:formatted", function(event) {
			onComplete(event.detail.newRawValue, event.detail.newValue, true);
		}, true);
	}

	global.AutoMoneyFormat = AutoMoneyFormat;
}(this));