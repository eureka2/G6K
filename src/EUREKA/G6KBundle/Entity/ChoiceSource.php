<?php

namespace EUREKA\G6KBundle\Entity;

class ChoiceSource {

	private $data = null;
	private $id = 0;
	private $idColumn = "";
	private $valueColumn = "";
	private $labelColumn = "";
	
	public function __construct($data, $id, $valueColumn, $labelColumn) {
		$this->data = $data;
		$this->id = $id;
		$this->valueColumn = $valueColumn;
		$this->labelColumn = $labelColumn;
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
	
	public function getIdColumn() {
		return $this->idColumn;
	}
	
	public function setIdColumn($idColumn) {
		$this->idColumn = $idColumn;
	}
	
	public function getValueColumn() {
		return $this->valueColumn;
	}
	
	public function setValueColumn($valueColumn) {
		$this->valueColumn = $valueColumn;
	}
	
	public function getLabelColumn() {
		return $this->labelColumn;
	}
	
	public function setLabelColumn($labelColumn) {
		$this->labelColumn = $labelColumn;
	}
}


?>