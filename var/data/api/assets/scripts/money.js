(function (global) {
	'use strict';

	function MoneyFunction() {
	};

	MoneyFunction.decimalPoint = '.';
	MoneyFunction.moneySymbol = '$';
	MoneyFunction.symbolPosition = 'before';
	MoneyFunction.groupingSeparator = ',';
	MoneyFunction.groupingSize = 3;

	MoneyFunction.setRegionalSettings = function(settings) {
		MoneyFunction.decimalPoint = settings.decimalPoint;
		MoneyFunction.moneySymbol = settings.moneySymbol;
		MoneyFunction.symbolPosition = settings.symbolPosition;
		MoneyFunction.groupingSeparator = settings.groupingSeparator;
		MoneyFunction.groupingSize = settings.groupingSize;
	}

	global.MoneyFunction = MoneyFunction;

}(this));
