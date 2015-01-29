<?php

namespace EUREKA\G6KBundle\Entity;

class Table {

	private $data;
	private $id;
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