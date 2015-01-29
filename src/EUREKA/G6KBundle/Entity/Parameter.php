<?php

namespace EUREKA\G6KBundle\Entity;

class Parameter {

	private $source = null;
	private $type = "";
	private $name = "";
	private $format = "";
	private $data = 0;
	
	public function __construct($source, $type) {
		$this->source = $source;
		$this->type = $type;
	}
	
	public function getSource() {
		return $this->source;
	}
	
	public function getType() {
		return $this->type;
	}
	
	public function setType($type) {
		$this->type = $type;
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function setName($name) {
		$this->name = $name;
	}
	
	public function getFormat() {
		return $this->format;
	}
	
	public function setFormat($format) {
		$this->format = $format;
	}
	
	public function getData() {
		return $this->data;
	}
	
	public function setData($data) {
		$this->data = $data;
	}
}


?>