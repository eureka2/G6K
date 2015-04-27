<?php

namespace EUREKA\G6KBundle\Entity;

class FieldRow {

	private $fieldset = null;
	private $label = "";
	private $help = "";
	private $colon = "";
	private $emphasize = "";
	private $datagroup = "";
	private $fields = array();
	
	public function __construct($fieldset, $label) {
		$this->fieldset = $fieldset;
		$this->label = $label;
	}
	
	public function getFieldSet() {
		return $this->fieldset;
	}
	
	public function getDataGroup() {
		return $this->datagroup;
	}
	
	public function setDataGroup($datagroup) {
		$this->datagroup = $datagroup;
	}
	
	public function getLabel() {
		return $this->label;
	}
	
	public function setLabel($label) {
		$this->label = $label;
	}
	
	public function hasColon() {
		return $this->colon;
	}
	
	public function setColon($colon) {
		$this->colon = $colon;
	}
	public function hasHelp() {
		return $this->help;
	}
	
	public function setHelp($help) {
		$this->help = $help;
	}
	
	public function isEmphasized() {
		return $this->emphasize;
	}
	
	public function setEmphasize($emphasize) {
		$this->emphasize = $emphasize;
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
	
	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}
	
}

?>