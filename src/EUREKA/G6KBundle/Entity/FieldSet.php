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

class FieldSet {

	private $panel = null;
	private $id = 0;
	private $legend = "";
	private $disposition = "classic";
	private $display = "inline";
	private $popinLink = "";
	private $displayable = true;
	private $inputFields = false;
	private $fields = array();
	private $columns = array();

	public function __construct($panel, $id) {
		$this->panel = $panel;
		$this->id = $id;
	}

	public function getPanel() {
		return $this->panel;
	}

	public function getId() {
		return $this->id;
	}

	public function setId($id) {
		$this->id = $id;
	}

	public function getLegend() {
		return $this->legend;
	}

	public function setLegend($legend) {
		$this->legend = $legend;
	}

	public function getDisposition() {
		return $this->disposition;
	}

	public function setDisposition($disposition) {
		$this->disposition = $disposition;
	}

	public function getDisplay() {
		return $this->display;
	}

	public function setDisplay($display) {
		$this->display = $display;
	}

	public function getPopinLink() {
		return $this->popinLink;
	}

	public function setPopinLink($popinLink) {
		$this->popinLink = $popinLink;
	}

	public function isDisplayable() {
		return $this->displayable;
	}

	public function getDisplayable() {
		return $this->displayable;
	}

	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

	public function hasInputFields() {
		return $this->inputFields;
	}

	public function getInputFields() {
		return $this->inputFields;
	}

	public function setInputFields($inputFields) {
		$this->inputFields = $inputFields;
	}

	public function getFields() {
		return $this->fields;
	}

	public function setFields($fields) {
		$this->fields = $fields;
	}

	public function addField($field) {
		$this->fields[] = $field;
	}

	public function removeField($index) {
		$this->fields[$index] = null;
	}

	public function getFieldByPosition($position) {
		foreach ($this->fields as $field) {
			if ($field instanceof Field && $field->getPosition() == $position) {
				return $field;
			}
		}
		return null;
	}

	public function getFieldRowById($id) {
		foreach ($this->fields as $field) {
			if ($field instanceof FieldRow && $field->getId() == $id) {
				return $field;
			}
		}
		return null;
	}

	public function getColumns() {
		return $this->columns;
	}

	public function setColumns($columns) {
		$this->columns = $columns;
	}

	public function addColumn(Column $column) {
		$this->columns[] = $column;
	}

	public function removeColumn($index) {
		$this->columns[$index] = null;
	}

	public function getColumnById($id) {
		foreach ($this->columns as $column) {
			if ($column->getId() == $id) {
				return $column;
			}
		}
		return null;
	}

	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}

}

?>