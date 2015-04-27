<?php

namespace EUREKA\G6KBundle\Entity;

class Column {

	private $table = null;
	private $id;
	private $name = "";
	private $type = ""; // date, boolean, number, integer, text, textarea, money, choice, percent, table, department region, country
	private $label = "";
	private $description = "";
	private $condition = "";
	private $selected = true;
	
	public function __construct($table, $id, $name, $type) {
		$this->table = $table;
		$this->id = $id;
		$this->name = $name;
		$this->type = $type;
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
	
	public function getType() {
		return $this->type;
	}
	
	public function setType($type) {
		$this->type = $type;
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