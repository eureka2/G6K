<?php

namespace EUREKA\G6KBundle\Entity;

class FootNotes {

	private $step = null;
	private $position = "beforeActions";
	private $footnotes = array();
	private $displayable = true;
	
	public function __construct($step) {
		$this->step = $step;
	}
	
	public function getStep() {
		return $this->step;
	}
	
	public function getPosition() {
		return $this->position;
	}
	
	public function setPosition($position) {
		$this->position = $position;
	}
	
	public function getFootNotes() {
		return $this->footnotes;
	}
	
	public function setFootNotes($footnotes) {
		$this->footnotes = $footnotes;
	}
	
	public function addFootNote(FootNote $footnote) {
		$this->footnotes[] = $footnote;
	}
	
	public function removeFootNote($index) {
		$this->footnotes[$index] = null;
	}
	
	public function isDisplayable() {
		return $this->displayable;
	}
	
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}
	
}

?>