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
				$this->setToken($token, $value);
			}
		}
	}

	public function setNamedFields($fields) {
		foreach ($this->tokens as $token) {
			if ($token->type == Token::T_IDENT && isset($fields[$token->value])) {
				$value = $fields[$token->value];
				$this->setToken($token, $value);
			}
		}
	}

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

	protected function setToken(Token &$token, $value) {
		if (is_array($value)) {
			$token->type = Token::T_ARRAY;
			$token->value = $value;
		} elseif (is_numeric($value)) {
			$token->type = Token::T_NUMBER;
			$token->value = $value;
		} elseif (preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $value)) {
			$this->setDateToken($token, $value);
		} elseif (in_array($value, array('true', 'false'))) {
			$token->type = Token::T_BOOLEAN;
			$token->value = $value == 'true';
		} else {
			$token->type = Token::T_TEXT;
			$token->value = $value;
		}
	}

	protected function setDateToken(Token &$token, $value) {
		$token->type = Token::T_DATE;
		$date = \DateTime::createFromFormat("d/m/Y", $value, new \DateTimeZone( 'Europe/Paris' ));
		$error = \DateTime::getLastErrors();
		if ($error['error_count'] > 0) {
			throw new \Exception($error['errors'][0]);
		}
		$date->setTime(0, 0, 0);
		$token->value = $date;
	}

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
