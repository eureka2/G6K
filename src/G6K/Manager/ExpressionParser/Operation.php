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
 * This class provides static functions that perform logical or arithmetic operations
 *
 * @copyright Jacques Archimède
 *
 */
class Operation {

	/**
	 * Calculates and returns the result of adding two numbers, a date and a number of days, or the concatenation of two strings..
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the second operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the addition
	 * @return  void
	 * @throws \Exception
	 *
	 */
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
				$result->value = $arg1->value->format(DateFunction::$dateFormat).$arg2->value;
			} else {
				throw new \Exception("Illegal argument '".$arg2);
			}
		} else if ($arg1->type == Token::T_TEXT) {
			$result->type = Token::T_TEXT;
			if ($arg2->type == Token::T_NUMBER) {
				$result->value = $arg1->value.(string)$arg2->value;
			} else if ($arg2->type == Token::T_DATE) {
				$result->value = $arg1->value.$arg2->value->format(DateFunction::$dateFormat);
			} else if ($arg2->type == Token::T_TEXT) {
				$result->value = $arg1->value.$arg2->value;
			} else {
				throw new \Exception("Illegal argument '".$arg2);
			}
		} else {
			throw new \Exception("Illegal argument '".$arg1);
		}
	}

	/**
	 * Calculates and returns the result of subtracting two numbers or a date and a number of days.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the second operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the subtraction
	 * @return  void
	 * @throws \Exception
	 *
	 */
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

	/**
	 * Calculates and returns the product of two numbers.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the product
	 * @return  void
	 * @throws \Exception
	 *
	 */
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

	/**
	 * Calculates and returns the quotient of the Euclidean division of one number by another.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the dividend
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the divisor
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the quotient of the division
	 * @return  void
	 * @throws \Exception
	 *
	 */
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

	/**
	 * Calculates and returns the remainder of the Euclidean division of one number by another.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the dividend
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the divisor
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the remainder of the division
	 * @return  void
	 * @throws \Exception
	 *
	 */
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

	/**
	 * Calculates and returns the result of the first operand raised to the power of the operand.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the second operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the operation
	 * @return  void
	 * @throws \Exception
	 *
	 */
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

	/**
	 * Calculates and returns the result of the bitwise AND on the two given operands.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the second operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the bitwide AND
	 * @return  void
	 * @throws \Exception
	 *
	 */
	public static function bitwiseAnd(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument : operands must be numbers");
		} else {
			$result->value = (float)((int)$arg1->value & (int)$arg2->value);
		}
	}

	/**
	 * Calculates and returns the result of the bitwise XOR on the two given operands.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the second operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the bitwide XOR
	 * @return  void
	 * @throws \Exception
	 *
	 */
	public static function bitwiseXor(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument : operands must be numbers");
		} else {
			$result->value = (float)((int)$arg1->value ^ (int)$arg2->value);
		}
	}

	/**
	 * Calculates and returns the result of the bitwise OR on the two given operands.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the second operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the bitwide OR
	 * @return  void
	 * @throws \Exception
	 *
	 */
	public static function bitwiseOr(Token $arg1, Token $arg2, Token &$result) {
		if ($arg1->isVariable() || $arg2->isVariable()) {
			$result->type = Token::T_UNDEFINED;
			$result->value = array($arg1, $arg2);
		} elseif ($arg1->type != Token::T_NUMBER || $arg2->type != Token::T_NUMBER) { 
			throw new \Exception("Illegal argument : operands must be numbers");
		} else {
			$result->value = (float)((int)$arg1->value | (int)$arg2->value);
		}
	}

	/**
	 * Calculates and returns the result of the logical AND on the two given operands.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the second operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the logical AND
	 * @return  void
	 * @throws \Exception
	 *
	 */
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

	/**
	 * Calculates and returns the result of the logical OR on the two given operands.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the second operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the logical OR
	 * @return  void
	 * @throws \Exception <description of the exception>
	 *
	 */
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

	/**
	 * Calculates and returns the result of the unary positive operation on the given operand.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the operation
	 * @return  void
	 * @throws \Exception <description of the exception>
	 *
	 */
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

	/**
	 * Calculates and returns the result of the unary negation on the given operand.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the negation
	 * @return  void
	 * @throws \Exception <description of the exception>
	 *
	 */
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

	/**
	 * Calculates and returns the result of the logical negation on the given operand.
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the logical negation
	 * @return  void
	 * @throws \Exception <description of the exception>
	 *
	 */
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

	/**
	 * Converts a number expressed in radians to a number expressed in degrees 
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the number expressed in radians
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the number expressed in degrees
	 * @return  void
	 * @throws \Exception
	 *
	 */
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

	/**
	 * Transfers the argument into the result token (for the else part of a ternary operation)
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the first operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the ternary else operation
	 * @return  void
	 *
	 */
	public static function ternaryElse(Token $arg1, Token &$result) {
		$result = $arg1;
	}

	/**
	 * Evaluates the first argument, if true the result is the second argument otherwise the result is the third argument
	 *
	 * @access  public
	 * @static 
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg1 The token containing the boolean operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg2 The token containing the second operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token $arg3 The token containing the third operand
	 * @param   \App\G6K\Manager\ExpressionParser\Token &$result The token containing the result of the ternary operation
	 * @return  void
	 * @throws \Exception
	 *
	 */
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
