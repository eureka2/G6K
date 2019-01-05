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
 * This class represents an arithmetic or a logical expression.
 *
 * @copyright Jacques Archimède
 *
 */
class Expression {

	/**
	 * @var array      $tokens The token list of this expression
	 *
	 * @access  protected
	 *
	 */
	protected $tokens = array( );

	/**
	 * @var bool       $postfixed Indicates whether this expression is already postfixed or not.
	 *
	 * @access  protected
	 *
	 */
	protected $postfixed = false;

	/**
	 * Returns the token list of this expression.
	 *
	 * @access  public
	 * @return  array The token list of this expression
	 *
	 */
	public function get(){
		return $this->tokens;
	}

	/**
	 * Sets the token list of this expression
	 *
	 * @access  public
	 * @param   array $tokens The token list of this expression
	 * @return  void
	 *
	 */
	public function set($tokens){
		$this->tokens = $tokens;
		$this->postfixed = true;
	}

	/**
	 * Adds a token at the end of the token list of this expression.
	 *
	 * @access  public
	 * @param   \App\G6K\Manager\ExpressionParser\Token $t The token to be added
	 * @return  void
	 *
	 */
	public function push(Token $t){
		$this->tokens[] = $t;
	}

	/**
	 * Returns the last added token of this expression and removes it from the list of tokens.
	 *
	 * @access  public
	 * @return  \App\G6K\Manager\ExpressionParser\Token The last added token
	 *
	 */
	public function pop(){
		return array_pop($this->tokens);
	}

	/**
	 * Returns the last added token of this expression
	 *
	 * @access  public
	 * @return  \App\G6K\Manager\ExpressionParser\Token The last added token
	 *
	 */
	public function peek(){
		return end($this->tokens);
	}

	/**
	 * Implementation of the <i>Shunting Yard</i> algorithm to transform an infix expression to a RPN expression.
	 *
	 * @access  public
	 * @return  void
	 * @throws \Exception
	 *
	 */
	public function postfix () {
		$stack = array();
		$rpn = array();

		foreach ($this->tokens as $token) {
			switch ($token->type) {
				case Token::T_COMMA:
					while (!empty($stack) && end($stack)->type != Token::T_POPEN) {
						$rpn[] = array_pop($stack);
					}
					if (count($stack) > 1
						&& $stack[count($stack)-2]->type == Token::T_FUNCTION) {
						$stack[count($stack)-2]->arity++;
					}
					break;
				case Token::T_NUMBER:
				case Token::T_DATE:
				case Token::T_BOOLEAN:
				case Token::T_TEXT:
				case Token::T_ANY:
				case Token::T_IDENT:
				case Token::T_FIELD:
				case Token::T_ARRAY:
				case Token::T_UNDEFINED:
					$rpn[] = $token;
					break;
				case Token::T_PCLOSE:
					while (!empty($stack) && end($stack)->type != Token::T_POPEN) {
						$rpn[] = array_pop($stack);
					}
					if (empty($stack)) {
						throw new \Exception("Closing parenthesis without opening parenthesis ");
					}
					array_pop($stack);
					if (!empty($stack)
						&& end($stack)->type == Token::T_FUNCTION) {
						end($stack)->arity++;
						$rpn[] = array_pop($stack);
					}
					break;
				case Token::T_POPEN:
				case Token::T_FUNCTION:
					$stack[] = $token;
					break;
				default:
					if ($token->isOperator() || $token->isComparator()) {
						while (!empty($stack)
							&& (end($stack)->isOperator() || end($stack)->isComparator())
							&& (($token->associativity() == Token::A_LEFT && $token->precedence() >= end($stack)->precedence()) || ($token->associativity() == Token::A_RIGHT && $token->precedence() > end($stack)->precedence()))) {
							$rpn[] = array_pop($stack);
						}
						$stack[] = $token;
					} else {
						throw new \Exception("Unrecognized token " . $token->value);
					}
					break;
			}
		}
		while (!empty($stack) && end($stack)->type != Token::T_POPEN) {
			$rpn[] = array_pop($stack);
		}
		if (!empty($stack)) {
			throw new \Exception("Opening parenthesis without closing parenthesis ");
		}
		$this->tokens = $rpn;
		$this->postfixed = true;
	}

	/**
	 * Sets the value of all tokens with type T_FIELD
	 *
	 * @access  public
	 * @param   array $fields The token values
	 * @return  void
	 *
	 */
	public function setFields($fields) {
		foreach ($this->tokens as $token) {
			if ($token->type == Token::T_FIELD && count($fields) >= $token->value) {
				$value = $fields[$token->value - 1];
				$this->setToken($token, $value);
			}
		}
	}

	/**
	 * Sets the value of all tokens with type T_IDENT
	 *
	 * @access  public
	 * @param   array $fields The token values
	 *
	 */
	public function setNamedFields($fields) {
		foreach ($this->tokens as $token) {
			if ($token->type == Token::T_IDENT && isset($fields[$token->value])) {
				$value = $fields[$token->value];
				$this->setToken($token, $value);
			}
		}
	}

	/**
	 * Sets the value of all tokens with type T_IDENT or T_FIELD
	 *
	 * @access  public
	 * @param   array $variables The token values
	 * @return  bool true if all tokens with type T_IDENT or T_FIELD have a value, false otherwise
	 *
	 */
	public function setVariables($variables) {
		$completed = true;
		foreach ($this->tokens as $token) {
			if (($token->type == Token::T_FIELD && isset($variables[''.$token->value])) || 
				($token->type == Token::T_IDENT && isset($variables[$token->value]))) {
				$value = $variables[''.$token->value];
				if ((is_array($value) && count($value) == 0) || (is_string($value) && strlen($value) == 0)) {
					$completed = false;
					continue;
				}
				$this->setToken($token, $value);
			} elseif ($token->type == Token::T_FIELD || $token->type == Token::T_IDENT)  {
				$completed = false;
			}
		}
		return $completed;
	}

	/**
	 * Detects the type of the given value, converts it according to this type and sets the value of the given token with the result.
	 *
	 * @access  protected
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$token The given token
	 * @param   string $value The given value
	 * @return  void
	 *
	 */
	protected function setToken(Token &$token, $value) {
		if (is_array($value)) {
			$token->type = Token::T_ARRAY;
			$token->value = $value;
		} elseif (is_numeric($value)) {
			$token->type = Token::T_NUMBER;
			$token->value = $value;
		} elseif (DateFunction::isDate($value)) {
			$this->setDateToken($token, $value);
		} elseif (in_array($value, array('true', 'false'))) {
			$token->type = Token::T_BOOLEAN;
			$token->value = $value == 'true';
		} else {
			$token->type = Token::T_TEXT;
			$token->value = $value;
		}
	}

	/**
	 * Converts the given value into a DateTime object and sets the value of the given token with the result.
	 *
	 * @access  protected
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$token The given token
	 * @param   string $value The given value
	 * @return  void
	 * @throws \Exception
	 *
	 */
	protected function setDateToken(Token &$token, $value) {
		$token->type = Token::T_DATE;
		$token->value = DateFunction::makeDate($value);
	}

	/**
	 * Evaluates this expression
	 *
	 * @access  public
	 * @return  \App\G6K\Manager\ExpressionParser\Token|false The result token of the evaluation
	 *
	 */
	public function evaluate() {
		try {
			$evaluator = new Evaluator();
			return $evaluator->run($this->tokens);
		} catch (\Exception $e) {
			return false;
		}
	}
}

?>
