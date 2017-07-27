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

namespace EUREKA\G6KBundle\Entity;

class Data {

	private $simulator = null;
	private $id = 0;
	private $name = "";
	private $label = "";
	private $type = ""; // date, boolean, number, integer, text, textarea, money, choice, multichoice, percent, table, department region, country, array
	private $min = "";
	private $unparsedMin = "";
	private $max = "";
	private $unparsedMax = "";
	private $default = "";
	private $unit = "";
	private $unparsedDefault = "";
	private $round = 2; // nombre de décimal d'arrondi pour money, number et percent
	private $content=""; // expression = calcul du contenu ($value)
	private $source = ""; // service symphony, webservice or database
	private $unparsedIndex = ""; // if result of source is an array
	private $index = ""; // if result of source is an array
	private $memorize = false; // store the value of this data in a cookie 
	private $choices = array(); 
	private $choiceSource = null; 
	private $table = null; 
	private $description = "";
	private $value = "";
	private $rulesDependency = array(); 
	private $error = false;
	private $errorMessages = array();
	private $warning = false;
	private $warningMessages = array();
	private $inputStepId = -1;
	private $used = false;

	public function __construct($simulator, $id, $name) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->name = $name;
	}

	public function getSimulator() {
		return $this->simulator;
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

	public function getType() {
		return $this->type;
	}

	public function setType($type) {
		$this->type = $type;
		if ($type == "multichoice" && ! is_array($this->value)) {
			$this->value = array();
		}
	}

	public function getMin() {
		return $this->min;
	}

	public function getPlainMin() {
		return $this->replaceByDataLabel($this->unparsedMin);
	}

	public function setMin($min) {
		$this->min = $min;
	}

	public function getUnparsedMin() {
		return $this->unparsedMin;
	}

	public function setUnparsedMin($unparsedMin) {
		$this->unparsedMin = $unparsedMin;
	}

	public function getMax() {
		return $this->max;
	}

	public function getPlainMax() {
		return $this->replaceByDataLabel($this->unparsedMax);
	}

	public function setMax($max) {
		$this->max = $max;
	}

	public function getUnparsedMax() {
		return $this->unparsedMax;
	}

	public function setUnparsedMax($unparsedMax) {
		$this->unparsedMax = $unparsedMax;
	}

	public function getDefault() {
		return $this->default;
	}

	public function getPlainDefault() {
		return $this->replaceByDataLabel($this->unparsedDefault);
	}

	public function setDefault($default) {
		$this->default = $default;
	}

	public function getUnparsedDefault() {
		return $this->unparsedDefault;
	}

	public function setUnparsedDefault($unparsedDefault) {
		$this->unparsedDefault = $unparsedDefault;
	}

	public function getUnit() {
		return $this->unit;
	}

	public function setUnit($unit) {
		$this->unit = $unit;
	}

	public function getRound() {
		return $this->round;
	}

	public function setRound($round) {
		$this->round = $round;
	}

	public function getContent() {
		return $this->content;
	}

	public function getPlainContent() {
		return $this->replaceByDataLabel($this->content);
	}

	public function setContent($content) {
		$this->content = $content;
	}

	public function getSource() {
		return $this->source;
	}

	public function getPlainSource() {
		return $this->replaceByDataLabel($this->source);
	}

	public function setSource($source) {
		$this->source = $source;
	}

	public function getIndex() {
		return $this->index;
	}

	public function getPlainIndex() {
		return $this->replaceByDataLabel($this->unparsedIndex);
	}

	public function setIndex($index) {
		$this->index = $index;
	}

	public function getUnparsedIndex() {
		return $this->unparsedIndex;
	}

	public function setUnparsedIndex($unparsedIndex) {
		$this->unparsedIndex = $unparsedIndex;
	}

	public function isMemorize() {
		return $this->memorize;
	}

	public function getMemorize() {
		return $this->memorize;
	}

	public function setMemorize($memorize) {
		$this->memorize = $memorize;
	}

	public function getChoices() {
		return $this->choices;
	}

	public function getChoiceLabel() {
		return $this->getChoiceLabelByValue($this->value);
	}

	public function getChoiceLabelByValue($avalue) {
		$label = "";
		if ($this->type == "choice" && $avalue != "") {
			foreach ($this->choices as $choice) {
				if ($choice instanceof ChoiceGroup) {
					foreach ($choice as $gchoice) {
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
						foreach ($choice as $gchoice) {
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

	public function setChoices($choices) {
		$this->choices = $choices;
	}

	public function addChoice($choice) {
		$this->choices[] = $choice;
	}

	public function getChoiceById($id) {
		foreach ($this->choices as $choice) {
			if ($choice instanceof ChoiceGroup) {
				foreach ($choice as $gchoice) {
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

	public function getChoiceSource() {
		return $this->choiceSource;
	}

	public function setChoiceSource($choiceSource) {
		$this->choiceSource = $choiceSource;
	}

	public function getTable() {
		return $this->table;
	}

	public function setTable(Table $table) {
		$this->table = $table;
	}

	public function getDescription() {
		return $this->description;
	}

	public function setDescription($description) {
		$this->description = $description;
	}

	public function getValue() {
		if ($this->type == 'multichoice' || $this->type == 'array') {
			return $this->value;
		} else {
			$value = isset($this->value) && $this->value != "" ? $this->value : $this->default;
			if ($this->type == 'money' || $this->type == 'percent') {
				$value = is_numeric($value) ? number_format ( (float) $value, 2, ".", "" ) : $value;
			}
			return $value;
		}
	}

	public function getPlainValue() {
		if ($this->type == 'multichoice' || $this->type == 'array') {
			return json_encode($this->value);
		} else {
			return $this->value;
		}
	}

	public function setValue($value) {
		switch ($this->type) {
			case 'money': 
			case 'percent':
				$value = str_replace(',', '.', $value);
				$value = is_numeric($value) ? ''.round($value, $this->round, PHP_ROUND_HALF_EVEN) : $value;
				break;
			case 'number': 
				$value = str_replace(',', '.', $value);
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
		$this->value = $value;
	}

	public function getInputStepId() {
		return $this->inputStepId;
	}

	public function setInputStepId($inputStepId) {
		$this->inputStepId = $inputStepId;
	}

	public function isUsed() {
		return $this->used;
	}

	public function getUsed() {
		return $this->used;
	}

	public function setUsed($used) {
		$this->used = $used;
	}

	public function isError() {
		return $this->error;
	}

	public function getError() {
		return $this->error;
	}

	public function setError($error) {
		$this->error = $error;
	}

	public function getErrorMessages() {
		return $this->errorMessages;
	}

	public function setErrorMessages($errorMessages) {
		$this->errorMessages = $errorMessages;
	}

	public function addErrorMessage($errorMessage) {
		if (! in_array($errorMessage, $this->errorMessages)) {
			$this->errorMessages[] = $errorMessage;
		}
	}

	public function removeErrorMessage($index) {
		$this->errorMessages[$index] = null;
	}

	public function isWarning() {
		return $this->warning;
	}

	public function getWarning() {
		return $this->warning;
	}

	public function setWarning($warning) {
		$this->warning = $warning;
	}

	public function getWarningMessages() {
		return $this->warningMessages;
	}

	public function setWarningMessages($warningMessages) {
		$this->warningMessages = $warningMessages;
	}

	public function addWarningMessage($warningMessage) {
		if (! in_array($warningMessage, $this->warningMessages)) {
			$this->warningMessages[] = $warningMessage;
		}
	}

	public function removeWarningMessage($index) {
		$this->warningMessages[$index] = null;
	}

	public function getRulesDependency() {
		return $this->rulesDependency;
	}

	public function setRulesDependency($rulesDependency) {
		$this->rulesDependency = $rulesDependency;
	}

	public function addRuleDependency($ruleId) {
		if (! in_array($ruleId, $this->rulesDependency)) {
			$this->rulesDependency[] = $ruleId;
		}
	}

	public function removeRuleDependency($index) {
		$this->rulesDependency[$index] = null;
	}

	public function check() {
		if ($this->type != 'multichoice' && $this->type != 'array' && $this->value == "") {
			return true;
		}
		switch ($this->type) {
			case 'date':
				if (! preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $this->value)) {
					return false;
				}
				break;
			case 'boolean':
				if ( ! in_array($this->value, array('0', '1', 'false', 'true'))) {
					return false;
				}
				break;
			case 'number': 
				if (! is_numeric($this->value)) {
					return false;
				}
				break;
			case 'integer': 
				if (! ctype_digit ( $this->value )) {
					return false;
				}
				break;
			case 'text': 
			case 'textarea': 
				break;
			case 'money': 
				if (! preg_match("/^\d+(\.\d{1,2})?$/", $this->value)) {
					return false;
				}
				break;
			case 'choice':
				if ($this->value == $this->default) {
					return true;
				}
				if ($this->choiceSource != null) {
					return true;
				}
				foreach ($this->choices as $choice) {
					if ($choice instanceof ChoiceGroup) {
						if ($choice->getChoiceSource() != null) {
							return true;
						}
						foreach ($choice as $gchoice) {
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
				if ($this->choiceSource != null) {
					return true;
				}
				foreach ($this->value as $value) {
					$found = false;
					foreach ($this->choices as $choice) {
						if ($choice instanceof ChoiceGroup) {
							if ($choice->getChoiceSource() != null) {
								return true;
							}
							foreach ($choice as $gchoice) {
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
			case 'percent':
				if (! is_numeric($this->value)) {
					return false;
				}
				break;
		}
		return true;
	}

	private function replaceIdByDataLabel($matches) {
		$id = $matches[1];
		$data = $this->simulator->getDataById($id);
		return $data !== null ? $data->getLabel() : "#" . $id;
	}

	private function replaceByDataLabel($target) {
		return preg_replace_callback(
			"/#(\d+)/", 
			array($this, 'replaceIdByDataLabel'),
			$target
		);
	}

	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}
}

?>
