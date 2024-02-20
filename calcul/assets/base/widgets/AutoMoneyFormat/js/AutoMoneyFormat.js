(function (global) {
	"use strict";

	function AutoMoneyFormat (input, options, onComplete) {
		if (typeof input === "object" && input && input["jquery"]) {
			input = input[0];
		}
		input.style.textAlign = 'right';
	// https://github.com/autoNumeric/autoNumeric/
		var autoNum = new AutoNumeric(input, {
			currencySymbol: '',
			currencySymbolPlacement: options.symbolPosition == 'before' ? 'p' : 's',
			decimalCharacter: options.decimalPoint,
			digitGroupSeparator: options.groupingSeparator,
			digitalGroupSpacing: options.groupingSize,
			formulaMode: true
		});
		if (! input.hasAttribute('autocomplete') || input.getAttribute('autocomplete') !== 'off') {
			input.addEventListener("input", function(event) {
				if (this.value.length > 0 && autoNum.getNumericString().length == 0) {
					autoNum.set(this.value);
				}
			}, false);
		}
		input.addEventListener("autoNumeric:rawValueModified", function(event) {
			onComplete(event.detail.newRawValue, event.detail.newValue, true, true);
		}, true);
	}

	global.AutoMoneyFormat = AutoMoneyFormat;
}(this));