<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2018 Jacques Archimède

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

namespace App\G6K\Model;

/**
 *
 * This class allows the storage and retrieval of rich text.
 *
 * @author    Jacques Archimède
 *
 */
class RichText {

	/**
	 * @var string $content The rich text
	 *
	 * @access  private
	 *
	 */
	private $content = '';

	/**
	 * @var string  $edition Indicates the edition mode (manual, wysihtml, ...) of this rich text.
	 *
	 * @access  private
	 *
	 */
	private $edition = 'manual';

	/**
	 * Constructor of class RichText
	 *
	 * @access  public
	 * @param   string $content  The text content
	 * @param   string $edition The edition mode of this rich text
	 * @return  void
	 *
	 */
	public function __construct($content, $edition = 'manual') {
		$this->setContent($content);
		$this->setEdition($edition);
	}

	/**
	 * Indicates if this text was edited manually or not
	 *
	 * @access  public
	 * @return  bool true if this text was edited manually, false otherwise
	 *
	 */
	public function isManual() {
		return $this->edition == 'manual';
	}

	/**
	 * Returns the edition mode of this rich text
	 *
	 * @access  public
	 * @return  string The edition mode of this rich text
	 *
	 */
	public function getEdition() {
		return $this->edition;
	}

	/**
	 * Sets the edition mode of this rich text
	 *
	 * @access  public
	 * @param   string $edition The edition mode of this rich text
	 * @return  void
	 *
	 */
	public function setEdition($edition = 'manual') {
		$this->edition = empty($edition) ? 'manual' : $edition;
	}

	/**
	 * Returns the text content
	 *
	 * @access  public
	 * @return  string The text content
	 *
	 */
	public function getContent() {
		return $this->content;
	}

	/**
	 * Sets the text content
	 *
	 * @access  public
	 * @param   string $content  The text content
	 * @return  void
	 *
	 */
	public function setContent($content) {
		$this->content = $content;
	}

}

?>
