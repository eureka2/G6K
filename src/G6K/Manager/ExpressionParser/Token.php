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

namespace App\G6K\Manager\ExpressionParser;

/**
 *
 * This class represents one token of an arithmetic or a logical expression.
 *
 * @copyright Jacques Archimède
 *
 */
class Token {

	const	T_UNDEFINED			= 0,
			T_NUMBER	  		= 1,  
			T_DATE				= 2, 
			T_BOOLEAN			= 3, 
			T_TEXT				= 4, 
			T_ANY				= 5, 
			T_IDENT				= 6,  
			T_FUNCTION			= 7,  
			T_ARRAY				= 8,  
			T_POPEN				= 9,  
			T_PCLOSE			= 10, 
			T_SBOPEN			= 11,  
			T_SBCLOSE			= 12, 
			T_COMMA				= 13, 
			T_NOOP				= 14, 
			T_PLUS				= 15, 
			T_MINUS				= 16, 
			T_TIMES				= 17, 
			T_DIV				= 18, 
			T_MOD				= 19, 
			T_POW				= 20, 
			T_UNARY_PLUS		= 21, 
			T_UNARY_MINUS		= 22, 
			T_NOT				= 23, 
			T_FIELD				= 24, 
			T_EQUAL				= 25,
			T_NOT_EQUAL			= 26,
			T_LESS_THAN			= 27,
			T_LESS_OR_EQUAL		= 28,
			T_GREATER_THAN		= 29,
			T_GREATER_OR_EQUAL	= 30,
			T_CONTAINS			= 31,
			T_NOT_CONTAINS		= 32,
			T_BITWISE_AND		= 33,
			T_BITWISE_OR		= 34,
			T_BITWISE_XOR		= 35,
			T_LOGICAL_AND		= 36,
			T_LOGICAL_OR		= 37,
			T_TERNARY			= 38,
			T_TERNARY_ELSE		= 39,
			T_DEGRE				= 40;

	const	A_NONE				= 0,
			A_LEFT				= 1,
			A_RIGHT				= 2;

	/**
	 * @var int      $type Token type one of Token::T_* constants
	 *
	 * @access  public
	 *
	 */
	public $type;

	/**
	 * @var mixed      $value String representation of the value of this token
	 *
	 * @access  public
	 *
	 */
	public $value;

	/**
	 * @var int      $arity Number of parsed arguments if this token is a funcion
	 *
	 * @access  public
	 *
	 */
	public $arity;

	/**
	 * Constructor of class Token
	 *
	 * @access  public
	 * @param   int $type The type of this token
	 * @param   mixed $value The value of this token
	 * @return  void
	 *
	 */
	public function __construct($type, $value) {
		$this->type  = $type;
		$this->value = $value;
		$this->arity = 0;
	}

	/**
	 * Determines whether this token represents an unary operator or not.
	 *
	 * @access  public
	 * @return  bool true if this token represents an unary operator, false otherwise
	 *
	 */
	public function isUnaryOperator(){
		switch ($this->type) {
			case self::T_NOT:
			case self::T_UNARY_PLUS:
			case self::T_UNARY_MINUS:
			case self::T_TERNARY_ELSE:
			case self::T_DEGRE:
				return true;
		}
		return false;
	}

	/**
	 * Determines whether this token represents a binary operator or not.
	 *
	 * @access  public
	 * @return  bool true if this token represents a binary operator, false otherwise
	 *
	 */
	public function isBinaryOperator(){
		switch ($this->type) {
			case self::T_POW:
			case self::T_TIMES:
			case self::T_DIV:
			case self::T_MOD:
			case self::T_PLUS:
			case self::T_MINUS:
			case self::T_BITWISE_AND:
			case self::T_BITWISE_OR:
			case self::T_BITWISE_XOR:
			case self::T_LOGICAL_AND:
			case self::T_LOGICAL_OR:
				return true;
		}
		return false;
	}

	/**
	 * Determines whether this token represents a ternary operator or not.
	 *
	 * @access  public
	 * @return  bool true if this token represents a ternary operator, false otherwise
	 *
	 */
	public function isTernaryOperator(){
		switch ($this->type) {
			case self::T_TERNARY:
				return true;
		}
		return false;
	}

	/**
	 * Determines whether this token represents an operator or not.
	 *
	 * @access  public
	 * @return  bool true if this token represents an operator, false otherwise
	 *
	 */
	public function isOperator(){
		return $this->isUnaryOperator() 
			|| $this->isBinaryOperator() 
			|| $this->isTernaryOperator();
	}

	/**
	 * Determines whether this token represents a comparison operator or not.
	 *
	 * @access  public
	 * @return  bool true if this token represents a comparison operator, false otherwise
	 *
	 */
	public function isComparator(){
		switch ($this->type) {
			case self::T_EQUAL:
			case self::T_NOT_EQUAL:
			case self::T_LESS_THAN:
			case self::T_LESS_OR_EQUAL:
			case self::T_GREATER_THAN:
			case self::T_GREATER_OR_EQUAL:
			case self::T_CONTAINS:
			case self::T_NOT_CONTAINS:
			   return true;
		}
		return false;
	}

	/**
	 * Determines whether this token represents a variable identifier or not.
	 *
	 * @access  public
	 * @return  bool true if this token represents a variable identifier, false otherwise
	 *
	 */
	public function isVariable(){
		switch ($this->type) {
			case self::T_IDENT:
			case self::T_FIELD:
			case self::T_UNDEFINED:
				return true;
		}
		return false;
	}

	/**
	 * Determines whether this token represents an undefined value or not.
	 *
	 * @access  public
	 * @return  bool true if this token represents an undefined value, false otherwise
	 *
	 */
	public function isUndefined(){
		return $this->type == self::T_UNDEFINED;
	}

	/**
	 * Determines whether this token is just before a function argument or not.
	 *
	 * @access  public
	 * @return  bool true if this token is just before a function argument, false otherwise
	 *
	 */
	public function isBeforeFunctionArgument(){
		switch ($this->type) {
			case self::T_POPEN:
			case self::T_COMMA:
			case self::T_NOOP:
				return true;
		}
		return false;
	}

	/**
	 * Returns the priority of the operator represented by this token
	 *
	 * @access  public
	 * @return  int The priority of the operator
	 *
	 */
	public function precedence(){
		switch ($this->type) {
			case self::T_POPEN:
			case self::T_PCLOSE:
			case self::T_POW:
				return 1;
			case self::T_NOT:
			case self::T_UNARY_PLUS:
			case self::T_UNARY_MINUS:
			case self::T_DEGRE:
				return 2;
			case self::T_TIMES:
			case self::T_DIV:
			case self::T_MOD:
				return 3;
			case self::T_PLUS:
			case self::T_MINUS:
				return 4;
			case self::T_LESS_THAN:
			case self::T_LESS_OR_EQUAL:
			case self::T_GREATER_THAN:
			case self::T_GREATER_OR_EQUAL:
				return 6;
			case self::T_EQUAL:
			case self::T_NOT_EQUAL:
			case self::T_CONTAINS:
			case self::T_NOT_CONTAINS:
				return 7;
			case self::T_BITWISE_AND:
				return 8;
			case self::T_BITWISE_XOR:
				return 9;
			case self::T_BITWISE_OR:
				return 10;
			case self::T_LOGICAL_AND:
				return 11;
			case self::T_LOGICAL_OR:
				return 12;
			case self::T_TERNARY_ELSE:
			   return 13;
			case self::T_TERNARY:
				return 14;
			case self::T_COMMA:
				return 15;
		}

		return 16;
	}

	/**
	 * Determines if the operator represented by this token is right-associative, left-associative or non-associative
	 *
	 * @access  public
	 * @return  int One of the associativity constant: A_RIGHT, A_LEFT or A_NONE
	 *
	 */
	public function associativity(){
		switch ($this->type) {
			case self::T_POW:
			case self::T_NOT:
			case self::T_UNARY_PLUS:
			case self::T_UNARY_MINUS:
				return self::A_RIGHT;
			case self::T_DEGRE:
			case self::T_TIMES:
			case self::T_DIV:
			case self::T_MOD:
			case self::T_PLUS:
			case self::T_MINUS:
			case self::T_LESS_THAN:
			case self::T_LESS_OR_EQUAL:
			case self::T_GREATER_THAN:
			case self::T_GREATER_OR_EQUAL:
			case self::T_EQUAL:
			case self::T_NOT_EQUAL:
			case self::T_CONTAINS:
			case self::T_NOT_CONTAINS:
			case self::T_BITWISE_AND:
			case self::T_BITWISE_XOR:
			case self::T_BITWISE_OR:
			case self::T_LOGICAL_AND:
			case self::T_LOGICAL_OR:
			case self::T_TERNARY:
				return self::A_LEFT;
			case self::T_TERNARY_ELSE:
				return self::A_RIGHT;
			case self::T_COMMA:
				return self::A_LEFT;
		}

		return self::A_NONE;
	}

	/**
	 * Returns a string representation of this token.
	 *
	 * @access  public
	 * @return  string
	 *
	 */
	public function __toString() {
		switch ($this->type) {
			case self::T_DATE:
				return $this->value->format(DateFunction::$dateFormat);
				break;
			case self::T_BOOLEAN:
				return $this->value ? 'true' : 'false';
				break;
			case self::T_FUNCTION:
				return $this->value;
				break;
			case self::T_ARRAY:
				return json_encode($this->value);
				break;
			default:
				return (string)$this->value;
		}
	}
}

?>
