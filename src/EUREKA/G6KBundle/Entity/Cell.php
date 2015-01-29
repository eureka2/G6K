<?php

namespace EUREKA\G6KBundle\Entity;

class Cell {

	private $column = null;
	private $value = "";
	
	public function __construct($column, $value="") {
		$this->column = $column;
		$this->value = $value;
	}
	
	public function getColumn() {
		return $this->column;
	}
	
	public function getValue() {
		return $this->value;
	}
	
	public function setValue($value) {
		$this->value = $value;
	}
}


?>