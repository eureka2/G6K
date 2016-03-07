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

class FieldRow {

	private $fieldset = null;
	private $label = "";
	private $help = false;
	private $colon = true;
	private $emphasize = false;
	private $datagroup = "";
	private $fields = array();
	
	public function __construct($fieldset, $label) {
		$this->fieldset = $fieldset;
		$this->label = $label;
	}
	
	public function getFieldSet() {
		return $this->fieldset;
	}
	
	public function getDataGroup() {
		return $this->datagroup;
	}
	
	public function setDataGroup($datagroup) {
		$this->datagroup = $datagroup;
	}
	
	public function getLabel() {
		return $this->label;
	}
	
	public function setLabel($label) {
		$this->label = $label;
	}
	
	public function hasColon() {
		return $this->colon;
	}
	
	public function setColon($colon) {
		$this->colon = $colon;
	}
	public function hasHelp() {
		return $this->help;
	}
	
	public function setHelp($help) {
		$this->help = $help;
	}
	
	public function isEmphasized() {
		return $this->emphasize;
	}
	
	public function setEmphasize($emphasize) {
		$this->emphasize = $emphasize;
	}
	
	public function getFields() {
		return $this->fields;
	}
	
	public function setFields($fields) {
		$this->fields = $fields;
	}
	
	public function addField(Field $field) {
		$this->fields[] = $field;
	}
	
	public function removeField($index) {
		$this->fields[$index] = null;
	}
	
	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}
	
}

?>