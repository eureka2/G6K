<?php

/*
The MIT License (MIT)

Copyright (c) 2017-2018 Jacques Archimède

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

namespace App\G6K\Twig\Extension;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

use Symfony\Contracts\Translation\TranslatorInterface;
use App\G6K\Model\RichText;
use App\G6K\Manager\ExpressionParser\NumberFunction;

/**
 * This class is a Twig extension custom filter that implements 'jscode' to replace the deprecated raw filter
 *
 * @copyright Jacques Archimède
 *
 */
class Filters extends AbstractExtension {

	/**
	 * @var \Symfony\Contracts\Translation\TranslatorInterface	  $translator The translator interface
	 *
	 * @access  private
	 *
	 */
	private $translator;

	/**
	 * Constructor of class Filters
	 *
	 * @access  public
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface $translator The translator interface
	 * @return  void
	 *
	 */
	public function __construct(TranslatorInterface $translator) {
		$this->translator = $translator;
	}

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
		return [
			new TwigFilter('jscode', array($this, 'jscodeFilter'), array('is_safe' => array('html'))),
			new TwigFilter('htmlraw', array($this, 'htmlRaw'), array('is_safe' => array('html'))),
			new TwigFilter('fnref', array($this, 'replaceFootnotesReference'), array('is_safe' => array('html'))),
			new TwigFilter('nofnref', array($this, 'removeFootnotesReference'), array('is_safe' => array('html'))),
			new TwigFilter('nofilter', array($this, 'noFilter'), array('is_safe' => array('html'))),
			new TwigFilter('intl_number_format', array($this, 'numberFormat')),
		];
	}

	/**
	 * Returns the string as is without any modification
	 *
	 * @access  public
	 * @param   string $string The string to be filtered
	 * @return  string
	 *
	 */
	public function jscodeFilter($string) {
		return $this->replaceFootnotesReference($string);
	}

	/**
	 * Returns the string as HTML raw
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $string The string to be filtered
	 * @return  string
	 *
	 */
	public function htmlRaw($string) {
		if ($string instanceof RichText && ! $string->isManual()) { 
			return $this->replaceFootnotesReference($string);
		} else {
			$text = $string instanceof RichText ? $string->getContent() : $string;
			$blocktags = ['address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'noscript', 'ol', 'output', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'];
			$paragraphs = explode("\n", trim($text));
			$result = '';
			foreach($paragraphs as $paragraph) {
				$paragraph = trim($paragraph);
				if ($paragraph == '' || $paragraph == '&nbsp;') {
					$result .= '<br>';
				} else {
					$result .= '<p>' . $paragraph . '</p>';
				}
			}
			foreach($blocktags as $tag) {
				$result = preg_replace("|<p>\s*<" . $tag . ">|", "<" . $tag . ">", $result);
				$result = preg_replace("|<" . $tag . ">\s*<\/p>|", "<" . $tag . ">", $result);
				$result = preg_replace("|<p>\s*<\/" . $tag . ">|", "</" . $tag . ">", $result);
				$result = preg_replace("|<\/" . $tag . ">\s*<\/p>|", "</" . $tag . ">", $result);
			}
			return $this->replaceFootnotesReference($result);
		}
	}

	/**
	 * Returns the string as is without any modification
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $string The string to be filtered
	 * @return  string
	 *
	 */
	public function noFilter($string) {
		$text = $string instanceof RichText ? $string->getContent() : $string;
		return $text;
	}

	/**
	 * Replaces footnotes reference in a text by a html link
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $string
	 * @return  string
	 *
	 */
	public function replaceFootnotesReference($string) 
	{
		$text = $string instanceof RichText ? $string->getContent() : $string;
		$text = preg_replace("/\[([^\^]+)\^(\d+)\(([^\]]+)\)\]/", '<a href="#foot-note-$2" title="$3">$1</a>', $text);
		$text = preg_replace("/\[([^\^]+)\^(\d+)\]/", '<a href="#foot-note-$2" title="' . $this->translator->trans("Reference to the footnote %footnote%", array('%footnote%' => '$2')) . ' ">$1</a>', $text);
		return $text;
	}

	/**
	 * Removes footnotes reference in a text 
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $string
	 * @return  string
	 *
	 */
	public function removeFootnotesReference($string) 
	{
		$text = $string instanceof RichText ? $string->getContent() : $string;
		$text = preg_replace("/\[([^\^]+)\^(\d+)\(([^\]]+)\)\]/", '$1', $text);
		$text = preg_replace("/\[([^\^]+)\^(\d+)\]/", '$1', $text);
		return $text;
	}

	public function numberFormat($number , $decimals = 0 , $dec_point = "." , $thousands_sep = "," , $thousands_size = 3 )
	{
		return NumberFunction::formatNumber($number , $decimals, $dec_point, $thousands_sep, $thousands_size);
	}

}

?>
