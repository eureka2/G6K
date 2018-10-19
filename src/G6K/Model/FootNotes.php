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
 * This class allows the storage and retrieval of the attributes of a footnote container attached to a step.
 *
 *
 * @author    Jacques Archimède
 *
 */
class FootNotes {

	/**
	 * @var \App\G6K\Model\Step $step The Step object to which this footnote container is attached
	 *
	 * @access  private
	 *
	 */
	private $step = null;

	/**
	 * @var string     $position Indicates the position of this footnote container relative to the action buttons.
	 *
	 * @access  private
	 *
	 */
	private $position = "beforeActions";

	/**
	 * @var array      $footnotes The list of footnotes contained in this container
	 *
	 * @access  private
	 *
	 */
	private $footnotes = array();

	/**
	 * @var bool       $displayable Indicates whether this footnote container should be displayed or not.
	 *
	 * @access  private
	 *
	 */
	private $displayable = true;

	/**
	 * Constructor of class FootNotes
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Step $step The Step object to which this footnote container is attached
	 * @return  void
	 *
	 */
	public function __construct($step) {
		$this->step = $step;
	}

	/**
	 * Returns the Step object to which this footnote container is attached.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Step The Step object
	 *
	 */
	public function getStep() {
		return $this->step;
	}

	/**
	 * Returns the position of this footnote container relative to the action buttons. 
	 *
	 * Possible values are :
	 *
	 * - beforeActions: the footnote container is placed before the action buttons
	 * - afterActions: the footnote container is placed after the action buttons
	 *
	 * @access  public
	 * @return  string the The position of this footnote container. 
	 *
	 */
	public function getPosition() {
		return $this->position;
	}

	/**
	 * Sets the position of this footnote container relative to the action buttons. 
	 *
	 * Possible values are :
	 *
	 * - beforeActions: the footnote container is placed before the action buttons
	 * - afterActions: the footnote container is placed after the action buttons
	 *
	 * @access  public
	 * @param    string     $position The position of this footnote container. 
	 * @return  void
	 *
	 */
	public function setPosition($position) {
		$this->position = $position;
	}

	/**
	 * Returns the list of footnotes contained in this container
	 *
	 * @access  public
	 * @return  array The list of footnotes
	 *
	 */
	public function getFootNotes() {
		return $this->footnotes;
	}

	/**
	 * Sets the list of footnotes contained in this container
	 *
	 * @access  public
	 * @param   array      $footnotes The list of footnotes
	 * @return  void
	 *
	 */
	public function setFootNotes($footnotes) {
		$this->footnotes = $footnotes;
	}

	/**
	 * Adds a FootNote Object to the list of footnotes contained in this container
	 *
	 * @access  public
	 * @param   \App\G6K\Model\FootNote $footnote The FootNote Object 
	 * @return  void
	 *
	 */
	public function addFootNote(FootNote $footnote) {
		$this->footnotes[] = $footnote;
	}

	/**
	 * Retrieves a FootNote object by its ID in the list of footnotes contained in this container
	 *
	 * @access  public
	 * @param   int $id The ID of the footnote 
	 * @return  \App\G6K\Model\FootNote|null The FootNote object
	 *
	 */
	public function getFootNoteById($id) {
		foreach ($this->footnotes as $footnote) {
			if ($footnote->getId() == $id) {
				return $footnote;
			}
		}
		return null;
	}

	/**
	 * Removes a FootNote Object from the list of footnotes contained in this container
	 *
	 * @access  public
	 * @param   int $index The index of the FootNote Object in the list of data item
	 * @return  void
	 *
	 */
	public function removeFootNote($index) {
		$this->footnotes[$index] = null;
	}

	/**
	 * Returns the displayable attribute of this footnote container
	 *
	 * @access  public
	 * @return  bool true if this footnote container can be displayed, false otherwise
	 *
	 */
	public function isDisplayable() {
		return $this->displayable;
	}

	/**
	 * Returns the displayable attribute of this footnote container
	 *
	 * @access  public
	 * @return  bool true if this footnote container can be displayed, false otherwise
	 *
	 */
	public function getDisplayable() {
		return $this->displayable;
	}

	/**
	 * Determines whether this footnote container can be displayed or not
	 *
	 * @access  public
	 * @param   bool $displayable true if this footnote container can be displayed, false otherwise
	 * @return  void
	 *
	 */
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

}

?>
