<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2018 Jacques Archimède

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

namespace App\G6K\Model;

/**
 *
 * This class allows the storage and retrieval of the attributes of a condition
 *
 * A condition is a part of the set of conditions that makes up a busines rule of a simulator.
 * It is a true/false (Boolean) expression that consists of one predicate that are applied to data.
 *
 * It may be the only condition of the set of condtions or combined with other conditions using connectors "all", "any" and "none".
 *
 * A condition has the following syntax :
 * <pre>
 * &lt;operand&gt;&lt;operator&gt;[&lt;arithmetic expression&gt;]
 * </pre>
 * Operand, operator and arithmetic expression are stored in instances of this class.
 *
 * @author    Jacques Archimède
 * @author    Yann Toqué
 *
 */
class Condition {

	/**
	 * @var \App\G6K\Model\Simulator $simulator The Simulator object that has the business rule that uses this condition
	 *
	 * @access  private
	 *
	 */
	private $simulator = null;

	/**
	 * @var \App\G6K\Model\Connector $connector The Connector object that combines this condition with others.
	 *
	 * @access  private
	 *
	 */
	private $connector = null;

	/**
	 * @var string     $operand The operand part of the condition. It's the name of a data item.
	 *
	 * @access  private
	 *
	 */
	private $operand = ""; 

	/**
	 * @var string     $operator The operator part of the condition. Operators list: present, blank, =, !=, <, <=, >, >=, ~, !~, isTrue or isFalse
	 *
	 * @access  private
	 *
	 */
	private $operator = ""; 

	/**
	 * @var string $expression String corresponding to the expression 
	 *
	 * @access  private
	 *
	 */
	private $expression = null; 

	/**
	 * Constructor of class Condition
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator $simulator The Simulator object that has the business rule that uses this condition.
	 * @param   \App\G6K\Model\Connector $connector The Connector object that combines this condition with others.
	 * @param   string $operand The operand part (name of a data item) of this condition.
	 * @param   string $operator The operator part of this condition.
	 * @param   string $expression the arithmetic expression part of this condition.
	 * @return  void
	 *
	 */
	public function __construct($simulator, $connector, $operand, $operator, $expression) {
		$this->simulator = $simulator;
		$this->connector = $connector;
		$this->operand = $operand;
		$this->operator = $operator;
		$this->expression = $expression == '' ? null : $expression;
	}

	/**
	 * Retrieves the Simulator object that has the business rule that uses this condition.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Simulator The Simulator object
	 *
	 */
	public function getSimulator() {
		return $this->simulator;
	}

	/**
	 * Retrieves the Connector object that combines this condition with others.
	 *
	 * Returns null if this condition is not combined with others.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Connector|null The Connector object 
	 *
	 */
	public function getConnector() {
		return $this->connector;
	}

	/**
	 * Retrieves the operand part (name of a data item) of this condition.
	 *
	 * @access  public
	 * @return  string The operand part of this condition.
	 *
	 */
	public function getOperand() {
		return $this->operand;
	}

	/**
	 * Sets the operand part (name of a data item) of this condition.
	 *
	 * @access  public
	 * @param   string     $operand The operand part of this condition.
	 * @return  void
	 *
	 */
	public function setOperand($operand) {
		$this->operand = $operand;
	}

	/**
	 * Retrieves the operator part of this condition.
	 *
	 * The possible values are: present, blank, =, !=, <, <=, >, >=, ~, !~, isTrue or isFalse.
	 *
	 * present, blank, isTrue and isFalse are unary operators, the others are binary operators.
	 *
	 * @access  public
	 * @return  string The operator part of this condition.
	 *
	 */
	public function getOperator() {
		return $this->operator;
	}

	/**
	 * Sets the operator part of this condition.
	 *
	 * The possible values are: present, blank, =, !=, <, <=, >, >=, ~, !~, isTrue or isFalse.
	 *
	 * present, blank, isTrue and isFalse are unary operators, the others are binary operators.
	 *
	 * @access  public
	 * @param   string $operator The operator part of this condition. 
	 * @return  void
	 *
	 */
	public function setOperator($operator) {
		$this->operator = $operator;
	}

	/**
	 * Retrieves the arithmetic expression part of this condition.
	 *
	 * Returns null if the operator is an unary operator.
	 *
	 * @access  public
	 * @return  string|null The arithmetic expression part
	 *
	 */
	public function getExpression() {
		return $this->expression;
	}

	/**
	 * Sets the arithmetic expression part of this condition.
	 *
	 * Arithmetic expressions contain data (data id prefixed with #), constants, numeric operators, boolean operators (&& or ||), parenthesis, functions.
	 *
	 * @access  public
	 * @param   string $expression The arithmetic expression part
	 * @return  void
	 *
	 */
	public function setExpression($expression) {
		$this->expression = $expression == '' ? null : $expression;
	}

}

?>
