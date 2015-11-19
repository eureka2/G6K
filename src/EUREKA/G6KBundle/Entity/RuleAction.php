<?php

namespace EUREKA\G6KBundle\Entity;

class RuleAction {
	
	private $id = 0;
	private $name = "";
	private $target = "";
	private $data = "";
	private $datagroup = ""; 
	private $step = "";
	private $fieldset = "";
	private $field = "";
	private $prenote = "";
	private $postnote = "";
	private $action = "";
	private $footnote = "";
	private $choice = "";
	private $value = "";
	
	
	public function __construct($id, $name) {
		$this->id = $id;
		$this->name = $name;
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function setName($name) {
		$this->name = $name;
	}
	
	public function getTarget() {
		return $this->target;
	}
	
	public function setTarget($target) {
		$this->target = $target;
	}
	
	public function getData() {
		return $this->data;
	}
	
	public function setData($data) {
		$this->data = $data;
	}
	
	public function getDatagroup() {
		return $this->datagroup;
	}
	
	public function setDatagroup($datagroup) {
		$this->datagroup = $datagroup;
	}
	
	public function getStep() {
		return $this->step;
	}
	
	public function setStep($step) {
		$this->step = $step;
	}
	
	public function getFieldset() {
		return $this->fieldset;
	}
	
	public function setFieldset($fieldset) {
		$this->fieldset = $fieldset;
	}
	
	public function getField() {
		return $this->field;
	}
	
	public function setField($field) {
		$this->field = $field;
	}
	
	public function getPrenote() {
		return $this->prenote;
	}
	
	public function setPrenote($prenote) {
		$this->prenote = $prenote;
	}
	
	public function getPostnote() {
		return $this->postnote;
	}
	
	public function setPostnote($postnote) {
		$this->postnote = $postnote;
	}
	
	public function getAction() {
		return $this->action;
	}
	
	public function setAction($action) {
		$this->action = $action;
	}
	
	public function getFootnote() {
		return $this->footnote;
	}
	
	public function setFootnote($footnote) {
		$this->footnote = $footnote;
	}
	
	public function getChoice() {
		return $this->choice;
	}
	
	public function setChoice($choice) {
		$this->choice = $choice;
	}
	
	public function getTargetId() {
		switch ($this->target) {
			case 'field':
				return $this->getField();
			case 'prenote':
				return $this->getPrenote();
			case 'postnote':
				return $this->getPostnote();
			case 'fieldset':
				return $this->getFieldset();
			case 'step':
				return $this->getStep();
			case 'footnote':
				return $this->getFootnote();
			case 'action':
				return $this->getAction();
			case 'choice':
				return $this->getChoice();
		}
		return 0;
	}	
	
	public function getValue() {
		return $this->value;
	}
	
	public function setValue($value) {
		$this->value = $value;
	}
	
}

?>