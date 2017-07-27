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

class DataGroup {

	private $simulator = null;
	private $id = 0;
	private $name = "";
	private $label = "";
	private $description = "";
	private $datas = array();
	private $error = false;
	private $errorMessages = array();
	private $warning = false;
	private $warningMessages = array();
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

	public function getUsed() {
		return $this->used;
	}

	public function setUsed($used) {
		$this->used = $used;
	}

	public function isError() {
		return $this->error;
	}

	public function getError() {
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

	public function isWarning() {
		return $this->warning;
	}

	public function getWarning() {
		return $this->warning;
	}

	public function setWarning($warning) {
		$this->warning = $warning;
	}

	public function getWarningMessages() {
		return $this->warningMessages;
	}

	public function setWarningMessages($warningMessages) {
		$this->warningMessages = $warningMessages;
	}

	public function addWarningMessage($warningMessage) {
		if (! in_array($warningMessage, $this->warningMessages)) {
			$this->warningMessages[] = $warningMessage;
		}
	}

	public function removeWarningMessage($index) {
		$this->warningMessages[$index] = null;
	}

	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}

}

?>
