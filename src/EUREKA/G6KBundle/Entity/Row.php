<?php

namespace EUREKA\G6KBundle\Entity;

class Row {

	private $table = null;
	private $cells = array();
	
	public function __construct($table) {
		$this->table = $table;
	}
	
	public function getTable() {
		return $this->table;
	}
	
	public function getCells() {
		return $this->cells;
	}
	
	public function setCells($cells) {
		$this->cells = $cells;
	}
	
	public function addCell(Cell $cell) {
		$this->cells[] = $cell;
	}
	
	public function getCell($index) {
		return $this->cells[$index];
	}
}


?>