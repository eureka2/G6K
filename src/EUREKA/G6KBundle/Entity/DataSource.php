<?php

namespace EUREKA\G6KBundle\Entity;

class DataSource {

	private $simulator = null;
	private $id = 0;
	private $name = "";
	private $type = ""; // uri, database, internal
	private $uri = "";
	private $database = 0;
	private $description = "";
	private $tables = array(); 
	
	public function __construct($simulator, $id, $name, $type) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->name = $name;
		$this->type = $type;
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
	
	public function getType() {
		return $this->type;
	}
	
	public function setType($type) {
		$this->type = $type;
	}
	
	public function getUri() {
		return $this->uri;
	}
	
	public function setUri($uri) {
		$this->uri = $uri;
	}
	
	public function getDatabase() {
		return $this->database;
	}
	
	public function setDatabase($database) {
		$this->database = $database;
	}
	
	public function getDescription() {
		return $this->description;
	}
	
	public function setDescription($description) {
		$this->description = $description;
	}
	
	public function getTables() {
		return $this->tables;
	}
	
	public function setTables($tables) {
		$this->tables = $tables;
	}
	
	public function addTable(Table $table) {
		$this->tables[] = $table;
	}

}



?>