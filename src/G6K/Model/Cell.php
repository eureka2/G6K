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
 * This class allows the storage and retrieval of the attributes of a cell
 *
 * @author    Jacques Archimède
 *
 */
class Cell {

	/**
	 * @var \App\G6K\Model\Column $column Column that defines this cell
	 *
	 * @access  private
	 *
	 */
	private $column = null;

	/**
	 * @var string     $value Cell value
	 *
	 * @access  private
	 *
	 */
	private $value = "";

	/**
	 * Constructor of class Cell
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Column $column Column that defines this cell
	 * @param   string $value (default: "") Cell value
	 * @return  void
	 *
	 */
	public function __construct($column, $value="") {
		$this->column = $column;
		$this->value = $value;
	}

	/**
	 * Returns the column that contains the cell 
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Column the value of column
	 *
	 */
	public function getColumn() {
		return $this->column;
	}

	/**
	 * Returns the value of the cell
	 *
	 * @access  public
	 * @return  string the Cell value
	 *
	 */
	public function getValue() {
		return $this->value;
	}

	/**
	 * Sets the value of the cell
	 *
	 * @access  public
	 * @param   string     $value Cell value
	 * @return  void
	 *
	 */
	public function setValue($value) {
		$this->value = $value;
	}
}

?>
