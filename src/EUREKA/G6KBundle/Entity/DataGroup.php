<?php

namespace EUREKA\G6KBundle\Entity;

class DataGroup {

	private $simulator = null;
	private $id = 0;
	private $name = "";
	private $label = "";
	private $description = "";
	private $datas = array();
	private $error = false;
	private $errorMessages = array();
	private $used = false;
	
	public function __construct($simulator, $id, $name) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->name = $name;
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
	
	public function getDatas() {
		return $this->datas;
	}
	
	public function setDatas($datas) {
		$this->datas = $datas;
	}
	
	public function addData(Data $data) {
		$this->datas[] = $data;
	}
	
	public function removeData($index) {
		$this->datas[$index] = null;
	}
	
	public function getDataById($id) {
		foreach ($this->datas as $data) {
			if ($data->getId() == $id) {
				return $data;
			}
		}
		return null;
	}
	
	public function getDataByName($name) {
		foreach ($this->datas as $data) {
			if ($data->getName() == $name) {
				return $data;
			}
		}
		return null;
	}
	
	public function isUsed() {
		return $this->used;
	}
	
	public function setUsed($used) {
		$this->used = $used;
	}
	
	public function isError() {
		return $this->error;
	}
	
	public function setError($error) {
		$this->error = $error;
	}
	
	public function getErrorMessages() {
		return $this->errorMessages;
	}
	
	public function setErrorMessages($errorMessages) {
		$this->errorMessages = $errorMessages;
	}
	
	public function addErrorMessage($errorMessage) {
		if (! in_array($errorMessage, $this->errorMessages)) {
			$this->errorMessages[] = $errorMessage;
		}
	}
	
	public function removeErrorMessage($index) {
		$this->errorMessages[$index] = null;
	}
	
	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}
	
}



?>