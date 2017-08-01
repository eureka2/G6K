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

namespace EUREKA\G6KBundle\Manager\ExpressionParser;

class Expression {

	protected $tokens = array( );
	protected $postfixed = false;

	public function get(){
		return $this->tokens;
	}

	public function set($tokens){
		$this->tokens = $tokens;
		$this->postfixed = true;
	}

	public function push(Token $t){
		$this->tokens[] = $t;
	}

	public function pop(){
		return array_pop($this->tokens);
	}

	public function peek(){
		return end($this->tokens);
	}

	public function postfix () {
		$stack = array();
		$rpn = array();

		foreach ($this->tokens as $token) {
			switch ($token->type) {
				case Token::T_COMMA:
					while (!empty($stack) && end($stack)->type != Token::T_POPEN) {
						$rpn[] = array_pop($stack);
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

	public function setFields($fields) {
		foreach ($this->tokens as $token) {
			if ($token->type == Token::T_FIELD && count($fields) >= $token->value) {
				$value = $fields[$token->value - 1];
				if (is_array($value)) {
					$token->type = Token::T_ARRAY;
					$token->value = $value;
				} elseif (is_numeric($value)) {
					$token->type = Token::T_NUMBER;
					$token->value = $value;
				} else if (preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $value)) {
                	$token->type = Token::T_DATE;
					$date = \DateTime::createFromFormat("d/m/Y", $value, new \DateTimeZone( 'Europe/Paris' ));
					$error = \DateTime::getLastErrors();
					if ($error['error_count'] > 0) {
						throw new \Exception($error['errors'][0]);
					}
					$date->setTime(0, 0, 0);
					$token->value = $date;
				} elseif (in_array($value, array('true', 'false'))) {
					$token->type = Token::T_BOOLEAN;
					$token->value = $value == 'true';
				} else {
					$token->type = Token::T_TEXT;
					$token->value = $value;
				}
			}
		}
	}

	public function setNamedFields($fields) {
		foreach ($this->tokens as $token) {
			if ($token->type == Token::T_IDENT && isset($fields[$token->value])) {
				$value = $fields[$token->value];
				if (is_array($value)) {
					$token->type = Token::T_ARRAY;
					$token->value = $value;
				} elseif (is_numeric($value)) {
					$token->type = Token::T_NUMBER;
					$token->value = $value;
				} else if (preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $value)) {
					$token->type = Token::T_DATE;
					$date = \DateTime::createFromFormat("d/m/Y", $value, new \DateTimeZone( 'Europe/Paris' ));
					$error = \DateTime::getLastErrors();
					if ($error['error_count'] > 0) {
						throw new \Exception($error['errors'][0]);
					}
					$date->setTime(0, 0, 0);
					$token->value = $date;
				} elseif (in_array($value, array('true', 'false'))) {
					$token->type = Token::T_BOOLEAN;
					$token->value = $value == 'true';
				} else {
					$token->type = Token::T_TEXT;
					$token->value = $value;
				}
			}
		}
	}

	public function setVariables($variables) {
		$completed = true;
		foreach ($this->tokens as $token) {
			if ($token->type == Token::T_FIELD && isset($variables[''.$token->value])) {
				$value = $variables[''.$token->value];
				if ((is_array($value) && count($value) == 0) || (is_string($value) && strlen($value) == 0)) {
					$completed = false;
				} elseif (is_array($value)) {
					$token->type = Token::T_ARRAY;
					$token->value = $value;
				} elseif (is_numeric($value)) {
					$token->type = Token::T_NUMBER;
					$token->value = $value;
				} elseif (preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $value)) {
					$token->type = Token::T_DATE;
					$date = \DateTime::createFromFormat("d/m/Y", $value, new \DateTimeZone( 'Europe/Paris' ));
					$error = \DateTime::getLastErrors();
					if ($error['error_count'] > 0) {
						throw new \Exception($error['errors'][0]);
					}
					$date->setTime(0, 0, 0);
					$token->value = $date;
				} elseif (in_array($value, array('true', 'false'))) {
					$token->type = Token::T_BOOLEAN;
					$token->value = $value == 'true';
				} else {
					$token->type = Token::T_TEXT;
					$token->value = $value;
				}
			} else if ($token->type == Token::T_IDENT && isset($variables[$token->value])) {
				$value = $variables[$token->value];
				if ((is_array($value) && count($value) == 0) || (is_string($value) && strlen($value) == 0)) {
					$completed = false;
				} elseif (is_array($value)) {
					$token->type = Token::T_ARRAY;
					$token->value = $value;
				} elseif (is_numeric($value)) {
					$token->type = Token::T_NUMBER;
					$token->value = $value;
				} elseif (preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $value)) {
					$token->type = Token::T_DATE;
					$date = \DateTime::createFromFormat("d/m/Y", $value, new \DateTimeZone( 'Europe/Paris' ));
					$error = \DateTime::getLastErrors();
					if ($error['error_count'] > 0) {
						throw new \Exception($error['errors'][0]);
					}
					$date->setTime(0, 0, 0);
					$token->value = $date;
				} elseif (in_array($value, array('true', 'false'))) {
					$token->type = Token::T_BOOLEAN;
					$token->value = $value == 'true';
				} else {
					$token->type = Token::T_TEXT;
					$token->value = $value;
				}
			} elseif ($token->type == Token::T_FIELD || $token->type == Token::T_IDENT)  {
				$completed = false;
			}
		}
		return $completed;
	}

	public function evaluate() {
		try {
			$ops = array();
			foreach ($this->tokens as $token) {
				if ($token->isOperator()) {
					$ops[] = $this->operation($token, $ops);
				} elseif ($token->isComparator()) {
					$ops[] = $this->comparison($token, $ops);
				} else {
					switch ($token->type) {
						case Token::T_NUMBER:
						case Token::T_DATE:
						case Token::T_BOOLEAN:
						case Token::T_TEXT:
						case Token::T_ANY:
						case Token::T_IDENT:
						case Token::T_FIELD:
						case Token::T_ARRAY:
						case Token::T_UNDEFINED:
							$ops[] = $token;
							break;
						case Token::T_FUNCTION:
							$ops[] = $this->func($token, $ops);
							break;
						default:
							throw new \Exception("Unrecognized token " . $token->value);
					}
				}
			}
			$result = end($ops);
			return $result->isVariable() ? false : ''.$result;
		} catch (\Exception $e) {
			return false;
		}
	}

	private function operation(Token $op, &$args) {
		if ($op->isUnaryOperator()) {
			if (count($args) < 1) {
				throw new \Exception("Illegal number (".count($args).") of operands for " . $op);
			}
			$arg1 = array_pop($args);
		} else if ($op->isBinaryOperator()) {
			if (count($args) < 2) {
				throw new \Exception("Illegal number (".count($args).") of operands for " . $op);
			}
			$arg2 = array_pop($args);
			$arg1 = array_pop($args);
		} else if ($op->isTernaryOperator()) {
			if (count($args) < 3) {
				throw new \Exception("Illegal number (".count($args).") of operands for " . $op);
			}
			$arg3 = array_pop($args);
			$arg2 = array_pop($args);
			$arg1 = array_pop($args);
		}
		$result = new Token(Token::T_NUMBER, 0);
		switch ($op->type) {
			case Token::T_PLUS:
				if ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} elseif ($arg1->type == Token::T_NUMBER) { 
					if ($arg2->type == Token::T_NUMBER) {
						$result->value = $arg1->value + $arg2->value;
					} else if ($arg2->type == Token::T_DATE) {
						$date = $arg2->value;
						$date->add(new \DateInterval('P'.$arg1->value.'D'));
						$result->type = Token::T_DATE;
						$result->value = $date;
					} else if ($arg2->type == Token::T_TEXT) {
						$result->type = Token::T_TEXT;
						$result->value = (string)$arg1->value.$arg2->value;
					} else {
						throw new \Exception("Illegal argument '".$arg2."' for ".$op);
					}
				} else if ($arg1->type == Token::T_DATE) {
					if ($arg2->type == Token::T_NUMBER) {
						$date = $arg1->value;
						$date->add(new \DateInterval('P'.$arg2->value.'D'));
						$result->type = Token::T_DATE;
						$result->value = $date;
					} else if ($arg2->type == Token::T_TEXT) {
						$result->type = Token::T_TEXT;
						$result->value = $arg1->value->format("d/m/Y").$arg2->value;
					} else {
						throw new \Exception("Illegal argument '".$arg2."' for ".$op);
					}
				} else if ($arg1->type == Token::T_TEXT) {
					$result->type = Token::T_TEXT;
					if ($arg2->type == Token::T_NUMBER) {
						$result->value = $arg1->value.(string)$arg2->value;
					} else if ($arg2->type == Token::T_DATE) {
						$result->value = $arg1->value.$arg2->value->format("d/m/Y");
					} else if ($arg2->type == Token::T_TEXT) {
						$result->value = $arg1->value.$arg2->value;
					} else {
						throw new \Exception("Illegal argument '".$arg2."' for ".$op);
					}
				} else {
					throw new \Exception("Illegal argument '".$arg1."' for ".$op);
				}
				break;
			case Token::T_MINUS:
				if ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} elseif ($arg1->type == Token::T_NUMBER) { 
					if ($arg2->type == Token::T_NUMBER) {
						$result->value = $arg1->value - $arg2->value;
					} else {
						throw new \Exception("Illegal argument '".$arg2."' for ".$op);
					}
				} else if ($arg1->type == Token::T_DATE) {
					if ($arg2->type == Token::T_NUMBER) {
						$date = $arg1->value;
						$ivl = new \DateInterval('P'.$arg2->value.'D');
						$ivl->invert = 1;
						$date->add($ivl);
						$result->type = Token::T_DATE;
						$result->value = $date;
					} else if ($arg2->type == Token::T_DATE) {
						$result->value = ($arg1->value > $arg2->value)
							? $arg1->value->diff($arg2->value)->days
							: 0;
					} else {
						throw new \Exception("Illegal argument '".$arg2."' for ".$op);
					}
				} else {
					throw new \Exception("Illegal argument '".$arg1."' for ".$op);
				}
				break;
			case Token::T_TIMES:
				if ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
					throw new \Exception("Illegal argument '".$arg2."' : operands must be numbers for ".$op);
				} else {
					$result->value = $arg1->value * $arg2->value;
				}
				break;
			case Token::T_DIV:
				if ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
					throw new \Exception("Illegal argument : operands must be numbers for ".$op);
				} else {
					$result->value = (float)$arg1->value / $arg2->value;
				}
				break;
			case Token::T_MOD:
				if ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
					throw new \Exception("Illegal argument : operands must be numbers for ".$op);
				} else {
					$result->value = (float)$arg1->value % $arg2->value;
				}
				break;
			case Token::T_POW:
				if ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
					throw new \Exception("Illegal argument : operands must be numbers for ".$op);
				} else {
					$result->value = (float)pow($arg1->value, $arg2->value);
				}
				break;
			case Token::T_BITWISE_AND:
				if ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
					throw new \Exception("Illegal argument : operands must be numbers for ".$op);
				} else {
					$result->value = (float)$arg1->value & $arg2->value;
				}
				break;
			case Token::T_BITWISE_XOR:
				if ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
					throw new \Exception("Illegal argument : operands must be numbers for ".$op);
				} else {
					$result->value = (float)$arg1->value ^ $arg2->value;
				}
				break;
			case Token::T_BITWISE_OR:
				if ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
					throw new \Exception("Illegal argument : operands must be numbers for ".$op);
				} else {
					$result->value = (float)$arg1->value | $arg2->value;
				}
				break;
			case Token::T_LOGICAL_AND:
				$result->type = Token::T_BOOLEAN;
				if ($arg1->type == Token::T_BOOLEAN && $arg2->type == Token::T_BOOLEAN) {
					$result->value = $arg1->value && $arg2->value;
				} elseif ($arg1->type == Token::T_BOOLEAN) {
					if (! $arg1->value) {
						$result->value = false;
					} elseif ($arg2->isVariable()) {
						$result->type = Token::T_UNDEFINED;
						$result->value = array($arg1, $arg2);
					} else {
						throw new \Exception("Illegal argument 2 : operand must be boolean for ".$op);
					}
				} elseif ($arg2->type == Token::T_BOOLEAN) {
					if (! $arg2->value) {
						$result->value = false;
					} elseif ($arg1->isVariable()) {
						$result->type = Token::T_UNDEFINED;
						$result->value = array($arg1, $arg2);
					} else {
						throw new \Exception("Illegal argument 1 : operand must be boolean for ".$op);
					}
				} elseif ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} else {
					throw new \Exception("Illegal argument : operands must be boolean for ".$op);
				}
				break;
			case Token::T_LOGICAL_OR:
				$result->type = Token::T_BOOLEAN;
				if ($arg1->type == Token::T_BOOLEAN && $arg2->type == Token::T_BOOLEAN) {
					$result->value = $arg1->value || $arg2->value;
				} elseif ($arg1->type == Token::T_BOOLEAN) {
					if ($arg1->value) {
						$result->value = true;
					} elseif ($arg2->isVariable()) {
						$result->type = Token::T_UNDEFINED;
						$result->value = array($arg1, $arg2);
					} else {
						throw new \Exception("Illegal argument 2 : operand must be boolean for ".$op);
					}
				} elseif ($arg2->type == Token::T_BOOLEAN) {
					if ($arg2->value) {
						$result->value = true;
					} elseif ($arg1->isVariable()) {
						$result->type = Token::T_UNDEFINED;
						$result->value = array($arg1, $arg2);
					} else {
						throw new \Exception("Illegal argument 1 : operand must be boolean for ".$op);
					}
				} elseif ($arg1->isVariable() || $arg2->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2);
				} else {
					throw new \Exception("Illegal argument : operands must be boolean for ".$op);
				}
				break;
			case Token::T_UNARY_PLUS:
				if ($arg1->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1);
				} elseif ($arg1->type != Token::T_NUMBER) { 
					throw new \Exception("Illegal argument '".$arg1."' : operand must be a number for ".$op);
				} else {
					$result->value = $arg1->value;
				}
				break;
			case Token::T_UNARY_MINUS:
				if ($arg1->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1);
				} elseif ($arg1->type != Token::T_NUMBER) { 
					throw new \Exception("Illegal argument '".$arg1."' : operand must be a number for ".$op);
				} else {
					$result->value = -$arg1->value;
				}
				break;
			case Token::T_NOT:
				if ($arg1->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1);
				} elseif ($arg1->type != Token::T_NUMBER && $arg1->type != Token::T_BOOLEAN) { 
					throw new \Exception("Illegal argument '".$arg1."' : operand must be a number or a boolean for ".$op);
				} else {
					$result->type = $arg1->type;
					$result->value = !$arg1->value;
				}
				break;
			case Token::T_DEGRE:
				if ($arg1->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1);
				} elseif ($arg1->type != Token::T_NUMBER) { 
					throw new \Exception("Illegal argument '".$arg1."' : operand must be a number for ".$op);
				} else {
					$result->value = deg2rad($arg1->value);
				}
				break;
			case Token::T_TERNARY_ELSE:
				$result = $arg1;
				break;
			case Token::T_TERNARY:
				if ($arg1->isVariable()) {
					$result->type = Token::T_UNDEFINED;
					$result->value = array($arg1, $arg2, $arg3);
				} elseif ($arg1->type != Token::T_BOOLEAN) { 
					throw new \Exception("Illegal argument '".$arg1."' : operand 1 must be a condition for ".$op);
				} else {
					$result = $arg1->value ? $arg2 : $arg3;
				}
				break;
		}
		$this->guessType($result);
		return $result;
	}

	private function comparison(Token $op, &$args) {
		if (count($args) < 2) {
			throw new \Exception("Illegal number (".count($args).") of operands for " . $op);
		}
		$arg2 = array_pop($args);
		$arg1 = array_pop($args);
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result = new Token(Token::T_UNDEFINED, array($arg1, $arg2));
		} elseif ($op->type != Token::T_CONTAINS && ! $this->compatible($arg1, $arg2)) { 
			throw new \Exception("operand types for '" . $op. "' are not identical");
		} elseif ($op->type == Token::T_CONTAINS && $arg1->type != Token::T_ARRAY) { 
			throw new \Exception("first operand type for '" . $op. "' is not an array");
		} else {
			$result = new Token(Token::T_BOOLEAN, false);
			switch ($op->type) {
				case Token::T_EQUAL:
					$result->value = ($arg1->value == $arg2->value);
					break;
				case Token::T_NOT_EQUAL:
					$result->value = ($arg1->value != $arg2->value);
					break;
				case Token::T_LESS_THAN:
					$result->value = ($arg1->value < $arg2->value);
					break;
				case Token::T_LESS_OR_EQUAL:
					$result->value = ($arg1->value <= $arg2->value);
					break;
				case Token::T_GREATER_THAN:
					$result->value = ($arg1->value > $arg2->value);
					break;
				case Token::T_GREATER_OR_EQUAL:
					$result->value = ($arg1->value >= $arg2->value);
					break;
				case Token::T_CONTAINS:
					$result->value = is_array($arg1->value) && in_array($arg2->value, $arg1->value);
					break;
				case Token::T_NOT_CONTAINS:
					$result->value = ! is_array($arg1->value) || ! in_array($arg2->value, $arg1->value);
					break;
			}
		}
		return $result;
	}

	private function compatible(Token $arg1, Token $arg2) {
		if ($arg1->type == $arg2->type) {
			return true;
		} elseif ($arg1->type == Token::T_NUMBER && $arg2->type == Token::T_TEXT && is_numeric($arg2->value)) {
			return true;
		} elseif ($arg2->type == Token::T_NUMBER && $arg1->type == Token::T_TEXT && is_numeric($arg1->value)) {
			return true;
		} elseif ($arg1->type == Token::T_DATE && $arg2->type == Token::T_TEXT && preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $arg2->value)) {
			return true;
		} elseif ($arg2->type == Token::T_DATE && $arg1->type == Token::T_TEXT && preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $arg1->value)) {
			return true;
		} elseif ($arg1->type == Token::T_BOOLEAN && $arg2->type == Token::T_TEXT && ($arg2->value == 'true' || $arg2->value == 'false')) {
			return true;
		} elseif ($arg2->type == Token::T_BOOLEAN && $arg1->type == Token::T_TEXT && ($arg1->value == 'true' || $arg1->value == 'false')) {
			return true;
		} else {
			return false;
		}
	}

	private function guessType(Token &$token) {
		if ($token->type == Token::T_TEXT) {
			if (is_numeric($token->value)) {
				$token->type = Token::T_NUMBER;
				$token->value = parseFloat($token->value);
			} else if (preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $token->value)) {
					$token->type = Token::T_DATE;
					$date = \DateTime::createFromFormat("d/m/Y", $token->value, new \DateTimeZone( 'Europe/Paris' ));
					$error = \DateTime::getLastErrors();
					if ($error['error_count'] > 0) {
						throw new \Exception($error['errors'][0]);
					}
					$date->setTime(0, 0, 0);
					$token->value = $date;
			} else if ($token->value === 'true' || $token->value === 'false') {
				$token->type = Token::T_BOOLEAN;
				$token->value = $token->value === 'true';
			}
		}
	}

	private static function easter($year) {
		$days = easter_days($year);
		$easter = \DateTime::createFromFormat('Y-m-d', $year.'-3-21');
		$easter->setTime(0, 0, 0);	 
		$easter->add(new \DateInterval('P'.$days.'D'));
		$easter->setTime(0, 0, 0);
		return $easter;
	}

	public function nthDayOfMonth($nth, $day, $month, $year) {
	$dayname = array('sunday',  'monday',  'tuesday',  'wednesday',  'thursday',  'friday',  'saturday',  'sun',  'mon',  'tue',  'wed',  'thu',  'fri',  'sat',  'sun');
		$monthname = array('january',  'february',  'march',  'april',  'may',  'june',  'july',  'august',  'september',  'october',  'november',  'december',  'jan',  'feb',  'mar',  'apr',  'may',  'jun',  'jul',  'aug',  'sep',  'sept',  'oct',  'nov',  'dec');
		$ordinal = array('first',  'second',  'third',  'fourth',  'fifth',  'sixth',  'seventh',  'eighth',  'ninth',  'tenth',  'eleventh',  'twelfth');
		return new \DateTime($ordinal[$nth - 1]. " ".$dayname[$day]." of ".$monthname[$month - 1]." ".$year);
	}

	public static function lastDay($month, $year) {
		$monthname = array('january',  'february',  'march',  'april',  'may',  'june',  'july',  'august',  'september',  'october',  'november',  'december',  'jan',  'feb',  'mar',  'apr',  'may',  'jun',  'jul',  'aug',  'sep',  'sept',  'oct',  'nov',  'dec');
		$lastDate =  new \DateTime("last day of ".$monthname[$month - 1]." ".$year);
		return (int)$lastDate->format('j');
	}

	public static function firstDayOfMonth($dateObj) {
		$date = clone $dateObj;
		$date->modify('first day of this month');
		return $date;
	}

	public static function lastDayOfMonth($dateObj) {
		$date = clone $dateObj;
		$date->modify('last day of this month');
		return $date;
	}

	private static function fixedHolidays($year, $lang = "en-US") {
		$fholidays = array(
			"US" => array(
				"01-01", "07-04", "11-01", "12-25"
			),
			"FR" => array(
				"01-01", "05-01", "05-08", "07-14", "08-15", "11-01", "11-11", "12-25"
			),
		);
		$lg = explode("-", $lang);
		$lg = strtoupper (end($lg));
		if (!isset($fholidays[$lg])) $lg = "US";
		$holidays = array();
		foreach($fholidays[$lg] as $monthday) {
			$holiday = \DateTime::createFromFormat('Y-m-d', $year.'-'.$monthday);
			$holiday->setTime(0, 0, 0);
			$holidays[] = $holiday;
		}
		return $holidays;
	}

	private static function moveableHolidays($year, $lang = "en-US") {
		$easter = self::easter($year);
		$holidays = array(
			"US" => array(),
			"FR" => array(
				clone $easter, clone $easter->add(new \DateInterval('P1D')), clone $easter->add(new \DateInterval('P38D')), clone $easter->add(new \DateInterval('P10D')), clone $easter->add(new \DateInterval('P1D'))
			),
		);
		$lg = explode("-", $lang);
		$lg = strtoupper (end($lg));
		if (!isset($holidays[$lg])) $lg = "US";
		return $holidays[$lg];
	}

	private static function holidays($year, $lang = "en.US") {
		$holidays =  self::moveableHolidays($year, $lang);
		$fixed =  self::fixedHolidays($year, $lang);
		foreach($fixed as $holiday) {
			$holidays[] = $holiday;
		}
		return $holidays;
	}

	public static function workdays($startDate, $endDate) {
		// Validate input
		if ($endDate < $startDate)
			return 0;

		// Calculate days between dates
		$startDate->setTime(0,0,1);  // Start just after midnight
		$endDate->setTime(23,59,59);  // End just before midnight
		$days = $startDate->diff($endDate)->days + 1;  // days between datetime objects
		// Subtract two weekend days for every week in between
		$weeks = floor($days / 7);
		$days = $days - ($weeks * 2);

		// Handle special cases
		$startDay = ((int)$startDate->format('N')) % 7;
		$endDay = ((int)$endDate->format('N')) % 7;

		// Remove weekend not previously removed.   
		if ($startDay - $endDay > 1)		 
			$days = $days - 2;	  

		// Remove start day if span starts on Sunday but ends before Saturday
		if ($startDay == 0 && $endDay != 6)
			$days = $days - 1;

		// Remove end day if span ends on Saturday but starts after Sunday
		if ($endDay == 6 && $startDay != 0)
			$days = $days - 1;  
		$lang = "fr-FR";
		$startYear = (int)$startDate->format('Y');
		$endYear = (int)$endDate->format('Y');
		$startDate->setTime(0, 0, 0);
		for ($y = $startYear; $y <= $endYear; $y++) {
			$holidays = self::holidays($y, $lang);
			foreach($holidays as $holiday) {
				$d = ((int)$holiday->format('N')) % 7;
				if ($d != 0 && $d != 6 && $holiday >= $startDate && $holiday <= $endDate)
					$days = $days - 1;
			}
		}
		return $days;
	}

	private static function isWorkingDay($date) {
		$day = ((int)$date->format('N')) % 7;
		if ($day == 0 || $day == 6) {
			return false; 
		}
		$lang = "fr-FR";
		$holidays = self::holidays((int)$date->format('Y'), $lang);
		foreach($holidays as $holiday) {
			if ($holiday == $date) {
				return false;
			}
		}
		return true;
	}

	public static function nextWorkingDay($date) {
		$d = $date;
		while (! self::isWorkingDay($d)) {
			$d->add(new \DateInterval('P1D'));
		}
		return $d;
	}

	public static function addMonths($months, $dateObject) {
		$next = new \DateTime($dateObject->format('Y-m-d'));
		$next->modify('last day of +'.$months.' month');
		if($dateObject->format('d') > $next->format('d')) {
			$int = $dateObject->diff($next);
		} else {
			$int = new \DateInterval('P'.$months.'M');
		}
		$date = clone $dateObject;
		$newDate = $date->add($int);
		return $newDate;
	}

	private function func(Token $func, &$args) {
		$functions = array(
			"abs" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return abs($a); }),
			"acos" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return acos($a); }),
			"acosh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return acosh($a); }),
			"addMonths" => array(2, array(Token::T_NUMBER, Token::T_DATE), Token::T_DATE, function($a, $b) { return Expression::addMonths($a, $b); }),
			"asin" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return asin($a); }),
			"asinh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return asinh($a); }),
			"atan" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return atan($a); }),
			"atan2" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return atan2($a, $b); }),
			"atanh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return atanh($a); }),
			"ceil" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return ceil($a); }),
			"concat" => array(-1, array(Token::T_TEXT), Token::T_TEXT, function($a) { 
				$s = '';
				foreach ($a as $v) {
					$s .= isset($v) ? $v : '';
				};
				return $s;
			}),
			"cos" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return cos($a); }),
			"cosh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return cosh($a); }),
			"count" => array(-1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { 
				$c = 0;
				foreach ($a as $v) {
					if (isset($v)) {
						$c += 1;
					}
				};
				return $c;
			}),
			"day" => array(1, array(Token::T_DATE), Token::T_NUMBER, function($a) { return (float)$a->format('d'); }),
			"exp" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return exp($a); }),
			"firstDayOfMonth" => array(1, array(Token::T_DATE), Token::T_DATE, function($a) { return Expression::firstDayOfMonth($a); }),
			"floor" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return floor($a); }),
			"fullmonth" => array(1, array(Token::T_DATE), Token::T_TEXT, function($a) {
				$months = array("janvier", "février", "mars", "avril", "mai", "juin",  "juillet", "août", "septembre", "octobre", "novembre", "décembre");
				return $months[(int)$a->format('m') - 1].' '.$a->format('Y');
			}),
			"get" => array(2, array(Token::T_ARRAY, Token::T_NUMBER), Token::T_TEXT, function($a, $b) { return isset($a[$b - 1]) ? $a[$b - 1] : ""; }),
			"lastday" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return Expression::lastDay($b, $a); }),
			"lastDayOfMonth" => array(1, array(Token::T_DATE), Token::T_DATE, function($a) { return Expression::lastDayOfMonth($a); }),
			"lcfirst" => array(1, array(Token::T_TEXT), Token::T_TEXT, function($a) { return lcfirst($a); }),
			"length" => array(1, array(Token::T_TEXT), Token::T_NUMBER, function($a) { return mb_strlen($a, 'utf8'); }),
			"log" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return log($a); }),
			"log10" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return log10($a); }),
			"lower" => array(1, array(Token::T_TEXT), Token::T_TEXT, function($a) { return strtolower($a); }),
			"match" => array(2, array(Token::T_TEXT, Token::T_TEXT), Token::T_BOOLEAN, function($a, $b) { return preg_match($a, $b); }),
			"max" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return max($a, $b); }),
			"min" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return min($a, $b); }),
			"money" => array(1, array(Token::T_NUMBER), Token::T_TEXT, function($a) { return (string)number_format($a , 2 , "," , " "); }),
			"month" => array(1, array(Token::T_DATE), Token::T_NUMBER, function($a) { return (float)$a->format('m'); }),
			"nextWorkDay" => array(1, array(Token::T_DATE), Token::T_DATE, function($a) { return Expression::nextWorkingDay($a); }),
			"pow" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return pow($a, $b); }),
			"rand" => array(0, array(), Token::T_NUMBER, function() { return rand(); }),
			"replace" => array(3, array(Token::T_TEXT, Token::T_TEXT, Token::T_TEXT), Token::T_TEXT, function($a, $b, $c) { return str_replace($a, $b, $c); }),
			"round" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return round($a); }),
			"sin" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return sin($a); }),
			"sinh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return sinh($a); }),
			"size" => array(1, array(Token::T_ARRAY), Token::T_NUMBER, function($a) { return count($a); }),
			"split" => array(2, array(Token::T_TEXT, Token::T_TEXT), Token::T_ARRAY, function($a, $b) { return explode($a, $b); }),
			"sqrt" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return sqrt($a); }),
			"strftime" => array(2, array(Token::T_TEXT, Token::T_NUMBER), Token::T_TEXT, function($a, $b) { return strftime($a, $b); }),
			"strtotime" => array(1, array(Token::T_TEXT), Token::T_NUMBER, function($a) { return strtotime($a); }),
			"substr" => array(3, array(Token::T_TEXT, Token::T_NUMBER, Token::T_NUMBER), Token::T_TEXT, function($a, $b, $c) { return substr($a, $b - 1, $c); }),
			"sum" => array(-1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { 
				$s = 0;
				foreach ($a as $v) {
					if (isset($v)) {
						$s += $v;
					}
				};
				return $s;
			}),
			"tan" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return tan($a); }),
			"tanh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return tanh($a); }),
			"trim" => array(1, array(Token::T_TEXT), Token::T_TEXT, function($a) { return trim($a); }),
			"ucfirst" => array(1, array(Token::T_TEXT), Token::T_TEXT, function($a) { return ucfirst($a); }),
			"upper" => array(1, array(Token::T_TEXT), Token::T_TEXT, function($a) { return strtoupper($a); }),
			"workdays" => array(2, array(Token::T_DATE, Token::T_DATE), Token::T_NUMBER, function($a, $b) { return Expression::workdays($a, $b); }),
			"year" => array(1, array(Token::T_DATE), Token::T_NUMBER, function($a) { return (float)$a->format('Y'); })
		);
		if ($func->value == "defined") {
			if (count($args) < 1) { 
				throw new \Exception("Illegal number (".count($args).") of operands for function" . $func);
			}
			$arg = array_pop($args);
			if ($arg->isVariable()) {
				return new Token(Token::T_BOOLEAN, false);
			}
			if ($arg->value === null || $arg->value == "") {
				return new Token(Token::T_BOOLEAN, false);
			}
			return new Token(Token::T_BOOLEAN, true);
		}
		if (! isset($functions[$func->value])) {
			throw new \Exception("Unknown function : " . $func);
		}
		$argscount = $functions[$func->value][0];
		$variableArgsCount = false;
		if ($argscount == -1) {
			$argscount = count($args);
			$variableArgsCount = true;
		}
		if (count($args) < $argscount) {
			throw new \Exception("Illegal number (".count($args).") of operands for function" . $func);
		}
		$argslist = array();
		for (; $argscount > 0; --$argscount) {
			$arg = array_pop($args);
			if (! $variableArgsCount) {
				if ($arg->isVariable()) {
					return new Token(Token::T_UNDEFINED, array($arg));
				}
				$type = $functions[$func->value][1][$argscount - 1];
				if ($arg->type != $type) { 
					$expected = "";
					switch ($type) {
						case Token::T_NUMBER:
							$expected = "number";
							break;
						case Token::T_DATE: 
							$expected = "date";
							break;
						case Token::T_BOOLEAN:
							$expected = "boolean";
							break;
						case Token::T_TEXT: 
							$expected = "text";
							break;
						case Token::T_ARRAY: 
							$expected = "array";
							break;
					}
					throw new \Exception("Illegal type for argument '".$arg."' : operand must be a ".$expected." for ".$func);
				}
				array_unshift($argslist, $arg->value); 
			} else if ($arg->isVariable()) {
				unset($arg->value);
			} else {
				array_unshift($argslist, $arg->value); 
			}
		}
		if ($variableArgsCount) {
			$argslist = array($argslist);
		}
		return new Token($functions[$func->value][2], call_user_func_array($functions[$func->value][3], $argslist));
	}

}

?>
