<?php

namespace EUREKA\G6KBundle\Entity;

class FieldSet {

	private $step = null;
	private $id = 0;
	private $legend = "";
	private $disposition = "classic";
	private $condition = "";
	private $displayable = true;
	private $fields = array();
	private $fieldrows = array();
	
	
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
	
	public function getDisposition() {
		return $this->disposition;
	}
	
	public function setDisposition($disposition) {
		$this->disposition = $disposition;
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
	
	public function getFieldRows() {
		return $this->fieldrows;
	}
	
	public function setFieldRows($fieldrows) {
		$this->fieldrows = $fieldrows;
	}
	
	public function addFieldRow(FieldRow $fieldrow) {
		$this->fieldrows[] = $fieldrow;
	}
	
	public function removeFieldRow($index) {
		$this->fieldrows[$index] = null;
	}
	
}

?>