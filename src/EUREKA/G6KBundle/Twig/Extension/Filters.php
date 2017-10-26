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

namespace EUREKA\G6KBundle\Twig\Extension;

/**
 * This class is a Twig extension custom filter that implements 'jscode' to replace the deprecated raw filter
 *
 * @copyright Jacques Archimède
 *
 */
class Filters extends \Twig_Extension {

	/**
	 * Returns the extension class name
	 *
	 * @access  public
	 * @return  string The extension class name
	 *
	 */
	public function getName() {
		return 'filters_extension';
	}

	/**
	 * Registers the new filters
	 *
	 * @access  public
	 * @return  array List a new available filters
	 *
	 */
	public function getFilters() {
		return array(
			new \Twig_SimpleFilter('jscode', array($this, 'jscodeFilter'), array('is_safe' => array('html'))),
		);
	}

	/**
	 * Returns the string as is without any modification
	 *
	 * @access  public
	 * @param   string $string The string to be filtered
	 * @return  void
	 *
	 */
	public function jscodeFilter($string) {
		return $string;
	}

}

?>
