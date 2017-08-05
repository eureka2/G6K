<?php

/*
The MIT License (MIT)

Copyright (c) 2017 Jacques Archimède

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

class Operation {

	public static function plus(Token $arg1, Token $arg2, Token &$result) {
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
				throw new \Exception("Illegal argument '".$arg2);
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
				throw new \Exception("Illegal argument '".$arg2);
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
				throw new \Exception("Illegal argument '".$arg2);
			}
		} else {
			throw new \Exception("Illegal argument '".$arg1);
		}
	}

	public static function minus(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type == Token::T_NUMBER) { 
			if ($arg2->type == Token::T_NUMBER) {
				$result->value = $arg1->value - $arg2->value;
			} else {
				throw new \Exception("Illegal argument '".$arg2);
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
				throw new \Exception("Illegal argument '".$arg2);
			}
		} else {
			throw new \Exception("Illegal argument '".$arg1);
		}
	}

	public static function times(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument '".$arg2."' : operands must be numbers");
		} else {
			$result->value = $arg1->value * $arg2->value;
		}
	}

	public static function div(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument : operands must be numbers");
		} else {
			$result->value = (float)$arg1->value / $arg2->value;
		}
	}

	public static function mod(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument : operands must be numbers");
		} else {
			$result->value = (float)$arg1->value % $arg2->value;
		}
	}

	public static function pow(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument : operands must be numbers");
		} else {
			$result->value = (float)pow($arg1->value, $arg2->value);
		}
	}

	public static function bitwiseAnd(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument : operands must be numbers");
		} else {
			$result->value = (float)$arg1->value & $arg2->value;
		}
	}

	public static function bitwiseXor(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument : operands must be numbers");
		} else {
			$result->value = (float)$arg1->value ^ $arg2->value;
		}
	}

	public static function bitwiseOr(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument : operands must be numbers");
		} else {
			$result->value = (float)$arg1->value | $arg2->value;
		}
	}

	public static function logicalAnd(Token $arg1, Token $arg2, Token &$result) {
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
				throw new \Exception("Illegal argument 2 : operand must be boolean");
			}
		} elseif ($arg2->type == Token::T_BOOLEAN) {
			if (! $arg2->value) {
				$result->value = false;
			} elseif ($arg1->isVariable()) {
				$result->type = Token::T_UNDEFINED;
				$result->value = array($arg1, $arg2);
			} else {
				throw new \Exception("Illegal argument 1 : operand must be boolean");
			}
		} elseif ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} else {
			throw new \Exception("Illegal argument : operands must be boolean");
		}
	}

	public static function logicalOr(Token $arg1, Token $arg2, Token &$result) {
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
				throw new \Exception("Illegal argument 2 : operand must be boolean");
			}
		} elseif ($arg2->type == Token::T_BOOLEAN) {
			if ($arg2->value) {
				$result->value = true;
			} elseif ($arg1->isVariable()) {
				$result->type = Token::T_UNDEFINED;
				$result->value = array($arg1, $arg2);
			} else {
				throw new \Exception("Illegal argument 1 : operand must be boolean");
			}
		} elseif ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} else {
			throw new \Exception("Illegal argument : operands must be boolean");
		}
	}

	public static function unaryPlus(Token $arg1, Token &$result) {
		if ($arg1->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1);
		} elseif ($arg1->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument '".$arg1."' : operand must be a number");
		} else {
			$result->value = $arg1->value;
		}
	}

	public static function unaryMinus(Token $arg1, Token &$result) {
		if ($arg1->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1);
		} elseif ($arg1->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument '".$arg1."' : operand must be a number");
		} else {
			$result->value = -$arg1->value;
		}
	}

	public static function not(Token $arg1, Token &$result) {
		if ($arg1->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1);
		} elseif ($arg1->type != Token::T_NUMBER && $arg1->type != Token::T_BOOLEAN) { 
			throw new \Exception("Illegal argument '".$arg1."' : operand must be a number or a boolean");
		} else {
			$result->type = $arg1->type;
			$result->value = !$arg1->value;
		}
	}

	public static function degre(Token $arg1, Token &$result) {
		if ($arg1->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1);
		} elseif ($arg1->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument '".$arg1."' : operand must be a number");
		} else {
			$result->value = deg2rad($arg1->value);
		}
	}

	public static function ternaryElse(Token $arg1, Token &$result) {
		$result = $arg1;
	}

	public static function ternary(Token $arg1, Token $arg2, Token $arg3, Token &$result) {
		if ($arg1->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2, $arg3);
		} elseif ($arg1->type != Token::T_BOOLEAN) { 
			throw new \Exception("Illegal argument '".$arg1."' : operand 1 must be a condition");
		} else {
			$result = $arg1->value ? $arg2 : $arg3;
		}
	}

}

?>
