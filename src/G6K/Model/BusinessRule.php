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

use App\G6K\Manager\ExpressionParser\Parser;
use App\G6K\Manager\ExpressionParser\Token;

/**
 * This class allows the storage and retrieval of the attributes of a business rule
 *
 * @author    Jacques Archimède
 *
 */
class BusinessRule {

	/**
	 * @var \App\G6K\Model\Simulator $simulator Simulator object that defines this BusinessRule
	 *
	 * @access  private
	 *
	 */
	private $simulator = null;

	/**
	 * @var string        $elementId Generated id of this business rule for the DOM element in the browser
	 *
	 * @access  private
	 *
	 */
	private $elementId = '0';

	/**
	 * @var int     $id ID of this BusinessRule
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $name Name of this BusinessRule without spaces or special or accented characters
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $label Label of this BusinessRule
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var string     $conditions  Conditions value
	 *
	 * @access  private
	 *
	 */
	private $conditions = "";

	/**
	 * @var \App\G6K\Model\Connector $connector Connector that defines this BusinessRule
	 *
	 * @access  private
	 *
	 */
	private $connector = null;

	/**
	 * @var array      $ifActions Array of actions matching the IF condition of this business rule
	 *
	 * @access  private
	 *
	 */
	private $ifActions = array();

	/**
	 * @var array      $elseActions Array of actions matching the ELSE condition of this business rule 
	 *
	 * @access  private
	 *
	 */
	private $elseActions = array();	

	/**
	 * @var \Symfony\Contracts\Translation\TranslatorInterface|null $translator Instance of translation service
	 *
	 * @access  private
	 *
	 */
	private $translator = null;

	/**
	 * @var array      $inverseOperators Array of inverse operators 
	 *
	 * @access  private
	 *
	 */
	private $inverseOperators = array(
		"present" => "blank",
		"blank"   => "present",
		"="       => "!=",
		"!="      => "=",
		"~"       => "!~",
		"!~"      => "~",
		">"       => "<=",
		"<="      => ">",
		"<"       => ">=",
		">="      => "<",
		"isTrue"  => "isFalse",
		"isFalse" => "isTrue"
	);

	/**
	 * Constructor of class BusinessRule
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator $simulator Simulator object that defines this BusinessRule
	 * @param   string    $elementId Generated id of this business rule for the DOM element in the browser
	 * @param   int $id ID of this business rule
	 * @param   string $name Name of this business rule without spaces or special or accented characters
	 * @return  void
	 *
	 */
	public function __construct(Simulator $simulator, $elementId, $id, $name) {
		$this->simulator = $simulator;
		$this->translator = $simulator->getController()->getTranslator();
		$this->elementId = $elementId;
		$this->id = $id;
		$this->name = $name;
	}

	/**
	 * Returns the Simulator object that defines this BusinessRule
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Simulator the Simulator object
	 *
	 */
	public function getSimulator() {
		return $this->simulator;
	}

	/**
	 * Returns the generated id of this business rule for the DOM element in the browser
	 *
	 * @access  public
	 * @return  string  The generated id of this business rule
	 *
	 */
	public function getElementId() {
		return $this->elementId;
	}

	/**
	 * Sets the generated id of this business rule for the DOM element in the browser
	 *
	 *
	 * @access  public
	 * @param   string   $elementId The generated id of this business rule
	 * @return  void
	 *
	 */
	public function setElementId($elementId) {
		$this->elementId = $elementId;
	}

	/**
	 * Returns the business rule ID
	 *
	 * @access  public
	 * @return  int The business rule id
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the business rule ID
	 *
	 * @access  public
	 * @param   int $id The business rule id
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the business rule name
	 *
	 * @access  public
	 * @return  string the Business rule name
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the business rule name
	 *
	 * @access  public
	 * @param   string $name The business rule name without spaces or special or accented characters 
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the business rule label
	 *
	 * @access  public
	 * @return  string The business rule label
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the business rule label
	 *
	 * @access  public
	 * @param   string $label The business rule label
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the business rule conditions
	 *
	 * @access  public
	 * @return  string The business rule conditions
	 *
	 */
	public function getConditions() {
		return $this->conditions;
	}

	/**
	 * Sets the business rule conditions
	 *
	 * @access  public
	 * @param   string   $conditions  The business rule conditions
	 * @return  void
	 *
	 */
	public function setConditions($conditions) {
		$this->conditions = $conditions;
	}

	/**
	 * Returns the Connector object of this business rule
	 *
	 * @access  public
	 * @return \App\G6K\Model\Connector The Connector object of this business rule
	 *
	 */
	public function getConnector() {
		return $this->connector;
	}

	/**
	 * Sets the Connector object of this business rule
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Connector $connector The Connector object of this business rule
	 * @return  void
	 *
	 */
	public function setConnector($connector) {
		$this->connector = $connector;
	}

	/**
	 * Returns the list of actions that must be executed if the conditions of this business rule are verified.
	 *
	 * @access  public
	 * @return  array The list of actions
	 *
	 */
	public function getIfActions() {
		return $this->ifActions;
	}

	/**
	 * Sets the list of actions that must be executed if the conditions of this business rule are verified.
	 *
	 * @access  public
	 * @param   array  $ifActions The list of actions
	 * @return  void
	 *
	 */
	public function setIfActions($ifActions) {
		$this->ifActions = $ifActions;
	}

	/**
	 * Adds an action to the list of actions that must be executed if the conditions of this business rule are verified.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RuleAction  $ifAction The action to be added
	 * @return  void
	 *
	 */
	public function addIfAction($ifAction) {
		$this->ifActions[] = $ifAction;
	}

	/**
	 * Returns the list of actions that must be executed if the conditions of this business rule are NOT verified.
	 *
	 * @access  public
	 * @return  array The list of actions
	 *
	 */
	public function getElseActions() {
		return $this->elseActions;
	}

	/**
	 * Sets the list of actions that must be executed if the conditions of this business rule are NOT verified.
	 *
	 * @access  public
	 * @param   array  $elseActions The list of actions
	 * @return  void
	 *
	 */
	public function setElseActions($elseActions) {
		$this->elseActions = $elseActions;
	}

	/**
	 * Adds an action to the list of actions that must be executed if the conditions of this business rule are NOT verified.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RuleAction  $elseAction Action The action to be added
	 * @return  void
	 *
	 */
	public function addElseAction($elseAction) {
		$this->elseActions[] = $elseAction;
	}

	/**
	 * Returns the conditions of this business rule in a readable format.
	 *
	 * If the business rule has no connector, the conditions are first parsed then optimized.
	 *
	 * @access  public
	 * @return  array The conditions in a readable format
	 *
	 */
	public function getExtendedConditions() {
		if ($this->connector !== null) {
			$extended = $this->ruleConnector($this->connector);
		} else {
			$extended = $this->parseConditions();
			$this->optimize($extended);
		}
		$this->plainConditions($extended);
		return $extended;
	}

	/**
	 * Transforms a connector into an array of conditions
	 *
	 * A connector is either a Condition object or a Connector object
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Connector|\App\G6K\Model\Condition $pconnector The connector
	 * @return  array The array of conditions
	 *
	 */
	public function ruleConnector($pconnector) {
		if ($pconnector instanceof Condition) {
			$operand = $pconnector->getOperand();
			$data = is_numeric($operand) ? 
					$this->simulator->getDataById((int)$operand) :
					$this->simulator->getDataByName($operand);
			return array(
				'name' => $data === null ? $operand : $data->getName(),
				'operator' => $pconnector->getOperator(),
				'value' =>  $pconnector->getExpression()
			);
		}
		$kind = $pconnector->getType();
		$connector = array(
			$kind => array()
		);
		foreach ($pconnector->getConditions() as $cond) {
			$connector[$kind][] = $this->ruleConnector($cond);
		}
		return $connector;
	}

	/**
	 * Returns the readable format of an operator
	 *
	 * @access  protected
	 * @param   string $operator The operator 
	 * @param   string $type Type of operand to which the operator applies
	 * @return  string The readable format of the operator
	 *
	 */
	protected function getPlainOperator($operator, $type) {
		$operators = array(
			'=' => $this->translator->trans('is equal to'),
			'!=' => $this->translator->trans('is not equal to'),
			'>' => $this->translator->trans('is greater than'),
			'>=' => $this->translator->trans('is greater than or equal to'),
			'<' => $this->translator->trans('is less than'),
			'<=' => $this->translator->trans('is less than or equal to'),
			'isTrue' => $this->translator->trans('is true'),
			'isFalse' => $this->translator->trans('is false'),
			'~' => $this->translator->trans('contains'),
			'!~' => $this->translator->trans('not contains'),
			'matches' => $this->translator->trans('matches'),
			'present' => $this->translator->trans('is present'),
			'blank' => $this->translator->trans('is not present')
		);
		$dateOperators = array(
			'=' => $this->translator->trans('is'),
			'!=' => $this->translator->trans('is not'),
			'>' => $this->translator->trans('is after'),
			'>=' => $this->translator->trans('is not before'),
			'<' => $this->translator->trans('is before'),
			'<=' => $this->translator->trans('is not after'),
			'~' => $this->translator->trans('contains'),
			'!~' => $this->translator->trans('not contains'),
			'present' => $this->translator->trans('is present'),
			'blank' => $this->translator->trans('is not present')
		);
		if ($type == 'date' || $type == 'day' || $type == 'month' || $type == 'year') {
			return isset($dateOperators[$operator]) ? $dateOperators[$operator] : $operator;
		} else {
			return isset($operators[$operator]) ? $operators[$operator] : $operator;
		}
	}

	/**
	 * Transforms the array of parsed conditions of this business rule into an array of conditions in a readable format
	 *
	 * @access  protected
	 * @param   array &$ruleData The array of parsed conditions
	 * @return  void
	 *
	 */
	protected function plainConditions(&$ruleData) {
		if ($ruleData !== array_values($ruleData)) {
			if (isset($ruleData["name"])) {
				$type = 'boolean';
				if ($ruleData["name"] == 'script') {
					$ruleData["id"] = 0;
					$ruleData["name"] = $this->translator->trans('Javascript');
					$ruleData["operator"] = $this->translator->trans('is');
					$ruleData["value"] = $ruleData["value"] == 1 ? $this->translator->trans('enabled') : $this->translator->trans('disabled');
				} elseif ($ruleData["name"] == 'dynamic') {
					$ruleData["id"] = 0;
					$ruleData["name"] = $this->translator->trans('User Interface');
					$ruleData["operator"] =  $ruleData["value"] == 1 ? $this->translator->trans('is') : $this->translator->trans('is not');
					$ruleData["value"] = $this->translator->trans('interactive');
				} elseif (preg_match("/step(\d+)\.dynamic$/", $ruleData["name"], $matches)) {
					$ruleData["id"] = 0;
					$ruleData["name"] = $this->translator->trans('User Interface for step %id%', array('%id%' => $matches[1]));
					$ruleData["operator"] =  $ruleData["value"] == 1 ? $this->translator->trans('is') : $this->translator->trans('is not');
					$ruleData["value"] = $this->translator->trans('interactive');
				} elseif (preg_match("/^#(\d+)$/", $ruleData["name"], $matches)) {
					$data = $this->simulator->getDataById((int)$matches[1]);
					$type = $data->getType();
					$ruleData["id"] = $data->getId();
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
					$type = $data->getType();
					$ruleData["id"] = $data->getId();
					$ruleData["name"] = $data->getLabel();
					if ($data->getType() == 'choice') {
						$data->setValue($ruleData["value"]);
						$label = $data->getChoiceLabel();
						if ($label != "") {
							$ruleData["value"] = '«' . $label . '»';
						}
					}
				}
				if (isset($ruleData["operator"])) {
					$ruleData["operator"] = $this->getPlainOperator($ruleData["operator"], $type);
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

	/**
	 * Transforms the array of parsed conditions of this business rule into their negative forms
	 *
	 * @access  protected
	 * @param   array &$ruleData The array of parsed conditions
	 * @return  void
	 *
	 */
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

	/**
	 * function optimize 
	 *
	 * @access  protected
	 * @param   array &$ruleData The array of parsed conditions
	 * @return  void
	 *
	 */
	protected function optimize (&$ruleData) {
		if (isset($ruleData["all"]) && count($ruleData["all"]) == 1) {
			$ruleData = $ruleData['all'][0];
		} elseif (isset($ruleData["any"]) && count($ruleData["any"]) == 1) {
			$ruleData = $ruleData['any'][0];
		}
		do {
			$optimized = false;
			if (isset($ruleData["all"])) {
				$optimized = $this->optimizeCond($ruleData, "all") || $optimized;
			} else if (isset($ruleData["any"])) {
				$optimized = $this->optimizeCond($ruleData, "any") || $optimized;
			} else if (isset($ruleData["none"])) {
				$optimized = $this->optimizeCond($ruleData, "none") || $optimized;
			}
		} while ($optimized);
	}

	/**
	 * function optimizeCond
	 *
	 * @access  protected
	 * @param   array &$ruleData <parameter description>
	 * @param   string $connector Connector that defines this BusinessRule
	 * @return  bool the value of optimized
	 *
	 */
	protected function optimizeCond(&$ruleData, $connector) {
		$optimized = false;
		$conds = array();
		foreach ($ruleData[$connector] as $i => $cond) {
			if (isset($cond[$connector])) {
				foreach ($cond[$connector] as $j => $scond) {
					array_push($conds, $scond);
				}
				array_splice($ruleData[$connector], $i, 1, array($conds[0]));
				$condsCount = count($conds);
				for ($j = 1; $j < $condsCount; $j++) {
					array_splice($ruleData[$connector], $i + $j, 0, array($conds[$j]));
				}
				$optimized = true;
			}
		}
		return $optimized;
	}

	/**
	 * Parses the conditions of this business rule in an array to be usable by the administration module..
	 *
	 * @access  protected
	 * @return  array The array of the parsed conditions
	 * @throws \Exception if an error occurs
	 *
	 */
	protected function parseConditions() {
		
		$arities = array(
			"abs" => 1,
			"acos" => 1,
			"acosh" => 1,
			"addMonths" => 2,
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
			"firstDayOfMonth" => 1,
			"floor" => 1,
			"fullmonth" => 1,
			"lastday" => 2,
			"lastDayOfMonth" => 1,
			"log" => 1,
			"log10" => 1,
			"max" => 2,
			"min" => 2,
			"money" => 1,
			"month" => 1,
			"nextWorkDay" => 1,
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
		
		$parser = new Parser();
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
						$data = $this->simulator->getDataById((int)$matches[1]);
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
						array_push($ops, $token->value->format($this->simulator->getDateFormat()));
						break;
					case Token::T_NUMBER:
						array_push($ops, '' . $token->value);
						break;
					case Token::T_BOOLEAN:
						array_push($ops, $token->value ? 'true' : 'false');
						break;
					case Token::T_TEXT:
					case Token::T_IDENT:
					case Token::T_ARRAY:
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
