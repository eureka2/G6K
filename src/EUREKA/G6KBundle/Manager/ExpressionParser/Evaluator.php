<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2017 Jacques Archimède

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

/**
 *
 * This class allows the evaluation of postfixed expressions (RPN notation)
 *
 * @copyright Jacques Archimède
 *
 */
class Evaluator {

	/**
	 * Constructor of class Evaluator
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function __construct() {
	}

	/**
	 * Performs the evaluation of a postfixed expression
	 *
	 * @access  public
	 * @param   array &$tokens The postfixed expression
	 * @return  \EUREKA\G6KBundle\Manager\ExpressionParser\Token|false The result token of the evaluation
	 * @throws \Exception
	 *
	 */
	public function run(&$tokens) {
		try {
			$ops = array();
			foreach ($tokens as $token) {
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

	/**
	 * Realizes an unary, binary or ternary operation and returns the result token.
	 *
	 * @access  private
	 * @param   \EUREKA\G6KBundle\Manager\ExpressionParser\Token $op The operator token
	 * @param   array &$args The arguments of the operation
	 * @return  \EUREKA\G6KBundle\Manager\ExpressionParser\Token The result token of the operation
	 * @throws \Exception
	 *
	 */
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
		try {
			$result = new Token(Token::T_NUMBER, 0);
			switch ($op->type) {
				case Token::T_PLUS:
					Operation::plus($arg1, $arg2, $result);
					break;
				case Token::T_MINUS:
					Operation::minus($arg1, $arg2, $result);
					break;
				case Token::T_TIMES:
					Operation::times($arg1, $arg2, $result);
					break;
				case Token::T_DIV:
					Operation::div($arg1, $arg2, $result);
					break;
				case Token::T_MOD:
					Operation::mod($arg1, $arg2, $result);
					break;
				case Token::T_POW:
					Operation::pow($arg1, $arg2, $result);
					break;
				case Token::T_BITWISE_AND:
					Operation::bitwiseAnd($arg1, $arg2, $result);
					break;
				case Token::T_BITWISE_XOR:
					Operation::bitwiseXor($arg1, $arg2, $result);
					break;
				case Token::T_BITWISE_OR:
					Operation::bitwiseOr($arg1, $arg2, $result);
					break;
				case Token::T_LOGICAL_AND:
					Operation::logicalAnd($arg1, $arg2, $result);
					break;
				case Token::T_LOGICAL_OR:
					Operation::logicalOr($arg1, $arg2, $result);
					break;
				case Token::T_UNARY_PLUS:
					Operation::unaryPlus($arg1, $result);
					break;
				case Token::T_UNARY_MINUS:
					Operation::unaryMinus($arg1, $result);
					break;
				case Token::T_NOT:
					Operation::not($arg1, $result);
					break;
				case Token::T_DEGRE:
					Operation::degre($arg1, $result);
					break;
				case Token::T_TERNARY_ELSE:
					Operation::ternaryElse($arg1, $result);
					break;
				case Token::T_TERNARY:
					Operation::ternary($arg1, $arg2, $arg3, $result);
					break;
			}
			$this->guessType($result);
			return $result;
		} catch (\Exception $e) {
			throw new \Exception($op . " : " . $e->getMessage());
		}
	}

	/**
	 * Compares two arguments with a comparison operator and returns the result token.
	 *
	 * @access  private
	 * @param   \EUREKA\G6KBundle\Manager\ExpressionParser\Token $op The comparison operator token
	 * @param   array &$args The arguments of the comparison
	 * @return  \EUREKA\G6KBundle\Manager\ExpressionParser\Token The result token of the comparison
	 * @throws \Exception
	 *
	 */
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

	/**
	 * Determines whether two arguments have compatible types.
	 *
	 * @access  private
	 * @param   \EUREKA\G6KBundle\Manager\ExpressionParser\Token $arg1 The first argument
	 * @param   \EUREKA\G6KBundle\Manager\ExpressionParser\Token $arg2 The second argument
	 * @return  bool true if the two arguments have compatible types, false otherwise
	 *
	 */
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

	/**
	 * Guess the type of a token value
	 *
	 * @access  private
	 * @param   \EUREKA\G6KBundle\Manager\ExpressionParser\Token &$token <parameter description>
	 * @return  void
	 * @throws \Exception
	 *
	 */
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

	/**
	 * Evaluates a function and returns the result token.
	 *
	 * @access  private
	 * @param   \EUREKA\G6KBundle\Manager\ExpressionParser\Token $func The function token
	 * @param   array &$args The arguments of the fuction
	 * @return  \EUREKA\G6KBundle\Manager\ExpressionParser\Token The result token
	 * @throws \Exception
	 *
	 */
	private function func(Token $func, &$args) {
		$functions = array(
			"abs" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return abs($a); }),
			"acos" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return acos($a); }),
			"acosh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return acosh($a); }),
			"addMonths" => array(2, array(Token::T_NUMBER, Token::T_DATE), Token::T_DATE, function($a, \DateTime $b) { return DateFunction::addMonths($a, $b); }),
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
			"day" => array(1, array(Token::T_DATE), Token::T_NUMBER, function(\DateTime $a) { return (float)$a->format('d'); }),
			"exp" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return exp($a); }),
			"firstDayOfMonth" => array(1, array(Token::T_DATE), Token::T_DATE, function(\DateTime $a) { return DateFunction::firstDayOfMonth($a); }),
			"floor" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return floor($a); }),
			"fullmonth" => array(1, array(Token::T_DATE), Token::T_TEXT, function(\DateTime $a) {
				$months = array("janvier", "février", "mars", "avril", "mai", "juin",  "juillet", "août", "septembre", "octobre", "novembre", "décembre");
				return $months[(int)$a->format('m') - 1].' '.$a->format('Y');
			}),
			"get" => array(2, array(Token::T_ARRAY, Token::T_NUMBER), Token::T_TEXT, function($a, $b) { return isset($a[$b - 1]) ? $a[$b - 1] : ""; }),
			"lastday" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return DateFunction::lastDay($b, $a); }),
			"lastDayOfMonth" => array(1, array(Token::T_DATE), Token::T_DATE, function($a) { return DateFunction::lastDayOfMonth($a); }),
			"lcfirst" => array(1, array(Token::T_TEXT), Token::T_TEXT, function($a) { return lcfirst($a); }),
			"length" => array(1, array(Token::T_TEXT), Token::T_NUMBER, function($a) { return mb_strlen($a, 'utf8'); }),
			"log" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return log($a); }),
			"log10" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return log10($a); }),
			"lower" => array(1, array(Token::T_TEXT), Token::T_TEXT, function($a) { return strtolower($a); }),
			"match" => array(2, array(Token::T_TEXT, Token::T_TEXT), Token::T_BOOLEAN, function($a, $b) { return preg_match($a, $b); }),
			"max" => array(-1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return max($a); }),
			"min" => array(-1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return min($a); }),
			"money" => array(1, array(Token::T_NUMBER), Token::T_TEXT, function($a) { return (string)number_format($a , 2 , "," , " "); }),
			"month" => array(1, array(Token::T_DATE), Token::T_NUMBER, function(\DateTime $a) { return (float)$a->format('m'); }),
			"nextWorkDay" => array(1, array(Token::T_DATE), Token::T_DATE, function(\DateTime $a) { return Holidays::nextWorkingDay($a); }),
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
			"workdays" => array(2, array(Token::T_DATE, Token::T_DATE), Token::T_NUMBER, function(\DateTime $a, \DateTime $b) { return Holidays::workdays($a, $b); }),
			"workdaysofmonth" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { 
				$d1 = \DateTime::createFromFormat('Y-n-j', $a . '-' . $b . '-1');
				$d2 = DateFunction::lastDayOfMonth($d1);
				return Holidays::workdays($d1, $d2);
			}), 
			"year" => array(1, array(Token::T_DATE), Token::T_NUMBER, function(\DateTime $a) { return (float)$a->format('Y'); })
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
			$argscount = $func->arity;
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
				return new Token(Token::T_UNDEFINED, array($arg));
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
