<?php

namespace EUREKA\G6KBundle\Entity;

class FieldSet {

	private $step = null;
	private $id = 0;
	private $legend = "";
	private $condition = "";
	private $displayable = true;
	private $fields = array();
	
	
	public function __construct($step, $id) {
		$this->step = $step;
		$this->id = $id;
	}
	
	public function getStep() {
		return $this->step;
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function setId($id) {
		$this->id = $id;
	}
	
	public function getLegend() {
		return $this->legend;
	}
	
	public function setLegend($legend) {
		$this->legend = $legend;
	}
	
	public function getCondition() {
		return $this->condition;
	}
	
	public function setCondition($condition) {
		$this->condition = $condition;
	}
	
	public function isDisplayable() {
		return $this->displayable;
	}
	
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}
	
	
	public function getFields() {
		return $this->fields;
	}
	
	public function setFields($fields) {
		$this->fields = $fields;
	}
	
	public function addField(Field $field) {
		$this->fields[] = $field;
	}
	
	public function removeField($index) {
		$this->fields[$index] = null;
	}
	
}

?>