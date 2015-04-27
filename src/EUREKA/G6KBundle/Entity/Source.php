<?php

namespace EUREKA\G6KBundle\Entity;

class Source {

	private $simulator = null;
	private $id = 0;
	private $datasource = ""; // id datasource
	private $request = ""; // sql if type = database
	private $returnType = ""; // json, xml or singleValue
	private $returnPath = ""; // 
	private $parameters = array();
	
	
	public function __construct($simulator, $id, $datasource, $returnType) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->datasource = $datasource;
		$this->returnType = $returnType;
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
	
	public function getDatasource() {
		return $this->datasource;
	}
	
	public function setDatasource($datasource) {
		$this->datasource = $datasource;
	}
	
	public function getRequest() {
		return $this->request;
	}
	
	public function setRequest($request) {
		$this->request = $request;
	}
	
	public function getReturnType() {
		return $this->returnType;
	}
	
	public function setReturnType($returnType) {
		$this->returnType = $returnType;
	}
	
	public function getReturnPath() {
		return $this->returnPath;
	}
	
	public function setReturnPath($returnPath) {
		$this->returnPath = $returnPath;
	}
	
	public function getParameters() {
		return $this->parameters;
	}
	
	public function setParameters($parameters) {
		$this->parameters = $parameters;
	}
	
	public function addParameter(Parameter $parameter) {
		$this->parameters[] = $parameter;
	}
	
	public function removeParameter($index) {
		$this->parameters[$index] = null;
	}
	
	public function getParameterByName($name) {
		foreach ($this->parameters as $parameter) {
			if ($parameter->getName() == $name) {
				return $parameter;
			}
		}
		return null;
	}
	
}
?>