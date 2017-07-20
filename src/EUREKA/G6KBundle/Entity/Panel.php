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

class Panel {

	private $step = null;
	private $id = 0;
	private $name = "";
	private $label = "";
	private $fieldsets = array();
	private $displayable = true;

	public function __construct($step, $id) {
		$this->step = $step;
		$this->id = $id;
	}

	public function getStep() {
		return $this->step;
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

	public function getFieldSets() {
		return $this->fieldsets;
	}

	public function setFieldSets($fieldsets) {
		$this->fieldsets = $fieldsets;
	}

	public function addFieldSet($fieldset) {
		$this->fieldsets[] = $fieldset;
	}

	public function removeFieldSet($index) {
		$this->fieldsets[$index] = null;
	}

	public function getFieldSetById($id) {
		foreach ($this->fieldsets as $fieldset) {
			if ($fieldset instanceof FieldSet && $fieldset->getId() == $id) {
				return $fieldset;
			}
		}
		return null;
	}

	public function getBlockInfoById($id) {
		foreach ($this->fieldsets as $fieldset) {
			if ($fieldset instanceof BlockInfo && $fieldset->getId() == $id) {
				return $fieldset;
			}
		}
		return null;
	}

	public function hasCollapsibles() {
		foreach ($this->fieldsets as $block) {
			if ($block instanceof BlockInfo) {
				foreach ($block->getChapters() as $chapter) {
					if ($chapter->isCollapsible()) {
						return true;
					}
				}
			}
		}
		return false;
	}

	public function getCollapsibles() {
		return $this->hasCollapsibles();
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