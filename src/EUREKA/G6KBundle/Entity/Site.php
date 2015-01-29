<?php

namespace EUREKA\G6KBundle\Entity;

class Site {

	private $simulator = null;
	private $id;
	private $name;
	private $home;
	
	public function __construct($simulator, $id, $name, $home) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->name = $name;
		$this->home = $home;
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
	
	public function getHome() {
		return $this->home;
	}
	
	public function setHome($home) {
		$this->home = $home;
	}

}

?>