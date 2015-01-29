<?php

namespace EUREKA\G6KBundle\Entity;

class Column {

	private $table = null;
	private $id;
	private $name = "";
	private $label = "";
	private $condition = "";
	private $selected = true;
	
	public function __construct($table, $id, $name, $label) {
		$this->table = $table;
		$this->id = $id;
		$this->name = $name;
		$this->label = $label;
	}
	
	public function getTable() {
		return $this->table;
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
	
	public function getLabel() {
		return $this->label;
	}
	
	public function setLabel($label) {
		$this->label = $label;
	}
	
	public function getCondition() {
		return $this->condition;
	}
	
	public function setCondition($condition) {
		$this->condition = $condition;
	}
	
	public function isSelected() {
		return $this->selected;
	}
	
	public function setSelected($selected) {
		$this->selected = $selected;
	}
}


?>