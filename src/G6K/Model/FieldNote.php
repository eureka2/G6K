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
 * This class allows the storage and retrieval of the attributes of a note attached to a field.
 *
 * @author    Jacques Archimède
 *
 */
class FieldNote {

	/**
	 * @var \App\G6K\Model\Field $field The Field object to which this note is attached
	 *
	 * @access  private
	 *
	 */
	private $field = null;

	/**
	 * @var bool  $displayable Indicates whether this note should be displayed or not.
	 *
	 * @access  private
	 *
	 */
	private $displayable = true;

	/**
	 * @var \App\G6K\Model\RichText $text The text of this note
	 *
	 * @access  private
	 *
	 */
	private $text = null;

	/**
	 * Constructor of class FieldNote
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Field $field  The Field object to which this note is attached
	 * @return  void
	 *
	 */
	public function __construct($field) {
		$this->field = $field;
	}

	/**
	 * Returns the Field object to which this note is attached
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Field The Field object
	 *
	 */
	public function getField() {
		return $this->field;
	}

	/**
	 * Returns the displayable attribute of this note
	 *
	 * @access  public
	 * @return  bool true if this note can be displayed, false otherwise
	 *
	 */
	public function isDisplayable() {
		return $this->displayable;
	}

	/**
	 * Returns the displayable attribute of this note
	 *
	 * @access  public
	 * @return  bool true if this note can be displayed, false otherwise
	 *
	 */
	public function getDisplayable() {
		return $this->displayable;
	}

	/**
	 * Determines whether this note can be displayed or not
	 *
	 * @access  public
	 * @param   bool $displayable true if this note can be displayed, false otherwise
	 * @return  void
	 *
	 */
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

	/**
	 * Returns the text of this note
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText The text of this note
	 *
	 */
	public function getText() {
		return $this->text;
	}

	/**
	 * Sets the text of this note
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText $text  The text of this note
	 * @return  void
	 *
	 */
	public function setText($text) {
		$this->text = $text;
	}

}

?>
