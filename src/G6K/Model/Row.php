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
 * This class allows the storage and retrieval of the attributes of a row of a Table object
 *
 * @author    Jacques Archimède
 *
 */
class Row {

	/**
	 * @var \App\G6K\Model\Table $table The Table object to which this row belongs
	 *
	 * @access  private
	 *
	 */
	private $table = null;

	/**
	 * @var array      $cells The list of cells (Cell Object) of this row
	 *
	 * @access  private
	 *
	 */
	private $cells = array();

	/**
	 * Constructor of class Row
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Table $table The Table object to which this row belongs
	 * @return  void
	 *
	 */
	public function __construct($table) {
		$this->table = $table;
	}

	/**
	 * Retrieves the Table object to which this row belongs
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Table The Table object
	 *
	 */
	public function getTable() {
		return $this->table;
	}

	/**
	 * Retrieves the list of cells (Cell Object) of this row
	 *
	 * @access  public
	 * @return  array The list of cells
	 *
	 */
	public function getCells() {
		return $this->cells;
	}

	/**
	 * Sets the list of cells (Cell Object) of this row
	 *
	 * @access  public
	 * @param   array      $cells The list of cells 
	 * @return  void
	 *
	 */
	public function setCells($cells) {
		$this->cells = $cells;
	}

	/**
	 * Adds a cell (Cell object) to this row
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Cell $cell The Cell object 
	 * @return  void
	 *
	 */
	public function addCell(Cell $cell) {
		$this->cells[] = $cell;
	}

	/**
	 * Returns the cell (Cell object) at the given index of the array of cells
	 *
	 * @access  public
	 * @param   int $index index of a cell in the array of cells 
	 * @return  \App\G6K\Model\Cell  The Cell object 
	 *
	 */
	public function getCell($index) {
		return $this->cells[$index];
	}
}

?>
