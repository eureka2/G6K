<?php

namespace EUREKA\G6KBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use EUREKA\G6KBundle\Entity\Simulator;
use EUREKA\G6KBundle\Entity\Source;
use EUREKA\G6KBundle\Entity\Choice;
use EUREKA\G6KBundle\Entity\ChoiceSource;
use EUREKA\G6KBundle\Entity\DataGroup;
use EUREKA\G6KBundle\Entity\Data;
use EUREKA\G6KBundle\Entity\FieldRow;
use EUREKA\G6KBundle\Entity\Field;
use EUREKA\G6KBundle\Entity\BusinessRule;
use EUREKA\G6KBundle\Entity\RuleAction;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

use EUREKA\G6KBundle\Entity\Database;

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

class SimulatorsAdminController extends BaseAdminController {
	
	private $log = array();
	private $simu = null;
	private $datasources = array();
	private $dataset = array();
	private $actions = array();
	private $rules = array();

	public function indexAction(Request $request, $simulator = null)
	{
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
		
		$simu_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/simulators";
		$simus = array_filter(scandir($simu_dir), function ($simu) { return preg_match("/.xml$/", $simu); } );
		
		
		$simulators = array();
		foreach($simus as $simu) {
			$s = new \SimpleXMLElement($simu_dir."/".$simu, LIBXML_NOWARNING, true);
			$file = preg_replace("/.xml$/", "", $simu);
			$simulators[] = array(
				'file' => $file, 
				'name' => $s['name'], 
				'label' => $s['label'], 
				'description' => $s->Description
			);
			if ($simulator !== null && $file == $simulator) {
				$this->simu = new Simulator($this);
				try {
					if (isset($form['update'])) {
						$this->simu->load($simu_dir."/".$simu);
						$this->update($simulator, $form);
						$this->loadBusinessRules();
					} elseif (isset($form['create'])) {
					} elseif (isset($form['delete'])) {
					} else {
						$this->simu->load($simu_dir."/".$simu);
						$this->loadBusinessRules();
					}
				} catch (\Exception $e) {
					$this->simu = null;
				}
			}
		}
		
		$hiddens = array();		
		$hiddens['script'] = $script;
		$silex = new Application();
		$silex->register(new MobileDetectServiceProvider());
		try {
			return $this->render(
				'EUREKAG6KBundle:admin/pages:simulators.html.twig',
				array(
					'ua' => $silex["mobile_detect"],
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'nav' => 'simulators',
					'simulators' => $simulators,
					'simulator' => $this->simu,
					'dataset' => preg_replace("/\n/", "\n\t", json_encode($this->dataset, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE |  JSON_UNESCAPED_SLASHES)),
					'actions' => preg_replace("/\n/", "\n\t", json_encode($this->actions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE |  JSON_UNESCAPED_SLASHES)),
					'rules' => preg_replace("/\n/", "\n\t", json_encode($this->rules, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE |  JSON_UNESCAPED_SLASHES)),
					'hiddens' => $hiddens
				)
			);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}
	public function getDataById($id) {
		return $this->simu !== null ? $this->simu->getDataById($id) : null;
	}	
	
	protected function update($simulator, $form) {
		$simu_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/simulators";
		$simulatorData = json_decode($form['simulator'], true);
		$this->simu->setName($simulatorData["name"]);
		$this->simu->setLabel($simulatorData["label"]);
		$this->simu->setDefaultView($simulatorData["defaultView"]);
		$this->simu->setReferer($simulatorData["referer"]);
		$this->simu->setDynamic($simulatorData['dynamic'] == '1');
		$this->simu->setDescription(trim($simulatorData['description']));
		$this->simu->setRelatedInformations(trim($simulatorData['relatedInformations']));
		$this->simu->setDateFormat($simulatorData['dateFormat']);
		$this->simu->setDecimalPoint($simulatorData['decimalPoint']);
		$this->simu->setMoneySymbol($simulatorData['moneySymbol']);
		$this->simu->setSymbolPosition($simulatorData['symbolPosition']);
		
		$datas = json_decode($form['datas'], true);
		// file_put_contents($simu_dir."/work/".$simulator."-datas.json", var_export($datas, true));

		$this->simu->setDatas(array());
		foreach($datas as $i => $data) {
			if ($data['element'] == 'datagroup') {
				$dataGroupObj = new DataGroup($this->simu, (int)$data['id'], $data['name']);
				$dataGroupObj->setLabel($data['label']);
				$dataGroupObj->setDescription($data['description']);
				foreach ($data['datas'] as $gdata) {
					$dataObj = new Data($this, (int)$gdata['id'], $gdata['name']);
					$dataObj->setLabel($gdata['label']);
					$dataObj->setType($gdata['type']);
					if (isset($gdata['min'])) {
						$dataObj->setUnparsedMin($gdata['min']);
					}
					if (isset($gdata['max'])) {
						$dataObj->setUnparsedMax($gdata['max']);
					}
					if (isset($gdata['default'])) {
						$dataObj->setUnparsedDefault($gdata['default']);
					}
					if (isset($gdata['unit'])) {
						$dataObj->setUnit($gdata['unit']);
					}
					if (isset($gdata['round'])) {
						$dataObj->setRound((int)$gdata['round']);
					}
					if (isset($gdata['content'])) {
						$dataObj->setContent($gdata['content']);
					}
					if (isset($gdata['source'])) {
						$dataObj->setSource($gdata['source']);
					}
					if (isset($gdata['index'])) {
						$dataObj->setUnparsedIndex($gdata['index']);
					}
					if (isset($gdata['choices']) && count($gdata['choices']) > 0) {
						foreach ($gdata['choices'] as $choice) {
							$choiceObj = new Choice($dataObj, $choice['id'], $choice['value'], $choice['label']);
							$dataObj->addChoice($choiceObj);
						}
					}
					if (isset($gdata['choicesource']) && !empty($gdata['choicesource'])) {
						$source = $gdata['choicesource'];
						$choiceSourceObj = new ChoiceSource($dataObj, (int)$source['id'], $source['valueColumn'], $source['labelColumn']);
						if (isset($source['idColumn'])) {
							$choiceSourceObj->setIdColumn($source['idColumn']);
						}
						$dataObj->setChoiceSource($choiceSourceObj);
					}
					if (isset($gdata['description'])) {
						$dataObj->setDescription(trim($gdata['description']));
					}
					$this->simu->addData($dataObj);
				}
			} else {
				$dataObj = new Data($this, (int)$data['id'], $data['name']);
				$dataObj->setLabel($data['label']);
				$dataObj->setType($data['type']);
				if (isset($data['min'])) {
					$dataObj->setUnparsedMin($data['min']);
				}
				if (isset($data['max'])) {
					$dataObj->setUnparsedMax($data['max']);
				}
				if (isset($data['default'])) {
					$dataObj->setUnparsedDefault($data['default']);
				}
				if (isset($data['unit'])) {
					$dataObj->setUnit($data['unit']);
				}
				if (isset($data['round'])) {
					$dataObj->setRound((int)$data['round']);
				}
				if (isset($data['content'])) {
					$dataObj->setContent($data['content']);
				}
				if (isset($data['source'])) {
					$dataObj->setSource($data['source']);
				}
				if (isset($data['index'])) {
					$dataObj->setUnparsedIndex($data['index']);
				}
				if (isset($data['choices']) && count($data['choices']) > 0) {
					foreach ($data['choices'] as $choice) {
						$choiceObj = new Choice($dataObj, $choice['id'], $choice['value'], $choice['label']);
						$dataObj->addChoice($choiceObj);
					}
				}
				if (isset($data['choicesource']) && !empty($data['choicesource'])) {
					$source = $data['choicesource'];
					$choiceSourceObj = new ChoiceSource($dataObj, (int)$source['id'], $source['valueColumn'], $source['labelColumn']);
					if (isset($source['idColumn'])) {
						$choiceSourceObj->setIdColumn($source['idColumn']);
					}
					$dataObj->setChoiceSource($choiceSourceObj);
				}
				if (isset($data['description'])) {
					$dataObj->setDescription(trim($data['description']));
				}
				$this->simu->addData($dataObj);
			}
		}
		
		$rulesData = json_decode($form['rules'], true);
		// file_put_contents($simu_dir."/work/".$simulator."-rules.json", var_export($rulesData, true));
		
		$this->simu->setBusinessRules(array());
		
		foreach($rulesData as $id => $brule) {
			$businessRuleObj = new BusinessRule($this->simu, 'rule-'.mt_rand(), (int)$brule['id'], (string)$brule['name']);
			$businessRuleObj->setLabel((string)$brule['label']);
			// $businessRuleObj->setConditions($this->infix($brule["conditions"]));
			$businessRuleObj->setConditions((string)$brule["conditions"]);
			foreach ($brule["ifActions"] as $ida => $action) {
				$ruleActionObj = new RuleAction((int)$ida + 1, (string)$action['value']);
				switch ($action['value']) {
					case 'notifyError':
						$target = $action['fields'][1]['value'];
						$value = $action['fields'][0]['value'];
						$ruleActionObj->setTarget($target);
						$ruleActionObj->setValue($value);
						switch ($target) {
							case 'data':
								$data = $this->simu->getDataByName($action['fields'][1]['fields'][0]['value']);
								$ruleActionObj->setData($data->getId());
								break;
							case 'datagroup':
								$ruleActionObj->setDatagroup($action['fields'][1]['fields'][0]['value']);
								break;
							case 'dataset':
								break;
						}
						break;
					case 'setAttribute':
						$target = $action['fields'][0]['value'];
						$value = $action['fields'][0]['fields'][0]['fields'][0]['value'];
						$data = $this->simu->getDataByName($action['fields'][0]['fields'][0]['value']);
						$ruleActionObj->setTarget($target);
						$ruleActionObj->setValue($value);
						$ruleActionObj->setData($data->getId());
						break;
					case 'hideObject':
					case 'showObject':
						$target = $action['fields'][0]['value'];
						$step = $action['fields'][0]['fields'][0]['value'];
						$ruleActionObj->setTarget($target);
						$ruleActionObj->setStep($step);
						switch ($target) {
							case 'field':
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setField($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'prenote':
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setPrenote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'postnote':
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setPostnote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'fieldset':
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'step':
								break;
							case 'footnote':
								$ruleActionObj->setFootnote($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'action':
								$ruleActionObj->setAction($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'choice':
								$data = $this->simu->getDataByName($action['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setData($data->getId());
								$ruleActionObj->setChoice($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
						}
						break;
				}
				$businessRuleObj->addIfAction($ruleActionObj);
			}
			foreach ($brule["elseActions"] as $ida => $action) {
				$ruleActionObj = new RuleAction((int)$ida + 1, (string)$action['value']);
				switch ($action['value']) {
					case 'notifyError':
						$target = $action['fields'][1]['value'];
						$value = $action['fields'][0]['value'];
						$ruleActionObj->setTarget($target);
						$ruleActionObj->setValue($value);
						switch ($target) {
							case 'data':
								$data = $this->simu->getDataByName($action['fields'][1]['fields'][0]['value']);
								$ruleActionObj->setData($data->getId());
								break;
							case 'datagroup':
								$ruleActionObj->setDatagroup($action['fields'][1]['fields'][0]['value']);
								break;
							case 'dataset':
								break;
						}
						break;
					case 'setAttribute':
						$target = $action['fields'][0]['value'];
						$value = $action['fields'][0]['fields'][0]['fields'][0]['value'];
						$data = $this->simu->getDataByName($action['fields'][0]['fields'][0]['value']);
						$ruleActionObj->setTarget($target);
						$ruleActionObj->setValue($value);
						$ruleActionObj->setData($data->getId());
						break;
					case 'hideObject':
					case 'showObject':
						$target = $action['fields'][0]['value'];
						$step = $action['fields'][0]['fields'][0]['value'];
						$ruleActionObj->setTarget($target);
						$ruleActionObj->setStep($step);
						switch ($target) {
							case 'field':
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setField($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'prenote':
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setPrenote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'postnote':
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setPostnote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'fieldset':
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'step':
								break;
							case 'footnote':
								$ruleActionObj->setFootnote($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'action':
								$ruleActionObj->setAction($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'choice':
								$data = $this->simu->getDataByName($action['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setData($data->getId());
								$ruleActionObj->setChoice($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
						}
						break;
				}
				$businessRuleObj->addElseAction($ruleActionObj);
			}
			$this->simu->addBusinessRule($businessRuleObj);
		}

		$this->simu->save($simu_dir."/work/".$simulator.".xml");
	}
	
	private function makeCond($val) {
		$name = $val['name'];
		if ($name == 'script' || $name == 'dynamic' || preg_match("/\.dynamic$/", $name)) {
			$id = $name;
			$type = 'integer';
		} else {
			$data = $this->simu->getDataByName($name);
			$id = "#" . $data->getId();
			$type = $data->getType();
		}
		$cond = "";
		switch ($val['operator']) {
			case 'present':
		   		$cond = 'defined(' . $id . ')';
		   		break;
		   	case 'blank':
		   		$cond = '!defined(' . $id . ')';
		   		break;
		   	case 'isTrue':
		   		$cond = $id;
		   		break;
		   	case 'isFalse':
		   		$cond = '!' . $id;
		   		break;
		   	default:
				if ($type == 'choice' && !preg_match("/^\d+$/", $val['value'])) {
					$cond = $id . ' ' . $val['operator'] . " '" . $val['value'] . "'";
				} else {
					$cond = $id . ' ' . $val['operator'] . ' ' . $val['value'];
				}
		}
		return $cond;
	}
		  
	private function conjonct($conds) {
		$et = "";
		$parenthesis = count($conds) > 1;
		foreach($conds as $key => $val) {
			if (isset($val['name'])) {
				$et .= ' && ';
				$et .= $this->makeCond($val);
			} else {
				$cond = $this->infix($val);
				if ($cond != '') {
					$et .= ' && ';
					if ($parenthesis) {
						$et .= '(';
					}
					$et .= $cond;
					if ($parenthesis) {
						$et .= ')';
					}
				}
			}
		}
		return preg_replace("/^ \&\& /", "", $et);
	}
	
	private function disjonct($conds) {
		$ou = "";
		$parenthesis = count($conds) > 1;
		foreach($conds as $key => $val) {
			if (isset($val['name'])) {
				$ou .= ' || ';
				$ou .= $this->makeCond($val);
			} else {
				$cond = $this->infix($val);
				if ($cond != '') {
					$ou .= ' || ';
					if ($parenthesis) {
						$ou .= '(';
					}
					$ou .= $cond;
					if ($parenthesis) {
						$ou .= ')';
					}
				}
			}
		}
		return preg_replace("/^ \|\| /", "", $ou);
	}
	  
	private function infix($conds) {
		$infixed = "";
		foreach($conds as $key => $val) {
			switch ($key) {
				case 'all': 
					$infixed .= $this->conjonct($val);
					break;
				case 'any': 
					$infixed .= $this->disjonct($val);
					break;
				case 'none': 
					$infixed .= '!(' . $this->disjonct($val) . ')';
					break;
			}
		}
		return $infixed;
	}
	
	protected function loadBusinessRules() {
		$datagroups = array();
		$steps = array();
		$fieldsets = array();
		$fields = array();
		$prenotes = array();
		$postnotes = array();
		$footnotes = array();
		$actionbuttons = array();
		$choices = array();		
		foreach ($this->simu->getDatas() as $data) {
			if ($data instanceof DataGroup) {
				$datagroups[] = array(
					'label' => $data->getLabel(),
					'name' => $data->getName()
				);
				foreach ($data->getDatas() as $gdata) {
					$name = $gdata->getName();
					$this->dataset[$name] = array(
						'id' => $gdata->getId(), 
						'label' => $gdata->getLabel(),
						'type' => $gdata->getType()
					);
					if ($gdata->getType() == 'choice') {
						$options = array();
						foreach ($gdata->getChoices() as $choice) {
							$options[] = array(
								'label' => $choice->getLabel(),
								'name' => $choice->getValue()
							);
						}
						if (count($options) > 0) {
							$this->dataset[$name]['options'] = $options;
						}
					}
					if ($gdata->getDescription() != '') {
						$this->dataset[$name]['description'] = $this->paragraphs($gdata->getDescription());
					}
					if ($gdata->getUnparsedDefault() != '' && ! preg_match("/[\?:]/", $gdata->getUnparsedDefault())) {
						$this->dataset[$name]['unparsedDefault'] = $gdata->getUnparsedDefault();
					}
					if ($gdata->getUnparsedMin() != '' && ! preg_match("/[\?:]/", $gdata->getUnparsedMin())) {
						$this->dataset[$name]['unparsedMin'] = $gdata->getUnparsedMin();
					}
					if ($gdata->getUnparsedMax() != '' && ! preg_match("/[\?:]/", $gdata->getUnparsedMax())) {
						$this->dataset[$name]['unparsedMax'] = $gdata->getUnparsedMax();
					}
					if ($gdata->getContent() != '' && ! preg_match("/[\?:]/", $gdata->getContent())) {
						$this->dataset[$name]['unparsedContent'] = $gdata->getContent();
					}
					if ($gdata->getUnit() != '') {
						$this->dataset[$name]['unit'] = $gdata->getUnit();
					}
					if ($gdata->getRound() != '' && $gdata->getRound() != 2) {
						$this->dataset[$name]['round'] = $gdata->getRound();
					}
					if ($gdata->getSource() != '' && ! preg_match("/[\?:]/", $gdata->getSource())) {
						$this->dataset[$name]['unparsedSource'] = $gdata->getSource();
					}
					if ($gdata->getUnparsedIndex() != '' && ! preg_match("/[\?:]/", $gdata->getUnparsedIndex())) {
						$this->dataset[$name]['unparsedIndex'] = $gdata->getUnparsedIndex();
					}
				}
			} elseif ($data instanceof Data) {
				$name = $data->getName();
				$this->dataset[$name] = array(
					'id' => $data->getId(), 
					'label' => $data->getLabel(),
					'type' => $data->getType()
				);
				if ($data->getType() == 'choice') {
					$options = array();
					foreach ($data->getChoices() as $choice) {
						$options[] = array(
							'label' => $choice->getLabel(),
							'name' => $choice->getValue()
						);
					}
					if (count($options) > 0) {
						$this->dataset[$name]['options'] = $options;
					}
				}
				if ($data->getDescription() != '') {
					$this->dataset[$name]['description'] = $this->paragraphs($data->getDescription());
				}
				if ($data->getUnparsedDefault() != '' && ! preg_match("/[\?:]/", $data->getUnparsedDefault())) {
					$this->dataset[$name]['unparsedDefault'] = $data->getUnparsedDefault();
				}
				if ($data->getUnparsedMin() != '' && ! preg_match("/[\?:]/", $data->getUnparsedMin())) {
					$this->dataset[$name]['unparsedMin'] = $data->getUnparsedMin();
				}
				if ($data->getUnparsedMax() != '' && ! preg_match("/[\?:]/", $data->getUnparsedMax())) {
					$this->dataset[$name]['unparsedMax'] = $data->getUnparsedMax();
				}
				if ($data->getContent() != '' && ! preg_match("/[\?:]/", $data->getContent())) {
					$this->dataset[$name]['unparsedContent'] = $data->getContent();
				}
				if ($data->getUnit() != '') {
					$this->dataset[$name]['unit'] = $data->getUnit();
				}
				if ($data->getRound() != '' && $data->getRound() != 2) {
					$this->dataset[$name]['round'] = $data->getRound();
				}
				if ($data->getSource() != '' && ! preg_match("/[\?:]/", $data->getSource())) {
					$this->dataset[$name]['unparsedSource'] = $data->getSource();
				}
				if ($data->getUnparsedIndex() != '' && ! preg_match("/[\?:]/", $data->getUnparsedIndex())) {
					$this->dataset[$name]['unparsedIndex'] = $data->getUnparsedIndex();
				}
			}			
		}
		if (count($this->simu->getSteps()) > 0) {
			$ssteps = array ();
			$sfieldsets = array();
			$sstepfields = array();
			$ssteppostnotes = array();
			$sstepprenotes = array();
			$sstepfootnotes = array();
			$sstepactionbuttons = array();
			foreach ($this->simu->getSteps() as $step) {
				$stepLabel = $step->getLabel() != '' ? $step->getLabel() : 'Step ' . $step->getId() . ' (nolabel)';
				$ssteps[] = array (
					'label' => $stepLabel,
					'name' => $step->getId()
				);
				$this->dataset['step' . $step->getId() . '.dynamic'] = array(
					'id' => 10000 + $step->getId(), 
					'label' => 'Is step ' . $step->getId() . ' interactive ?',
					'type' => 'choice',
					'options' => array(
						array(
							'label' => 'No',
							'name' => 0
						),
						array(
							'label' => 'Yes',
							'name' => 1
						)
					)
				);
				$nfieldsets = array();
				$sfields = array();
				$sprenotes = array();
				$spostnotes = array();
				foreach ($step->getFieldSets() as $fieldset) {
					$fieldsetLabel = $fieldset->getLegend() != '' ? $fieldset->getLegend() : 'Fieldset ' . $fieldset->getId() . ' (nolabel)';
					$nfieldsets[] = array(
						'label' => $fieldsetLabel,
						'name' => $fieldset->getId()
					);
					
					$nfields = array();
					$nprenotes = array();
					$npostnotes = array();
					foreach ($fieldset->getFields() as $child) {
						if ($child instanceof FieldRow) {
							$fieldrow = $child;
							foreach ($fieldrow->getFields() as $field) {
								$fieldLabel = $field->getLabel() != '' ? $field->getLabel() : 'Field ' . $field->getPosition() . ' (nolabel)';
								$nfields[] = array(
									'label' => $fieldLabel,
									'name' => $field->getPosition()
								);
								if ($field->getPreNote()) {
									$nprenotes[] = array(
										'label' => $fieldLabel,
										'name' => $field->getPosition()
									);
								}
								if ($field->getPostNote()) {
									$npostnotes[] = array(
										'label' => $fieldLabel,
										'name' => $field->getPosition()
									);
								}
							}
						} elseif ($child instanceof Field) {
							$field = $child;
							$fieldLabel = $field->getLabel() != '' ? $field->getLabel() : 'Field ' . $field->getPosition() . ' (nolabel)';
							$nfields[] = array(
								'label' => $fieldLabel,
								'name' => $field->getPosition()
							);
							if ($field->getPreNote()) {
								$nprenotes[] = array(
									'label' => $fieldLabel,
									'name' => $field->getPosition()
								);
							}
							if ($field->getPostNote()) {
								$npostnotes[] = array(
									'label' => $fieldLabel,
									'name' => $field->getPosition()
								);
							}
						}
					}
					$sfields[]  = array(
						'label' => $fieldsetLabel,
						'name' => $fieldset->getId(),
						'fields' => array(
							array(
								'label' => '',
								'name' => 'fieldId',
								'fieldType' => 'select',
								'options' => $nfields
							)
						)
					);
					if (count($nprenotes) > 0) {
						$sprenotes[]  = array(
							'label' => $fieldsetLabel,
							'name' => $fieldset->getId(),
							'fields' => array(
								array(
									'label' => '',
									'name' => 'fieldId',
									'fieldType' => 'select',
									'options' => $nprenotes
								)
							)
						);
					}
					if (count($npostnotes) > 0) {
						$spostnotes[]  = array(
							'label' => $fieldsetLabel,
							'name' => $fieldset->getId(),
							'fields' => array(
								array(
									'label' => '',
									'name' => 'fieldId',
									'fieldType' => 'select',
									'options' => $npostnotes
								)
							)
						);
					}
				}
				$sstepfields[]  = array(
					'label' => $stepLabel,
					'name' => $step->getId(),
					'fields' => array(
						array(
							'label' => 'FieldSet',
							'name' => 'fieldsetId',
							'fieldType' => 'select',
							'options' => $sfields					
						)
					)
				);
				if (count($sprenotes) > 0) {
					$sstepprenotes[]  = array(
						'label' => $stepLabel,
						'name' => $step->getId(),
						'fields' => array(
							array(
								'label' => 'FieldSet',
								'name' => 'fieldsetId',
								'fieldType' => 'select',
								'options' => $sprenotes					
							)
						)
					);
				}
				if (count($spostnotes) > 0) {
					$ssteppostnotes[]  = array(
						'label' => $stepLabel,
						'name' => $step->getId(),
						'fields' => array(
							array(
								'label' => 'FieldSet',
								'name' => 'fieldsetId',
								'fieldType' => 'select',
								'options' => $spostnotes					
							)
						)
					);
				}
				$sactionbuttons = array();
				foreach ($step->getActions() as $action) {
					$sactionbuttons[] = array(
						'label' => $action->getLabel(),
						'name' => $action->getName()
					);
				}
				if (count($sactionbuttons) > 0) {
					$sstepactionbuttons[] = array(
						'label' => $stepLabel,
						'name' => $step->getId(),
						'fields' => array(
							array(
								'label' => '',
								'name' => 'actionId',
								'fieldType' => 'select',
								'options' => $sactionbuttons
							)
						)
					);
				}
				$sfootnotes = array();
				if ($step->getFootNotes() !== null) {
					$footnoteList = $step->getFootNotes();
					foreach ($footnoteList->getFootNotes() as $footnote) {
						$sfootnotes[] = array(
							'label' => 'FootNote ' . $footnote->getId(),
							'name' => $footnote->getId()
						);
					}
				}
				if (count($sfootnotes) > 0) {
					$sstepfootnotes[] = array(
						'label' => $stepLabel,
						'name' => $step->getId(),
						'fields' => array(
							array(
								'label' => '',
								'name' => 'footnoteId',
								'fieldType' => 'select',
								'options' => $sfootnotes
							)
						)
					);
				}
				$sfieldsets[] = array(
					'label' => $stepLabel,
					'name' => $step->getId(),
					'fields' => array(
						array(
							'label' => '',
							'name' => 'fieldsetId',
							'fieldType' => 'select',
							'options' => $nfieldsets
						)
					)
				);
				
			}
			$steps = array(
				'label' => 'Step',
				'name' => 'step',
				'fields' => array(
					array(
						'label' => '',
						'name' => 'stepId',
						'fieldType' => 'select',
						'options' => $ssteps
					)
				)
			);
			$fieldsets = array(
				'label' => 'FieldSet',
				'name' => 'fieldset',
				'fields' => array(
					array(
						'label' => 'Step',
						'name' => 'stepId',
						'fieldType' => 'select',
						'options' => $sfieldsets
					)
				)
			);
			$fields = array(
				'label' => 'Field',
				'name' => 'field',
				'fields' => array(
					array(
						'label' => 'Step',
						'name' => 'stepId',
						'fieldType' => 'select',
						'options' => $sstepfields
					)
				)
			);
			if (count($sstepprenotes) > 0) {
				$prenotes = array(
					'label' => 'PreNote',
					'name' => 'prenote',
					'fields' => array(
						array(
							'label' => 'Step',
							'name' => 'stepId',
							'fieldType' => 'select',
							'options' => $sstepprenotes
						)
					)
				);
			}
			if (count($ssteppostnotes) > 0) {
				$postnotes = array(
					'label' => 'PostNote',
					'name' => 'postnote',
					'fields' => array(
						array(
							'label' => 'Step',
							'name' => 'stepId',
							'fieldType' => 'select',
							'options' => $ssteppostnotes
						)
					)
				);
			}
			if (count($sstepactionbuttons) > 0) {
				$actionbuttons = array(
					'label' => 'Action button',
					'name' => 'action',
					'fields' => array(
						array(
							'label' => 'Step',
							'name' => 'stepId',
							'fieldType' => 'select',
							'options' => $sstepactionbuttons
						)
					)
				);
			}
			if (count($sstepfootnotes) > 0) {
				$footnotes = array(
					'label' => 'FootNote',
					'name' => 'footnote',
					'fields' => array(
						array(
							'label' => 'Step',
							'name' => 'stepId',
							'fieldType' => 'select',
							'options' => $sstepfootnotes
						)
					)
				);
			}
		}
		$schoices = array();
		foreach ($this->dataset as $name => $data) {
			if (isset($data['options'])) {
				$schoices[] = array(
					'label' => $data['label'],
					'name' => $name,
					'fields' => array(
						array(
							'label' => '',
							'name' => 'choiceId',
							'fieldType' => 'select',
							'options' => $data['options']
						)
					)
				);
			}
		}
		if (count($schoices) > 0) {
			$choices = array(
				'label' => 'Choice',
				'name' => 'choice',
				'fields' => array(
					array(
						'label' => 'Data',
						'name' => 'fieldName',
						'fieldType' => 'select',
						'options' => $schoices
					)
				)
			);
		}
		$objects = array();
		if (count($steps) > 0) {
			$objects[] = $steps;
		}
		if (count($fieldsets) > 0) {
			$objects[] = $fieldsets;
		}
		if (count($fields) > 0) {
			$objects[] = $fields;
		}
		if (count($prenotes) > 0) {
			$objects[] = $prenotes;
		}
		if (count($postnotes) > 0) {
			$objects[] = $postnotes;
		}
		if (count($actionbuttons) > 0) {
			$objects[] = $actionbuttons;
		}
		if (count($footnotes) > 0) {
			$objects[] = $footnotes;
		}
		if (count($choices) > 0) {
			$objects[] = $choices;
		}
		$this->actions = array(
			array(
				'label' => "Choose an Action...", 
				'name' => "", 
				'fieldType' => "textarea"
			),
			array(
				'label' => "Notify error", 
				'name' => "notifyError", 
				'fields' => array(
					array(
						'label' => "",
						'name' => "message",
						'fieldType' => "textarea"
					),
					array(
						'label' => "to",
						'name'	=> "target",
						'fieldType' => "select",
						'options' => array(
							array(
								'label' => 'data',
								'name' => 'data',
								'fields' => array(
									array(
										'label' => "",
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => 'dataset',
								'name' => 'dataset'
							)
						)
					)
				)
			),
			array(
				'label' => "Hide", 
				'name' => "hideObject", 
				'fields' => array(
					array(
						'label' => '',
						'name' => 'objectId',
						'fieldType' => "select",
						'options' => $objects
					)
				)
			),
			array(
				'label' => "Show", 
				'name' => "showObject", 
				'fields' => array(
					array(
						'label' => '',
						'name' => 'objectId',
						'fieldType' => "select",
						'options' => $objects
					)
				)
			),
			array(
				'label' => "Set", 
				'name' => "setAttribute", 
				'fields' => array(
					array(
						'label' => "",
						'name' => "attributeId",
						'fieldType' => "select",
						'options' => array(
							array(
								'label' => "Content", 
								'name' => "content", 
								'fields' => array(
									array(
										'label' => "of",
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => "Default", 
								'name' => "default", 
								'fields' => array(
									array(
										'label' => "of",
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => "Minimum", 
								'name' => "min", 
								'fields' => array(
									array(
										'label' => "of",
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => "Maximum", 
								'name' => "max", 
								'fields' => array(
									array(
										'label' => "of",
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => "Result index", 
								'name' => "index", 
								'fields' => array(
									array(
										'label' => "of",
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => "Explanation", 
								'name' => "explanation", 
								'fields' => array(
									array(
										'label' => "of",
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							)
						)
					)
				)
			)
		);
		if (count($datagroups) > 0) {
			$this->actions[1]['fields'][1]['options'][] = array(
				'label' => 'datagroup',
				'name' => 'datagroup',
				'fields' => array(
					array(
						'label' => "",
						'name' => "datagroupName",
						'fieldType' => "select",
						'options' => $datagroups
					)
				)
			);
		}
		$this->dataset['script'] = array(
			'id' => 20000, 
			'label' => 'Script',
			'type' => 'choice',
			'options' => array(
				 array(
					'label' => 'Disabled',
					'name' => 0
				),
				 array(
					'label' => 'Enabled',
					'name' => 1
				)
			)
		);
		$this->dataset['dynamic'] = array(
			'id' => 20001, 
			'label' => 'Interactive UI',
			'type' => 'choice',
			'options' => array(
				 array(
					'label' => 'No',
					'name' => 0
				),
				 array(
					'label' => 'Yes',
					'name' => 1
				)
			)
		);
		foreach ($this->simu->getBusinessRules() as $brule) {
			$rule = array(
				'elementId' => $brule->getElementId(),
				'id' => $brule->getId(),
				'name' => $brule->getName(),
				'label' => $brule->getLabel(),
				'conditions' => $brule->getConditions(),
				'ifdata' =>  $this->actionsData($brule->getId(), $brule->getIfActions()),
				'elsedata' => $this->actionsData($brule->getId(), $brule->getElseActions())
			);
			if (preg_match_all("/#(\d+)/", $rule['conditions'], $matches)) {
				foreach($matches[1] as $id) {
					$name = $this->findDataNameById($id);
					if (! isset($this->dataset[$name]['rulesConditionsDependency'])) {
						$this->dataset[$name]['rulesConditionsDependency'] = array();
					}
					$this->dataset[$name]['rulesConditionsDependency'][] = $rule['id'];
				}
			}
			$this->rules[] = $rule;
		}
		foreach ($this->dataset as $name => $data) {
			if (isset($data['rulesConditionsDependency'])) {
				$this->dataset[$name]['rulesConditionsDependency'] = array_keys(array_flip($data['rulesConditionsDependency']));
			}
		 	if (isset($data['rulesActionsDependency'])) {
				$this->dataset[$name]['rulesActionsDependency'] = array_keys(array_flip($data['rulesActionsDependency']));
			}
		 
		}
				
	}

	private function actionsData($ruleID, $actions) {
		$datas = array();
		foreach ($actions as $action) {
			$target = $action->getTarget();
			switch ($action->getName()) {
				case 'notifyError':
					$clause = array(
						'name' => 'action-select',
						'value' => 'notifyError',
						'fields' => array(
							array('name' => 'message', 'value' => $action->getValue()),
							array('name' => 'target', 'value' => $target)
						)
					);
					switch ($target) {
						case 'data':
							$clause['fields'][1]['fields'] = array(
								array('name' => 'fieldName', 'value' => $this->findDataNameById($action->getData()))
							);
							break;
						case 'datagroup':
							$clause['fields'][1]['fields'] = array(
								array('name' => 'datagroupName', 'value' => $action->getDatagroup())
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
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId',	'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'fieldsetId', 'value' => $action->getFieldset(), 'fields' => array(
															array('name' => 'fieldId', 'value' => $action->getTargetId())
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
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'fieldsetId', 'value' => $action->getTargetId())
												)
											)
										)
									)
								)
							);
							break;
						case 'step':
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getTargetId())
										)
									)
								)
							);
							break;
						case 'footnote':
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'footnoteId', 'value' => $action->getTargetId())
												)
											)
										)
									)
								)
							);
							break;
						case 'action':
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'actionId', 'value' => $action->getTargetId())
												)
											)
										)
									)
								)
							);
							break;
						case 'choice':
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'fieldName', 'value' => $this->findDataNameById($action->getData()), 'fields' => array(
													array('name' => 'choiceId', 'value' => $action->getTargetId())
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
									array('name' => 'fieldName', 'value' => $this->findDataNameById($action->getData()), 'fields' => array(
											array('name' => 'newValue', 'value' => $action->getValue())
										)
									)
								)
							)
						)
					);
					if (preg_match_all("/#(\d+)/", $action->getValue(), $matches)) {
						foreach($matches[1] as $id) {
							$name = $this->findDataNameById($id);
							if (! isset($dataset[$name]['rulesActionsDependency'])) {
								$dataset[$name]['rulesActionsDependency'] = array();
							}
							$dataset[$name]['rulesActionsDependency'][] = $ruleID;
						}
					}
					break;
			}
			$datas[] = $clause;
		}
		return $datas;
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

	private function findDataNameById($id) {
		foreach ($this->dataset as $name => $data) {
			if ($data['id'] == $id) {
				return $name;
			}
		}
		return null;
	}
}
