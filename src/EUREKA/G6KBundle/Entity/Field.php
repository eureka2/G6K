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

class Field {

	private $fieldset = 0;
	private $position = 0;
	private $newline = true;
	private $data = 0;
	private $label = "";
	private $usage = ""; // input, output
	private $prompt = ""; // choice only
	private $required = true; // false, true
	private $visibleRequired = true; // false, true
	private $colon = true; // false, true
	private $underlabel = false; // false, true
	private $help = true; // false, true
	private $emphasize = false; // false, true
	private $explanation = ""; //expression;
	private $widget = ""; //string;
	private $expanded = true;
	private $preNote = null;
	private $postNote = null;
	private $displayable = true;

	public function __construct($fieldset, $position, $data, $label) {
		$this->fieldset = $fieldset;
		$this->position = $position;
		$this->data = $data;
		$this->label = $label;
	}

	public function getFieldSet() {
		return $this->fieldset;
	}

	public function getPosition() {
		return $this->position;
	}

	public function setPosition($position) {
		$this->position = $position;
	}

	public function isNewline() {
		return $this->newline;
	}

	public function getNewline() {
		return $this->newline;
	}

	public function setNewline($newline) {
		$this->newline = $newline;
	}

	public function getData() {
		return $this->data;
	}

	public function setData($data) {
		$this->data = $data;
	}

	public function getLabel() {
		return $this->label;
	}

	public function setLabel($label) {
		$this->label = $label;
	}

	public function getUsage() {
		return $this->usage;
	}

	public function setUsage($usage) {
		$this->usage = $usage;
	}

	public function getPrompt() {
		return $this->prompt;
	}

	public function setPrompt($prompt) {
		$this->prompt = $prompt;
	}

	public function isRequired() {
		return $this->required;
	}

	public function getRequired() {
		return $this->required;
	}

	public function setRequired($required) {
		$this->required = $required;
	}

	public function isVisibleRequired() {
		return $this->visibleRequired;
	}

	public function getVisibleRequired() {
		return $this->visibleRequired;
	}

	public function setVisibleRequired($visibleRequired) {
		$this->visibleRequired = $visibleRequired;
	}

	public function hasColon() {
		return $this->colon;
	}

	public function getColon() {
		return $this->colon;
	}

	public function setColon($colon) {
		$this->colon = $colon;
	}

	public function isUnderlabel() {
		return $this->underlabel;
	}

	public function getUnderlabel() {
		return $this->underlabel;
	}

	public function setUnderlabel($underlabel) {
		$this->underlabel = $underlabel;
	}

	public function hasHelp() {
		return $this->help;
	}

	public function getHelp() {
		return $this->help;
	}

	public function setHelp($help) {
		$this->help = $help;
	}

	public function isEmphasized() {
		return $this->emphasize;
	}

	public function getEmphasize() {
		return $this->emphasize;
	}

	public function setEmphasize($emphasize) {
		$this->emphasize = $emphasize;
	}

	public function getExplanation() {
		return $this->explanation;
	}

	public function setExplanation($explanation) {
		$this->explanation = $explanation;
	}

	public function isExpanded() {
		return $this->expanded;
	}

	public function getExpanded() {
		return $this->expanded;
	}

	public function setExpanded($expanded) {
		$this->expanded = $expanded;
	}

	public function getWidget() {
		return $this->widget;
	}

	public function setWidget($widget) {
		$this->widget = $widget;
	}

	public function getPreNote() {
		return $this->preNote;
	}

	public function setPreNote($preNote) {
		$this->preNote = $preNote;
	}

	public function getPostNote() {
		return $this->postNote;
	}

	public function setPostNote($postNote) {
		$this->postNote = $postNote;
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

	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}

}

?>
