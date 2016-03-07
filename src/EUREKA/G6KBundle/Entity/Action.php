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

class Action {
	
	private $step = null;
	private $name = "";
	private $label = "";
	private $clazz = "";
	private $what = ""; // submit, reset
	private $for = ""; // currentStep (only for what=reset), priorStep, nextStep, pdfOutput, htmlOutput, externalPage
	private $uri = ""; //url for externalPage
	private $displayable = true;
	
	
	public function __construct($step, $name, $label) {
		$this->step = $step;
		$this->name = $name;
		$this->label = $label;
	}
	
	public function getStep() {
		return $this->step;
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
	
	public function getClass() {
		return $this->clazz;
	}
	
	public function setClass($clazz) {
		$this->clazz = $clazz;
	}
	
	public function getWhat() {
		return $this->what;
	}
	
	public function setWhat($what) {
		$this->what = $what;
	}
	
	public function getFor() {
		return $this->for;
	}
	
	public function setFor($for) {
		$this->for = $for;
	}
	
	public function getUri() {
		return $this->uri;
	}
	
	public function setUri($uri) {
		$this->uri = $uri;
	}
	
	public function isDisplayable() {
		return $this->displayable;
	}
	
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}
	
}

?>