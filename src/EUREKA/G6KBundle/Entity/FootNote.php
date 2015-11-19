<?php

namespace EUREKA\G6KBundle\Entity;

class FootNote {

	private $step = null;
	private $id = 0;
	private $displayable = true;
	private $text = "";

	
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