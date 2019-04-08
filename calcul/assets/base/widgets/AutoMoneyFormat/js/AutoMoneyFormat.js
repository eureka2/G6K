(function (global) {
	"use strict";

	function AutoMoneyFormat (input, options, onComplete) {
		input.css('text-align', 'right');
	// https://github.com/autoNumeric/autoNumeric/
		var autoNum = new AutoNumeric(input[0], {
			currencySymbol: '',
			currencySymbolPlacement: options.symbolPosition == 'before' ? 'p' : 's',
			decimalCharacter: options.decimalPoint,
			digitGroupSeparator: options.groupingSeparator,
			digitalGroupSpacing: options.groupingSize,
			formulaMode: true
		});
		if (! input[0].hasAttribute('autocomplete') || input[0].getAttribute('autocomplete') !== 'off') {
			input[0].addEventListener("input", function(event) {
				if (this.value.length > 0 && autoNum.getNumericString().length == 0) {
					autoNum.set(this.value);
				}
			}, false);
		}
		input[0].addEventListener("autoNumeric:rawValueModified", function(event) {
			onComplete(event.detail.newRawValue, event.detail.newValue, true, true);
		}, true);
	}

	global.AutoMoneyFormat = AutoMoneyFormat;
}(this));