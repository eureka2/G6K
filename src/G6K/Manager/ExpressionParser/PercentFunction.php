<?php

/*
The MIT License (MIT)

Copyright (c) 2019 Jacques Archimède

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

namespace App\G6K\Manager\ExpressionParser;

/**
 *
 * This class provides some money functions for the expression parser.
 *
 * @copyright Jacques Archimède
 *
 */
class PercentFunction {

	public static $decimalPoint = null;
	public static $groupingSeparator = null;
	public static $groupingSize = null;
	public static $percentSymbol = null;

	public static function toString($percent) {
		if (is_float($percent)) {
			return NumberFunction::formatNumber($percent, 2, self::$decimalPoint, self::$groupingSeparator, self::$groupingSize);
		} elseif (is_numeric($percent) || is_int($percent)) {
			return NumberFunction::formatNumber((float)$percent, 2, self::$decimalPoint, self::$groupingSeparator, self::$groupingSize);
		} else {
			return $percent;
		}
	}

	public static function toPercent(string $percent) {
		$value = str_replace([self::$groupingSeparator, self::$decimalPoint], ['', '.'], $percent);
		return is_numeric($value) ? (float)$value : $percent;
	}

	public static function format(string $percent) {
		return is_numeric($percent) ? number_format((float)$percent, 2, ".", "") : $percent;
	}

	public static function isPercent(string $percent) {
		$numeric = str_replace([self::$groupingSeparator, self::$decimalPoint], ['', '.'], $percent);
		return preg_match("/^\d+(\.\d{1,2})?$/", $numeric);
	}

	protected static function init() {
		$locale = str_replace('-', '_', getenv('APP_LOCALE'));
		if (class_exists('\NumberFormatter')) {
			$formatter = new \NumberFormatter($locale, \NumberFormatter::PERCENT );
			if (self::$decimalPoint === null) {
				self::$decimalPoint = $formatter->getSymbol(\NumberFormatter::DECIMAL_SEPARATOR_SYMBOL);
			}
			if (self::$groupingSeparator === null) {
				self::$groupingSeparator = normalizer_normalize($formatter->getSymbol(\NumberFormatter::GROUPING_SEPARATOR_SYMBOL));
				self::$groupingSeparator = str_replace(["\xc2\xa0", "\xe2\x80\xaf"], [' ', ' '], self::$groupingSeparator);
			}
			if (self::$groupingSize === null) {
				self::$groupingSize = $formatter->getAttribute(\NumberFormatter::GROUPING_SIZE);
			}
			if (self::$percentSymbol === null) {
				self::$percentSymbol = normalizer_normalize($formatter->getSymbol(\NumberFormatter::PERCENT_SYMBOL));
			}
		} else {
			if (self::$decimalPoint === null) {
				self::$decimalPoint = preg_match("/^fr/", $locale) ? "," : ".";
			}
			if (self::$groupingSeparator === null) {
				self::$groupingSeparator = preg_match("/^fr/", $locale) ? " " : ",";
			}
			if (self::$groupingSize === null) {
				self::$groupingSize = 3;
			}
			if (self::$percentSymbol === null) {
				self::$percentSymbol = "%";
			}
		}
	}

}

(function () {
	PercentFunction::init();
})->bindTo(null, PercentFunction::class)();


?>
