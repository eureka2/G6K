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

class Simulator {

	private $controller = "";
	private $name = "";
	private $label = "";
	private $defaultView = "";
	private $referer = "";
	private $dynamic = false;
	private $memo = false;
	private $description = "";
	private $dateFormat = "";
	private $decimalPoint = "";
	private $moneySymbol = "";
	private $symbolPosition = "";
	private $datas = array();
	private $profiles = null;
	private $steps = array();
	private $sites = array();
	private $databases = array();
	private $datasources = array();
	private $sources = array();
	private $businessrules = array();
	private $relatedInformations = "";
	private $dependencies = "";
	private $error = false;
	private $errorMessages = array();
	private $warning = false;
	private $warningMessages = array();

	public function __construct($controller) {
		$this->controller = $controller;
	}

	public function getController() {
		return $this->controller;
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

	public function getReferer() {
		return $this->referer;
	}

	public function setReferer($referer) {
		$this->referer = $referer;
	}

	public function getDefaultView() {
		return $this->defaultView;
	}

	public function setDefaultView($defaultView) {
		$this->defaultView = $defaultView;
	}

	public function isDynamic() {
		return $this->dynamic;
	}

	public function getDynamic() {
		return $this->dynamic;
	}

	public function setDynamic($dynamic) {
		$this->dynamic = $dynamic;
	}

	public function isMemo() {
		return $this->memo;
	}

	public function hasMemo() {
		return $this->memo;
	}

	public function getMemo() {
		return $this->memo;
	}

	public function setMemo($memo) {
		$this->memo = $memo;
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

	public function addData($data) {
		$this->datas[] = $data;
	}

	public function removeData($index) {
		$this->datas[$index] = null;
	}

	public function getDataById($id) {
		foreach ($this->datas as $data) {
			if ($data instanceof DataGroup) {
				if (($gdata = $data->getDataById($id)) !== null) {
					return $gdata;
				}
			} elseif ($data->getId() == $id) {
				return $data;
			}
		}
		return null;
	}

	public function getDataByName($name) {
		foreach ($this->datas as $data) {
			if ($data instanceof DataGroup) {
				if (($gdata = $data->getDataByName($name)) !== null) {
					return $gdata;
				}
			} elseif ($data->getName() == $name) {
				return $data;
			}
		}
		return null;
	}

	public function getDataGroupById($id) {
		foreach ($this->datas as $data) {
			if (($data instanceof DataGroup) && $data->getId() == $id) {
				return $data;
			}
		}
		return null;
	}

	public function getDataGroupByName($name) {
		foreach ($this->datas as $data) {
			if (($data instanceof DataGroup) && $data->getName() == $name) {
				return $data;
			}
		}
		return null;
	}

	public function getProfiles() {
		return $this->profiles;
	}

	public function setProfiles($profiles) {
		$this->profiles = $profiles;
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

	public function getBusinessRules() {
		return $this->businessrules;
	}

	public function setBusinessRules($businessrules) {
		$this->businessrules = $businessrules;
	}

	public function addBusinessRule(BusinessRule $businessrules) {
		$this->businessrules[] = $businessrules;
	}

	public function removeBusinessRule($index) {
		$this->businessrules[$index] = null;
	}

	public function getBusinessRuleById($id) {
		foreach ($this->businessrules as $businessrule) {
			if ($businessrule->getId() == $id) {
				return $businessrule;
			}
		}
		return null;
	}

	public function getRelatedInformations() {
		return $this->relatedInformations;
	}

	public function setRelatedInformations($relatedInformations) {
		$this->relatedInformations = $relatedInformations;
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

	public function getDatasourceById($id) {
		foreach ($this->datasources as $datasource) {
			if ($datasource->getId() == $id) {
				return $datasource;
			}
		}
		return null;
	}

	public function getDatasourceByName($name) {
		foreach ($this->datasources as $datasource) {
			if ($datasource->getName() == $name) {
				return $datasource;
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

	private function replaceIdByDataLabel($matches) {
		$id = $matches[1];
		$data = $this->getDataById($id);
		return $data !== null ? '<var data-id="' . $data->getId() . '" class="data">«' . $data->getLabel() . '»</var>' : "#" . $id;
	}

	public function replaceByDataLabel($target) {
		return preg_replace_callback(
			"/#(\d+)/", 
			array($this, 'replaceIdByDataLabel'),
			$target
		);
	}

	protected function loadData($data) {
		$dataObj = new Data($this, (int)$data['id'], (string)$data['name']);
		$dataObj->setLabel((string)$data['label']);
		$dataObj->setType((string)$data['type']);
		$dataObj->setUnparsedMin((string)$data['min']);
		$dataObj->setUnparsedMax((string)$data['max']);
		$dataObj->setUnparsedDefault((string)$data['default']);
		$dataObj->setUnit((string)$data['unit']);
		$dataObj->setRound(isset($data['round']) ? (int)$data['round'] : 2);
		$dataObj->setContent((string)$data['content']);
		$dataObj->setSource((string)$data['source']);
		$dataObj->setUnparsedIndex((string)$data['index']);
		$dataObj->setMemorize((string)$data['memorize'] == '1');
		if ($data->Choices) {
			foreach ($data->Choices->children() as $child) {
				if ($child->getName() == "ChoiceGroup") {
					$choicegroup = $child;
					$choiceGroupObj = new ChoiceGroup((string)$choicegroup['label']);
					foreach ($choicegroup->Choice as $choice) {
						$choiceObj = new Choice($dataObj, (string)$choice['id'], (string)$choice['value'], (string)$choice['label']);
						$choiceGroupObj->addChoice($choiceObj);
					}
					if ($choicegroup->Source) {
						$source = $choicegroup->Source;
						$choiceSourceObj = new ChoiceSource($dataObj, (int)$source['id'], (string)$source['valueColumn'], (string)$source['labelColumn']);
						$choiceSourceObj->setIdColumn((string)$source['idColumn']);
						$choiceGroupObj->setChoiceSource($choiceSourceObj);
					}
					$dataObj->addChoice($choiceGroupObj);
				} elseif ($child->getName() == "Choice") {
					$choice = $child;
					$choiceObj = new Choice($dataObj, (string)$choice['id'], (string)$choice['value'], (string)$choice['label']);
					$dataObj->addChoice($choiceObj);
				} elseif ($child->getName() == "Source") {
					$source = $child;
					$choiceSourceObj = new ChoiceSource($dataObj, (int)$source['id'], (string)$source['valueColumn'], (string)$source['labelColumn']);
					$choiceSourceObj->setIdColumn((string)$source['idColumn']);
					$dataObj->setChoiceSource($choiceSourceObj);
					break; // only one source
				}
			}
		}
		if ($data->Table) {
			$table = $data->Table;
			$tableObj = new Table($dataObj, (string)$table['id']);
			$tableObj->setName((string)$table['name']);
			$tableObj->setLabel((string)$table['label']);
			$tableObj->setDescription((string)$table->Description);
			foreach ($table->Column as $column) {
				$columnObj = new Column($tableObj, (int)$column['id'], (string)$column['name'], (string)$column['type']);
				$columnObj->setLabel((string)$column['label']);
				$tableObj->addColumn($columnObj);
			}
			$dataObj->setTable($tableObj);
		}
		$dataObj->setDescription((string)$data->Description);
		return $dataObj;
	}

	public function load($url) {
		$datasrc = $this->controller->databasesDir . '/DataSources.xml';
		if(extension_loaded('apc') && ini_get('apc.enabled')) {
			$xml = $this->loadFileFromCache($url);
			$simulator = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
			$xml = $this->loadFileFromCache($datasrc);
			$datasources = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
		} else {
			$simulator = new \SimpleXMLElement($url, LIBXML_NOWARNING, true);
			$datasources = new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true);
		}
		$this->loadEntities($simulator, $datasources);
	}

	protected function loadEntities(\SimpleXMLElement $simulator, \SimpleXMLElement $datasources) {
		foreach ($datasources->DataSource as $datasource) {
			$datasourceObj = new DataSource($this, (int)$datasource['id'], (string)$datasource['name'], (string)$datasource['type']);
			$datasourceObj->setUri((string)$datasource['uri']);
			$datasourceObj->setMethod((string)$datasource['method']);
			$datasourceObj->setDatabase((int)$datasource['database']);
			$datasourceObj->setDescription((string)$datasource->Description);
			foreach ($datasource->Namespace as $namespace) {
				$datasourceObj->addNamespace((string)$namespace['prefix'], (string)$namespace['uri']);
			}
			if ($datasourceObj->getType() == 'internal' || $datasourceObj->getType() == 'database') {
				foreach ($datasource->Table as $table) {
					foreach ($datasource->Table as $table) {
						$tableObj = new Table(null, (int)$table['id']);
						$tableObj->setName((string)$table['name']);
						$tableObj->setLabel((string)$table['label']);
						$tableObj->setDescription((string)$table->Description);
						foreach ($table->Column as $column) {
							$columnObj = new Column($tableObj, (int)$column['id'], (string)$column['name'], (string)$column['type']);
							$columnObj->setLabel((string)$column['label']);
							$tableObj->addColumn($columnObj);
						}
						$datasourceObj->addTable($tableObj);
					}
				}
			}
			$this->datasources[] = $datasourceObj;
		}
		if ($datasources->Databases) {
			$this->loadDatabases($datasources->Databases->Database);
		}
		$this->setName((string)$simulator["name"]);
		$this->setLabel((string)$simulator["label"]);
		$this->setDefaultView((string)$simulator["defaultView"]);
		$this->setReferer((string)$simulator["referer"]);
		$this->setDynamic((string)$simulator['dynamic'] == '1');
		$this->setMemo((string)$simulator['memo'] == '1');
		$this->setDescription((string)$simulator->Description);
		$this->setRelatedInformations($simulator->RelatedInformations);
		$this->setDateFormat((string)($simulator->DataSet['dateFormat']));
		$this->setDecimalPoint((string)($simulator->DataSet['decimalPoint']));
		$this->setMoneySymbol((string)($simulator->DataSet['moneySymbol']));
		$this->setSymbolPosition((string)($simulator->DataSet['symbolPosition']));
		if ($simulator->DataSet) {
			foreach ($simulator->DataSet->children() as $child) {
				if ($child->getName() == "DataGroup") {
					$datagroup = $child;
					$dataGroupObj = new DataGroup($this, (int)$datagroup['id'], (string)$datagroup['name']);
					$dataGroupObj->setLabel((string)$datagroup['label']);
					$dataGroupObj->setDescription((string)$datagroup->Description);
					foreach ($datagroup->Data as $data) {
						$dataGroupObj->addData( $this->loadData($data));
					}
					$this->datas[] = $dataGroupObj;
				} elseif ($child->getName() == "Data") {
					$this->datas[] = $this->loadData($child);
				} 
			}
		}
		if ($simulator->Profiles) {
			$this->profiles = new Profiles($this);
			$this->profiles->setLabel((string)$simulator->Profiles['label']);
			foreach ($simulator->Profiles->Profile as $profile) {
				$profileObj = new Profile((int)$profile['id'], (string)$profile['name']);
				$profileObj->setLabel((string)$profile['label']);
				$profileObj->setDescription((string)$profile->Description);
				foreach ($profile->Data as $data) {
					$profileObj->addData((int)$data['id'], (string)$data['default']);
				}
				$this->profiles->addProfile($profileObj);
			}
		}
		if ($simulator->Steps) {
			$step0 = false;
			foreach ($simulator->Steps->Step as $step) {
				$stepObj = new Step($this, (int)$step['id'], (string)$step['name'], (string)$step['label'], (string)$step['template']);
				if ($stepObj->getId() == 0) {
					$step0 = true;
				}
				$stepObj->setOutput((string)$step['output']);
				$stepObj->setDescription((string)$step->Description);
				$stepObj->setDynamic((string)$step['dynamic'] == '1');
				foreach ($step->Panels->Panel as $panel) {
					$panelObj = new Panel($stepObj, (int)$panel['id']);
					$panelObj->setName((string)$panel['name']);
					$panelObj->setLabel((string)$panel['label']);
					foreach ($panel->children() as $block) {
						if ($block->getName() == "FieldSet") {
							$fieldset = $block;
							$fieldsetObj = new FieldSet($panelObj, (int)$fieldset['id']);
							$fieldsetObj->setLegend((string)$fieldset->Legend);
							if ((string)$fieldset['disposition'] != "") {
								$fieldsetObj->setDisposition((string)$fieldset['disposition']);
							}
							if ((string)$fieldset['display'] != "") {
								$fieldsetObj->setDisplay((string)$fieldset['display']);
							}
							if ((string)$fieldset['popinLink'] != "") {
								$fieldsetObj->setPopinLink((string)$fieldset['popinLink']);
							}
							foreach ($fieldset->children() as $child) {
								if ($child->getName() == "Columns") {
									foreach ($child->Column as $column) {
										$columnObj = new Column(null, (int)$column['id'], (string)$column['name'], (string)$column['type']);
										$columnObj->setLabel((string)$column['label']);
										$fieldsetObj->addColumn($columnObj);
									}
								} elseif ($child->getName() == "FieldRow") {
									$fieldrow = $child;
									$fieldRowObj = new FieldRow($fieldsetObj, (int)$fieldrow['id'], (string)$fieldrow['label']);
									$fieldRowObj->setColon((string)$fieldrow['colon'] == '' || (string)$fieldrow['colon'] == '1');
									$fieldRowObj->setHelp((string)$fieldrow['help'] == '1');
									$fieldRowObj->setEmphasize((string)$fieldrow['emphasize'] == '1');
									$fieldRowObj->setDataGroup((string)$fieldrow['datagroup']);
									foreach ($fieldrow->Field as $field) {
										$fieldRowObj->addField($this->loadField($field, $fieldsetObj));
									}
									$fieldsetObj->addField($fieldRowObj);
								} elseif ($child->getName() == "Field") {
									$fieldsetObj->addField($this->loadField($child, $fieldsetObj));
								}
							}
							$panelObj->addFieldSet($fieldsetObj);
						} elseif ($block->getName() == "BlockInfo") {
							$blockinfo = $block;
							$blockinfoObj = new BlockInfo($panelObj, (int)$blockinfo['id']);
							$blockinfoObj->setName((string)$blockinfo['name']);
							$blockinfoObj->setLabel((string)$blockinfo['label']);
							foreach ($blockinfo->Chapter as $chapter) {
								$chapterObj = new Chapter($blockinfoObj, (int)$chapter['id']);
								$chapterObj->setName((string)$chapter['name']);
								$chapterObj->setLabel((string)$chapter['label']);
								$chapterObj->setIcon((string)$chapter['icon']);
								$chapterObj->setCollapsible((string)$chapter['collapsible'] == '1');
								foreach ($chapter->Section as $section) {
									$sectionObj = new Section($chapterObj, (int)$section['id']);
									$sectionObj->setName((string)$section['name']);
									$sectionObj->setLabel((string)$section['label']);
									$sectionObj->setContent((string)$section->Content);
									$sectionObj->setAnnotations((string)$section->Annotations);
									$chapterObj->addSection($sectionObj);
								}
								$blockinfoObj->addChapter($chapterObj);
							}
							$panelObj->addFieldSet($blockinfoObj);
						}
					}
					$stepObj->addPanel($panelObj);
				}
				foreach ($step->ActionList as $actionList) {
					foreach ($actionList as $action) {
						$actionObj = new Action($stepObj, (string)$action['name'], (string)$action['label']);
						$actionObj->setClass((string)$action['class']);
						$actionObj->setWhat((string)$action['what']);
						$actionObj->setFor((string)$action['for']);
						$actionObj->setUri((string)$action['uri']);
						$stepObj->addAction($actionObj);
					}
				}
				foreach ($step->FootNotes as $footnotes) {
					$footnotesObj = new FootNotes($stepObj);
					if ((string)$footnotes['position'] != "") {
						$footnotesObj->setPosition((string)$footnotes['position']);
					}
					foreach ($footnotes as $footnote) {
						$footnoteObj = new FootNote($stepObj, (int)$footnote['id']);
						$footnoteObj->setText((string)$footnote);
						$footnotesObj->addFootNote($footnoteObj);
					}
					$stepObj->setFootNotes($footnotesObj);
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
		if ($simulator->Sources) {
			$this->loadSources($simulator->Sources->Source);
		}

		if ($simulator->BusinessRules) {
			foreach ($simulator->BusinessRules->BusinessRule as $brule) {
				$businessRuleObj = new BusinessRule($this, 'rule-'.mt_rand(), (int)$brule['id'], (string)$brule['name']);
				$businessRuleObj->setLabel((string)$brule['label']);
				$businessRuleObj->setConditions((string)$brule->Conditions['value']);
				if (preg_match_all("/#(\d+)/", (string)$brule->Conditions['value'], $matches)) {
					foreach($matches[1] as $id) {
						$data = $this->getDataById($id);
						$data->addRuleDependency((int)$brule['id']);
					}
				}
				if ($brule->Conditions->Condition) {
					$businessRuleObj->setConnector($this->loadConnector($brule->Conditions->Condition));
				} else if ($brule->Conditions->Connector) {
					$businessRuleObj->setConnector($this->loadConnector($brule->Conditions->Connector));
				}
				foreach ($brule->IfActions->Action as $action) {
					$businessRuleObj->addIfAction($this->loadRuleAction($action));
					if ((string)$action['name'] == "setAttribute" && preg_match_all("/#(\d+)/", (string)$action['value'], $matches)) {
						foreach($matches[1] as $id) {
							$data = $this->getDataById($id);
							$data->addRuleDependency((int)$brule['id']);
						}
					}
				}
				foreach ($brule->ElseActions->Action as $action) {
					$businessRuleObj->addElseAction($this->loadRuleAction($action));
					if ((string)$action['name'] == "setAttribute" && preg_match_all("/#(\d+)/", (string)$action['value'], $matches)) {
						foreach($matches[1] as $id) {
							$data = $this->getDataById($id);
							$data->addRuleDependency((int)$brule['id']);
						}
					}
				}
				$this->businessrules[] = $businessRuleObj;
			}
		}
	}

	protected function loadField(\SimpleXMLElement $field, FieldSet $fieldsetObj) {
		$fieldObj = new Field($fieldsetObj, (int)$field['position'], (int)$field['data'], (string)$field['label']);
		$fieldObj->setUsage((string)$field['usage']);
		$fieldObj->setPrompt((string)$field['prompt']);
		$fieldObj->setNewline((string)$field['newline'] == '' || (string)$field['newline'] == '1');
		$fieldObj->setRequired((string)$field['required'] == '1');
		$fieldObj->setVisibleRequired((string)$field['visibleRequired'] == '1');
		$fieldObj->setColon((string)$field['colon'] == '' || (string)$field['colon'] == '1');
		$fieldObj->setUnderlabel((string)$field['underlabel'] == '1');
		$fieldObj->setHelp((string)$field['help'] == '1');
		$fieldObj->setEmphasize((string)$field['emphasize'] == '1');
		$fieldObj->setExplanation((string)$field['explanation']);
		$fieldObj->setExpanded((string)$field['expanded'] == '1');
		$fieldObj->setWidget((string)$field['widget']);
		if ($field->PreNote) {
			$noteObj = new FieldNote($this);
			$noteObj->setText((string)$field->PreNote);
			$fieldObj->setPreNote($noteObj);
		}
		if ($field->PostNote) {
			$noteObj = new FieldNote($this);
			$noteObj->setText((string)$field->PostNote);
			$fieldObj->setPostNote($noteObj);
		}
		return $fieldObj;
	}

	protected function loadRuleAction(\SimpleXMLElement $action) {
		$ruleActionObj = new RuleAction((int)$action['id'], (string)$action['name']);
		$ruleActionObj->setTarget((string)$action['target']);
		$ruleActionObj->setData((string)$action['data']);
		$ruleActionObj->setDatagroup((string)$action['datagroup']);
		$ruleActionObj->setStep((string)$action['step']);
		$ruleActionObj->setPanel((string)$action['panel']);
		$ruleActionObj->setFieldset((string)$action['fieldset']);
		$ruleActionObj->setColumn((string)$action['column']);
		$ruleActionObj->setFieldrow((string)$action['fieldrow']);
		$ruleActionObj->setField((string)$action['field']);
		$ruleActionObj->setBlockinfo((string)$action['blockinfo']);
		$ruleActionObj->setChapter((string)$action['chapter']);
		$ruleActionObj->setSection((string)$action['section']);
		$ruleActionObj->setPrenote((string)$action['prenote']);
		$ruleActionObj->setPostnote((string)$action['postnote']);
		$ruleActionObj->setFootnote((string)$action['footnote']);
		$ruleActionObj->setAction((string)$action['action']);
		$ruleActionObj->setChoice((string)$action['choice']);
		$ruleActionObj->setValue((string)$action['value']);
		return $ruleActionObj;
	}

	protected function loadSources(\SimpleXMLElement $sources) {
		foreach ($sources as $source) {
			$sourceObj = new Source($this, (int)$source['id'], (string)$source['datasource'], (string)$source['returnType']);
			$sourceObj->setLabel((string)$source['label']);
			$sourceObj->setRequest((string)$source['request']);
			if ((string)$source['requestType'] != '') {
				$sourceObj->setRequestType((string)$source['requestType']);
			}
			$sourceObj->setSeparator((string)$source['separator']);
			$sourceObj->setDelimiter((string)$source['delimiter']);
			$sourceObj->setReturnPath((string)$source['returnPath']);
			foreach ($source->Parameter as $parameter) {
				$parameterObj = new Parameter($sourceObj, (string)$parameter['type']);
				$parameterObj->setOrigin((string)$parameter['origin']);
				$parameterObj->setName((string)$parameter['name']);
				$parameterObj->setFormat((string)$parameter['format']);
				$parameterObj->setData((int)$parameter['data']);
				$parameterObj->setConstant((string)$parameter['constant']);
				$parameterObj->setOptional((string)$parameter['optional'] == '1');
				$sourceObj->addParameter($parameterObj);
			}
			$this->sources[] = $sourceObj;
		}
	}

	protected function loadDatabases(\SimpleXMLElement $databases) {
		foreach ($databases as $database) {
			$databaseObj = new Database($this, $this->controller->databasesDir, (int)$database['id'], (string)$database['type'], (string)$database['name']);
			$databaseObj->setLabel((string)$database['label']);
			$databaseObj->setHost((string)$database['host']);
			$databaseObj->setPort((int)$database['port']);
			$databaseObj->setUser((string)$database['user']);
			if ((string)$database['password'] != '') {
				$databaseObj->setPassword((string)$database['password']);
			} elseif ((string)$database['user'] != '') {
				try {
					$user = $this->controller->get('kernel')->getContainer()->getParameter('database_user');
					if ((string)$database['user'] == $user) {
						$databaseObj->setPassword($this->controller->get('kernel')->getContainer()->getParameter('database_password'));
					}
				} catch (\Exception $e) {
				}
			}
			$this->databases[] = $databaseObj;
		}
	}

	protected function loadConnector(\SimpleXMLElement $connector, $parentConnector = null) {
		if ($connector->getName() == 'Condition') {
			return new Condition($this, $parentConnector, (string)$connector['operand'], (string)$connector['operator'], (string)$connector['expression']);
		}
		$connectorObj = new Connector($this, (string)$connector['type']);
		foreach ($connector->children() as $child) {
			$connectorObj->addCondition($this->loadConnector($child, $connectorObj));
		}
		return $connectorObj;
	}

	public function loadForSource($url) {
		$datasrc = $this->controller->databasesDir . '/DataSources.xml';
		if(extension_loaded('apc') && ini_get('apc.enabled')) {
			$xml = $this->loadFileFromCache($url);
			$simulator = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
			$xml = $this->loadFileFromCache($datasrc);
			$datasources = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
		} else {
			$simulator = new \SimpleXMLElement($url, LIBXML_NOWARNING, true);
			$datasources = new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true);
		}
		foreach ($datasources->DataSource as $datasource) {
			$datasourceObj = new DataSource($this, (int)$datasource['id'], (string)$datasource['name'], (string)$datasource['type']);
			$datasourceObj->setUri((string)$datasource['uri']);
			$datasourceObj->setMethod((string)$datasource['method']);
			$datasourceObj->setDatabase((int)$datasource['database']);
			$datasourceObj->setDescription((string)$datasource->Description);
			$this->datasources[] = $datasourceObj;
		}
		if ($datasources->Databases) {
			$this->loadDatabases($datasources->Databases->Database);
		}
		if ($simulator->DataSet) {
			foreach ($simulator->DataSet->children() as $child) {
				if ($child->getName() == "DataGroup") {
					foreach ($child->Data as $data) {
						$dataObj = new Data($this, (int)$data['id'], (string)$data['name']);
						$dataObj->setLabel((string)$data['label']);
						$dataObj->setType((string)$data['type']);
						$this->datas[] = $dataObj;
					}
				} elseif ($child->getName() == "Data") {
					$dataObj = new Data($this, (int)$child['id'], (string)$child['name']);
					$dataObj->setLabel((string)$child['label']);
					$dataObj->setType((string)$child['type']);
					$this->datas[] = $dataObj;
				}
			}
		}
		if ($simulator->Sources) {
			$this->loadSources($simulator->Sources->Source);
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

	private function replaceDataIdByName($matches) {
		$id = $matches[1];
		return $this->datas[$id] ? "#(" . $this->datas[$id]['name'] . ")" : "#" . $id;
	}

	private function replaceIdByName($target) {
		$result = preg_replace_callback(
			'/\<var\s+[^\s]*\s*data-id="(\d+)"[^\>]*\>[^\<]+\<\/var\>/',
			array($this, 'replaceDataIdByName'),
			$target
		);
		return preg_replace_callback(
			"/#(\d+)/", 
			array($this, 'replaceDataIdByName'),
			$result
		);
	}

	private function replaceIdByDataName($matches) {
		$id = $matches[1];
		return $this->datas[$id] ? $this->datas[$id]['name']: "#" . $id;
	}

	private function replaceByDataName($target) {
		return preg_replace_callback(
			"/#(\d+)/", 
			array($this, 'replaceIdByDataName'),
			$target
		);
	}

	public function paragraphs ($text) {
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

	private function fieldProperties ($field) {
		$id = (int)$field['data'];
		$nfield = array(
			'data' => $this->name,
			'label' => (string)$field['label'],
			'usage' => (string)$field['usage']
		);
		if ((string)$field['prompt'] != "") {
			$nfield['prompt'] = (string)$field['prompt'];
		}
		if ((string)$field['required'] == '' || (string)$field['required'] == '1') {
			$nfield['required'] = '1';
		}
		if ((string)$field['visibleRequired'] == '' || (string)$field['visibleRequired'] == '1') {
			$nfield['visibleRequired'] = '1';
		}
		if ((string)$field['widget'] != "") {
			$nfield['widget'] = (string)$field['widget'];
		}
		$this->dependencies = 'fieldDependencies';
		if ((string)$field['explanation'] != "") {
			$this->datas[$id]['unparsedExplanation'] = preg_replace_callback(
				"/#(\d+)/", 
				array($this, 'addDependency'),
				(string)$field['explanation']
			);
		}
		$this->dependencies = 'noteDependencies';
		if ($field->PreNote) {
			$nfield['prenote'] = $this->paragraphs(preg_replace_callback(
				'/#(\d+)|\<var\s+class="data"\s+data-id="(\d+)L?"\>[^\<]+\<\/var\>/', 
				array($this, 'addNoteDependency'), 
				(string)$field->PreNote
			));
		}
		if ($field->PostNote) {
			$nfield['postnote'] = $this->paragraphs(preg_replace_callback(
				'/#(\d+)|\<var\s+class="data"\s+data-id="(\d+)L?"\>[^\<]+\<\/var\>/', 
				array($this, 'addNoteDependency'),
				(string)$field->PostNote
			));
		}
		return $nfield;
	}

	protected function toJSONData($data, &$sources) {
		$id = (int)$data['id'];
		$this->datas[$id]['id'] = $id;
		$this->datas[$id]['name'] = (string)$data['name'];
		$this->datas[$id]['type'] = (string)$data['type'];
		if ((string)$data['memorize'] != "") {
			$this->datas[$id]['memorize'] = (string)$data['memorize'];
		}
		$this->name = $this->datas[$id]['name'];
		$this->dependencies = 'dataDependencies';
		if ((string)$data['default'] != "") {
			$this->datas[$id]['unparsedDefault'] = preg_replace_callback(
				"/#(\d+)/", 
				array($this, 'addDependency'),
				(string)$data['default']
			);
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
			foreach ($data->Choices->children() as $child) {
				if ($child->getName() == "ChoiceGroup") {
					$choicegroup = $child;
					foreach ($choicegroup->Choice as $choice) {
						$choices[] = array(
							(string)$choice['value'] => (string)$choice['label']
						);
					}
					if ($choicegroup->Source) {
						$source = $choicegroup->Source;
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
				} elseif ($child->getName() == "Choice") {
					$choice = $child;
					$choices[] = array(
						(string)$choice['value'] => (string)$choice['label']
					);
				} elseif ($child->getName() == "Source") {
					$source = $child;
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
					break; // only one source
				}
			}
			if (count($choices) > 0) {
				$this->datas[$id]['choices'] = $choices;
			}
		}
	}

	private function actionsData($ruleID, \SimpleXMLElement $actions, &$dataset) {
		$datas = array();
		foreach ($actions->Action as $action) {
			$target = (string)$action['target'];
			switch ((string)$action['name']) {
				case 'notifyWarning':
					$clause = array(
						'name' => 'action-select',
						'value' => 'notifyWarning',
						'fields' => array(
							array('name' => 'message', 'value' => $this->replaceIdByName((string)$action['value'])),
							array('name' => 'target', 'value' => $target)
						)
					);
					switch ($target) {
						case 'data':
							$clause['fields'][1]['fields'] = array(
								array('name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name'])
							);
							break;
						case 'datagroup':
							$clause['fields'][1]['fields'] = array(
								array('name' => 'datagroupName', 'value' => (string)$action['datagroup'])
							);
							break;
						case 'dataset':
							break;
					}
					break;
				case 'notifyError':
					$clause = array(
						'name' => 'action-select',
						'value' => 'notifyError',
						'fields' => array(
							array('name' => 'message', 'value' => $this->replaceIdByName((string)$action['value'])),
							array('name' => 'target', 'value' => $target)
						)
					);
					switch ($target) {
						case 'data':
							$clause['fields'][1]['fields'] = array(
								array('name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name'])
							);
							break;
						case 'datagroup':
							$clause['fields'][1]['fields'] = array(
								array('name' => 'datagroupName', 'value' => (string)$action['datagroup'])
							);
							break;
						case 'dataset':
							break;
					}
					break;
				case 'hideObject':
				case 'showObject':
					switch ($target) {
						case 'field':
						case 'prenote':
						case 'postnote':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId',	'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
													array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
															array('name' => 'fieldsetId', 'value' => (string)$action['fieldset'], 'fields' => array(
																	array('name' => 'fieldId', 'value' => (string)$action[$target])
																)
															)
														)
													)
												)
											)
										)
									)
								)
							);
							break;
						case 'section':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId',	'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
													array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
															array('name' => 'blockinfoId', 'value' => (string)$action['blockinfo'], 'fields' => array(
																	array('name' => 'chapterId', 'value' => (string)$action['chapter'], 'fields' => array(
																			array('name' => 'sectionId', 'value' => (string)$action[$target])
																		)
																	)
																)
															)
														)
													)
												)
											)
										)
									)
								)
							);
							break;
						case 'chapter':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId',	'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
													array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
															array('name' => 'blockinfoId', 'value' => (string)$action['blockinfo'], 'fields' => array(
																	array('name' => 'chapterId', 'value' => (string)$action[$target])
																)
															)
														)
													)
												)
											)
										)
									)
								)
							);
							break;
						case 'fieldset':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
													array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
															array('name' => 'fieldsetId', 'value' => (string)$action[$target])
														)
													)
												)
											)
										)
									)
								)
							);
							break;
						case 'fieldrow':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId',	'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
													array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
															array('name' => 'fieldsetId', 'value' => (string)$action['fieldset'], 'fields' => array(
																	array('name' => 'fieldrowId', 'value' => (string)$action[$target])
																)
															)
														)
													)
												)
											)
										)
									)
								)
							);
							break;
						case 'blockinfo':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
													array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
															array('name' => 'blockinfoId', 'value' => (string)$action[$target])
														)
													)
												)
											)
										)
									)
								)
							);
							break;
						case 'panel':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
													array('name' => 'panelId', 'value' => (string)$action[$target])
												)
											)
										)
									)
								)
							);
							break;
						case 'step':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action[$target])
										)
									)
								)
							);
							break;
						case 'footnote':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
													array('name' => 'footnoteId', 'value' => (string)$action[$target])
												)
											)
										)
									)
								)
							);
							break;
						case 'action':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
													array('name' => 'actionId', 'value' => (string)$action[$target])
												)
											)
										)
									)
								)
							);
							break;
						case 'choice':
							$clause = array('name' => 'action-select', 'value' => (string)$action['name'], 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => (string)$action['step'], 'fields' => array(
													array('name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => array(
															array('name' => 'fieldsetId', 'value' => (string)$action['fieldset'], 'fields' => array(
																	array('name' => 'fieldId', 'value' => (string)$action['field'], 'fields' => array(
																			array('name' => 'choiceId', 'value' => (string)$action[$target])
																		)
																	)
																)
															)
														)
													)
												)
											)
										)
									)
								)
							);
							break;
					}
					break;
				case 'setAttribute':
					$clause = array('name' => 'action-select', 'value' => 'setAttribute', 'fields' => array(
							array('name' => 'attributeId', 'value' => $target, 'fields' => array(
									array('name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name'], 'fields' => array(
											array('name' => 'newValue', 'value' => $this->replaceByDataName((string)$action['value']))
										)
									)
								)
							)
						)
					);
					if (preg_match_all("/#(\d+)/", (string)$action['value'], $matches)) {
						foreach($matches[1] as $id) {
							$name = $this->datas[$id]['name'];
							if (! isset($dataset[$name]['rulesActionsDependency'])) {
								$dataset[$name]['rulesActionsDependency'] = array();
							}
							$dataset[$name]['rulesActionsDependency'][] = $ruleID;
						}
					}
					break;
				case 'unsetAttribute':
					$clause = array('name' => 'action-select', 'value' => 'unsetAttribute', 'fields' => array(
							array('name' => 'attributeId', 'value' => $target, 'fields' => array(
									array('name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name'])
								)
							)
						)
					);
					break;
			}
			$datas[] = $clause;
		}
		return $datas;
	}

	public function toJSON($url, $stepId = 0) {
		$json = array();
		$datas = array();
		$profiles = array();
		$sources = array();
		$rules = array();
		$dataIdMax = 0;
		$datasrc = $this->controller->databasesDir . '/DataSources.xml';
		if(extension_loaded('apc') && ini_get('apc.enabled')) {
			$xml = $this->loadFileFromCache($url);
			$simulator = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
			$xml = $this->loadFileFromCache($datasrc);
			$datasources = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
		} else {
			$simulator = new \SimpleXMLElement($url, LIBXML_NOWARNING, true);
			$datasources = new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true);
		}
		if ($simulator->DataSet) {
			foreach ($simulator->DataSet->children() as $child) {
				if ($child->getName() == "DataGroup") {
					foreach ($child->Data as $data) {
						$this->toJSONData($data, $sources);
						$id = (int)$data['id'];
						$this->datas[$id]['datagroup'] = (string)$child['name'];
						if ((int)$data['id'] > $dataIdMax) {
							$dataIdMax = (int)$data['id'];
						}
					}
				} elseif ($child->getName() == "Data") {
					$this->toJSONData($child, $sources);
					if ((int)$child['id'] > $dataIdMax) {
						$dataIdMax = (int)$child['id'];
					}
				}
			}
		}
		$json["name"] = (string)$simulator["name"];
		$json["label"] = (string)$simulator["label"];
		$json["defaultView"] = (string)$simulator["defaultView"];
		$json["referer"] = (string)$simulator["referer"];
		if ((string)$simulator["memo"] != "") {
			$json["memo"] = (string)$simulator["memo"];
		}
		$json["description"] = $this->paragraphs((string)$simulator->Description);
		if ($simulator->Profiles) {
			$profiles['label'] = (string)$simulator->Profiles['label'];
			$profs = array();
			foreach ($simulator->Profiles->Profile as $profile) {
				$pdatas = array();
				foreach ($profile->Data as $data) {
					$id = (int)$data['id'];
					$pdatas[] = array(
						'id' => $id,
						'name' => $this->datas[$id]['name'],
						'default' => (string)$data['default']
					);
				}
				$profs[] = array(
					'id' => (int)$profile['id'],
					'name' => (string)$profile['name'],
					'label' => (string)$profile['label'],
					'description' => $this->paragraphs((string)$profile->Description),
					'datas' => $pdatas
				);
			}
			$profiles['profiles'] = $profs;
		}
		$panels = array();
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
					foreach ($step->Panels->Panel as $panel) {
						foreach ($panel->children() as $block) {
							if ($block->getName() == "FieldSet") {
								$fieldset = $block;
								$fields = array();
								foreach ($fieldset->children() as $child) {
									if ($child->getName() == "FieldRow") {
										$fieldrow = $child;
										foreach ($fieldrow->Field as $field) {
											$id = (int)$field['data'];
											$data = $this->datas[$id];
											if (!isset($usages[$data['name']])) {
												$usages[$data['name']] = (string)$field['usage'];
												$this->name = $data['name'];
												if ((string)$field['usage'] == 'input') {
													$this->datas[$id]['inputField'] = array(
														(string)$step['name']."-panel-".$panel['id']."-fieldset-".$fieldset['id'],
														count($fields)
													);
												}
												$fields[] = $this->fieldProperties($field);
											}
										}
									} elseif ($child->getName() == "Field") {
										$field = $child;
										$id = (int)$field['data'];
										$data = $this->datas[$id];
										if (!isset($usages[$data['name']])) {
											$usages[$data['name']] = (string)$field['usage'];
											$this->name = $data['name'];
											if ((string)$field['usage'] == 'input') {
												$this->datas[$id]['inputField'] = array(
													(string)$step['name']."-panel-".$panel['id']."-fieldset-".$fieldset['id'],
													count($fields)
												);
											}
											$fields[] = $this->fieldProperties($field);
										}
									}
								}
								$nfieldset = array(
									'id'	 => (int)$fieldset['id'],
									'legend' => (string)$fieldset->Legend,
									'display' => (string)$fieldset['display'],
									'popinLink' => (string)$fieldset['popinLink'],
									'fields' => $fields
								);
								$this->name = (string)$step['name']."-panel-".$panel['id']."-fieldset-".$fieldset['id'];
								$panels[$this->name] = $nfieldset;
							} elseif ($block->getName() == "BlockInfo") {
								$blockinfo = $block;
								$chapters = array();
								foreach ($blockinfo->Chapter as $chapter) {
									$sections = array();
									$this->dependencies = 'sectionContentDependencies';
									foreach ($chapter->Section as $section) {
										$this->name = (string)$step['name']."-panel-".$panel['id']."-blockinfo-".$blockinfo['id']."-chapter-".$chapter['id']."-section-".$section['id'];
										$content = preg_replace_callback(
											'/#(\d+)|\<var\s+class="data"\s+data-id="(\d+)L?"\>[^\<]+\<\/var\>/', 
											array($this, 'addNoteDependency'), 
											 $this->paragraphs((string)$section->Content)
										);
										$sections[$this->name] = array(
											'id'	 => (int)$section['id'],
											'name' => (string)$section['name'],
											'label' => (string)$section['label'],
											'content' => $content,
											'annotations' =>  $this->paragraphs((string)$section->Annotations)
										); 
									}
									$this->name = (string)$step['name']."-panel-".$panel['id']."-blockinfo-".$blockinfo['id']."-chapter-".$chapter['id'];
									$chapters[$this->name] = array(
										'id'	 => (int)$chapter['id'],
										'name' => (string)$chapter['name'],
										'label' => (string)$chapter['label'],
										'icon' => (string)$chapter['icon'],
										'collapsible' => (string)$chapter['collapsible'],
										'sections' => $sections
									); 
								}
								$nfieldset = array(
									'id'	 => (int)$blockinfo['id'],
									'name' => (string)$blockinfo['name'],
									'label' => (string)$blockinfo['label'],
									'chapters' => $chapters
								);
								$this->name = (string)$step['name']."-panel-".$panel['id']."-blockinfo-".$blockinfo['id'];
								$panels[$this->name] = $nfieldset;
							}
						}
					}
					$nstep["panels"] = $panels;
					foreach ($step->ActionList as $actionList) {
						foreach ($actionList as $action) {
							$this->name = (string)$action['name'];
							$this->dependencies = 'actionDependencies';
							$naction = array(
								'label'	 => (string)$action['label'],
								'what'	 => (string)$action['what'],
								'for'	 => (string)$action['for']
							);
							$actions[$this->name] = $naction;
						}
					}
					foreach ($step->FootNotes as $footnoteList) {
						foreach ($footnoteList as $footnote) {
							$this->name = (int)$footnote['id'];
							$this->dependencies = 'footNoteDependencies';
							$nfootnote = array(
								'text'	=> $this->paragraphs(preg_replace_callback(
									'/#(\d+)|\<var\s+class="data"\s+data-id="(\d+)L?"\>[^\<]+\<\/var\>/', 
									array($this, 'addNoteDependency'), 
									$footnote
								))
							);
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
				$datasource =(string)$source['datasource'];
				if (is_numeric($datasource)) {
					$dss = $datasources->xpath("/DataSources/DataSource[@id='".$datasource."']");
				} else {
					$dss = $datasources->xpath("/DataSources/DataSource[@name='".$datasource."']");
				}
				$datasource = $dss[0];
				$sources[$id]['datasource']['type'] = (string)$datasource['type'];
				if ((string)$datasource['type'] == 'uri') {
					$sources[$id]['datasource']['uri'] = (string)$datasource['uri'];
					$sources[$id]['datasource']['method'] = (string)$datasource['method'] != '' ? (string)$datasource['method'] : 'get';
				}
				$this->name = $id;
				$this->dependencies = 'sourceDependencies';
				$parameters = array();
				foreach ($source->Parameter as $param) {
					$parameter = array(
						'name' => (string)$param['name'],
						'type' => (string)$param['type'] != '' ? (string)$param['type'] : 'queryString',
						'format' => (string)$param['format'],
						'origin' => (string)$param['origin'] != '' ? (string)$param['origin'] : 'data',
						'optional' => (string)$param['optional'] != '' ? (string)$param['optional'] : '0'
					);
					if ((string)$param['origin'] == 'constant') {
						$parameter['constant'] = (string)$param['constant'];
					} else {
						$data = $this->datas[(int)$param['data']];
						$parameter['data'] = $data['name'];
						$this->addDependency(array(null, (int)$param['data']));
					}
					$parameters[] = $parameter;
				}
				$sources[$id]['label'] = (string)$source['label'];
				$sources[$id]['separator'] = (string)$source['separator'];
				$sources[$id]['delimiter'] = (string)$source['delimiter'];
				$sources[$id]['parameters'] = $parameters;
				$sources[$id]['returnType'] = (string)$source['returnType'];
				$sources[$id]['returnPath'] = $this->replaceIdByName((string)$source['returnPath']);
			}
		}
		foreach ($this->datas as $id => $data) {
			$name = $data['name'];
			unset($data['name']);
			foreach($data as $key => $value) {
				$datas[$name][$key] = $value;
			}
		}
		if ($simulator->BusinessRules) {
			foreach ($simulator->BusinessRules->BusinessRule as $brule) {
				$rule = array(
					'id' => (int)$brule['id'],
					'name' => (string)$brule['name'],
					'label' => (string)$brule['label'],
					'conditions' => $this->replaceByDataName((string)$brule->Conditions['value']),
					'connector' => $brule->Conditions->Condition ? $this->ruleConnector($brule->Conditions->Condition) : ($brule->Conditions->Connector ? $this->ruleConnector($brule->Conditions->Connector) : null),
					'ifdata' =>  $this->actionsData((int)$brule['id'], $brule->IfActions, $datas),
					'elsedata' => $this->actionsData((int)$brule['id'], $brule->ElseActions, $datas)
				);
				if (preg_match_all("/#(\d+)/", (string)$brule->Conditions['value'], $matches)) {
					foreach($matches[1] as $id) {
						$name = $this->datas[$id]['name'];
						if (! isset($datas[$name]['rulesConditionsDependency'])) {
							$datas[$name]['rulesConditionsDependency'] = array();
						}
						$datas[$name]['rulesConditionsDependency'][] = $rule['id'];
					}
				}
				$rules[] = $rule;
			}
			foreach ($datas as $name => $data) {
				if (isset($data['rulesConditionsDependency'])) {
					$datas[$name]['rulesConditionsDependency'] = array_keys(array_flip($data['rulesConditionsDependency']));
				}
			 	if (isset($data['rulesActionsDependency'])) {
					$datas[$name]['rulesActionsDependency'] = array_keys(array_flip($data['rulesActionsDependency']));
				}
			 
			}
		}
		$json["datas"] = $datas;
		$json["profiles"] = $profiles;
		$json["step"] = $nstep;
		$json["sources"] = $sources;
		$json["rules"] = $rules;
		if ($this->controller->helper->isDevelopmentEnvironment() && ! version_compare(phpversion(), '5.4.0', '<')) {
			return json_encode($json, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE |  JSON_UNESCAPED_SLASHES);
		} else {
			return json_encode($json);
		}
	}

	protected function ruleConnector(\SimpleXMLElement $pconnector) {
		if ($pconnector->getName() == 'Condition') {
			$operand = (string)$pconnector['operand'];
			if (preg_match("/^\d+$/", $operand)) {
				$operand = (int)$operand;
				$name = isset($this->datas[$operand]) ? $this->datas[$operand]['name'] : $operand;
			} else {
				$name = $operand;
			}
			return array(
				'name' => $name,
				'operator' => (string)$pconnector['operator'],
				'value' => (string)$pconnector['expression']
			);
		}
		$kind = (string)$pconnector['type'];
		$connector = array(
			$kind => array()
		);
		foreach ($pconnector->children() as $child) {
			$connector[$kind][] = $this->ruleConnector($child);
		}
		return $connector;
	}

	private function cleanRichText($text) {
		$text = preg_replace("|<p>&nbsp;</p>".PHP_EOL."|smi", PHP_EOL, $text);
		$text = preg_replace("|<p>&nbsp;</p>|smi", "", $text);
		$pattern = '{<p>((?:(?:(?!<p[^>]*>|</p>).)++|<p[^>]*>(?1)</p>)*)</p>}smi';
		$text = preg_replace($pattern, "$1", $text);
		$lines = explode("\n", $text);
		foreach($lines as &$line) {
			$line = trim(str_replace(array("<br>", "\t", "&nbsp;"), array(PHP_EOL, " ", " "), $line));
		}
		$cleaned = implode(PHP_EOL ,$lines);
		return trim($cleaned);
	}

	public function save($file) {
		$xml = array();
		$xml[] = '<?xml version="1.0" encoding="utf-8"?>';
		$xml[] = '<Simulator xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/Simulator.xsd" name="' . $this->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $this->getLabel()) . '" defaultView="' . $this->getDefaultView() . '" referer="' . $this->getReferer() . '" dynamic="' . ($this->isDynamic() ? 1 : 0) . '" memo="' . ($this->hasMemo() ? 1 : 0) . '">';
		$xml[] = '	<Description><![CDATA[';
		$xml[] = $this->cleanRichText($this->getDescription());
		$xml[] = '	]]></Description>';
		$xml[] = '	<DataSet dateFormat="' . $this->getDateFormat() . '" decimalPoint="' . $this->getDecimalPoint() . '" moneySymbol="' . $this->getMoneySymbol() . '" symbolPosition="' . $this->getSymbolPosition() . '">';
		foreach ($this->getDatas() as $data) {
			if ($data instanceof DataGroup) {
				$xml[] = '		<DataGroup id="' . $data->getId() . '" name="' . $data->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $data->getLabel()) . '">';
				foreach ($data->getDatas() as $gdata) {
					$attrs = 'id="' . $gdata->getId() . '" name="' . $gdata->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $gdata->getLabel()) . '" type="' . $gdata->getType() . '"';
					if ($gdata->getUnparsedDefault() != '') {
						$attrs .= ' default="' . htmlspecialchars($gdata->getUnparsedDefault(), ENT_COMPAT) . '"'; 
					}
					if ($gdata->getUnparsedMin() != '') {
						$attrs .= ' min="' . $gdata->getUnparsedMin() . '"'; 
					}
					if ($gdata->getUnparsedMax() != '') {
						$attrs .= ' max="' . $gdata->getUnparsedMax() . '"'; 
					}
					if ($gdata->getContent() != '') {
						$attrs .= ' content="' . htmlspecialchars($gdata->getContent(), ENT_COMPAT) . '"'; 
					}
					if ($gdata->getSource() != '') {
						$attrs .= ' source="' . $gdata->getSource() . '"'; 
					}
					if ($gdata->getUnparsedIndex() != '') {
						$attrs .= ' index="' . $gdata->getUnparsedIndex() . '"'; 
					}
					if ($gdata->getRound() != 2) {
						$attrs .= ' round="' . $gdata->getRound() . '"'; 
					}
					if ($gdata->getUnit() != '') {
						$attrs .= ' unit="' . $gdata->getUnit() . '"'; 
					}
					if ($gdata->isMemorize()) {
						$attrs .= ' memorize="1"'; 
					}
					$description = $this->cleanRichText($gdata->getDescription());
					if ($description != '' || $gdata->getType() == 'choice') {
						$xml[] = '			<Data ' . $attrs . '>';
						if ($description != '') {
							$xml[] = '				<Description><![CDATA[';
							$xml[] = $description;
							$xml[] = '				]]></Description>';
						}
						if ($gdata->getType() == 'choice') {
							$xml[] = '				<Choices>';
							foreach ($gdata->getChoices() as $choice) {
								if ($choice instanceof Choice) {
									$xml[] = '					<Choice id="' . $choice->getId() . '" value="' . $choice->getValue() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $choice->getLabel()) . '" />';
								} elseif ($choice instanceof ChoiceGroup) {
									$xml[] = '					<ChoiceGroup label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $choice->getLabel()) . '">';
									foreach ($choice->getChoices() as $gchoice) {
										$xml[] = '						<Choice id="' . $gchoice->getId() . '" value="' . $gchoice->getValue() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $gchoice->getLabel()) . '" />';
									}
									if ($choice->getChoiceSource() !== null) {
										$source = $choice->getChoiceSource();
										$attrs = 'id="' . $source->getId() . '"';
										if ($source->getIdColumn() != '') {
											$attrs .= ' idColumn="' . $source->getIdColumn() . '"';
										}
										$attrs .= ' valueColumn="' . $source->getValueColumn() . '" labelColumn="' . $source->getLabelColumn() . '"';
										$xml[] = '						<Source ' . $attrs . ' />';
									}
									$xml[] = '					</ChoiceGroup>';
								}
							}
							if ($gdata->getChoiceSource() !== null) {
								$source = $gdata->getChoiceSource();
								$attrs = 'id="' . $source->getId() . '"';
								if ($source->getIdColumn() != '') {
									$attrs .= ' idColumn="' . $source->getIdColumn() . '"';
								}
								$attrs .= ' valueColumn="' . $source->getValueColumn() . '" labelColumn="' . $source->getLabelColumn() . '"';
								$xml[] = '					<Source ' . $attrs . ' />';
							}
							$xml[] = '				</Choices>';
						}
						$xml[] = '			</Data>';
					} else {
						$xml[] = '			<Data ' . $attrs . ' />';
					}
				}
				$xml[] = '		</DataGroup>';
			} elseif ($data instanceof Data) {
				$attrs = 'id="' . $data->getId() . '" name="' . $data->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $data->getLabel()) . '" type="' . $data->getType() . '"';
				if ($data->getUnparsedDefault() != '') {
					$attrs .= ' default="' . $data->getUnparsedDefault() . '"'; 
				}
				if ($data->getUnparsedMin() != '') {
					$attrs .= ' min="' . $data->getUnparsedMin() . '"'; 
				}
				if ($data->getUnparsedMax() != '') {
					$attrs .= ' max="' . $data->getUnparsedMax() . '"'; 
				}
				if ($data->getContent() != '') {
					$attrs .= ' content="' . htmlspecialchars($data->getContent(), ENT_COMPAT) . '"'; 
				}
				if ($data->getSource() != '') {
					$attrs .= ' source="' . $data->getSource() . '"'; 
				}
				if ($data->getUnparsedIndex() != '') {
					$attrs .= ' index="' . $data->getUnparsedIndex() . '"'; 
				}
				if ($data->getRound() != 2) {
					$attrs .= ' round="' . $data->getRound() . '"'; 
				}
				if ($data->getUnit() != '') {
					$attrs .= ' unit="' . $data->getUnit() . '"'; 
				}
				if ($data->isMemorize()) {
					$attrs .= ' memorize="1"'; 
				}
				$description = $this->cleanRichText($data->getDescription());
				if ($description != '' || $data->getType() == 'choice') {
					$xml[] = '		<Data ' . $attrs . '>';
					if ($description != '') {
						$xml[] = '			<Description><![CDATA[';
						$xml[] = $description;
						$xml[] = '			]]></Description>';
					}
					if ($data->getType() == 'choice') {
						$xml[] = '			<Choices>';
						foreach ($data->getChoices() as $choice) {
							if ($choice instanceof Choice) {
								$xml[] = '				<Choice id="' . $choice->getId() . '" value="' . $choice->getValue() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $choice->getLabel()) . '" />';
							} elseif ($choice instanceof ChoiceGroup) {
								$xml[] = '				<ChoiceGroup label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $choice->getLabel()) . '">';
								foreach ($choice->getChoices() as $gchoice) {
									$xml[] = '					<Choice id="' . $gchoice->getId() . '" value="' . $gchoice->getValue() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $gchoice->getLabel()) . '" />';
								}
								if ($choice->getChoiceSource() !== null) {
									$source = $choice->getChoiceSource();
									$source->setCaseInsensitive(false);
									$attrs = 'id="' . $source->getId() . '"';
									if ($source->getIdColumn() != '') {
										$attrs .= ' idColumn="' . $source->getIdColumn() . '"';
									}
									$attrs .= ' valueColumn="' . $source->getValueColumn() . '" labelColumn="' . $source->getLabelColumn() . '"';
									$xml[] = '					<Source ' . $attrs . ' />';
								}
								$xml[] = '				</ChoiceGroup>';
							}
						}
						if ($data->getChoiceSource() !== null) {
							$source = $data->getChoiceSource();
							$source->setCaseInsensitive(false);
							$attrs = 'id="' . $source->getId() . '"';
							if ($source->getIdColumn() != '') {
								$attrs .= ' idColumn="' . $source->getIdColumn() . '"';
							}
							$attrs .= ' valueColumn="' . $source->getValueColumn() . '" labelColumn="' . $source->getLabelColumn() . '"';
							$xml[] = '				<Source ' . $attrs . ' />';
						}
						$xml[] = '			</Choices>';
					}
					$xml[] = '		</Data>';
				} else {
					$xml[] = '		<Data ' . $attrs . ' />';
				}
			}
		}
		$xml[] = '	</DataSet>';
		if ($this->profiles !== null && (count($this->profiles->getProfiles()) > 0)) {
			$xml[] = '	<Profiles label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $this->profiles->getLabel()) . '">';
			foreach ($this->profiles->getProfiles() as $profile) {
				$xml[] = '		<Profile id="' . $profile->getId() . '" name="' . $profile->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $profile->getLabel()) . '">';
				$description = $this->cleanRichText($profile->getDescription());
				if ($description != '') {
					$xml[] = '			<Description><![CDATA[';
					$xml[] = $description;
					$xml[] = '			]]></Description>';
				}
				foreach ($profile->getDatas() as $data) {
					$xml[] = '			<Data id="' . $data[0] . '" default="' . $data[1] . '" />';
				}
				$xml[] = '		</Profile>';
			}
			$xml[] = '	</Profiles>';
		}
		if (count($this->getSteps()) > 0) {
			$xml[] = '	<Steps>';
			foreach ($this->getSteps() as $step) {
				$attrs = 'id="' . $step->getId() . '" name="' . $step->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $step->getLabel()) . '" template="' . $step->getTemplate() . '"';
				if ($step->getOutput() != '') {
					$attrs .= ' output="' . $step->getOutput() . '"'; 
				}
				if ($step->isDynamic()) {
					$attrs .= ' dynamic="1"'; 
				}
				$xml[] = '		<Step ' . $attrs . '>';
				$description = $this->cleanRichText($step->getDescription());
				if ($description != '') {
					$xml[] = '			<Description><![CDATA[';
					$xml[] = $description;
					$xml[] = '			]]></Description>';
				}
				$xml[] = '			<Panels>';
				foreach ($step->getPanels() as $panel) {
					$attrs = 'id="' . $panel->getId() . '"';
					$attrs .= ' name="' . $panel->getName() . '"';
					$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $panel->getLabel()) . '"';
					$xml[] = '				<Panel ' . $attrs . '>';
					foreach ($panel->getFieldSets() as $block) {
						if ($block instanceof FieldSet) {
							$fieldset = $block;
							$attrs = 'id="' . $fieldset->getId() . '"';
							if ($fieldset->getDisposition() != '' && $fieldset->getDisposition() != 'classic') {
								$attrs .= ' disposition="' . $fieldset->getDisposition() . '"'; 
							}
							if ($fieldset->getDisplay() != '' && $fieldset->getDisplay() != 'inline') {
								$attrs .= ' display="' . $fieldset->getDisplay() . '"'; 
							}
							if ($fieldset->getPopinLink() != '') {
								$attrs .= ' popinLink="' . $fieldset->getPopinLink() . '"'; 
							}
							$xml[] = '					<FieldSet ' . $attrs . '>';
							$legend = $this->cleanRichText($fieldset->getLegend());
							if ($legend != '') {
								$xml[] = '						<Legend><![CDATA[';
								$xml[] = $legend;
								$xml[] = '						]]></Legend>';
							}
							if (count($fieldset->getColumns()) > 0) {
								$xml[] = '						<Columns>';
								foreach ($fieldset->getColumns() as $column) {
									$attrs = 'id="' . $column->getId() . '" name="' . $column->getName() . '" type="' . $column->getType() . '" label="' . str_replace("<", "&lt;", $column->getLabel()) . '"';
									$xml[] = '							<Column ' . $attrs . ' />';
								}
								$xml[] = '						</Columns>';
							}
							foreach ($fieldset->getFields() as $child) {
								if ($child instanceof FieldRow) {
									$fieldrow = $child;
									$attrs = 'id="' . $fieldrow->getId() . '" datagroup="' . $fieldrow->getDataGroup() . '"';
									if ($fieldrow->getLabel() != '') {
										$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $fieldrow->getLabel()) . '"'; 
									}
									if ($fieldrow->hasHelp()) {
										$attrs .= ' help="1"'; 
									}
									if (! $fieldrow->hasColon()) {
										$attrs .= ' colon="0"'; 
									}
									if ($fieldrow->isEmphasized()) {
										$attrs .= ' emphasize="1"'; 
									}
									$xml[] = '						<FieldRow ' . $attrs . '>';
									foreach ($fieldrow->getFields() as $field) {
										$attrs = 'position="' . $field->getPosition() . '" data="' . $field->getData() . '" usage="' . $field->getUsage() . '"';
										if (! $field->isNewline()) {
											$attrs .= ' newline="0"'; 
										}
										if ($field->getLabel() != '') {
											$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getLabel()) . '"'; 
										}
										if ($field->getPrompt() != '') {
											$attrs .= ' prompt="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getPrompt()) . '"'; 
										}
										if (! $field->isRequired()) {
											$attrs .= ' required="0"'; 
										}
										if (! $field->isVisibleRequired()) {
											$attrs .= ' visibleRequired="0"'; 
										}
										if (! $field->hasColon()) {
											$attrs .= ' colon="0"'; 
										}
										if ($field->isUnderlabel()) {
											$attrs .= ' underlabel="1"'; 
										}
										if (! $field->hasHelp()) {
											$attrs .= ' help="0"'; 
										}
										if ($field->isEmphasized()) {
											$attrs .= ' emphasize="1"'; 
										}
										if ($field->getExplanation() != '') {
											$attrs .= ' explanation="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getExplanation()) . '"'; 
										}
										if ($field->isExpanded()) {
											$attrs .= ' expanded="1"'; 
										}
										if ($field->getWidget() != '') {
											$attrs .= ' widget="' . $field->getWidget() . '"'; 
										}
										if ($field->getPreNote() !== null || $field->getPostNote() !== null) {
											$xml[] = '							<Field ' . $attrs . '>';
											if ($field->getPreNote() !== null) {
												$xml[] = '							<PreNote><![CDATA[';
												$xml[] = $this->cleanRichText($field->getPreNote()->getText());
												$xml[] = '							]]></PreNote>';
											}
											if ($field->getPostNote() !== null) {
												$xml[] = '							<PostNote><![CDATA[';
												$xml[] = $this->cleanRichText($field->getPostNote()->getText());
												$xml[] = '							]]></PostNote>';
											}
											$xml[] = '							</Field>';
										} else {
											$xml[] = '							<Field ' . $attrs . ' />';
										}
									}
									$xml[] = '						</FieldRow>';
								} elseif ($child instanceof Field) {
									$field = $child;
									$attrs = 'position="' . $field->getPosition() . '" data="' . $field->getData() . '" usage="' . $field->getUsage() . '"';
									if (! $field->isNewline()) {
										$attrs .= ' newline="0"'; 
									}
									if ($field->getLabel() != '') {
										$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getLabel()) . '"'; 
									}
									if ($field->getPrompt() != '') {
										$attrs .= ' prompt="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getPrompt()) . '"'; 
									}
									$attrs .= $field->isRequired() ? ' required="1"' : ' required="0"'; 
									$attrs .= $field->isVisibleRequired() ? ' visibleRequired="1"' : ' visibleRequired="0"'; 
									if (! $field->hasColon()) {
										$attrs .= ' colon="0"'; 
									}
									if ($field->isUnderlabel()) {
										$attrs .= ' underlabel="1"'; 
									}
									$attrs .= $field->hasHelp() ? ' help="1"' : ' help="0"'; 
									if ($field->isEmphasized()) {
										$attrs .= ' emphasize="1"'; 
									}
									if ($field->getExplanation() != '') {
										$attrs .= ' explanation="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $field->getExplanation()) . '"'; 
									}
									if ($field->isExpanded()) {
										$attrs .= ' expanded="1"'; 
									}
									if ($field->getWidget() != '') {
										$attrs .= ' widget="' . $field->getWidget() . '"'; 
									}
									if ($field->getPreNote() !== null || $field->getPostNote() !== null) {
										$xml[] = '						<Field ' . $attrs . '>';
										if ($field->getPreNote() !== null) {
											$xml[] = '							<PreNote><![CDATA[';
											$xml[] = $this->cleanRichText($field->getPreNote()->getText());
											$xml[] = '							]]></PreNote>';
										}
										if ($field->getPostNote() !== null) {
											$xml[] = '							<PostNote><![CDATA[';
											$xml[] = $this->cleanRichText($field->getPostNote()->getText());
											$xml[] = '							]]></PostNote>';
										}
										$xml[] = '						</Field>';
									} else {
										$xml[] = '						<Field ' . $attrs . ' />';
									}
								}
							}
							$xml[] = '					</FieldSet>';
						} elseif ($block instanceof BlockInfo) {
							$blocinfo = $block;
							$attrs = 'id="' . $blocinfo->getId() . '"';
							$attrs .= ' name="' . $blocinfo->getName() . '"';
							$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $blocinfo->getLabel()) . '"';
							$xml[] = '					<BlockInfo ' . $attrs . '>';
							foreach ($blocinfo->getChapters() as $chapter) {
								$attrs = 'id="' . $chapter->getId() . '"';
								$attrs .= ' name="' . $chapter->getName() . '"';
								$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $chapter->getLabel()) . '"';
								if ($chapter->getIcon() != '') {
									$attrs .= ' icon="' . $chapter->getIcon() . '"'; 
								}
								if ($chapter->isCollapsible()) {
									$attrs .= ' collapsible="1"'; 
								}
								$xml[] = '						<Chapter ' . $attrs . '>';
								foreach ($chapter->getSections() as $section) {
									$attrs = 'id="' . $section->getId() . '"';
									$attrs .= ' name="' . $section->getName() . '"';
									$attrs .= ' label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $section->getLabel()) . '"';
									$xml[] = '							<Section ' . $attrs . '>';
									$xml[] = '								<Content><![CDATA[';
									$xml[] = $this->cleanRichText($section->getContent());
									$xml[] = '								]]></Content>';
									$annotations = $this->cleanRichText($section->getAnnotations());
									if ($annotations != '') {
										$xml[] = '								<Annotations><![CDATA[';
										$xml[] = $annotations;
										$xml[] = '								]]></Annotations>';
									}
									$xml[] = '							</Section>';
								}
								$xml[] = '						</Chapter>';
							}
							$xml[] = '					</BlockInfo>';
						}
					}
					$xml[] = '				</Panel>';
				}
				$xml[] = '			</Panels>';
				if (count($step->getActions()) > 0) {
					$xml[] = '			<ActionList>';
					foreach ($step->getActions() as $action) {
						$attrs = 'name="' . $action->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $action->getLabel()) . '" what="' . $action->getWhat() . '" for="' . $action->getFor() . '"';
						if ($action->getUri() != '') {
							$attrs .= ' uri="' . $action->getUri() . '"'; 
						}
						if ($action->getClass() != '') {
							$attrs .= ' class="' . $action->getClass() . '"'; 
						}
						$xml[] = '				<Action ' . $attrs . ' />';
					}
					$xml[] = '			</ActionList>';
				}
				if ($step->getFootNotes() !== null) {
					$attrs = '';
					if ($step->getFootNotes()->getPosition() != '') {
						$attrs .= ' position="' . $step->getFootNotes()->getPosition() . '"'; 
					}
					$xml[] = '			<FootNotes' . $attrs . '>';
					$footnoteList = $step->getFootNotes();
					foreach ($footnoteList->getFootNotes() as $footnote) {
						$attrs = '';
						if ($footnote->getId() != '') {
							$attrs .= ' id="' . $footnote->getId() . '"'; 
						}
						$xml[] = '				<FootNote' . $attrs . '><![CDATA[';
						$xml[] = $this->cleanRichText($footnote->getText());
						$xml[] = '				]]></FootNote>';
					}
					$xml[] = '			</FootNotes>';
				}
				$xml[] = '		</Step>';
			}
			$xml[] = '	</Steps>';
		}
		if (count($this->getSources()) > 0) {
			$xml[] = '	<Sources>';
			foreach ($this->getSources() as $source) {
				$attrs = 'id="' . $source->getId() . '" datasource="' . $source->getDatasource() . '"';
				if ($source->getLabel() != '') {
					$attrs .= ' label="' . $source->getLabel() . '"'; 
				}
				if ($source->getRequest() != '') {
					$attrs .= ' request="' . htmlspecialchars($source->getRequest(), ENT_COMPAT) . '"'; 
				}
				if ($source->getRequestType() != '' && $source->getRequestType() != 'simple') {
					$attrs .= ' requestType="' . $source->getRequestType() . '"'; 
				}
				if ($source->getReturnType() != '') {
					$attrs .= ' returnType="' . $source->getReturnType() . '"'; 
				}
				if ($source->getSeparator() != '' && $source->getSeparator() != ';') {
					$attrs .= ' separator="' . $source->getSeparator() . '"'; 
				}
				if ($source->getDelimiter() != '') {
					$attrs .= ' delimiter="' . $source->getDelimiter() . '"'; 
				}
				if ($source->getReturnPath() != '') {
					$attrs .= ' returnPath="' . $source->getReturnPath() . '"';
				}
				if (count($source->getParameters()) > 0) {
					$xml[] = '		<Source ' . $attrs . '>';
					foreach ($source->getParameters() as $parameter) {
						$attrs = 'type="' . $parameter->getType() . '"';
						$attrs .= ' origin="' . $parameter->getOrigin() . '"';
						if ($parameter->getName() != '') {
							$attrs .= ' name="' . $parameter->getName() . '"';
						}
						if ($parameter->getFormat() != '') {
							$attrs .= ' format="' . $parameter->getFormat() . '"';
						}
						if ($parameter->getData() != '') {
							$attrs .= ' data="' . $parameter->getData() . '"';
						}
						if ($parameter->getConstant() != '') {
							$attrs .= ' constant="' . $parameter->getConstant() . '"';
						}
						if ($parameter->isOptional()) {
							$attrs .= ' optional="1"';
						}
						$xml[] = '			<Parameter ' . $attrs . ' />';
					}
					$xml[] = '		</Source>';
				} else {
					$xml[] = '		<Source ' . $attrs . ' />';
				}
			}
			$xml[] = '	</Sources>';
		}
		if (count($this->getBusinessRules()) > 0) {
			$xml[] = '	<BusinessRules>';
			foreach ($this->getBusinessRules() as $rule) {
				$attrs = 'id="' . $rule->getId() . '" name="' . $rule->getName() . '" label="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $rule->getLabel()) . '"';
				$xml[] = '		<BusinessRule ' . $attrs . '>';
				$xml[] = '			<Conditions value="' . htmlspecialchars($rule->getConditions(), ENT_COMPAT) . '">';
				if ($rule->getConnector() !== null) {
					$this->saveConnector($rule->getConnector(), "			", $xml);
				}
				$xml[] = '			</Conditions>';
				$xml[] = '			<IfActions>';
				foreach ($rule->getIfActions() as $action) {
					$attrs = $this->makeRuleActionAttributes($action);
					$xml[] = '				<Action ' . $attrs . ' />';
				}
				$xml[] = '			</IfActions>';
				$xml[] = '			<ElseActions>';
				foreach ($rule->getElseActions() as $action) {
					$attrs = $this->makeRuleActionAttributes($action);
					$xml[] = '				<Action ' . $attrs . ' />';
				}
				$xml[] = '			</ElseActions>';
				$xml[] = '		</BusinessRule>';
			}
			$xml[] = '	</BusinessRules>';
		}
		$relatedInformations = $this->cleanRichText($this->getRelatedInformations());
		if ($relatedInformations != '') {
			$xml[] = '	<RelatedInformations><![CDATA[';
			$xml[] = $relatedInformations;
			$xml[] = '	]]></RelatedInformations>';
		}
		$xml[] = '</Simulator>';
		$xmlstring = implode("\r\n", $xml);
		$xmlstring = str_replace('&gt;', '>', $xmlstring);
		file_put_contents($file, $xmlstring);
	}

	private function makeRuleActionAttributes(RuleAction $action) {
		$attrs = 'id="' . $action->getId() . '" name="' . $action->getName() . '" target="' . $action->getTarget() . '"';
		if ($action->getData() != '') {
			$attrs .= ' data="' . $action->getData() . '"';
		}
		if ($action->getDatagroup() != '') {
			$attrs .= ' datagroup="' . $action->getDatagroup() . '"';
		}
		if ($action->getStep() != '') {
			$attrs .= ' step="' . $action->getStep() . '"';
		}
		if ($action->getPanel() != '') {
			$attrs .= ' panel="' . $action->getPanel() . '"';
		}
		if ($action->getFieldset() != '') {
			$attrs .= ' fieldset="' . $action->getFieldset() . '"';
		}
		if ($action->getColumn() != '') {
			$attrs .= ' column="' . $action->getColumn() . '"';
		}
		if ($action->getFieldrow() != '') {
			$attrs .= ' fieldrow="' . $action->getFieldrow() . '"';
		}
		if ($action->getField() != '') {
			$attrs .= ' field="' . $action->getField() . '"';
		}
		if ($action->getBlockinfo() != '') {
			$attrs .= ' blockinfo="' . $action->getBlockinfo() . '"';
		}
		if ($action->getChapter() != '') {
			$attrs .= ' chapter="' . $action->getChapter() . '"';
		}
		if ($action->getSection() != '') {
			$attrs .= ' section="' . $action->getSection() . '"';
		}
		if ($action->getPrenote() != '') {
			$attrs .= ' prenote="' . $action->getPrenote() . '"';
		}
		if ($action->getPostnote() != '') {
			$attrs .= ' postnote="' . $action->getPostnote() . '"';
		}
		if ($action->getAction() != '') {
			$attrs .= ' action="' . $action->getAction() . '"';
		}
		if ($action->getFootnote() != '') {
			$attrs .= ' footnote="' . $action->getFootnote() . '"';
		}
		if ($action->getChoice() != '') {
			$attrs .= ' choice="' . $action->getChoice() . '"';
		}
		if ($action->getValue() != '') {
			$attrs .= ' value="' . $action->getValue() . '"';
		}
		return $attrs;
	}

	private function saveConnector($connector, $indent, &$xml) {
		if ($connector instanceof Condition) {
			$htmlcondition = '<Condition operand="' . $connector->getOperand() . '" operator="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $connector->getOperator()) . '"';
			$expression = $connector->getExpression();
			if ($expression !== null && $expression != '') {
				$htmlcondition .= ' expression="' . str_replace(array('<', '"'), array("&lt;", "&quot;"), $expression) . '"';
			}
			$htmlcondition .= ' />';
			$xml[] = $indent . "\t" . $htmlcondition;
		} else {
			$htmlconnector = '<Connector type="' . $connector->getType() . '"';
			$conditions = $connector->getConditions();
			if (empty($conditions)) {
				$htmlconnector .= ' />';
				$xml[] = $indent . "\t" . $htmlconnector;
			} else {
				$htmlconnector .= '>';
				$xml[] = $indent . "\t" . $htmlconnector;
				foreach ($conditions as $cond) {
					$this->saveConnector($cond, $indent . "\t", $xml);
				}
				$xml[] = $indent . "\t" . '</Connector>';
			}
		}
	}

	private function loadFileFromCache($url) {
		$mtimekey = $url . "-mtime";
		$mtime = filemtime($url);
		if (apc_exists($mtimekey)) {
			if ($mtime <= apc_fetch($mtimekey)) {
				return apc_fetch($url);
			}
		} 
		$file = file_get_contents($url);
		apc_add($url, $file);
		apc_add($mtimekey, $mtime);
		return $file;
	}

	public function loadEmptySimulator() {
		$datasrc = $this->controller->databasesDir . '/DataSources.xml';
		if(extension_loaded('apc') && ini_get('apc.enabled')) {
			$xml = $this->loadFileFromCache($datasrc);
			$datasources = new \SimpleXMLElement($xml, LIBXML_NOWARNING, false);
		} else {
			$datasources = new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true);
		}
		$simusrc = '<?xml version="1.0" encoding="utf-8"?>' .PHP_EOL;
		$simusrc .= '<Simulator xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/Simulator.xsd" name="';
		$simusrc .= $this->controller->get('translator')->trans("new");
		$simusrc .= '" label="';
		$simusrc .= $this->controller->get('translator')->trans("Simulator of calculation of ...");
		$simusrc .= '" defaultView="Default">' .PHP_EOL;
		$simusrc .= <<<EOT
	<Description><![CDATA[
	]]></Description>
	<DataSet dateFormat="d/m/Y" decimalPoint="," moneySymbol="€" symbolPosition="after">
	</DataSet>
	<Steps>
	</Steps>
</Simulator>
EOT;
		$simulator = new \SimpleXMLElement($simusrc, LIBXML_NOWARNING, false);
		$this->loadEntities($simulator, $datasources);
	}
}

?>
