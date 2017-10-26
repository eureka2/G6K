<?php

/*
The MIT License (MIT)

Copyright (c) 2017 Jacques Archimède

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

namespace EUREKA\G6KBundle\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;

/**
 *
 * This class transforms a float into a string with a comma as the decimal point and two decimal places, and vice versa
 *
 * @deprecated
 *
 * @copyright Jacques Archimède
 *
 */
class MontantToStringTransformer implements DataTransformerInterface
{

	/**
	 * Constructor of class MontantToStringTransformer
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function __construct() {
	}

	/**
	 * Transforms a float into a string with a comma as the decimal point and two decimal places.
	 *
	 * @param float|null $montant The float to be converted
	 * @return string|null 
	 */
	public function transform($montant) {
		if (null === $montant || $montant == 0) {
			return null;
		}
 		$montant = preg_replace("/,/", ".", $montant."");
		if (! is_numeric($montant)) {
			return $montant;
		} 
		return sprintf("%01.2f", round(floatval($montant), 2, PHP_ROUND_HALF_EVEN));
	}

	/**
	 * Transforms a string with a comma as the decimal point and two decimal places into a float.
	 *
	 * @param  string $montant The string to be converted
	 * @return float|null The float or null if the string is empty
	 */
	public function reverseTransform($montant) {
		if (null === $montant || $montant == '') {
			return null;
		}
		$montant = preg_replace("/,/", ".", $montant);
		if (! is_numeric($montant)) {
			return 0;
		}
		return round(floatval($montant), 2, PHP_ROUND_HALF_EVEN);
	}
} 

?>
