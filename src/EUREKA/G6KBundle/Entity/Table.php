<?php

/*
The MIT License (MIT)

Copyright (c) 2015 Jacques Archimède

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

namespace EUREKA\G6KBundle\Entity;

class Table {

	private $data;
	private $id;
	private $name;
	private $label = "";
	private $description = "";
	private $columns = array();
	private $rows = array();
	
	public function __construct($data, $id) {
		$this->data = $data;
		$this->id = $id;
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function setId($id) {
		$this->id = $id;
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function setName($name) {
		$this->name = $name;
	}
	
	public function getData() {
		return $this->data;
	}
	
	public function getLabel() {
		return $this->label;
	}
	
	public function setLabel($label) {
		$this->label = $label;
	}
	
	public function getDescription() {
		return $this->description;
	}
	
	public function setDescription($description) {
		$this->description = $description;
	}
	
	public function getColumns() {
		return $this->columns;
	}
	
	public function setColumns($columns) {
		$this->columns = $columns;
	}
	
	public function addColumn(Column $column) {
		$this->columns[] = $column;
	}
	
	public function getColumn($index) {
		return $this->columns[$index];
	}
	
	public function removeColumn($index) {
		$this->columns[$index] = null;
	}

	public function getColumnById($id) {
		foreach ($this->columns as $column) {
			if ($column->getId() === $id) {
				return $column;
			}
		}
		return null;
	}

	public function getRows() {
		return $this->rows;
	}
	
	public function setRows($rows) {
		$this->rows = $rows;
	}
	
	public function addRow(Row $row) {
		$this->rows[] = $row;
	}
	
	public function getRow($index) {
		return $this->rows[$index];
	}
	
	public function removeRow($index) {
		$this->rows[$index] = null;
	}
}

?>
