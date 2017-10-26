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
 * This class transforms a DateTime object into a string in d/m/Y format and vice versa
 *
 * @deprecated
 *
 * @copyright Jacques Archimède
 *
 */
class DateTimeToStringTransformer implements DataTransformerInterface
{

	/**
	 * Constructor of class DateTimeToStringTransformer
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function __construct() {
	}

	/**
	 * Transforms the given DateTime object into a string in d/m/Y format
	 *
	 * @param \DateTime|null $datetime The \DateTime object to transform
	 * @return string The date in d/m/Y format
	 */
	public function transform($datetime) {
		if (null === $datetime) {
			return '';
		}
		return $datetime->format('d/m/Y');
	}

	/**
	 * Converts the given date string into a DateTime object.
	 *
	 * The accepted formats are Y-m-d and d/m/Y
	 *
	 * @param  string $datetimeString The date string to transform
	 * @return \DateTime The DateTime object or null if the date is not in one of the accepted formats or if an error occurs.
	 */
	public function reverseTransform($datetimeString) {
		if (preg_match("/^\d\d\d\d-\d\d?-\d\d?$/", $datetimeString)) {
			$datetime = \DateTime::createFromFormat("Y-m-d", $datetimeString);
		} elseif (preg_match("/^\d\d?\/\d\d?\/\d\d\d\d$/", $datetimeString)) {
			$datetime = \DateTime::createFromFormat("d/m/Y", $datetimeString);
		} else {
			return null;
		}
		$errors = \DateTime::getLastErrors();
		if ($errors['error_count'] > 0) {
			return null;;
		}
		return $datetime;
	}
} 

?>
