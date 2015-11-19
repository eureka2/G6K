<?php

namespace EUREKA\G6KBundle\Entity;

class Token {

    const	T_UNDEFINED    		= 0,
			T_NUMBER      		= 1,  
			T_DATE        		= 2, 
			T_BOOLEAN        	= 3, 
			T_TEXT		       	= 4, 
			T_IDENT       		= 5,  
			T_FUNCTION    		= 6,  
			T_POPEN       		= 7,  
			T_PCLOSE      		= 8, 
			T_COMMA       		= 9, 
			T_NOOP	    		= 10, 
			T_PLUS        		= 11, 
			T_MINUS       		= 12, 
			T_TIMES      	 	= 13, 
			T_DIV         		= 14, 
			T_MOD         		= 15, 
			T_POW         		= 16, 
			T_UNARY_PLUS  		= 17, 
			T_UNARY_MINUS 		= 18, 
			T_NOT         		= 19, 
			T_FIELD       		= 20, 
			T_EQUAL				= 21,
			T_NOT_EQUAL			= 22,
			T_LESS_THAN			= 23,
			T_LESS_OR_EQUAL		= 24,
			T_GREATER_THAN		= 25,
			T_GREATER_OR_EQUAL	= 26,
			T_BITWISE_AND		= 27,
			T_BITWISE_OR		= 28,
			T_BITWISE_XOR		= 29,
			T_LOGICAL_AND		= 30,
			T_LOGICAL_OR		= 31,
			T_TERNARY			= 32,
			T_TERNARY_ELSE		= 33,
			T_DEGRE				= 34;

	const	A_NONE				= 0,
			A_LEFT				= 1,
			A_RIGHT				= 2;
	
    public $type, $value;

    public function __construct($type, $value) {
        $this->type  = $type;
        $this->value = $value;
    }
	
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
	
    public function isTernaryOperator(){
        switch ($this->type) {
            case self::T_TERNARY:
               return true;
        }
		return false;
	}
	
    public function isOperator(){
		return $this->isUnaryOperator() 
			|| $this->isBinaryOperator() 
			|| $this->isTernaryOperator();
	}
	
    public function isComparator(){
        switch ($this->type) {
            case self::T_EQUAL:
            case self::T_NOT_EQUAL:
            case self::T_LESS_THAN:
            case self::T_LESS_OR_EQUAL:
            case self::T_GREATER_THAN:
            case self::T_GREATER_OR_EQUAL:
                return true;
        }
		return false;
	}
	
    public function isVariable(){
        switch ($this->type) {
            case self::T_IDENT:
            case self::T_FIELD:
            case self::T_UNDEFINED:
                return true;
        }
		return false;
	}
	
    public function isUndefined(){
		return $this->type == self::T_UNDEFINED;
	}
		
	public function isBeforeFunctionArgument(){
        switch ($this->type) {
	        case self::T_POPEN:
	        case self::T_COMMA:
	        case self::T_NOOP:
	            return true;
	    }
		return false;
	}
	
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
	
	public function __toString() {
		switch ($this->type) {
			case self::T_DATE:
				return $this->value->format("d/m/Y");
				break;
			case self::T_BOOLEAN:
				return $this->value ? 'true' : 'false';
				break;
			case self::T_FUNCTION:
				return $this->value;
				break;
			default:
				return (string)$this->value;
		}
	}
}

class Expression {

	protected $tokens = array( );
	protected $postfixed = false;
	
	public function get(){
		return $this->tokens;
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
				case Token::T_IDENT:
				case Token::T_FIELD:
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
				if (is_numeric($value)) {
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
				if (is_numeric($value)) {
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
				if (strlen($value) == 0) {
					$completed = false;
				} else if (is_numeric($value)) {
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
			} else if ($token->type == Token::T_IDENT && isset($variables[$token->value])) {
				$value = $variables[$token->value];
				if (strlen($value) == 0) {
					$completed = false;
				} else if (is_numeric($value)) {
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
						case Token::T_IDENT:
						case Token::T_FIELD:
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
		} elseif ($arg1->type != $arg2->type) { 
			throw new \Exception("operand types for '" . $op. "' are not identical");
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
			}
		}
		return $result;
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
	
	private function nthDayOfMonth($nth, $day, $month, $year) {


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
	
	private function func(Token $func, &$args) {
		$functions = array(
			"abs" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return abs($a); }),
			"acos" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return acos($a); }),
			"acosh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return acosh($a); }),
			"asin" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return asin($a); }),
			"asinh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return asinh($a); }),
			"atan" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return atan($a); }),
			"atan2" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return atan2($a, $b); }),
			"atanh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return atanh($a); }),
			"ceil" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return ceil($a); }),
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
			"floor" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return floor($a); }),
			"fullmonth" => array(1, array(Token::T_DATE), Token::T_TEXT, function($a) {
				$months = array("janvier", "février", "mars", "avril", "mai", "juin",  "juillet", "août", "septembre", "octobre", "novembre", "décembre");
				return $months[(int)$a->format('m') - 1].' '.$a->format('Y');
			}),
			"lastday" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return Expression::lastDay($b, $a); }),
			"log" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return log($a); }),
			"log10" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return log10($a); }),
			"max" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return max($a, $b); }),
			"min" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return min($a, $b); }),
			"money" => array(1, array(Token::T_NUMBER), Token::T_TEXT, function($a) { return (string)number_format($a , 2 , "," , " "); }),
			"month" => array(1, array(Token::T_DATE), Token::T_NUMBER, function($a) { return (float)$a->format('m'); }),
			"nextWorkDay" => array(1, array(Token::T_DATE), Token::T_DATE, function($a) { return Expression::nextWorkingDay($a); }),
			"pow" => array(2, array(Token::T_NUMBER, Token::T_NUMBER), Token::T_NUMBER, function($a, $b) { return pow($a, $b); }),
			"rand" => array(0, array(), Token::T_NUMBER, function() { return rand(); }),
			"round" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return round($a); }),
			"sin" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return sin($a); }),
			"sinh" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return sinh($a); }),
			"sqrt" => array(1, array(Token::T_NUMBER), Token::T_NUMBER, function($a) { return sqrt($a); }),
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
		$argc = $functions[$func->value][0];
		$variableArgsCount = false;
		if ($argc == -1) {
			$argc = count($args);
			$variableArgsCount = true;
		}
		if (count($args) < $argc) {
			throw new \Exception("Illegal number (".count($args).") of operands for function" . $func);
		}
		$argv = array();
		for (; $argc > 0; --$argc) {
			$arg = array_pop($args);
			if (! $variableArgsCount) {
				if ($arg->isVariable()) {
					return new Token(Token::T_UNDEFINED, array($arg));
				}
				$type = $functions[$func->value][1][$argc - 1];
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
					}
					throw new \Exception("Illegal type for argument '".$arg."' : operand must be a ".$expected." for ".$func);
				}
				array_unshift($argv, $arg->value); 
			} else if ($arg->isVariable()) {
				unset($arg->value);
			} else {
				array_unshift($argv, $arg->value); 
			}
		}
		if ($variableArgsCount) {
			$argv = array($argv);
		}
		return new Token($functions[$func->value][2], call_user_func_array($functions[$func->value][3], $argv));
	}
	
}

class ExpressionParser {

	const PATTERN = '/([\s!,\+\-\*\/\^%\(\)=\<\>\&\^\|\?\:°])/u';

    protected $lookup = array(
        '+' => Token::T_PLUS,
        '-' => Token::T_MINUS,
        '/' => Token::T_DIV,
        '%' => Token::T_MOD,
        '(' => Token::T_POPEN,
        ')' => Token::T_PCLOSE,
        '*' => Token::T_TIMES,
        '!' => Token::T_NOT,
        ',' => Token::T_COMMA,
        '=' => Token::T_EQUAL,
        '<' => Token::T_LESS_THAN,
        '>' => Token::T_GREATER_THAN,
        '&' => Token::T_BITWISE_AND,
        '^' => Token::T_BITWISE_XOR,
        '|' => Token::T_BITWISE_OR,
        '?' => Token::T_TERNARY,
        ':' => Token::T_TERNARY_ELSE,
        '°' => Token::T_DEGRE
    );
	
	private $text = array();

	private function replaceText($matches) {
		$this->text[] = substr($matches[0], 1, strlen($matches[0]) - 2);
		return "¤".count($this->text);
	}
	
	public function parse ($infix) {
		$constants = array(
			'pi'	=> new Token(Token::T_NUMBER, M_PI),
			'now'	=> new Token(Token::T_DATE, new \DateTime()),
			'today'	=> new Token(Token::T_DATE, new \DateTime()),
			'true'	=> new Token(Token::T_BOOLEAN, true),
			'false'	=> new Token(Token::T_BOOLEAN, false)
		);
		$expr = new Expression();
		$infix = preg_replace_callback(
			array("|'[^']*'|", '|"[^"]*"|'),
			array($this, 'replaceText'),
			$infix
		);
		$infix = preg_replace("#(\d{1,2})/(\d{1,2})/(\d{4})#", "D$1.$2.$3", $infix);
		$toks = preg_split(self::PATTERN, $infix, -1, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE);
		$prev = new Token(Token::T_NOOP, 'noop');
		foreach ($toks as $value) {
			$value = trim($value);
			if (is_numeric($value)) {
                if ($prev->type === Token::T_PCLOSE)
                    $expr->push(new Token(Token::T_TIMES, '*'));
                $expr->push($prev = new Token(Token::T_NUMBER, (float) $value));
            } else if (preg_match("/^#\d+$/", $value)) {
                if ($prev->type === Token::T_PCLOSE)
                    $expr->push(new Token(Token::T_TIMES, '*'));
                $expr->push($prev = new Token(Token::T_FIELD, (int)substr($value, 1)));
            } else if (preg_match("/^¤(\d+)$/", $value, $matches)) {
                if ($prev->type === Token::T_PCLOSE)
                    $expr->push(new Token(Token::T_TIMES, '*'));
				$i = (int)$matches[1];
                $expr->push($prev = new Token(Token::T_TEXT, $this->text[$i - 1]));
            } else if (preg_match("/^D(\d{1,2})\.(\d{1,2})\.(\d{4})$/", $value, $matches)) {
                if ($prev->type === Token::T_PCLOSE)
                    $expr->push(new Token(Token::T_TIMES, '*'));
				$date = \DateTime::createFromFormat("d/m/Y", $matches[1]."/".$matches[2]."/".$matches[3], new \DateTimeZone( 'Europe/Paris' ));
				$error = \DateTime::getLastErrors();
				if ($error['error_count'] > 0) {
					throw new \Exception($error['errors'][0]);
				}
				$date->setTime(0, 0, 0);
                $expr->push($prev = new Token(Token::T_DATE, $date));
			} elseif (isset($constants[$value])) {
                if ($prev->type === Token::T_PCLOSE)
                    $expr->push(new Token(Token::T_TIMES, '*'));
                $expr->push($prev = clone $constants[$value]);
			} else if ($value != "") {
				switch ($type = isset($this->lookup[$value]) ? $this->lookup[$value] : Token::T_IDENT) {
					case Token::T_EQUAL:
						switch ($prev->type) {
							case Token::T_NOT:
								$expr->pop();
								$type = Token::T_NOT_EQUAL;
								$value = "!=";
								break;
							case Token::T_LESS_THAN:
								$expr->pop();
								$type = Token::T_LESS_OR_EQUAL;
								$value = "<=";
								break;
							case Token::T_GREATER_THAN:
								$expr->pop();
								$type = Token::T_GREATER_OR_EQUAL;
								$value = ">=";
								break;
						}						
						break;
					case Token::T_BITWISE_AND:
						if ($prev->type === Token::T_BITWISE_AND) {
							$expr->pop();
							$type = Token::T_LOGICAL_AND;
							$value = "&&";
						}
						break;
					case Token::T_BITWISE_OR:
						if ($prev->type === Token::T_BITWISE_OR) {
							$expr->pop();
							$type = Token::T_LOGICAL_OR;
							$value = "||";
						}
						break;
					case Token::T_TIMES:
						if ($prev->type === Token::T_TIMES) {
							$expr->pop();
							$type = Token::T_POW;
							$value = "**";
						}
						break;
					case Token::T_PLUS:
						if ($prev->isOperator() || $prev->isComparator() || $prev->isBeforeFunctionArgument())
							$type = Token::T_UNARY_PLUS;
						break;

					case Token::T_MINUS:
						if ($prev->isOperator() || $prev->isComparator() || $prev->isBeforeFunctionArgument())
							$type = Token::T_UNARY_MINUS;
						break;

					case Token::T_POPEN:
						switch ($prev->type) {
							case Token::T_IDENT:
								$prev->type = Token::T_FUNCTION;
								break;

							case Token::T_NUMBER:
							case Token::T_DATE:
							case Token::T_BOOLEAN:
							case Token::T_TEXT:
							case Token::T_PCLOSE:
								$expr->push(new Token(Token::T_TIMES, '*'));
								break;
						}

						break;
				}
				$expr->push($prev = new Token($type, $value));
			}
		}
		return $expr;	
	}
}

?>