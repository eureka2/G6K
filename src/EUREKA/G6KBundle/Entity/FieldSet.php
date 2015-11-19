<?php

namespace EUREKA\G6KBundle\Entity;

class FieldSet {

	private $step = null;
	private $id = 0;
	private $legend = "";
	private $disposition = "classic";
	private $displayable = true;
	private $inputFields = false;
	private $fields = array();
	private $columns = array();
	
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
	
	public function hasInputFields() {
		return $this->inputFields;
	}
	
	public function setInputFields($inputFields) {
		$this->inputFields = $inputFields;
	}
	
	public function getFields() {
		return $this->fields;
	}
	
	public function setFields($fields) {
		$this->fields = $fields;
	}
	
	public function addField($field) {
		$this->fields[] = $field;
	}
	
	public function removeField($index) {
		$this->fields[$index] = null;
	}
	
	public function getFieldByPosition($position) {
		foreach ($this->fields as $field) {
			if ($field->getPosition() == $position) {
				return $field;
			}
		}
		return null;
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
	
	public function removeColumn($index) {
		$this->columns[$index] = null;
	}	
}

?>