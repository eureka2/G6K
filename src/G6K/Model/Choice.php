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
 * This class allows the storage and retrieval of the attributes of a choice
 *
 * A choice is a value chosen by a user in a list and assigned to a data item.
 *
 * @author    Jacques Archimède
 * @author    Yann Toqué
 *
 */
class Choice {

	/**
	 * @var \App\G6K\Model\Data $data The Data object that uses this choice
	 *
	 * @access  private
	 *
	 */
	private $data = null;

	/**
	 * @var int      $id The ID of this choice
	 *
	 * @access  private
	 *
	 */
	private $id;

	/**
	 * @var string     $value The value of this choice
	 *
	 * @access  private
	 *
	 */
	private $value = "";

	/**
	 * @var string     $label The label of this choice
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var bool       $selected Indicates whether the choice has been selected or not in the choices list.
	 *
	 * @access  private
	 *
	 */
	private $selected = true;

	/**
	 * Constructor of class Choice
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Data $data The Data object that uses this choice
	 * @param   int      $id The ID of this choice
	 * @param   string     $value The value of this choice
	 * @param   string     $label The label of this choice
	 * @return  void
	 *
	 */
	public function __construct($data, $id, $value, $label) {
		$this->data = $data;
		$this->id = $id;
		$this->value = $value;
		$this->label = $label;
	}

	/**
	 * Retrieves the ID of this choice
	 *
	 * @access  public
	 * @return  int The choice ID
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this choice
	 *
	 * @access  public
	 * @param   int      $id Choice id
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Retrieves the Data object that uses this choice
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Data the Data object
	 *
	 */
	public function getData() {
		return $this->data;
	}

	/**
	 * Retrieves the value of this choice
	 *
	 * @access  public
	 * @return  string The choice value
	 *
	 */
	public function getValue() {
		return $this->value;
	}

	/**
	 * Sets the value of this choice
	 *
	 * @access  public
	 * @param   string     $value The value of this choice
	 * @return  void
	 *
	 */
	public function setValue($value) {
		$this->value = $value;
	}

	/**
	 * Retrieves the label of this choice
	 *
	 * @access  public
	 * @return  string The label of this choice
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this choice
	 *
	 * @access  public
	 * @param   string     $label The label of this choice
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Retrieves the selected attribute of this Choice object
	 *
	 * @access  public
	 * @return  bool The selected attribute
	 *
	 */
	public function isSelected() {
		return $this->selected;
	}

	/**
	 * Retrieves the selected attribute of this Choice object
	 *
	 * @access  public
	 * @return  bool The selected attribute
	 *
	 */
	public function getSelected() {
		return $this->selected;
	}

	/**
	 * Determines whether this choice is selected or not
	 *
	 * @access  public
	 * @param   bool       $selected true if this choice is selected, false otherwise
	 * @return  void
	 *
	 */
	public function setSelected($selected) {
		$this->selected = $selected;
	}

	/**
	 * Returns the class name of this Choice object  
	 *
	 * @access  public
	 * @return  string the class name
	 *
	 */
	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}
}

?>
