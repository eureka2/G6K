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
	public static $thousandsSeparator = null;
	public static $fractionDigit = null;

	public static function toString($number) {
		if (is_float($number)) {
			return number_format($number, self::$fractionDigit, self::$decimalPoint, self::$thousandsSeparator);
		} elseif (is_numeric($number) || is_int($number)) {
			return number_format((float)$number, self::$fractionDigit, self::$decimalPoint, self::$thousandsSeparator);
		} else {
			return $number;
		}
	}

	public static function toNumber(string $number) {
		$value = str_replace([self::$thousandsSeparator, self::$decimalPoint], ['', '.'], $number);
		return is_numeric($value) ? (float)$value : $number;
	}

	public static function format(string $number) {
		return is_numeric($number) ? number_format((float)$number, self::$fractionDigit, ".", "") : $number;
	}

	public static function isNumber(string $number) {
		$numeric = str_replace([self::$thousandsSeparator, self::$decimalPoint], ['', '.'], $number);
		return is_numeric($numeric);
	}

	private static function init() {
		$locale = str_replace('-', '_', getenv('APP_LOCALE'));
		if (class_exists('\NumberFormatter')) {
			$formatter = new \NumberFormatter($locale, \NumberFormatter::DECIMAL);
			if (self::$decimalPoint === null) {
				self::$decimalPoint = $formatter->getSymbol(\NumberFormatter::DECIMAL_SEPARATOR_SYMBOL);
			}
			if (self::$thousandsSeparator === null) {
				self::$thousandsSeparator = normalizer_normalize($formatter->getSymbol(\NumberFormatter::GROUPING_SEPARATOR_SYMBOL));
				self::$thousandsSeparator = str_replace("\xc2\xa0", ' ', self::$thousandsSeparator);
			}
			if (self::$fractionDigit === null) {
				self::$fractionDigit = $formatter->getAttribute(\NumberFormatter::FRACTION_DIGITS);
			}
		} else {
			if (self::$decimalPoint === null) {
				self::$decimalPoint = preg_match("/^fr/", $locale) ? "," : ".";
			}
			if (self::$thousandsSeparator === null) {
				self::$thousandsSeparator = preg_match("/^fr/", $locale) ? " " : ",";
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
