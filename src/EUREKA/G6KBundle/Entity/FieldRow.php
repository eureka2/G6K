<?php

namespace EUREKA\G6KBundle\Entity;

class FieldRow {

	private $fieldset = null;
	private $label = "";
	private $fields = array();
	
	public function __construct($fieldset, $label) {
		$this->fieldset = $fieldset;
		$this->label = $label;
	}
	
	public function getFieldSet() {
		return $this->fieldset;
	}
	
	public function getLabel() {
		return $this->label;
	}
	
	public function setLabel($label) {
		$this->label = $label;
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