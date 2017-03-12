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

class ChoiceSource {

	private $data = null;
	private $id = 0;
	private $idColumn = "";
	private $valueColumn = "";
	private $labelColumn = "";
	private $caseInsensitive = true;

	public function __construct($data, $id, $valueColumn, $labelColumn) {
		$this->data = $data;
		$this->id = $id;
		$this->setValueColumn($valueColumn);
		$this->setLabelColumn($labelColumn);
	}

	public function getData() {
		return $this->data;
	}

	public function getId() {
		return $this->id;
	}

	public function setId($id) {
		$this->id = $id;
	}

	public function isCaseInsensitive() {
		return $this->caseInsensitive;
	}

	public function getCaseInsensitive() {
		return $this->caseInsensitive;
	}

	public function setCaseInsensitive($caseInsensitive = true) {
		$this->caseInsensitive = $caseInsensitive;
	}

	public function getIdColumn() {
		return $this->caseInsensitive ? strtolower($this->idColumn) : $this->idColumn;
	}

	public function setIdColumn($idColumn) {
		$this->idColumn = $idColumn;
	}

	public function getValueColumn() {
		return $this->caseInsensitive ? strtolower($this->valueColumn) : $this->valueColumn;
	}

	public function setValueColumn($valueColumn) {
		$this->valueColumn = $valueColumn;
	}

	public function getLabelColumn() {
		return $this->caseInsensitive ? strtolower($this->labelColumn) : $this->labelColumn;
	}

	public function setLabelColumn($labelColumn) {
		$this->labelColumn = $labelColumn;
	}
}


?>