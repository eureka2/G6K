<?php

namespace EUREKA\G6KBundle\Entity;

class BusinessRule {
	
	private $simulator = null;
	private $elementId = 0;
	private $id = "";
	private $name = "";
	private $label = "";
	private $conditions = "";
	private $ifActions = array();
	private $elseActions = array();	
	
		
	private $inverseOperators = array(
		"present" => "blank",
		"blank"   => "present",
		"="       => "!=",
		"!="      => "=",
		">"       => "<=",
		"<="      => ">",
		"<"       => ">=",
		">="      => "<",
		"isTrue"  => "isFalse",
		"isFalse" => "isTrue"
	);

	public function __construct($simulator, $elementId, $id, $name) {
		$this->simulator = $simulator;
		$this->elementId = $elementId;
		$this->id = $id;
		$this->name = $name;
	}
	
	public function getSimulator() {
		return $this->simulator;
	}
	
	public function getElementId() {
		return $this->elementId;
	}
	
	public function setElementId($elementId) {
		$this->elementId = $elementId;
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function setId($id) {
		$this->id = $id;
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function setName($name) {
		$this->name = $name;
	}
	
	public function getLabel() {
		return $this->label;
	}
	
	public function setLabel($label) {
		$this->label = $label;
	}
	
	public function getConditions() {
		return $this->conditions;
	}
	
	public function setConditions($conditions) {
		$this->conditions = $conditions;
	}
	
	public function getIfActions() {
		return $this->ifActions;
	}
	
	public function setIfActions($ifActions) {
		$this->ifActions = $ifActions;
	}
	
	public function addIfAction($ifAction) {
		$this->ifActions[] = $ifAction;
	}
	
	public function getElseActions() {
		return $this->elseActions;
	}
	
	public function setElseActions($elseActions) {
		$this->elseActions = $elseActions;
	}
	
	public function addElseAction($elseAction) {
		$this->elseActions[] = $elseAction;
	}
	
	public function getExtendedConditions() {
		$extended = $this->parseConditions();
		$this->optimize($extended);
		$this->plainConditions($extended);
		return $extended;
	}
	
	protected function getPlainOperator($operator) {
		$operators = array(
			'=' => 'is equal to',
			'!=' => 'is not equal to',
			'>' => 'is greater than',
			'>=' => 'is greater than or equal to',
			'<' => 'is less than',
			'<=' => 'is less than or equal to',
			'isTrue' => 'is true',
			'isFalse' => 'is false',
			'contains' => 'contains',
			'matches' => 'matches',
			'present' => 'is present',
			'blank' => 'is not present'
		);
		return isset($operators[$operator]) ? $operators[$operator] : $operator;
	}
	
	protected function plainConditions(&$ruleData) {
		if ($ruleData !== array_values($ruleData)) {
			if (isset($ruleData["name"])) {
				if ($ruleData["name"] == 'script') {
					$ruleData["name"] = 'Javascript';
					$ruleData["operator"] = 'is';
					$ruleData["value"] = $ruleData["value"] == 1 ? 'enabled' : 'disabled';
				} elseif ($ruleData["name"] == 'dynamic') {
					$ruleData["name"] = 'User Interface';
					$ruleData["operator"] =  $ruleData["value"] == 1 ? 'is' : 'is not';
					$ruleData["value"] = 'interactive';
				} elseif (preg_match("/step(\d+)\.dynamic$/", $ruleData["name"], $matches)) {
					$ruleData["name"] = 'User Interface for step ' . $matches[1];
					$ruleData["operator"] =  $ruleData["value"] == 1 ? 'is' : 'is not';
					$ruleData["value"] = 'interactive';
				} elseif (preg_match("/^#(\d+)$/", $ruleData["name"], $matches)) {
					$data = $this->simulator->getDataById($matches[1]);
					$ruleData["name"] = $data->getLabel();
					if ($data->getType() == 'choice') {
						$data->setValue($ruleData["value"]);
						$label = $data->getChoiceLabel();
						if ($label != "") {
							$ruleData["value"] = '«' . $label . '»';
						}
					}
				} else {
					$data = $this->simulator->getDataByName($ruleData["name"]);
					$ruleData["name"] = $data->getLabel();
				}
				if (isset($ruleData["operator"])) {
					$ruleData["operator"] = $this->getPlainOperator($ruleData["operator"]);
				}
				if (isset($ruleData["value"])) {
					$ruleData["value"] = $this->simulator->replaceByDataLabel($ruleData["value"]);
				}
			} elseif (isset($ruleData["all"])) {
				$this->plainConditions($ruleData["all"]);
			} elseif (isset($ruleData["any"])) {
				$this->plainConditions($ruleData["any"]);
			} elseif (isset($ruleData["none"])) {
				$this->plainConditions($ruleData["none"]);
			}	
		} else {
			foreach ($ruleData as $i => $cond) {
				$this->plainConditions($ruleData[$i]);
			}
		}
	}
		
	protected function negate(&$ruleData) {
		if ($ruleData !== array_values($ruleData)) {
			if (isset($ruleData["all"])) {
				$this->negate($ruleData["all"]);
				$ruleData["any"] = $ruleData["all"];
				unset($ruleData["all"]);
			} elseif (isset($ruleData["any"])) {
				$ruleData["none"] = $ruleData["any"];
				unset($ruleData["any"]);
			} elseif (isset($ruleData["none"])) {
				$ruleData["any"] = $ruleData["none"];
				unset($ruleData["none"]);
			} else {
				$ruleData["operator"] = $this->inverseOperators[$ruleData["operator"]];
			}
		} else {
			foreach ($ruleData as $i => $cond) {
				$this->negate($cond);
			}
		}
	}
	
	protected function optimize (&$ruleData) {
		if (isset($ruleData["all"]) && count($ruleData["all"]) == 1) {
			$ruleData = $ruleData['all'][0];
		} elseif (isset($ruleData["any"]) && count($ruleData["any"]) == 1) {
			$ruleData = $ruleData['any'][0];
		}
		do {
			$optimized = false;
			if (isset($ruleData["all"])) {
				$conds = array();
				foreach ($ruleData["all"] as $i => $cond) {
					if (isset($cond["all"])) {
						foreach ($cond["all"] as $j => $scond) {
							array_push($conds, $scond);
						}
						array_splice($ruleData["all"], $i, 1, array($conds[0]));
						for ($j = 1; $j < count($conds); $j++) {
							array_splice($ruleData["all"], $i + $j, 0, array($conds[$j]));
						}
						$optimized = true;
					}
				}
			} else if (isset($ruleData["any"])) {
				$conds = array();
				foreach ($ruleData["any"] as $i => $cond) {
					if (isset($cond["any"])) {
						foreach ($cond["any"] as $j => $scond) {
							array_push($conds, $scond);
						}
						array_splice($ruleData["any"], $i, 1, array($conds[0]));
						for ($j = 1; $j < count($conds); $j++) {
							array_splice($ruleData["any"], $i + $j, 0, array($conds[$j]));
						}
						$optimized = true;
					}
				}
			} else if (isset($ruleData["none"])) {
				$conds = array();
				foreach ($ruleData["none"] as $i => $cond) {
					if (isset($cond["none"])) {
						foreach ($cond["none"] as $j => $scond) {
							array_push($conds, $scond);
						}
						array_splice($ruleData["none"], $i, 1, array($conds[0]));
						for ($j = 1; $j < count($conds); $j++) {
							array_splice($ruleData["none"], $i + $j, 0, array($conds[$j]));
						}
						$optimized = true;
					}
				}
			}
		} while ($optimized);
	}
	
	protected function parseConditions() {
		
		$arities = array(
			"abs" => 1,
			"acos" => 1,
			"acosh" => 1,
			"asin" => 1,
			"asinh" => 1,
			"atan" => 1,
			"atan2" => 2,
			"atanh" => 1,
			"ceil" => 1,
			"cos" => 1,
			"cosh" => 1,
			"count" => -1,
			"day" => 1,
			"exp" => 1,
			"floor" => 1,
			"fullmonth" => 1,
			"lastday" => 2,
			"log" => 1,
			"log10" => 1,
			"max" => 2,
			"min" => 2,
			"month" => 1,
			"pow" => 2,
			"rand" => 0,
			"round" => 1,
			"sin" => 1,
			"sinh" => 1,
			"sqrt" => 1,
			"sum" => -1,
			"tan" => 1,
			"tanh" => 1,
			"workdays" => 2,
			"workdaysofmonth" => 2,
			"year" => 1
		);
		
		$parser = new ExpressionParser();
		if (preg_match("/^#\d+$/", $this->conditions)) {
			$this->conditions .= ' = true';
		}
		$expr = $parser->parse($this->conditions);
		$expr->postfix();
		$ops = array();
		$stack = array();
		foreach ($expr->get() as $k => $token) {
			if ($token->type == Token::T_NOT || $token->type == Token::T_LOGICAL_AND || $token->type == Token::T_LOGICAL_OR) {
				if (count($ops) > 0) {
					$fieldName = $ops[count($ops) - 1];
					if (preg_match("/^#(\d+)$/", $fieldName, $matches)) {
						$data = $this->simulator->getDataById($matches[1]);
					} else {
						$data = $this->simulator->getDataByName($fieldName);
					}
					if ($data !== null && $data->getType() == 'boolean') {
						array_push($stack, array(
							'name' => $data->getName(),
							'operator' => 'isTrue',
							'value' => null
						));
						array_pop($ops);
					}
				}
			}
			if ($token->isUnaryOperator()) {
				if ($token->type == Token::T_NOT) {
					$arg = array_pop($stack);
					$this->negate($arg);
					array_push($stack, $arg);
				} else {
					$arg = array_pop($ops);
					array_push($ops, $token->value . $arg);
				}
			} elseif ($token->isBinaryOperator()) {
				if ($token->type == Token::T_LOGICAL_AND) {
					$arg2 = array_pop($stack);
					$arg1 = array_pop($stack);
					array_push($stack, array(
						'all' => array( $arg1, $arg2 )
					));
				} elseif ($token->type == Token::T_LOGICAL_OR) {
					$arg2 = array_pop($stack);
					$arg1 = array_pop($stack);
					array_push($stack, array(
						'any' => array( $arg1, $arg2 )
					));
				} else {
					$arg2 = array_pop($ops);
					$arg1 = array_pop($ops);
					array_push($ops, $arg1 . ' ' . $token->value . ' ' . $arg2);
				}
			} elseif ($token->isComparator()) {
				$arg2 = array_pop($ops);
				$arg1 = array_pop($ops);
				if (($token->type == Token::T_EQUAL || $token->type == Token::T_NOT_EQUAL) && ($arg2 === 'true' || $arg2 === 'false')) {
					$operator = ($token->type == Token::T_EQUAL && $arg2 == 'true') || ($token->type == Token::T_NOT_EQUAL && $arg2 == 'false') ? 'isTrue' : 'isFalse';
					array_push($stack, array(
						'name' => $arg1,
						'operator' => $operator,
						'value' => null
					));
				} else {
					array_push($stack, array(
						'name' => $arg1,
						'operator' => $token->value,
						'value' => $arg2
					));
				}
			} else {
				switch ($token->type) {
					case Token::T_FIELD:
						array_push($ops, '#' . $token->value);
						break;
					case Token::T_DATE:
						array_push($ops, $token->value->format('d/m/Y'));
						break;
					case Token::T_NUMBER:
						array_push($ops, '' . $token->value);
						break;
					case Token::T_BOOLEAN:
						array_push($ops, $token->value ? 'true' : 'false');
						break;
					case Token::T_TEXT:
					case Token::T_IDENT:
					case Token::T_UNDEFINED:
						array_push($ops, $token->value);
						break;
					case Token::T_FUNCTION:
						if ($token->value == "defined") {
							$arg = array_pop($ops);
							array_push($stack, array(
								'name' => $arg,
								'operator' => 'present',
								'value' => null
							));
						} else {
							if (! isset($arities[$token->value])) {
								throw new \Exception("Unrecognized function " . $token->value);
							}
							$arity = $arities[$token->value];
							if (count($ops) < $arity) {
								throw new \Exception("Too few arguments for function " . $token->value);
							}
							$args = array();
							for ($a = 0; $a < $arity; $a++) {
								array_unshift($args, array_pop($ops));
							}
							array_push($ops, $token->value . '(' . implode(', ', $args) . ')');
						}
						break;
					default:
						throw new \Exception("Unrecognized token " . $token->value);
				}
			}
		}
		if (count($ops) > 0) {
			throw new \Exception("Syntax error");
		}
		$result = isset($stack[0]['name']) ? array("all" => array($stack[0])) : $stack[0];
		return $result;
	}
	
}

?>