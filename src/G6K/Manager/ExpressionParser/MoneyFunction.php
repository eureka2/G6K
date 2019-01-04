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
class MoneyFunction {

	public static $decimalPoint = null;
	public static $thousandsSeparator = null;
	public static $moneySymbol = null;
	public static $symbolPosition = null;

	public static function toString($money) {
		if (is_float($money)) {
			return number_format($money, 2, self::$decimalPoint, self::$thousandsSeparator);
		} elseif (is_numeric($money) || is_int($money)) {
			return number_format((float)$money, 2, self::$decimalPoint, self::$thousandsSeparator);
		} else {
			return $money;
		}
	}

	public static function toMoney(string $money) {
		$value = str_replace([self::$thousandsSeparator, self::$decimalPoint], ['', '.'], $money);
		return is_numeric($value) ? (float)$value : $money;
	}

	public static function format(string $money) {
		return is_numeric($money) ? number_format((float)$money, 2, ".", "") : $money;
	}

	public static function isMoney(string $money) {
		$numeric = str_replace([self::$thousandsSeparator, self::$decimalPoint], ['', '.'], $money);
		return preg_match("/^\d+(\.\d{1,2})?$/", $numeric);
	}

	protected static function init() {
		$locale = str_replace('-', '_', getenv('APP_LOCALE'));
		if (class_exists('\NumberFormatter')) {
			$formatter = new \NumberFormatter($locale, \NumberFormatter::CURRENCY);
			if (self::$decimalPoint === null) {
				self::$decimalPoint = $formatter->getSymbol(\NumberFormatter::DECIMAL_SEPARATOR_SYMBOL);
			}
			if (self::$thousandsSeparator === null) {
				self::$thousandsSeparator = normalizer_normalize($formatter->getSymbol(\NumberFormatter::MONETARY_GROUPING_SEPARATOR_SYMBOL));
				self::$thousandsSeparator = str_replace("\xc2\xa0", ' ', self::$thousandsSeparator);
			}
			if (self::$moneySymbol === null) {
				$currencyCode = $formatter->getTextAttribute(\NumberFormatter::CURRENCY_CODE);
				$formatter = new \NumberFormatter($locale . '@currency=' . $currencyCode , \NumberFormatter::CURRENCY);
				self::$moneySymbol = normalizer_normalize($formatter->getSymbol(\NumberFormatter::CURRENCY_SYMBOL));
			}
			if (self::$symbolPosition === null) {
				$formatter = new \NumberFormatter(substr($locale, 0, 2), \NumberFormatter::CURRENCY);
				$symbol = $formatter->getSymbol(\NumberFormatter::CURRENCY_SYMBOL);
				$pattern = $formatter->getPattern();
				self::$symbolPosition = preg_match("/^".$symbol."/", $pattern) ? 'before' : 'after';
			}
		} else {
			if (self::$decimalPoint === null) {
				self::$decimalPoint = preg_match("/^fr/", $locale) ? "," : ".";
			}
			if (self::$thousandsSeparator === null) {
				self::$thousandsSeparator = preg_match("/^fr/", $locale) ? " " : ",";
			}
			if (self::$moneySymbol === null) {
				self::$moneySymbol = preg_match("/^fr/", $locale) ? "€" : "$";
			}
			if (self::$symbolPosition === null) {
				self::$symbolPosition = preg_match("/^fr/", $locale) ? "after" : "before";
			}
		}
	}

}

(function () {
	MoneyFunction::init();
})->bindTo(null, MoneyFunction::class)();


?>
