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

class Step {

	private $simulator = null;
	private $id = 0;
	private $name = "";
	private $label = "";
	private $template = "";
	private $output = "";
	private $description = "";
	private $dynamic = false;
	private $panels = array();
	private $actions = array();
	private $footnotes = null;
	private $displayable = true;

	public function __construct($simulator, $id, $name, $label, $template) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->name = $name;
		$this->label = $label;
		$this->template = $template;
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

	public function getTemplate() {
		return $this->template;
	}

	public function setTemplate($template) {
		$this->template = $template;
	}

	public function getOutput() {
		return $this->output;
	}

	public function setOutput($output) {
		$this->output = $output;
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

	public function isDynamic() {
		return $this->dynamic;
	}

	public function getDynamic() {
		return $this->dynamic;
	}

	public function setDynamic($dynamic) {
		$this->dynamic = $dynamic;
	}

	public function getPanels() {
		return $this->panels;
	}

	public function setPanels($panels) {
		$this->panels = $panels;
	}

	public function addPanel($panel) {
		$this->panels[] = $panel;
	}

	public function removePanel($index) {
		$this->panels[$index] = null;
	}

	public function getPanelById($id) {
		foreach ($this->panels as $panel) {
			if ($panel->getId() == $id) {
				return $panel;
			}
		}
		return null;
	}

	public function getActions() {
		return $this->actions;
	}

	public function setActions($actions) {
		$this->actions = $actions;
	}

	public function addAction(Action $action) {
		$this->actions[] = $action;
	}

	public function removeAction($index) {
		$this->actions[$index] = null;
	}

	public function getActionByName($name) {
		foreach ($this->actions as $action) {
			if ($action->getName() == $name) {
				return $action;
			}
		}
		return null;
	}

	public function getFootNotes() {
		return $this->footnotes;
	}

	public function setFootNotes(FootNotes $footnotes) {
		$this->footnotes = $footnotes;
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
}

?>
