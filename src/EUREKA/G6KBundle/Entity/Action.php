<?php

namespace EUREKA\G6KBundle\Entity;

class Action {
	
	private $step = null;
	private $name = "";
	private $label = "";
	private $clazz = "";
	private $what = ""; // submit, reset
	private $for = ""; // currentStep (only for what=reset), priorStep, nextStep, pdfOutput, htmlOutput, externalPage
	private $uri = ""; //url for externalPage
	private $displayable = true;
	
	
	public function __construct($step, $name, $label) {
		$this->step = $step;
		$this->name = $name;
		$this->label = $label;
	}
	
	public function getStep() {
		return $this->step;
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function setName($name) {
		$this->name = $name;
	}
	
	public function getLabel() {
		return $this->label;
	}
	
	public function setLabel($label) {
		$this->label = $label;
	}
	
	public function getClass() {
		return $this->clazz;
	}
	
	public function setClass($clazz) {
		$this->clazz = $clazz;
	}
	
	public function getWhat() {
		return $this->what;
	}
	
	public function setWhat($what) {
		$this->what = $what;
	}
	
	public function getFor() {
		return $this->for;
	}
	
	public function setFor($for) {
		$this->for = $for;
	}
	
	public function getUri() {
		return $this->uri;
	}
	
	public function setUri($uri) {
		$this->uri = $uri;
	}
	
	public function isDisplayable() {
		return $this->displayable;
	}
	
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}
	
}

?>