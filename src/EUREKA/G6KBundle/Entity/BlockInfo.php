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

class BlockInfo {

	private $panel = null;
	private $id = 0;
	private $name = "";
	private $label = "";
	private $chapters = array();
	private $displayable = true;

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

	public function getChapters() {
		return $this->chapters;
	}

	public function setChapters($chapters) {
		$this->chapters = $chapters;
	}

	public function addChapter($chapter) {
		$this->chapters[] = $chapter;
	}

	public function removeChapter($index) {
		$this->chapters[$index] = null;
	}

	public function getChapterById($id) {
		foreach ($this->chapters as $chapter) {
			if ($chapter->getId() == $id) {
				return $chapter;
			}
		}
		return null;
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
