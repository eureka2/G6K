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
 * This class allows the storage and retrieval of attributes of a table associated with a data item or a data source.
 *
 * A Table object contains Column objects and Row objects.
 *
 * If a table is associated with a data item, it represents the contents of that data item.
 *
 * If a table is associated with a data source, it corresponds to the description of a database table.
 *
 * @author    Jacques Archimède
 *
 */
class Table {

	/**
	 * @var \App\G6K\Model\Data      $data The Data object of type 'table' associated with this this table
	 *
	 * @access  private
	 *
	 */
	private $data;

	/**
	 * @var int      $id The ID of this table
	 *
	 * @access  private
	 *
	 */
	private $id;

	/**
	 * @var string      $name The name of this table
	 *
	 * @access  private
	 *
	 */
	private $name;

	/**
	 * @var string     $label The label of this table
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var \App\G6K\Model\RichText|string|null     $description The description of this table
	 *
	 * @access  private
	 *
	 */
	private $description = null;

	/**
	 * @var array      $columns The list of columns of this table
	 *
	 * @access  private
	 *
	 */
	private $columns = array();

	/**
	 * @var array      $rows  The list of rows of this table
	 *
	 * @access  private
	 *
	 */
	private $rows = array();

	/**
	 * Constructor of class Table
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Data|null      $data The Data object of type 'table' associated with this this table
	 * @param   int      $id The ID of this table
	 * @return  void
	 *
	 */
	public function __construct($data, $id) {
		$this->data = $data;
		$this->id = $id;
	}

	/**
	 * Returns the ID of this table
	 *
	 * @access  public
	 * @return  int The ID of this table
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this table
	 *
	 * @access  public
	 * @param   int    $id The ID of this table
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the name of this table
	 *
	 * @access  public
	 * @return  string The name of this table
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this table
	 *
	 * @access  public
	 * @param   string      $name The name of this table
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the Data object of type 'table' associated with this this table
	 *
	 * Returns null if this table is the description of a database table.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Data|null The Data object
	 *
	 */
	public function getData() {
		return $this->data;
	}

	/**
	 * Returns the label of this table
	 *
	 * @access  public
	 * @return  string The label of this table
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this table
	 *
	 * @access  public
	 * @param   string     $label The label of this table
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the description of this table
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText|string|null The description of this table
	 *
	 */
	public function getDescription() {
		return $this->description;
	}

	/**
	 * Sets the description of this table
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $description The description of this table
	 * @return  void
	 *
	 */
	public function setDescription($description) {
		$this->description = $description;
	}

	/**
	 * Returns the list of columns of this table
	 *
	 * @access  public
	 * @return  array The list of columns
	 *
	 */
	public function getColumns() {
		return $this->columns;
	}

	/**
	 * Sets the list of columns of this table
	 *
	 * @access  public
	 * @param   array      $columns The list of columns
	 * @return  void
	 *
	 */
	public function setColumns($columns) {
		$this->columns = $columns;
	}

	/**
	 * Adds a Column object to the list of columns of this table
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Column $column The Column object
	 * @return  void
	 *
	 */
	public function addColumn(Column $column) {
		$this->columns[] = $column;
	}

	/**
	 * Returns the Column object at the given index in the list of columns of this table
	 *
	 * @access  public
	 * @param   int $index The index of the column in the list of columns
	 * @return  \App\G6K\Model\Column The Column object
	 *
	 */
	public function getColumn($index) {
		return $this->columns[$index];
	}

	/**
	 * Removes a Column object from the list of columns of this table
	 *
	 * @access  public
	 * @param   int $index The index of the column in the list of columns
	 * @return  void
	 *
	 */
	public function removeColumn($index) {
		$this->columns[$index] = null;
	}

	/**
	 * Retrieves a Column object by its ID in the list of columns of this table.
	 *
	 * @access  public
	 * @param   int $id The ID of the column
	 * @return  \App\G6K\Model\Column|null The Column object
	 *
	 */
	public function getColumnById($id) {
		foreach ($this->columns as $column) {
			if ($column->getId() === $id) {
				return $column;
			}
		}
		return null;
	}

	/**
	 * Returns the list of rows of this table
	 *
	 * @access  public
	 * @return  array The list of rows
	 *
	 */
	public function getRows() {
		return $this->rows;
	}

	/**
	 * Sets the list of rows of this table
	 *
	 * @access  public
	 * @param   array $rows The list of rows
	 * @return  void
	 *
	 */
	public function setRows($rows) {
		$this->rows = $rows;
	}

	/**
	 * Adds a Row object to the list of rows of this table
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Row $row The Row object 
	 * @return  void
	 *
	 */
	public function addRow(Row $row) {
		$this->rows[] = $row;
	}

	/**
	 * Returns the Row object at the given index in the list of rows of this table
	 *
	 * @access  public
	 * @param   int $index The index of the row in the list of rows
	 * @return  int the value of row
	 *
	 */
	public function getRow($index) {
		return $this->rows[$index];
	}

	/**
	 * Removes a Row object to the list of rows of this table
	 *
	 * @access  public
	 * @param   int $index The index of the row in the list of rows 
	 * @return  void
	 *
	 */
	public function removeRow($index) {
		$this->rows[$index] = null;
	}
}

?>
