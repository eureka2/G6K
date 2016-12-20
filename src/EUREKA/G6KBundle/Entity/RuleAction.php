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

class RuleAction {

	private $id = 0;
	private $name = "";
	private $target = "";
	private $data = "";
	private $datagroup = ""; 
	private $step = "";
	private $panel = "";
	private $fieldset = "";
	private $column = "";
	private $fieldrow = "";
	private $field = "";
	private $blockinfo = "";
	private $chapter = "";
	private $section = "";
	private $prenote = "";
	private $postnote = "";
	private $action = "";
	private $footnote = "";
	private $choice = "";
	private $value = "";


	public function __construct($id, $name) {
		$this->id = $id;
		$this->name = $name;
	}

	public function getId() {
		return $this->id;
	}

	public function getName() {
		return $this->name;
	}

	public function setName($name) {
		$this->name = $name;
	}

	public function getTarget() {
		return $this->target;
	}

	public function setTarget($target) {
		$this->target = $target;
	}

	public function getData() {
		return $this->data;
	}

	public function setData($data) {
		$this->data = $data;
	}

	public function getDatagroup() {
		return $this->datagroup;
	}

	public function setDatagroup($datagroup) {
		$this->datagroup = $datagroup;
	}

	public function getStep() {
		return $this->step;
	}

	public function setStep($step) {
		$this->step = $step;
	}

	public function getPanel() {
		return $this->panel;
	}

	public function setPanel($panel) {
		$this->panel = $panel;
	}

	public function getFieldset() {
		return $this->fieldset;
	}

	public function setFieldset($fieldset) {
		$this->fieldset = $fieldset;
	}

	public function getColumn() {
		return $this->column;
	}

	public function setColumn($column) {
		$this->column = $column;
	}

	public function getFieldrow() {
		return $this->fieldrow;
	}

	public function setFieldrow($fieldrow) {
		$this->fieldrow = $fieldrow;
	}

	public function getField() {
		return $this->field;
	}

	public function setField($field) {
		$this->field = $field;
	}

	public function getBlockinfo() {
		return $this->blockinfo;
	}

	public function setBlockinfo($blockinfo) {
		$this->blockinfo = $blockinfo;
	}

	public function getChapter() {
		return $this->chapter;
	}

	public function setChapter($chapter) {
		$this->chapter = $chapter;
	}

	public function getSection() {
		return $this->section;
	}

	public function setSection($section) {
		$this->section = $section;
	}

	public function getPrenote() {
		return $this->prenote;
	}

	public function setPrenote($prenote) {
		$this->prenote = $prenote;
	}

	public function getPostnote() {
		return $this->postnote;
	}

	public function setPostnote($postnote) {
		$this->postnote = $postnote;
	}

	public function getAction() {
		return $this->action;
	}

	public function setAction($action) {
		$this->action = $action;
	}

	public function getFootnote() {
		return $this->footnote;
	}

	public function setFootnote($footnote) {
		$this->footnote = $footnote;
	}

	public function getChoice() {
		return $this->choice;
	}

	public function setChoice($choice) {
		$this->choice = $choice;
	}

	public function getTargetId() {
		switch ($this->target) {
			case 'field':
				return $this->getField();
			case 'prenote':
				return $this->getPrenote();
			case 'postnote':
				return $this->getPostnote();
			case 'column':
				return $this->getColumn();
			case 'fieldrow':
				return $this->getFieldrow();
			case 'fieldset':
				return $this->getFieldset();
			case 'section':
				return $this->getSection();
			case 'chapter':
				return $this->getChapter();
			case 'blockinfo':
				return $this->getBlockinfo();
			case 'step':
				return $this->getStep();
			case 'footnote':
				return $this->getFootnote();
			case 'action':
				return $this->getAction();
			case 'choice':
				return $this->getChoice();
		}
		return 0;
	}	

	public function getValue() {
		return $this->value;
	}

	public function setValue($value) {
		$this->value = $value;
	}

}

?>