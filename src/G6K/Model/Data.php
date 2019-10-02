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

use App\G6K\Manager\ExpressionParser\DateFunction;
use App\G6K\Manager\ExpressionParser\NumberFunction;
use App\G6K\Manager\ExpressionParser\PercentFunction;
use App\G6K\Manager\ExpressionParser\MoneyFunction;

/**
 *
 * This class allows the storage and retrieval of the attributes of a data item.
 *
 * The Data object is where most of the information used by a simulator is stored:
 *
 * - User input
 * - information from data sources
 * - intermediate calculation data
 * - information returned to the user.
 *
 * The data item can have one of the following type:
 *
 * - date: a date stored in the d/m/Y format
 * - boolean: the value of the data item can be true or false
 * - number: a numeric data with decimal places
 * - integer: a numeric value without decimal places.
 * - text: a short text
 * - textarea: a long text
 * - money: a numeric data with decimal places. The value of the data will be displayed with the currency symbol
 * - choice: the value of the data is chosen from a list of choices
 * - multichoice: the values of the data are chosen from a list of choices
 * - percent: a numeric data with decimal places. The display of the value of the data will be followed by the % symbol.
 * - table: the data item has an associated Table object
 * - department: a departement code
 * - region: a region code
 * - country: a country code
 *
 * @author    Jacques Archimède
 *
 */
class Data extends DatasetChild {


	/**
	 * @var array
	 *
	 * The data item can have one of the following type:
	 *
	 * - date: a date stored in the d/m/Y format
	 * - boolean: the value of the data item can be true or false
	 * - number: a numeric data with decimal places
	 * - integer: a numeric value without decimal places.
	 * - text: a short text
	 * - textarea: a long text
	 * - money: a numeric data with decimal places. The value of the data will be displayed with the currency symbol
	 * - choice: the value of the data is chosen from a list of choices
	 * - multichoice: the values of the data are chosen from a list of choices
	 * - percent: a numeric data with decimal places. The display of the value of the data will be followed by the % symbol.
	 * - table: the data item has an associated Table object
	 * - department: a departement code
	 * - region: a region code
	 * - country: a country code
	 *
	 */
	const TYPES = ['date', 'boolean', 'number', 'integer', 'text', 'textarea', 'money', 'choice', 'multichoice', 'percent', 'table', 'department', 'region', 'country', 'year', 'month', 'day'];

	/**
	 * @var string     $type date, boolean, number, integer, text, textarea, money, choice, multichoice, percent, table, department region, country, ²
	 * array
	 *
	 * @access  private
	 *
	 */
	private $type = ""; 

	/**
	 * @var string     $min The minimum value of this data item
	 *
	 * @access  private
	 *
	 */
	private $min = "";

	/**
	 * @var string     $unparsedMin Contains an arithmetic expression used to calculate the minimum value of this data item
	 *
	 * @access  private
	 *
	 */
	private $unparsedMin = "";

	/**
	 * @var string     $max The maximum value of this data item
	 *
	 * @access  private
	 *
	 */
	private $max = "";

	/**
	 * @var string     $unparsedMax Contains an arithmetic expression used to calculate the maximum value of this data item 
	 *
	 * @access  private
	 *
	 */
	private $unparsedMax = "";

	/**
	 * @var string     $pattern The pattern that the text data must respect
	 *
	 * @access  private
	 *
	 */
	private $pattern = "";

	/**
	 * @var string     $default The default value of this data item
	 *
	 * @access  private
	 *
	 */
	private $default = "";

	/**
	 * @var string     $unit The unit text of this data item. A unit allows to measure a quantity according to a unit value
	 *
	 * @access  private
	 *
	 */
	private $unit = "";

	/**
	 * @var string     $unparsedDefault Contains an arithmetic expression used to calculate the default value of this data item
	 *
	 * @access  private
	 *
	 */
	private $unparsedDefault = "";

	/**
	 * @var int        $round The round decimals (number of decimal places 2) for : money, number and percent
	 *
	 * @access  private
	 *
	 */
	private $round = null; 

	/**
	 * @var string     $content Contains an arithmetic expression used to calculate the value of this data item
	 *
	 * @access  private
	 *
	 */
	private $content=""; 

	/**
	 * @var string     $source The id of the source if this data item is filled with the result of a query on a data source
	 *
	 * @access  private
	 *
	 */
	private $source = "";  

	/**
	 * @var string     $unparsedIndex Contains an arithmetic expression used to calculate the index value of this data item
	 *
	 * @access  private
	 *
	 */
	private $unparsedIndex = ""; 

	/**
	 * @var string     $index The key of the associative array of the result if this data item is filled with the result of a query on a data source
	 *
	 * @access  private
	 *
	 */
	private $index = ""; 

	/**
	 * @var bool       $memorize Indicates whether the value of this data should be saved in a cookie in the user's browser.
	 *
	 * @access  private
	 *
	 */
	private $memorize = false;  

	/**
	 * @var array      $choices If the type of this data is "choice" or "multichoice", contains the list of Choice objects allowing the user to select the value of this data item.
	 *
	 * @access  private
	 *
	 */
	private $choices = array(); 

	/**
	 * @var \App\G6K\Model\ChoiceSource $choiceSource If the type of this data is "choice" or "multichoice", contains a ChoiceSource object if the list of choices is made with the result of a query on a data source.
	 *
	 * @access  private
	 *
	 */
	private $choiceSource = null; 

	/**
	 * @var \App\G6K\Model\Table $table If the type of this data is "table", contains the Table object associated with this data item.
	 *
	 * @access  private
	 *
	 */
	private $table = null; 

	/**
	 * @var mixed     $value The current value of this data item
	 *
	 * @access  private
	 *
	 */
	private $value = "";

	/**
	 * @var array      $rulesDependency List of business rules that use this data item
	 *
	 * @access  private
	 *
	 */
	private $rulesDependency = array(); 

	/**
	 * @var int      $inputStepId If this data element is filled with a user input, contains the id of the step where the value is entered.
	 *
	 * @access  private
	 *
	 */
	private $inputStepId = -1;

	/**
	 * Constructor of class Data
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator|null $simulator The Simulator object that uses this data item
	 * @param   int $id The id of this data item
	 * @param   string $name The name of this data item
	 * @return  void
	 *
	 */
	public function __construct($simulator, $id, $name) {
		parent::__construct($simulator, $id, $name);
	}

	/**
	 * Returns the type of this data item
	 *
	 * @access  public
	 * @return  string The type of this data item
	 *
	 */
	public function getType() {
		return $this->type;
	}

	/**
	 * Sets the type of this data item
	 *
	 * @access  public
	 * @param    string     $type The type of this data item
	 * @return  void
	 *
	 */
	public function setType($type) {
		$this->type = $type;
		if ($type == "multichoice" && ! is_array($this->value)) {
			$this->value = array();
		}
	}

	/**
	 * Returns the minimum value of this data item
	 *
	 * @access  public
	 * @return  string The mimimum value
	 *
	 */
	public function getMin() {
		return $this->min;
	}

	/**
	 * Returns the arithmetic expression used to calculate the minimum value of this data item where the ids (prefixed with #) of the data are replaced by their labels.
	 *
	 * @access  public
	 * @return  string The arithmetic expression
	 *
	 */
	public function getPlainMin() {
		return $this->replaceByDataLabel($this->unparsedMin);
	}

	/**
	 * Sets the minimum value of this data item
	 *
	 * @access  public
	 * @param   string     $min The minimum value 
	 * @return  void
	 *
	 */
	public function setMin($min) {
		$this->min = $min;
	}

	/**
	 * Returns the arithmetic expression used to calculate the minimum value of this data item.
	 *
	 * @access  public
	 * @return  string The arithmetic expression
	 *
	 */
	public function getUnparsedMin() {
		return $this->unparsedMin;
	}

	/**
	 * Sets the arithmetic expression used to calculate the minimum value of this data item.
	 *
	 * @access  public
	 * @param   string     $unparsedMin The arithmetic expression
	 * @return  void
	 *
	 */
	public function setUnparsedMin($unparsedMin) {
		$this->unparsedMin = $unparsedMin;
	}

	/**
	 * Returns the maximum value of this data item
	 *
	 * @access  public
	 * @return  string The maximum value
	 *
	 */
	public function getMax() {
		return $this->max;
	}

	/**
	 * Returns the arithmetic expression used to calculate the maximum value of this data item where the ids (prefixed with #) of the data are replaced by their labels.
	 *
	 * @access  public
	 * @return  string The arithmetic expression
	 *
	 */
	public function getPlainMax() {
		return $this->replaceByDataLabel($this->unparsedMax);
	}

	/**
	 * Sets the maximum value of this data item
	 *
	 * @access  public
	 * @param   string     $max The maximum value 
	 * @return  void
	 *
	 */
	public function setMax($max) {
		$this->max = $max;
	}

	/**
	 * Returns the arithmetic expression used to calculate the minimum value of this data item.
	 *
	 * @access  public
	 * @return  string The arithmetic expression
	 *
	 */
	public function getUnparsedMax() {
		return $this->unparsedMax;
	}

	/**
	 * Sets the arithmetic expression used to calculate the minimum value of this data item.
	 *
	 * @access  public
	 * @param   string     $unparsedMax The arithmetic expression
	 * @return  void
	 *
	 */
	public function setUnparsedMax($unparsedMax) {
		$this->unparsedMax = $unparsedMax;
	}

	/**
	 * Returns the pattern of this data item.
	 *
	 * @access  public
	 * @return  string The pattern
	 *
	 */
	public function getPattern() {
		return $this->pattern;
	}

	/**
	 * Sets the pattern of this data item.
	 *
	 * @access  public
	 * @param   string     $pattern The pattern
	 * @return  void
	 *
	 */
	public function setPattern($pattern) {
		$this->pattern = $pattern;
	}

	/**
	 * Returns the default value of this data item
	 *
	 * @access  public
	 * @return  string The default value
	 *
	 */
	public function getDefault() {
		return $this->default;
	}

	/**
	 * Returns the arithmetic expression used to calculate the default value of this data item where the ids (prefixed with #) of the data are replaced by their labels.
	 *
	 * @access  public
	 * @return  string The arithmetic expression
	 *
	 */
	public function getPlainDefault() {
		return $this->replaceByDataLabel($this->unparsedDefault);
	}

	/**
	 * Sets the default value of this data item
	 *
	 * @access  public
	 * @param   string     $default The default value 
	 * @return  void
	 *
	 */
	public function setDefault($default) {
		$this->default = $default;
	}

	/**
	 * Returns the arithmetic expression used to calculate the default value of this data item.
	 *
	 * @access  public
	 * @return  string The arithmetic expression
	 *
	 */
	public function getUnparsedDefault() {
		return $this->unparsedDefault;
	}

	/**
	 * Sets the arithmetic expression used to calculate the default value of this data item.
	 *
	 * @access  public
	 * @param   string     $unparsedDefault The arithmetic expression
	 * @return  void
	 *
	 */
	public function setUnparsedDefault($unparsedDefault) {
		$this->unparsedDefault = $unparsedDefault;
	}

	/**
	 * Returns the unit (measurement) text of this data item.
	 *
	 * @access  public
	 * @return  string The unit text
	 *
	 */
	public function getUnit() {
		return $this->unit;
	}

	/**
	 * Sets the unit(measurement) text of this data item.
	 *
	 * @access  public
	 * @param   string     $unit The unit text
	 * @return  void
	 *
	 */
	public function setUnit($unit) {
		$this->unit = $unit;
	}

	/**
	 * Returns the number of decimal places for this data item.
	 *
	 * Useless if this data is not of type "number", "money" or "percent".
	 *
	 * @access  public
	 * @return  int|null The number of decimal places
	 *
	 */
	public function getRound() {
		return $this->round;
	}

	/**
	 * Sets the number of decimal places for this data item. The last digit of the value of the data will be rounded to the nearest integer.
	 *
	 * Useless if this data is not of type "number", "money" or "percent".
	 *
	 * @access  public
	 * @param   int|null $round  The number of decimal places
	 * @return  void
	 *
	 */
	public function setRound($round) {
		$this->round = $round;
	}

	/**
	 * Returns the arithmetic expression used to calculate the current value of this data item.
	 *
	 * @access  public
	 * @return  string The arithmetic expression
	 *
	 */
	public function getContent() {
		return $this->content;
	}

	/**
	 * Returns the arithmetic expression used to calculate the value of this data item where the ids (prefixed with #) of the data are replaced by their labels.
	 *
	 * @access  public
	 * @return  string The arithmetic expression
	 *
	 */
	public function getPlainContent() {
		return $this->replaceByDataLabel($this->content);
	}

	/**
	 * Sets the arithmetic expression used to calculate the value of this data item.
	 *
	 * @access  public
	 * @param   string     $content The arithmetic expression
	 * @return  void
	 *
	 */
	public function setContent($content) {
		$this->content = $content;
	}

	/**
	 * Returns the id of the source if this data item is filled with the result of a query on a data source
	 *
	 * @access  public
	 * @return  string  The id of the source
	 *
	 */
	public function getSource() {
		return $this->source;
	}

	/**
	 * Returns the arithmetic expression used to calculate the id of the source where the ids (prefixed with #) of the data are replaced by their labels.
	 *
	 * This function is no longer used.
	 *
	 * @access  public
	 * @deprecated
	 * @return  string The arithmetic expression
	 *
	 */
	public function getPlainSource() {
		return $this->replaceByDataLabel($this->source);
	}

	/**
	 * Sets the id of the source if this data item is filled with the result of a query on a data source
	 *
	 * @access  public
	 * @param   string     $source The id of the source
	 * @return  void
	 *
	 */
	public function setSource($source) {
		$this->source = $source;
	}

	/**
	 * Returns the key of the associative array of the result if this data item is filled with the result of a query on a data source
	 *
	 * @access  public
	 * @return  string The key of the associative array
	 *
	 */
	public function getIndex() {
		return $this->index;
	}

	/**
	 * Returns the arithmetic expression used to calculate the key of the associative array of the result if this data item is filled with the result of a query on a data source.  The ids (prefixed with #) of the data are replaced by their labels.
	 *
	 * @access  public
	 * @return  string The arithmetic expression
	 *
	 */
	public function getPlainIndex() {
		return $this->replaceByDataLabel($this->unparsedIndex);
	}

	/**
	 * Sets the key of the associative array of the result if this data item is filled with the result of a query on a data source
	 *
	 * @access  public
	 * @param   string     $index The key of the associative array
	 * @return  void
	 *
	 */
	public function setIndex($index) {
		$this->index = $index;
	}

	/**
	 * Returns the arithmetic expression used to calculate the key of the associative array of the result if this data item is filled with the result of a query on a data source.
	 *
	 * @access  public
	 * @return  string The arithmetic expression
	 *
	 */
	public function getUnparsedIndex() {
		return $this->unparsedIndex;
	}

	/**
	 * Sets the arithmetic expression used to calculate the key of the associative array of the result if this data item is filled with the result of a query on a data source.
	 *
	 * @access  public
	 * @param   string     $unparsedIndex The arithmetic expression
	 * @return  void
	 *
	 */
	public function setUnparsedIndex($unparsedIndex) {
		$this->unparsedIndex = $unparsedIndex;
	}

	/**
	 * Retrieves the memorize attribute of this data item.
	 *
	 * Indicates whether the value of this data should be saved in a cookie in the user's browser.
	 *
	 * @access  public
	 * @return  bool The memorize attribute
	 *
	 */
	public function isMemorize() {
		return $this->memorize;
	}

	/**
	 * Returns the memorize attribute of this data item.
	 *
	 * @access  public
	 * @return  bool The memorize attribute
	 *
	 */
	public function getMemorize() {
		return $this->memorize;
	}

	/**
	 * Determines whether the value of this data should be stored in a cookie in the user's browser or not.
	 *
	 * @access  public
	 * @param   bool       $memorize true if the value of this data should be stored in a cookie, false otherwise
	 * @return  void
	 *
	 */
	public function setMemorize($memorize) {
		$this->memorize = $memorize;
	}

	/**
	 * Returns the list of Choice Objects of this data item.
	 *
	 * If the type of this data is "choice" or "multichoice", the list of choices allows the user to select the value of this data item.
	 *
	 * @access  public
	 * @return  array The list of Choice Objects
	 *
	 */
	public function getChoices() {
		return $this->choices;
	}

	/**
	 * Returns the label of the choice corresponding to the current value of this data item.
	 *
	 * @access  public
	 * @return  string|array The label of the choice
	 *
	 */
	public function getChoiceLabel() {
		return $this->getChoiceLabelByValue($this->value);
	}

	/**
	 * Retrieves the label of a choice by its value from the list of choices associated with that data item.
	 *
	 * @access  public
	 * @param   mixed $avalue The value of the choice
	 * @return  string|array The label of the choice
	 *
	 */
	public function getChoiceLabelByValue($avalue) {
		$label = "";
		if ($this->type == "choice" && $avalue != "") {
			foreach ($this->choices as $choice) {
				if ($choice instanceof ChoiceGroup) {
					foreach ($choice->getChoices() as $gchoice) {
						if ($gchoice->getValue() == $avalue) {
							$label = $gchoice->getLabel();
							break;
						}
					}
					if ($label != "") {
						break;
					}
				} elseif ($choice->getValue() == $avalue) {
					$label = $choice->getLabel();
					break;
				}
			}
		}
		if ($this->type == "multichoice") {
			$label = array();
			foreach ($avalue as $value) {
				foreach ($this->choices as $choice) {
					if ($choice instanceof ChoiceGroup) {
						$found = false;
						foreach ($choice->getChoices() as $gchoice) {
							if ($gchoice->getValue() == $value) {
								array_push($label, $gchoice->getLabel());
								$found = true;
								break;
							}
						}
						if ($found) {
							break;
						}
					} elseif ($choice->getValue() == $value) {
						array_push($label, $choice->getLabel());
						break;
					}
				}
			}
		}
		return $label;
	}

	/**
	 * Sets the list of Choice Objects of this data item.
	 *
	 * If the type of this data is "choice" or "multichoice", the list of choices allows the user to select the value of this data item.
	 *
	 * @access  public
	 * @param   array      $choices The list of Choice Objects
	 * @return  void
	 *
	 */
	public function setChoices($choices) {
		$this->choices = $choices;
	}

	/**
	 * Adds a Choice object in the list of choices of this data item.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\ChoiceGroup|\App\G6K\Model\Choice $choice The Choice object 
	 * @return  void
	 *
	 */
	public function addChoice($choice) {
		$this->choices[] = $choice;
	}

	/**
	 * Retrieves a Choice object by its id in the list of choices of this data item.
	 *
	 * @access  public
	 * @param   int $id The id of the Choice object
	 * @return  \App\G6K\Model\Choice|null The Choice object 
	 *
	 */
	public function getChoiceById($id) {
		foreach ($this->choices as $choice) {
			if ($choice instanceof ChoiceGroup) {
				foreach ($choice->getChoices() as $gchoice) {
					if ($gchoice->getId() == $id) {
						return $gchoice;
					}
				}
			} elseif ($choice->getId() == $id) {
				return $choice;
			}
		}
		return null;
	}

	/**
	 * Returns the ChoiceSource object if the type of this data is "choice" or "multichoice" and the list of choices is made with the result of a query on a data source.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\ChoiceSource|null The ChoiceSource object
	 *
	 */
	public function getChoiceSource() {
		return $this->choiceSource;
	}

	/**
	 * Sets the ChoiceSource object if the type of this data is "choice" or "multichoice" and the list of choices is made with the result of a query on a data source.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\ChoiceSource $choiceSource The ChoiceSource object
	 * @return  void
	 *
	 */
	public function setChoiceSource($choiceSource) {
		$this->choiceSource = $choiceSource;
	}

	/**
	 * Returns the Table object associated with this data item if the type of this data is "table".
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Table The Table Object
	 *
	 */
	public function getTable() {
		return $this->table;
	}

	/**
	 * Returns the Table object associated with this data item if the type of this data is "table".
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Table $table The Table Object
	 * @return  void
	 *
	 */
	public function setTable(Table $table) {
		$this->table = $table;
	}

	/**
	 * Retrieves the current value of this data item
	 *
	 * @access  public
	 * @return  mixed The current value
	 *
	 */
	public function getValue() {
		if ($this->type == 'multichoice' || $this->type == 'array') {
			return $this->value;
		} else {
			$value = isset($this->value) && $this->value != "" ? $this->value : $this->default;
			if ($value !== '' && $this->type == 'money') {
				$value = MoneyFunction::format($value);
			} elseif ($value !== '' && $this->type == 'percent') {
				$value = PercentFunction::format($value);
			} elseif ($value !== '' && $this->type == 'number') {
				$value = NumberFunction::format($value);
			}
			return $value;
		}
	}

	/**
	 * Returns the current value of this data item in a string
	 *
	 * @access  public
	 * @return  string The current value
	 *
	 */
	public function getPlainValue() {
		if ($this->value === null) {
			return '';
		} elseif ($this->value == '') {
			return $this->value;
		} elseif ($this->type == 'multichoice' || $this->type == 'array') {
			return json_encode($this->value);
		} else {
			if (! in_array($this->type, ['money', 'percent', 'number'])) {
				return $this->value;
			}
			$fraction =  NumberFunction::$fractionDigit;
			if ($this->round !== null && $this->round != NumberFunction::$fractionDigit) {
				NumberFunction::$fractionDigit = $this->round;
			}
			$value = "";
			if ($this->type == 'money') {
				$value = MoneyFunction::toString($this->value);
			} elseif ($this->type == 'percent') {
				$value = PercentFunction::toString($this->value);
			} else {
				$value = NumberFunction::toString($this->value);
			}
			NumberFunction::$fractionDigit = $fraction;
			return $value;
		}
	}

	/**
	 * Sets the current value of this data item
	 *
	 * @access  public
	 * @param   mixed     $value The current value
	 * @return  void
	 *
	 */
	public function setValue($value) {
		if ($value !== null && $value != '') {
			switch ($this->type) {
				case 'money': 
					$value = MoneyFunction::toMoney($value);
					$round = $this->round === null ? 2 : $this->round;
					$value = is_numeric($value) ? ''.round($value, $round, PHP_ROUND_HALF_EVEN) : $value;
					break;
				case 'percent':
					$value = PercentFunction::toPercent($value);
					$round = $this->round === null ? 2 : $this->round;
					$value = is_numeric($value) ? ''.round($value, $round, PHP_ROUND_HALF_EVEN) : $value;
					break;
				case 'number':
					if ($this->round === null) {
						$value = ''.NumberFunction::toNumber($value);
					} else {
						$value = ''.round(NumberFunction::toNumber($value), $this->round, PHP_ROUND_HALF_EVEN);
					}
					break;
				case 'array': 
				case 'multichoice': 
					if (! is_array($value)) {
						if (preg_match("/^\[.*\]$/", $value)) {
							$value = json_decode($value);
						} else {
							$value = array_merge($this->value, array($value));
						}
					}
					break;
			}
		}
		$this->value = $value;
	}

	/**
	 * Retrieves the id of the step where the user enters the value of this data item
	 *
	 * Returns -1 if the value is never entered by the user.
	 *
	 * @access  public
	 * @return  int The id of the step
	 *
	 */
	public function getInputStepId() {
		return $this->inputStepId;
	}

	/**
	 * Sets the id of the step where the user enters the value of this data item 
	 *
	 * @access  public
	 * @param   int      $inputStepId The id of the step
	 * @return  void
	 *
	 */
	public function setInputStepId($inputStepId) {
		$this->inputStepId = $inputStepId;
	}

	/**
	 * Returns the list of business rules that use this data item
	 *
	 * @access  public
	 * @return  array The list of business rules
	 *
	 */
	public function getRulesDependency() {
		return $this->rulesDependency;
	}

	/**
	 * Sets the list of business rules that use this data item
	 *
	 * @access  public
	 * @param   array      $rulesDependency The list of business rules
	 * @return  void
	 *
	 */
	public function setRulesDependency($rulesDependency) {
		$this->rulesDependency = $rulesDependency;
	}

	/**
	 * Adds a business rule id to the list of business rules that use this data item
	 *
	 * @access  public
	 * @param   int $ruleId The id of the business rule.
	 * @return  void
	 *
	 */
	public function addRuleDependency($ruleId) {
		if (! in_array($ruleId, $this->rulesDependency)) {
			$this->rulesDependency[] = $ruleId;
		}
	}

	/**
	 * Removes a business rule id from the list of business rules that use this data item
	 *
	 * @access  public
	 * @param   int $index The index of the rule to remove 
	 * @return  void
	 *
	 */
	public function removeRuleDependency($index) {
		$this->rulesDependency[$index] = null;
	}

	/**
	 * Checks the value of this data item according to its type
	 *
	 * @access  public
	 * @return  bool false if there is an error, true otherwise
	 *
	 */
	public function check() {
		if ($this->type != 'multichoice' && $this->type != 'array' && $this->value == "") {
			return true;
		}
		switch ($this->type) {
			case 'date':
				return DateFunction::isDate($this->value);
			case 'boolean':
				if ( ! in_array($this->value, array('0', '1', 'false', 'true'))) {
					return false;
				}
				break;
			case 'number': 
				return NumberFunction::isNumber($this->value);
			case 'integer': 
				if (! ctype_digit ( $this->value )) {
					return false;
				}
				break;
			case 'text': 
				if ($this->pattern != '') {
					$delims = ['/', '#', '-', '|', '_', '=', '!'];
					foreach($delims as $delim) {
						if (strpos($this->pattern, $delim) === false) {
							return preg_match($delim . $this->pattern . $delim, $this->value);
						}
					}
				}
				break;
			case 'textarea': 
				break;
			case 'money': 
				return MoneyFunction::isMoney($this->value);
			case 'percent':
				return PercentFunction::isPercent($this->value);
			case 'choice':
				if ($this->value == $this->default) {
					return true;
				}
				if ($this->choiceSource !== null) {
					return true;
				}
				foreach ($this->choices as $choice) {
					if ($choice instanceof ChoiceGroup) {
						if ($choice->getChoiceSource() !== null) {
							return true;
						}
						foreach ($choice->getChoices() as $gchoice) {
							if ($gchoice->getValue() == $this->value) {
								return true;
							}
						}
					} elseif ($choice->getValue() == $this->value) {
						return true;
					}
				}
				return false;
				break;
			case 'multichoice':
				if ($this->choiceSource !== null) {
					return true;
				}
				foreach ($this->value as $value) {
					$found = false;
					foreach ($this->choices as $choice) {
						if ($choice instanceof ChoiceGroup) {
							if ($choice->getChoiceSource() !== null) {
								return true;
							}
							foreach ($choice->getChoices() as $gchoice) {
								if ($gchoice->getValue() == $value) {
									$found = true;
									break;
								}
							}
							if ($found) {
								break;
							}
						} elseif ($choice->getValue() == $value) {
							$found = true;
							break;
						}
					}
					if (! $found) {
						return false;
					}
				}
				return true;
				break;
		}
		return true;
	}

	/**
	 * Returns the label of the data item whose identifier is the first element of the given array. The argument is an array because this method is the callback function of a preg_replace_callback.
	 *
	 * If the data item is not found the given id prefixed by # is returned
	 *
	 * @access  private
	 * @param   array $matches  The first element is a data id
	 * @return  string returned value : The label of the data 
	 *
	 */
	private function replaceIdByDataLabel($matches) {
		$id = $matches[1];
		$data = $this->simulator->getDataById($id);
		return $data !== null ? $data->getLabel() : "#" . $id;
	}

	/**
	 * Replaces all data id (prefixed with #) by its label in the given text
	 *
	 * @access  private
	 * @param   string $target The text in which the data id are to be replaced
	 * @return  string  The text with data label
	 *
	 */
	private function replaceByDataLabel($target) {
		return preg_replace_callback(
			"/#(\d+)/", 
			array($this, 'replaceIdByDataLabel'),
			$target
		);
	}

}

?>
