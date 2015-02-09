<?php

namespace EUREKA\G6KBundle\Entity;

class Step {

	private $simulator = null;
	private $id = 0;
	private $name = "";
	private $label = "";
	private $template = "";
	private $condition = ""; // expression = condition d'affichage
	private $output = "";
	private $description = "";
	private $dynamic = false;
	private $fieldsets = array();
	private $actions = array();
	private $footnotes = null;
	private $displayable = true;
	
	public function __construct($simulator, $id, $name, $label, $template) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->name = $name;
		$this->label = $label;
		$this->template = $template;
	}
	
	public function getSimulator() {
		return $this->simulator;
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
	
	public function getTemplate() {
		return $this->template;
	}
	
	public function setTemplate($template) {
		$this->template = $template;
	}
	
	public function getCondition() {
		return $this->condition;
	}
	
	public function setCondition($condition) {
		$this->condition = $condition;
	}
	
	public function getOutput() {
		return $this->output;
	}
	
	public function setOutput($output) {
		$this->output = $output;
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
	
	public function isDynamic() {
		return $this->dynamic;
	}
	
	public function setDynamic($dynamic) {
		$this->dynamic = $dynamic;
	}
	
	public function getFieldSets() {
		return $this->fieldsets;
	}
	
	public function setFieldSets($fieldsets) {
		$this->fieldsets = $fieldsets;
	}
	
	public function addFieldSet(FieldSet $fieldset) {
		$this->fieldsets[] = $fieldset;
	}
	
	public function removeFieldSet($index) {
		$this->fieldsets[$index] = null;
	}
	
	public function getActions() {
		return $this->actions;
	}
	
	public function setActions($actions) {
		$this->actions = $actions;
	}
	
	public function addAction(Action $action) {
		$this->actions[] = $action;
	}
	
	public function removeAction($index) {
		$this->actions[$index] = null;
	}
	
	public function getActionByName($name) {
		foreach ($this->actions as $action) {
			if ($action->getName() == $name) {
				return $action;
			}
		}
		return null;
	}
	
	public function getFootNotes() {
		return $this->footnotes;
	}
	
	public function setFootNotes(FootNotes $footnotes) {
		$this->footnotes = $footnotes;
	}
	
	public function isDisplayable() {
		return $this->displayable;
	}
	
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}
}

?>