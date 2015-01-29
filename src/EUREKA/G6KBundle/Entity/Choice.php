<?php

namespace EUREKA\G6KBundle\Entity;

class Choice {

	private $data = null;
	private $id;
	private $value = "";
	private $label = "";
	private $condition = "";
	private $selected = true;
	
	public function __construct($data, $id, $value, $label) {
		$this->data = $data;
		$this->id = $id;
		$this->value = $value;
		$this->label = $label;
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
	
	public function getValue() {
		return $this->value;
	}
	
	public function setValue($value) {
		$this->value = $value;
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