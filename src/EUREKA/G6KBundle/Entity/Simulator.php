<?php

namespace EUREKA\G6KBundle\Entity;

class Simulator {

	private $controller = "";
	private $name = "";
	private $label = "";
	private $dynamic = false;
	private $description = "";
	private $dateFormat = "";
	private $decimalPoint = "";
	private $moneySymbol = "";
	private $symbolPosition = "";
	private $datas = array();
	private $steps = array();
	private $sites = array();
	private $databases = array();
	private $sources = array();
	private $dependencies = "";
	
	public function __construct($controller) {
		$this->controller = $controller;
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
	
	public function isDynamic() {
		return $this->dynamic;
	}
	
	public function setDynamic($dynamic) {
		$this->dynamic = $dynamic;
	}
	
	public function getDescription() {
		return $this->description;
	}
	
	public function setDescription($description) {
		$this->description = $description;
	}
	
	public function getDateFormat() {
		return $this->dateFormat;
	}
	
	public function setDateFormat($dateFormat) {
		$this->dateFormat = $dateFormat;
	}
	
	public function getDecimalPoint() {
		return $this->decimalPoint;
	}
	
	public function setDecimalPoint($decimalPoint) {
		$this->decimalPoint = $decimalPoint;
	}
	
	public function getMoneySymbol() {
		return $this->moneySymbol;
	}
	
	public function setMoneySymbol($moneySymbol) {
		$this->moneySymbol = $moneySymbol;
	}
	
	public function getSymbolPosition() {
		return $this->symbolPosition;
	}
	
	public function setSymbolPosition($symbolPosition) {
		$this->symbolPosition = $symbolPosition;
	}
	
	public function getDatas() {
		return $this->datas;
	}
	
	public function setDatas($datas) {
		$this->datas = $datas;
	}
	
	public function addData(Data $data) {
		$this->datas[] = $data;
	}
	
	public function removeData($index) {
		$this->datas[$index] = null;
	}
	
	public function getDataById($id) {
		foreach ($this->datas as $data) {
			if ($data->getId() === $id) {
				return $data;
			}
		}
		return null;
	}
	
	public function getDataByName($name) {
		foreach ($this->datas as $data) {
			if ($data->getName() == $name) {
				return $data;
			}
		}
		return null;
	}
	
	public function getSteps() {
		return $this->steps;
	}
	
	public function setSteps($steps) {
		$this->steps = $steps;
	}
	
	public function addStep(Step $step) {
		$this->steps[] = $step;
	}
	
	public function removeStep($index) {
		$this->steps[$index] = null;
	}
	
	public function getStepById($id) {
		foreach ($this->steps as $step) {
			if ($step->getId() == $id) {
				return $step;
			}
		}
		return null;
	}
	
	public function getSources() {
		return $this->sources;
	}
	
	public function setSources($sources) {
		$this->sources = $sources;
	}
	
	public function addSource(Source $source) {
		$this->sources[] = $source;
	}
	
	public function removeSource($index) {
		$this->sources[$index] = null;
	}
	
	public function getSiteById($id) {
		foreach ($this->sites as $site) {
			if ($site->getId() == $id) {
				return $site;
			}
		}
		return null;
	}
	
	public function getDatabaseById($id) {
		foreach ($this->databases as $database) {
			if ($database->getId() == $id) {
				return $database;
			}
		}
		return null;
	}
	
	public function getSourceById($id) {
		foreach ($this->sources as $source) {
			if ($source->getId() == $id) {
				return $source;
			}
		}
		return null;
	}
	
	public function load($url) {
		$simulator = new \SimpleXMLElement($url, LIBXML_NOWARNING, true);
		$this->setName((string)$simulator["name"]);
		$this->setLabel((string)$simulator["label"]);
		$this->setDynamic((string)$simulator['dynamic'] == '1');
		$this->setDescription($simulator->Description);
		$this->setDateFormat((string)($simulator->DataSet['dateFormat']));
		$this->setDecimalPoint((string)($simulator->DataSet['decimalPoint']));
		$this->setMoneySymbol((string)($simulator->DataSet['moneySymbol']));
		$this->setSymbolPosition((string)($simulator->DataSet['symbolPosition']));
		if ($simulator->DataSet) {
			foreach ($simulator->DataSet->Data as $data) {
				$dataObj = new Data($this, (int)$data['id'], (string)$data['name']);
				$dataObj->setType((string)$data['type']);
				$dataObj->setUnparsedMin((string)$data['min']);
				$dataObj->setUnparsedMax((string)$data['max']);
				$dataObj->setConstraint((string)$data['constraint']);
				$dataObj->setConstraintMessage((string)$data['constraintMessage']);
				$dataObj->setUnparsedDefault((string)$data['default']);
				$dataObj->setUnit((string)$data['unit']);
				$dataObj->setRound(isset($data['round']) ? (int)$data['round'] : 2);
				$dataObj->setContent((string)$data['content']);
				$dataObj->setSource((string)$data['source']);
				$dataObj->setUnparsedIndex((string)$data['index']);
				if ($data->Choices) {
					foreach ($data->Choices->Choice as $choice) {
						$choiceObj = new Choice($dataObj, (string)$choice['id'], (string)$choice['value'], (string)$choice['label']);
						$choiceObj->setCondition((string)$choice['condition']);
						$dataObj->addChoice($choiceObj);
					}
					if ($data->Choices->Source) {
						$source = $data->Choices->Source;
						$choiceSourceObj = new ChoiceSource($dataObj, (int)$source['id'], (string)$source['valueColumn'], (string)$source['labelColumn']);
						$choiceSourceObj->setIdColumn((string)$source['idColumn']);
						$dataObj->setChoiceSource($choiceSourceObj);
					}
				}
				if ($data->Table) {
					$table = $data->Table;
					$tableObj = new Table($dataObj, (string)$table['id']);
					$tableObj->setLabel((string)$table['label']);
					$tableObj->setDescription($table->Description);
					foreach ($table->Column as $column) {
						$columnObj = new Column($tableObj, (int)$column['id'], (string)$column['name'], (string)$column['label']);
						$columnObj->setCondition((string)$column['condition']);
						$tableObj->addColumn($columnObj);
					}
					$dataObj->setTable($tableObj);
				}
				$dataObj->setDescription($data->Description);
				$this->datas[] = $dataObj;
			}
		}
		if ($simulator->Steps) {
			$step0 = false;
			foreach ($simulator->Steps->Step as $step) {
				$stepObj = new Step($this, (int)$step['id'], (string)$step['name'], (string)$step['label'], (string)$step['template']);
				if ($stepObj->getId() == 0) {
					$step0 = true;
				}
				$stepObj->setCondition((string)$step['condition']);
				$stepObj->setOutput((string)$step['output']);
				$stepObj->setDescription($step->Description);
				$stepObj->setDynamic((string)$step['dynamic'] == '1');
				foreach ($step->FieldSet as $fieldset) {
					$fieldsetObj = new FieldSet($stepObj, (int)$fieldset['id']);
					$fieldsetObj->setLegend($fieldset->Legend);
					$fieldsetObj->setCondition((string)$fieldset['condition']);
					foreach ($fieldset->Field as $field) {
						$fieldObj = new Field($fieldsetObj, (int)$field['position'], (int)$field['data'], (string)$field['label']);
						$fieldObj->setUsage((string)$field['usage']);
						$fieldObj->setPrompt((string)$field['prompt']);
						$fieldObj->setNewline((string)$field['newline'] == '' || (string)$field['newline'] == '1');					
						$fieldObj->setRequired((string)$field['required'] == '1');					
						$fieldObj->setColon((string)$field['colon'] == '' || (string)$field['colon'] == '1');					
						$fieldObj->setUnderlabel((string)$field['underlabel'] == '1');					
						$fieldObj->setHelp((string)$field['help'] == '1');					
						$fieldObj->setEmphasize((string)$field['emphasize'] == '1');					
						$fieldObj->setExplanation((string)$field['explanation']);
						$fieldObj->setCondition((string)$field['condition']);
						$fieldObj->setExpanded((string)$field['expanded'] == '1');					
						$fieldObj->setPreNote($field->PreNote);
						$fieldObj->setPostNote($field->PostNote);
						$fieldsetObj->addField($fieldObj);
					}
					$stepObj->addFieldSet($fieldsetObj);
				}
				foreach ($step->ActionList as $actionList) {
					foreach ($actionList as $action) {
						$actionObj = new Action($stepObj, (string)$action['name'], (string)$action['label']);
						$actionObj->setCondition((string)$action['condition']);
						$actionObj->setClass((string)$action['class']);
						$actionObj->setWhat((string)$action['what']);
						$actionObj->setFor((string)$action['for']);
						$actionObj->setUri((string)$action['uri']);
						$stepObj->addAction($actionObj);
					}
				}
				if ($step->FootNotes) {
					foreach ($step->FootNotes->FootNote as $footnote) {
						$footnoteObj = new FootNote($stepObj, (int)$footnote['id']);
						$footnoteObj->setCondition((string)$footnote['condition']);
						$footnoteObj->setText($footnote);
						$stepObj->addFootNote($footnoteObj);
					}
				}
				$this->steps[] = $stepObj;
			}
			if (!$step0) {
				$this->setDynamic(false);
			}
		}
		if ($simulator->Sites) {
			foreach ($simulator->Sites->Site as $site) {
				$siteObj = new Site($this, (int)$site['id'], (string)$site['name'], (string)$site['home']);
				$this->sites[] = $siteObj;
			}
		}
		if ($simulator->Databases) {
			foreach ($simulator->Databases->Database as $database) {
				$databaseObj = new Database($this, (int)$database['id'], (string)$database['type'], (string)$database['name']);
				$databaseObj->setHost((string)$database['host']);
				$databaseObj->setPort((int)$database['port']);
				$databaseObj->setUser((string)$database['user']);
				$databaseObj->setPassword((string)$database['password']);
				$this->databases[] = $databaseObj;
			}
		}
		if ($simulator->Sources) {
			foreach ($simulator->Sources->Source as $source) {
				$sourceObj = new Source($this, (int)$source['id'], (string)$source['type'], (string)$source['returnType']);
				$sourceObj->setUri((string)$source['uri']);
				$sourceObj->setDatabase((int)$source['database']);
				$sourceObj->setRequest((string)$source['request']);
				$sourceObj->setReturnPath((string)$source['returnPath']);
				foreach ($source->Parameter as $parameter) {
					$parameterObj = new Parameter($sourceObj, (string)$parameter['type']);
					$parameterObj->setName((string)$parameter['name']);
					$parameterObj->setFormat((string)$parameter['format']);
					$parameterObj->setData((int)$parameter['data']);
					$sourceObj->addParameter($parameterObj);
				}
				$this->sources[] = $sourceObj;
			}
		}
	}
	
	public function loadForSource($url) {
		$simulator = new \SimpleXMLElement($url, LIBXML_NOWARNING, true);
		if ($simulator->DataSet) {
			foreach ($simulator->DataSet->Data as $data) {
				$dataObj = new Data($this, (int)$data['id'], (string)$data['name']);
				$dataObj->setType((string)$data['type']);
				$this->datas[] = $dataObj;
			}
		}
		if ($simulator->Databases) {
			foreach ($simulator->Databases->Database as $database) {
				$databaseObj = new Database($this, (int)$database['id'], (string)$database['type'], (string)$database['name']);
				$databaseObj->setHost((string)$database['host']);
				$databaseObj->setPort((int)$database['port']);
				$databaseObj->setUser((string)$database['user']);
				$databaseObj->setPassword((string)$database['password']);
				$this->databases[] = $databaseObj;
			}
		}
		if ($simulator->Sources) {
			foreach ($simulator->Sources->Source as $source) {
				$sourceObj = new Source($this, (int)$source['id'], (string)$source['type'], (string)$source['returnType']);
				$sourceObj->setUri((string)$source['uri']);
				$sourceObj->setDatabase((int)$source['database']);
				$sourceObj->setRequest((string)$source['request']);
				$sourceObj->setReturnPath((string)$source['returnPath']);
				foreach ($source->Parameter as $parameter) {
					$parameterObj = new Parameter($sourceObj, (string)$parameter['type']);
					$parameterObj->setName((string)$parameter['name']);
					$parameterObj->setFormat((string)$parameter['format']);
					$parameterObj->setData((int)$parameter['data']);
					$sourceObj->addParameter($parameterObj);
				}
				$this->sources[] = $sourceObj;
			}
		}
	}

	private function addDependency ($matches) {
		$id = $matches[1];
		$dependency = $this->name;
		if (! isset($this->datas[$id][$this->dependencies])) {
				$this->datas[$id][$this->dependencies] = array();
		}
		foreach ($this->datas[$id][$this->dependencies] as $d) {
			if ($d == $dependency) {
				return $this->datas[$id]['name'];
			}
		}
		$this->datas[$id][$this->dependencies][] = $dependency;
		return $this->datas[$id]['name'];
	}
	
	private function addNoteDependency ($matches) {
		return "#(".$this->addDependency ($matches).")";
	}
	
	private function paragraphs ($text) {
		$result = "";
		$paras = explode("\n", trim($text));
		foreach ($paras as $para) {
			$para = trim($para);
			$result .= "<p>";
			$result .= $para == "" ? "&nbsp;" : $para;
			$result .= "</p>";
		}
		return $result;
	}
	
	public function toJSON($url, $stepId = 0) {		
		$json = array();
		$datas = array();
		$sources = array();
		$simulator = new \SimpleXMLElement($url, LIBXML_NOWARNING, true);
		if ($simulator->DataSet) {
			foreach ($simulator->DataSet->Data as $data) {
				$id = (int)$data['id'];
				$this->datas[$id]['id'] = $id;
				$this->datas[$id]['name'] = (string)$data['name'];
				$this->datas[$id]['type'] = (string)$data['type'];
				$this->name = $this->datas[$id]['name'];
				$this->dependencies = 'dataDependencies';
				if ((string)$data['default'] != "") {
					$this->datas[$id]['unparsedDefault'] = preg_replace_callback(
						"/#(\d+)/", 
						array($this, 'addDependency'),
						(string)$data['default']
					);
				}
				if ((string)$data['constraint'] != "") {
					$this->datas[$id]['unparsedConstraint'] = preg_replace_callback(
						"/#(\d+)/", 
						array($this, 'addDependency'),
						(string)$data['constraint']
					);
					$this->datas[$id]['constraintMessage'] = (string)$data['constraintMessage'];
				}
				if ((string)$data['min'] != "") {
					$this->datas[$id]['unparsedMin'] = preg_replace_callback(
						"/#(\d+)/", 
						array($this, 'addDependency'),
						(string)$data['min']
					);
				}
				if ((string)$data['max'] != "") {
					$this->datas[$id]['unparsedMax'] = preg_replace_callback(
						"/#(\d+)/", 
						array($this, 'addDependency'),
						(string)$data['max']
					);
				}
				if ((string)$data['content'] != "") {
					$this->datas[$id]['unparsedContent'] = preg_replace_callback(
						"/#(\d+)/", 
						array($this, 'addDependency'),
						(string)$data['content']
					);
				}
				if ((string)$data['source'] != "") {
					$this->datas[$id]['unparsedSource'] = preg_replace_callback(
						"/#(\d+)/", 
						array($this, 'addDependency'),
						(string)$data['source']
					);
				}
				if ((string)$data['index'] != "") {
					$this->datas[$id]['unparsedIndex'] = preg_replace_callback(
						"/#(\d+)/", 
						array($this, 'addDependency'),
						(string)$data['index']
					);
				}
				if ($data->Choices) {
					$choices = array();
					foreach ($data->Choices->Choice as $choice) {
						$choices[] = array(
							(string)$choice['value'] => (string)$choice['label']
						);
					}
					if (count($choices) > 0) {
						$this->datas[$id]['choices'] = $choices;
					}
					if ($data->Choices->Source) {
						$source = $data->Choices->Source;
						$sid = (int)$source['id'];
						$this->datas[$id]['choices']['source'] = array (
							'id' => $sid,
							'valueColumn' => (string)$source['valueColumn'],
							'labelColumn' => (string)$source['labelColumn']
						);
						if (! isset($sources[$sid]['choiceDependencies'])) {
							$sources[$sid]['choiceDependencies'] = array();
						}
						$sources[$sid]['choiceDependencies'][] = $this->datas[$id]['name'];
					}
				}
			}
		}
		$json["name"] = (string)$simulator["name"];
		$json["label"] = (string)$simulator["label"];
		$json["description"] = $this->paragraphs($simulator->Description);
		$fieldsets = array();
		$actions = array();
		$footnotes = array();
		$usages = array();
		$nstep = array();
		if ($simulator->Steps) {
			foreach ($simulator->Steps->Step as $step) {
				if ((int)$step['id'] == $stepId) {
					$nstep = array (
						'name' => (string)$step['name'],
						'label' => (string)$step['label']
					);
					foreach ($step->FieldSet as $fieldset) {
						$fields = array();
						foreach ($fieldset->Field as $field) {
							$id = (int)$field['data'];
							$data = $this->datas[$id];
							if (!isset($usages[$data['name']])) {
								$usages[$data['name']] = (string)$field['usage'];
								$nfield = array(
									'data' => $data['name'],
									'label' => (string)$field['label'],
									'usage' => (string)$field['usage']
								);
								if ((string)$field['prompt'] != "") {
									$nfield['prompt'] = (string)$field['prompt'];
								}
								if ((string)$field['required'] == '1') {
									$nfield['required'] = '1';
								}
								$this->name = $data['name'];
								$this->dependencies = 'fieldDependencies';
								if ((string)$field['condition'] != "") {
									$this->datas[$id]['unparsedCondition'] = preg_replace_callback(
										"/#(\d+)/", 
										array($this, 'addDependency'),
										(string)$field['condition']
									);
								}
								if ((string)$field['explanation'] != "") {
									$this->datas[$id]['unparsedExplanation'] = preg_replace_callback(
										"/#(\d+)/", 
										array($this, 'addDependency'),
										(string)$field['explanation']
									);
								}
								$this->dependencies = 'noteDependencies';
								if ((string)$field->PreNote != "") {
									$nfield['prenote'] = $this->paragraphs(preg_replace_callback(
										"/#(\d+)/", 
										array($this, 'addNoteDependency'), 
										(string)$field->PreNote
									));
								}
								if ((string)$field->PostNote != "") {
									$nfield['postnote'] = $this->paragraphs(preg_replace_callback(
										"/#(\d+)/", 
										array($this, 'addNoteDependency'),
										(string)$field->PostNote
									));
								}
								if ((string)$field['usage'] == 'input') {
									$this->datas[$id]['inputField'] = array(
										(string)$step['name']."-fieldset-".$fieldset['id'],
										count($fields)
									);
								}
								$fields[] = $nfield;
							}
						}
						$nfieldset = array(
							'id'	 => (int)$fieldset['id'],
							'legend' => (string)$field->Legend,
							'fields' => $fields
						);
						$this->name = (string)$step['name']."-fieldset-".$fieldset['id'];
						$this->dependencies = 'fieldsetDependencies';
						if ((string)$fieldset['condition'] != "") {
							$nfieldset['unparsedCondition'] = preg_replace_callback(
								"/#(\d+)/", 
								array($this, 'addDependency'),
								(string)$fieldset['condition']
							);
						}
						$fieldsets[$this->name] = $nfieldset;
					}
					$nstep["fieldsets"] = $fieldsets;
					foreach ($step->ActionList as $actionList) {
						foreach ($actionList as $action) {
							$this->name = (string)$action['name'];
							$this->dependencies = 'actionDependencies';
							$naction = array(
								'label'	 => (string)$action['label']
							);
							if ((string)$action['condition'] != "") {
								$naction['unparsedCondition'] = preg_replace_callback(
									"/#(\d+)/", 
									array($this, 'addDependency'),
									(string)$action['condition']
								);
							}
							$actions[$this->name] = $naction;
						}
					}
					foreach ($step->FootNotes as $footnoteList) {
						foreach ($footnoteList as $footnote) {
							$this->name = (int)$footnote['id'];
							$this->dependencies = 'footNoteDependencies';
							$nfootnote = array(
								'text'	=> $this->paragraphs(preg_replace_callback(
									"/#(\d+)/", 
									array($this, 'addNoteDependency'), 
									$footnote
								))
							);
							if ((string)$footnote['condition'] != "") {
								$nfootnote['unparsedCondition'] = preg_replace_callback(
									"/#(\d+)/", 
									array($this, 'addDependency'),
									(string)$footnote['condition']
								);
							}
							$footnotes[$this->name] = $nfootnote;
						}
					}
					$nstep["actions"] = $actions;
					$nstep["footnotes"] = $footnotes;
				}
			}
		}
		if ($simulator->Sources) {
			foreach ($simulator->Sources->Source as $source) {
				$id = (int)$source['id'];
				$this->name = $id;
				$this->dependencies = 'sourceDependencies';
				$parameters = array();
				foreach ($source->Parameter as $parameter) {
					$data = $this->datas[(int)$parameter['data']];
					$parameters[(string)$parameter['name']] = $data['name'];
					$this->addDependency(array(null, (int)$parameter['data']));
				}
				$sources[$id]['parameters'] = $parameters;
			}
		}
		foreach ($this->datas as $id => $data) {
			$name = $data['name'];
			unset($data['name']);
			foreach($data as $key => $value) {
				$datas[$name][$key] = $value;
			}
		}
		$json["datas"] = $datas;
		$json["step"] = $nstep;
		$json["sources"] = $sources;
		if ($this->controller->isDevelopmentEnvironment() && ! version_compare(phpversion(), '5.4.0', '<')) {
			return json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE |  JSON_UNESCAPED_SLASHES);
		} else {
			return json_encode($json);
		}
	}
	
	public function save($file) {
	}
}

?>