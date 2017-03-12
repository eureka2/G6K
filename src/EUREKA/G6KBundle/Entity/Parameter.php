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

class Parameter {

	private $source = null;
	private $type = "";
	private $origin = "data"; // 'data' or 'constant'
	private $name = "";
	private $format = "";
	private $data = 0;
	private $constant = "";
	private $optional = false;

	public function __construct($source, $type) {
		$this->source = $source;
		$this->type = $type;
	}

	public function getSource() {
		return $this->source;
	}

	public function getType() {
		return $this->type;
	}

	public function setType($type) {
		$this->type = $type;
	}

	public function getOrigin() {
		return $this->origin;
	}

	public function setOrigin($origin) {
		if ($origin != '') {
			$this->origin = $origin;
		}
	}

	public function getName() {
		return $this->name;
	}

	public function setName($name) {
		$this->name = $name;
	}

	public function getFormat() {
		return $this->format;
	}

	public function setFormat($format) {
		$this->format = $format;
	}

	public function getData() {
		return $this->data;
	}

	public function setData($data) {
		$this->data = $data;
	}

	public function getConstant() {
		return $this->constant;
	}

	public function setConstant($constant) {
		$this->constant = $constant;
	}

	public function isOptional() {
		return $this->optional;
	}

	public function getOptional() {
		return $this->optional;
	}

	public function setOptional($optional) {
		$this->optional = $optional;
	}
}


?>