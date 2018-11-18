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
 * This class allows the storage and retrieval of the attributes of a column of a Table object
 *
 * @author    Jacques Archimède
 * @author    Yann Toqué
 *
 */
class Column {

	/**
	 * @var \App\G6K\Model\Table $table The Table object to which the column belongs
	 *
	 * @access  private
	 *
	 */
	private $table = null;

	/**
	 * @var int      $id The ID of this Column object
	 *
	 * @access  private
	 *
	 */
	private $id;

	/**
	 * @var string     $name The name of this Column object
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $type The type of this Column object: date, boolean, number, integer, text, textarea, money, choice, percent, table, department region, country
	 *
	 * @access  private
	 *
	 */
	private $type = ""; 

	/**
	 * @var string     $label The label of this Column object
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var bool       $selected (default:true) Indicates whether the column has been selected or not
	 *
	 * @access  private
	 *
	 */
	private $selected = true;

	/**
	 * Constructor of class Column
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Table|null $table The Table object to which the column belongs
	 * @param   int      $id The ID of this Column object
	 * @param   string   $name The name of this Column object
	 * @param   string   $type eg date, boolean, number, integer, text, textarea, money, choice, percent, table, department region, country
	 * @return  void
	 *
	 */
	public function __construct($table, $id, $name, $type) {
		$this->table = $table;
		$this->id = $id;
		$this->name = $name;
		$this->type = $type;
	}

	/**
	 * Retrieves the Table object to which the column belongs
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Table The Table object to which the column belongs
	 *
	 */
	public function getTable() {
		return $this->table;
	}

	/**
	 * Retrieves the ID of this column
	 *
	 * @access  public
	 * @return  int The ID of this Column object
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this column
	 *
	 * @access  public
	 * @param   int $id The ID of this Column object
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Retrieves the name of this column
	 *
	 * @access  public
	 * @return  string the The name of this Column object
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this column 
	 *
	 * @access  public
	 * @param   string  $name The name of this Column object
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Retrieves the type of this column
	 *
	 * @access  public
	 * @return  string The type of this Column object
	 *
	 */
	public function getType() {
		return $this->type;
	}

	/**
	 * Sets the type of this column
	 *
	 * @access  public
	 * @param   string   $type The ID of this Column object : date, boolean, number, integer, text, textarea, money, choice, percent, table, department region, country
	 * @return  void
	 *
	 */
	public function setType($type) {
		$this->type = $type;
	}

	/**
	 * Retrieves the label of this column
	 *
	 * @access  public
	 * @return  string The label of this Column object
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this column
	 *
	 * @access  public
	 * @param   string     $label The label of this Column object
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Retrieves the selected attribute of this Column object
	 *
	 * @access  public
	 * @return  bool the value of selected
	 *
	 */
	public function isSelected() {
		return $this->selected;
	}

	/**
	 * Retrieves the selected attribute of this Column object
	 *
	 * @access  public
	 * @return  bool the value of selected
	 *
	 */
	public function getSelected() {
		return $this->selected;
	}

	/**
	 * Determines whether this column is selected or not
	 *
	 * @access  public
	 * @param   bool $selected (default:true) true if this column is selected, false otherwise
	 * @return  void
	 *
	 */
	public function setSelected($selected) {
		$this->selected = $selected;
	}
}

?>
