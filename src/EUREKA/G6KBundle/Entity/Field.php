<?php

namespace EUREKA\G6KBundle\Entity;

class Field {

	private $fieldset = 0;
	private $position = 0;
	private $newline = true;
	private $data = 0;
	private $label = "";
	private $usage = ""; // input, output
	private $prompt = ""; // choice only
	private $required = true; // false, true
	private $colon = true; // false, true
	private $underlabel = false; // false, true
	private $help = true; // false, true
	private $emphasize = false; // false, true
	private $explanation = ""; //expression;
	private $condition = ""; // expression = condition d'affichage
	private $expanded = true;
	private $preNote = "";
	private $postNote = "";
	private $displayable = true;
	
	public function __construct($fieldset, $position, $data, $label) {
		$this->fieldset = $fieldset;
		$this->position = $position;
		$this->data = $data;
		$this->label = $label;
	}
	
	public function getFieldSet() {
		return $this->fieldset;
	}
	
	public function getPosition() {
		return $this->position;
	}
	
	public function setPosition($position) {
		$this->position = $position;
	}
	
	public function isNewline() {
		return $this->newline;
	}
	
	public function setNewline($newline) {
		$this->newline = $newline;
	}
	
	public function getData() {
		return $this->data;
	}
	
	public function setData($data) {
		$this->data = $data;
	}
	
	public function getLabel() {
		return $this->label;
	}
	
	public function setLabel($label) {
		$this->label = $label;
	}
	
	public function getUsage() {
		return $this->usage;
	}
	
	public function setUsage($usage) {
		$this->usage = $usage;
	}
	
	public function getPrompt() {
		return $this->prompt;
	}
	
	public function setPrompt($prompt) {
		$this->prompt = $prompt;
	}
	
	public function isRequired() {
		return $this->required;
	}
	
	public function setRequired($required) {
		$this->required = $required;
	}
	
	public function hasColon() {
		return $this->colon;
	}
	
	public function setColon($colon) {
		$this->colon = $colon;
	}
	
	public function isUnderlabel() {
		return $this->underlabel;
	}
	
	public function setUnderlabel($underlabel) {
		$this->underlabel = $underlabel;
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
	
	public function getExplanation() {
		return $this->explanation;
	}
	
	public function setExplanation($explanation) {
		$this->explanation = $explanation;
	}
	
	public function getCondition() {
		return $this->condition;
	}
	
	public function setCondition($condition) {
		$this->condition = $condition;
	}
	
	public function isExpanded() {
		return $this->expanded;
	}
	
	public function setExpanded($expanded) {
		$this->expanded = $expanded;
	}
	
	public function getPreNote() {
		return $this->preNote;
	}
	
	public function setPreNote($preNote) {
		$this->preNote = $preNote;
	}
	
	public function getPostNote() {
		return $this->postNote;
	}
	
	public function setPostNote($postNote) {
		$this->postNote = $postNote;
	}
	
	public function isDisplayable() {
		return $this->displayable;
	}
	
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}
	
}

?>