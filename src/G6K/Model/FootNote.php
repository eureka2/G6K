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
 * This class allows the storage and retrieval of the attributes of a footnote attached to a step.
 *
 *
 * @author    Jacques Archimède
 *
 */
class FootNote {

	/**
	 * @var \App\G6K\Model\Step $step The Step object to which this footnote is attached
	 *
	 * @access  private
	 *
	 */
	private $step = null;

	/**
	 * @var int        $id The id of this footnote
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var bool       $displayable Indicates whether this footnote should be displayed or not.
	 *
	 * @access  private
	 *
	 */
	private $displayable = true;

	/**
	 * @var \App\G6K\Model\RichText|null     $text The text of this footnote
	 *
	 * @access  private
	 *
	 */
	private $text = null;

	/**
	 * Constructor of class FootNote
	 *
	 * @access  public
	 * @param    \App\G6K\Model\Step $step The Step object to which this footnote is attached
	 * @param   int        $id The id of this footnote
	 * @return  void
	 *
	 */
	public function __construct($step, $id) {
		$this->step = $step;
		$this->id = $id;
	}

	/**
	 * Returns the Step object to which this footnote is attached
	 *
	 * @access  public
	 * @return   \App\G6K\Model\Step The Step object
	 *
	 */
	public function getStep() {
		return $this->step;
	}

	/**
	 * Returns the id of this footnote
	 *
	 * @access  public
	 * @return  int The id of this footnote
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the id of this footnote
	 *
	 * @access  public
	 * @param   int        $id The id of this footnote
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the displayable attribute of this footnote
	 *
	 * @access  public
	 * @return  bool true if this footnote can be displayed, false otherwise
	 *
	 */
	public function isDisplayable() {
		return $this->displayable;
	}

	/**
	 * Returns the displayable attribute of this footnote
	 *
	 * @access  public
	 * @return  bool true if this footnote can be displayed, false otherwise
	 *
	 */
	public function getDisplayable() {
		return $this->displayable;
	}

	/**
	 * Determines whether this footnote can be displayed or not
	 *
	 * @access  public
	 * @param   bool $displayable true if this footnote can be displayed, false otherwise
	 * @return  void
	 *
	 */
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

	/**
	 * Returns the text of this footnote
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText|null the The text of this footnote
	 *
	 */
	public function getText() {
		return $this->text;
	}

	/**
	 * Sets the text of this footnote
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText $text The text of this footnote
	 * @return  void
	 *
	 */
	public function setText($text) {
		$this->text = $text;
	}

}

?>
