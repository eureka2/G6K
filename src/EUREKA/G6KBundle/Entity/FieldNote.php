<?php

namespace EUREKA\G6KBundle\Entity;

class FieldNote {

	private $field = null;
	private $condition = "";
	private $displayable = true;
	private $text = "";

	
	public function __construct($field) {
		$this->field = $field;
	}
	
	public function getField() {
		return $this->step;
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
	
	public function getText() {
		return $this->text;
	}
	
	public function setText($text) {
		$this->text = $text;
	}
	
}

?>