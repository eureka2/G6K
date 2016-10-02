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

class Condition {

	private $simulator = null;
	private $connector = null;
	private $operand = ""; // data name or data id
	private $operator = ""; // present, blank, =, !=, <, <=, >, >=, ~, !~, isTrue, isFalse
	private $expression = null; 


	public function __construct($simulator, $connector, $operand, $operator, $expression) {
		$this->simulator = $simulator;
		$this->connector = $connector;
		$this->operand = $operand;
		$this->operator = $operator;
		$this->expression = $expression == '' ? null : $expression;
	}

	public function getSimulator() {
		return $this->simulator;
	}

	public function getConnector() {
		return $this->connector;
	}

	public function getOperand() {
		return $this->operand;
	}

	public function setOperand($operand) {
		$this->operand = $operand;
	}

	public function getOperator() {
		return $this->operator;
	}

	public function setOperator($operator) {
		$this->operator = $operator;
	}

	public function getExpression() {
		return $this->expression;
	}

	public function setExpression($expression) {
		$this->expression = $expression == '' ? null : $expression;
	}

}
?>