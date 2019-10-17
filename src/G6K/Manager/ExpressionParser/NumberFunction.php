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
class NumberFunction {

	public static $decimalPoint = null;
	public static $groupingSeparator = null;
	public static $groupingSize = null;
	public static $fractionDigit = null;

	public static function toString($number) {
		if (is_float($number)) {
			return self::formatNumber($number, self::$fractionDigit, self::$decimalPoint, self::$groupingSeparator, self::$groupingSize);
		} elseif (is_numeric($number) || is_int($number)) {
			return self::formatNumber((float)$number, self::$fractionDigit, self::$decimalPoint, self::$groupingSeparator, self::$groupingSize);
		} else {
			return $number;
		}
	}

	public static function toNumber(string $number) {
		$value = str_replace([self::$groupingSeparator, self::$decimalPoint], ['', '.'], $number);
		return is_numeric($value) ? (float)$value : $number;
	}

	public static function format(string $number) {
		return is_numeric($number) ? number_format((float)$number, self::$fractionDigit, ".", "") : $number;
	}

	public static function isNumber(string $number) {
		$numeric = str_replace([self::$groupingSeparator, self::$decimalPoint], ['', '.'], $number);
		return is_numeric($numeric);
	}

	public static function formatNumber($number , $decimals = 0 , $dec_point = "." , $thousands_sep = "," , $thousands_size = 3 )
	{
		$formatter = new \NumberFormatter(getenv('APP_LOCALE'), \NumberFormatter::DECIMAL );
		$formatter->setAttribute(\NumberFormatter::FRACTION_DIGITS, $decimals);
		$formatter->setSymbol(\NumberFormatter::DECIMAL_SEPARATOR_SYMBOL, $dec_point);
		$formatter->setSymbol(\NumberFormatter::GROUPING_SEPARATOR_SYMBOL, $thousands_sep);
		$formatter->setAttribute(\NumberFormatter::GROUPING_SIZE, $thousands_size);
		return $formatter->format($number);
	}

	protected static function init() {
		$locale = str_replace('-', '_', getenv('APP_LOCALE'));
		if (class_exists('\NumberFormatter')) {
			$formatter = new \NumberFormatter($locale, \NumberFormatter::DECIMAL);
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
			if (self::$fractionDigit === null) {
				self::$fractionDigit = $formatter->getAttribute(\NumberFormatter::MAX_FRACTION_DIGITS);
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
			if (self::$fractionDigit === null) {
				self::$fractionDigit = preg_match("/^fr/", $locale) ? 2 : 2;
			}
		}
	}

}

(function () {
	NumberFunction::init();
})->bindTo(null, NumberFunction::class)();


?>
