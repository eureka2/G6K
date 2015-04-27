<?php

namespace EUREKA\G6KBundle\Entity;

class Data {

	private $simulator = null;
	private $id = 0;
	private $name = "";
	private $label = "";
	private $type = ""; // date, boolean, number, integer, text, textarea, money, choice, percent, table, department region, country
	private $min = "";
	private $unparsedMin = "";
	private $max = "";
	private $unparsedMax = "";
	private $constraints = array();
	private $default = "";
	private $unit = "";
	private $unparsedDefault = "";
	private $round = 2; // nombre de décimal d'arrondi pour money, number et percent
	private $content=""; // expression = calcul du contenu ($value)
	private $source = ""; // service symphony, webservice or database
	private $unparsedIndex = ""; // if result of source is an array
	private $index = ""; // if result of source is an array
	private $choices = array(); 
	private $choiceSource = null; 
	private $table = null; 
	private $description = "";
	private $value = "";
	private $error = false;
	private $errorMessages = array();
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
	}
	
	public function getMin() {
		return $this->min;
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
	
	public function setMax($max) {
		$this->max = $max;
	}
	
	public function getUnparsedMax() {
		return $this->unparsedMax;
	}
	
	public function setUnparsedMax($unparsedMax) {
		$this->unparsedMax = $unparsedMax;
	}
	
	public function getConstraints() {
		return $this->constraints;
	}
	
	public function setConstraints($constraints) {
		$this->constraints = $constraints;
	}
	
	public function addConstraint(Constraint $constraint) {
		$this->constraints[] = $constraint;
	}
	
	public function removeConstraint($index) {
		$this->constraints[$index] = null;
	}
	
	public function getDefault() {
		return $this->default;
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
	
	public function setContent($content) {
		$this->content = $content;
	}
	
	public function getSource() {
		return $this->source;
	}
	
	public function setSource($source) {
		$this->source = $source;
	}
	
	public function getIndex() {
		return $this->index;
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
	
	public function getChoices() {
		return $this->choices;
	}
	
	public function getChoiceLabel() {
		$label = "";
		if ($this->type == "choice" && $this->value != "") {
			foreach ($this->choices as $choice) {
				if ($choice->getValue() == $this->value) {
					$label = $choice->getLabel();
					break;
				}
			}
		}
		return $label;
	}
	
	public function setChoices($choices) {
		$this->choices = $choices;
	}
	
	public function addChoice(Choice $choice) {
		$this->choices[] = $choice;
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
		$value = isset($this->value) && $this->value != "" ? $this->value : $this->default;
		if ($this->type == 'money' || $this->type == 'percent') {
			$value = is_numeric($value) ? number_format ( (float) $value, 2, ".", "" ) : $value;	
		}
		return $value;
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
	
	public function setUsed($used) {
		$this->used = $used;
	}
	
	public function isError() {
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
		$this->errorMessages[] = $errorMessage;
	}
	
	public function removeErrorMessage($index) {
		$this->errorMessages[$index] = null;
	}
	
	public function check() {
		if ($this->value == "") {
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
					if ($choice->getValue() == $this->value) {
						return true;
					}
				}
				return false;
				break;
			case 'percent':
				if (! is_numeric($this->value)) {
					return false;
				}
				break;
		}
		return true;
	}
	
	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}
}



?>