<?php

/*
The MIT License (MIT)

Copyright (c) 2015 Jacques Archimède

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

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