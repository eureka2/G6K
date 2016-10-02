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

namespace EUREKA\G6KBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use EUREKA\G6KBundle\Entity\Simulator;
use EUREKA\G6KBundle\Entity\Source;
use EUREKA\G6KBundle\Entity\Parameter;
use EUREKA\G6KBundle\Entity\ChoiceGroup;
use EUREKA\G6KBundle\Entity\Choice;
use EUREKA\G6KBundle\Entity\ChoiceSource;
use EUREKA\G6KBundle\Entity\DataGroup;
use EUREKA\G6KBundle\Entity\Data;
use EUREKA\G6KBundle\Entity\Panel;
use EUREKA\G6KBundle\Entity\FieldSet;
use EUREKA\G6KBundle\Entity\FieldRow;
use EUREKA\G6KBundle\Entity\Field;
use EUREKA\G6KBundle\Entity\BlockInfo;
use EUREKA\G6KBundle\Entity\Chapter;
use EUREKA\G6KBundle\Entity\Section;
use EUREKA\G6KBundle\Entity\BusinessRule;
use EUREKA\G6KBundle\Entity\Connector;
use EUREKA\G6KBundle\Entity\Condition;
use EUREKA\G6KBundle\Entity\RuleAction;
use EUREKA\G6KBundle\Entity\DOMClient as Client;
use EUREKA\G6KBundle\Entity\ResultFilter;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

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

	public function indexAction(Request $request, $simulator = null, $crud = null)
	{
		if ($crud == 'export') {
			return $this->doExportSimulator($simulator);
		}
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;

		$simu_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/simulators";
		$simus = array_filter(scandir($simu_dir), function ($simu) { return preg_match("/.xml$/", $simu); } );

		$hiddens = array();
		$hiddens['script'] = $script;
		$hiddens['action'] = 'show';
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
		if ($crud == 'import') {
			$hiddens['action'] = 'import';
		} elseif ($crud == 'doimport') {
			return $this->doImportSimulator($request->files->all());
		}
		$views_dir = $this->get('kernel')->getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/views";
		$views = array();
		$dirs = scandir($views_dir);
		foreach ($dirs as $dir) {
			if ($dir != "." && $dir != ".." && $dir != "admin" && $dir != "base" && $dir != "Theme") {
				$o = $views_dir . "/" . $dir;
				if (filetype($o) == "dir") {
					$views[$dir] = $dir;
				}
			}
		}
		$databasedir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/databases";
		$sources = new \SimpleXMLElement($databasedir."/DataSources.xml", LIBXML_NOWARNING, true);
		$datasources = array();
		$dss = $sources->xpath("/DataSources/DataSource");
		foreach ($dss as $ds) {
			$datasources[(string)$ds['name']] = array(
				'id' => (string)$ds['id'],
				'type' => (string)$ds['type']
			);
		}
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
					'datasources' => preg_replace("/\n/", "\n\t", json_encode($datasources, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE |  JSON_UNESCAPED_SLASHES)),
					'views' => preg_replace("/\n/", "\n\t", json_encode($views, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE |  JSON_UNESCAPED_SLASHES)),
					'hiddens' => $hiddens
				)
			);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}

	public function validateAction(Request $request) {
		$form = $request->request->all();
		$bundle = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true);
		$schema = $bundle->getPath()."/Resources/doc/Simulator.xsd";
		$dom = new \DOMDocument();
		$dom->preserveWhiteSpace  = false;
		$dom->formatOutput = true;
		$dom->loadXML($form['xml']);
		libxml_use_internal_errors(true);
		$result = array();
		if (!$dom->schemaValidate($schema)) {
			$result = array(
				'status' => 'Error',
				'errors' => array()
			);
			$errors = libxml_get_errors();
			foreach ($errors as $error) {
				$line = "Line ".$error->line;
				$column = $error->column > 0 ? ' Column ' .  $error->column : '';
				$result['errors'][] = $line . $column. ": " .  $error->message;
			}
			libxml_clear_errors();
		} else {
			$result = array(
				'status' => 'Ok',
				'errors' => array()
			);
		}
		$response = new Response();
		$response->setContent(json_encode($result));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
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
		$this->simu->setMemo($simulatorData['memo'] == '1');
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
					if (isset($gdata['memorize'])) {
						$dataObj->setMemorize($gdata['memorize']);
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
				if (isset($data['memorize'])) {
					$dataObj->setMemorize($data['memorize']);
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

		$this->simu->setBusinessRules(array());

		foreach($rulesData as $id => $brule) {
			$businessRuleObj = new BusinessRule($this->simu, 'rule-'.mt_rand(), (int)$brule['id'], (string)$brule['name']);
			$businessRuleObj->setLabel((string)$brule['label']);
			// $businessRuleObj->setConditions($this->infix($brule["conditions"]));
			$businessRuleObj->setConditions((string)$brule["conditions"]);
			if (isset($brule["connector"])) {
				$businessRuleObj->setConnector($this->loadConnector($brule["connector"]));
			}
			foreach ($brule["ifActions"] as $ida => $action) {
				$ruleActionObj = new RuleAction((int)$ida + 1, (string)$action['value']);
				switch ($action['value']) {
					case 'notifyError':
					case 'notifyWarning':
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
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setField($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'prenote':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setPrenote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'postnote':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setPostnote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'fieldset':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'section':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setBlockinfo($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setChapter($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setSection($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'chapter':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setBlockinfo($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setChapter($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'blockinfo':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setBlockinfo($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'panel':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'footnote':
								$ruleActionObj->setFootnote($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'action':
								$ruleActionObj->setAction($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'step':
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
					case 'notifyWarning':
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
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setField($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'prenote':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setPrenote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'postnote':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setPostnote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'fieldset':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'section':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setBlockinfo($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setChapter($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setSection($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'chapter':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setBlockinfo($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setChapter($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'blockinfo':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setBlockinfo($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'panel':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'footnote':
								$ruleActionObj->setFootnote($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'action':
								$ruleActionObj->setAction($action['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'step':
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

		$sources = json_decode($form['sources'], true);
		$this->simu->setSources(array());
		foreach($sources as $id => $source) {
			$sourceObj = new Source($this, (int)$source['id'], $source['datasource'], $source['returnType']);
			if (isset($source['request'])) {
				$sourceObj->setRequest($source['request']);
			}
			if (isset($source['separator'])) {
				$sourceObj->setSeparator($source['separator']);
			}
			if (isset($source['delimiter'])) {
				$sourceObj->setDelimiter($source['delimiter']);
			}
			if (isset($source['returnPath'])) {
				$sourceObj->setReturnPath($source['returnPath']);
			}
			if (isset($source['parameters'])) {
				foreach ($source['parameters'] as $parameter) {
					$parameterObj = new Parameter($sourceObj, $parameter['type']);
					$parameterObj->setName($parameter['name']);
					$parameterObj->setFormat($parameter['format']);
					$data = $this->simu->getDataByName($parameter['data']);
					$parameterObj->setData($data->getId());
					$sourceObj->addParameter($parameterObj);
				}
			}
			$this->simu->addSource($sourceObj);
		}

		$this->simu->save($simu_dir."/work/".$simulator.".xml");
	}

	private function loadConnector($connector, $parentConnector = null) {
		$kind = null;
		if (isset($connector['all'])) {
			$kind = 'all';
		} elseif (isset($connector['any'])) {
			$kind = 'any';
		} elseif (isset($connector['none'])) {
			$kind = 'none';
		} else {
			return new Condition($this->simu, $parentConnector, $connector['name'], $connector['operator'], $connector['value']);;
		}
		$connectorObj = new Connector($this->simu, $kind);
		foreach ($connector[$kind] as $cond) {
			$connectorObj->addCondition($this->loadConnector($cond, $connectorObj));
		}
		return $connectorObj;
	}

	protected function doExportSimulator($simu) {
		$simu_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/simulators";
		$public_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/public";
		$simulator = new \SimpleXMLElement($simu_dir . "/" . $simu . ".xml", LIBXML_NOWARNING, true);
		$view = (string)$simulator["defaultView"];
		$content = array(
			array(
				'name' => $simu . ".xml",
				'data' => file_get_contents($simu_dir . "/" . $simu . ".xml"),
				'modtime' => filemtime($simu_dir . "/" . $simu . ".xml")
			)
		);
		if (file_exists($public_dir . "/" . $view . "/css/" . $simu . ".css")) {
			$content[] = array(
				'name' => $simu . ".css",
				'data' => file_get_contents($public_dir . "/" . $view . "/css/" . $simu . ".css"),
				'modtime' => filemtime($public_dir . "/" . $view . "/css/" . $simu . ".css")

			);
		}
		$zipcontent = $this->zip($content);
		$response = new Response();
		$response->headers->set('Cache-Control', 'private');
		$response->headers->set('Content-type', 'application/octet-stream');
		$response->headers->set('Content-Disposition', sprintf('attachment; filename="%s"', (string)$simulator['name'] . ".zip"));
		$response->headers->set('Content-length', strlen($zipcontent));
		$response->sendHeaders();
		$response->setContent($zipcontent);
		return $response;
	}

	protected function doImportSimulator($files) {
		$fs = new Filesystem();
		$container = $this->get('kernel')->getContainer();
		$bundle = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true);
		$uploadDir = str_replace("\\", "/", $container->getParameter('g6k_upload_directory'));
		$simudir = $bundle->getPath()."/Resources/data/simulators";
		$viewdir = $bundle->getPath()."/Resources/views";
		$publicdir = $bundle->getPath()."/Resources/public";
		$schema = $bundle->getPath()."/Resources/doc/Simulator.xsd";
		$simu = '';
		$simufile = '';
		$stylesheet = '';
		foreach ($files as $fieldname => $file) {
			if ($file && $file->isValid()) {
				$filePath = $uploadDir . "/" . $this->get('g6k.file_uploader')->upload($file);
				if ($fieldname == 'simulator-file') {
					$simufile = $filePath;
					$simu = $file->getClientOriginalName();
					if (preg_match("/^(.+)\.xml$/", $simu, $m)) {
						$simu = trim($m[1]);
					}
				} elseif ($fieldname == 'simulator-stylesheet') {
					$stylesheet = $filePath;
				}
			}
		}
		if ($simu != '' && $simufile != '') {
			$dom = new \DOMDocument();
			$dom->preserveWhiteSpace  = false;
			$dom->formatOutput = true;
			$dom->load($simufile);
			libxml_use_internal_errors(true);
			if (!$dom->schemaValidate($schema)) {
				$errors = libxml_get_errors();
				$mess = "";
				foreach ($errors as $error) {
					$mess .= "Line ".$error->line . '.' .  $error->column . ": " .  $error->message . "\n";
				}
				libxml_clear_errors();
				$response = new Response();
				$response->setContent("<html><head><title>" . $this->get('translator')->trans("XML Validation errors") . "</title></head><body><pre>".$mess."</pre></body></html>");
				$response->headers->set('Content-Type', 'text/html');
				return $response;
			}
			$xpath = new \DOMXPath($dom);
			$view = $dom->documentElement->getAttribute('defaultView');
			if (! $fs->exists(array($viewdir.'/'.$view, $publicdir.'/'.$view))) {
				$view = 'Demo';
				$dom->documentElement->setAttribute('defaultView', $view);
			}
			$sources = $xpath->query("/Simulator/Sources/Source");
			$len = $sources->length;
			for($i = 0; $i < $len; $i++) {
				$datasource = $sources->item($i)->getAttribute('datasource');
				if (is_numeric($datasource)) {
					$sources->item($i)->setAttribute('datasource', $simu);
				}
			}
			$formatted = preg_replace_callback('/^( +)</m', function($a) { 
				return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
			}, $dom->saveXML(null, LIBXML_NOEMPTYTAG));
			$fs->dumpFile($simudir.'/'.$simu.'.xml', $formatted);
			if ($stylesheet != '') {
				if (! $fs->exists($publicdir.'/'.$view.'/css')) {
					$fs->mkdir($publicdir.'/'.$view.'/css');
				}
				$fs->copy($stylesheet, $publicdir.'/'.$view.'/css/'.$simu.'.css', true);
			} else if (! $fs->exists($publicdir.'/'.$view.'/css/'.$simu.'.css')) {
				if ($view == 'Demo') {
					$fs->dumpFile($publicdir.'/'.$view.'/css/'.$simu.'.css', '@import "common.css";'."\n");
				} else {
					if (! $fs->exists($publicdir.'/'.$view.'/css')) {
						$fs->mkdir($publicdir.'/'.$view.'/css');
					}
					$fs->copy($publicdir.'/Demo/css/common.css', $publicdir.'/'.$view.'/css/'.$simu.'.css');
				}
			}
		}
		try {
			if ($simufile != '') {
				$fs->remove($simufile);
			}
			if ($stylesheet != '') {
				$fs->remove($stylesheet);
			}
		} catch (IOExceptionInterface $e) {
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_simulator', array('simulator' => $simu)));
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
		$panels = array();
		$fieldsets = array();
		$fields = array();
		$blockinfos = array();
		$chapters = array();
		$sections = array();
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
					if ($gdata->getType() == 'choice' || $gdata->getType() == 'multichoice') {
						$this->populateChoiceWithSource($gdata);
						$options = array();
						foreach ($gdata->getChoices() as $choice) {
							if ($choice instanceof Choice) {
								$options[] = array(
									'label' => $choice->getLabel(),
									'name' => $choice->getValue()
								);
							} elseif ($choice instanceof ChoiceGroup) {
								foreach ($choice->getChoices() as $gchoice) {
									$options[] = array(
										'label' => $gchoice->getLabel(),
										'name' => $gchoice->getValue()
									);
								}
							}
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
					if ($gdata->isMemorize()) {
						$this->dataset[$name]['memorize'] = 1;
					}
				}
			} elseif ($data instanceof Data) {
				$name = $data->getName();
				$this->dataset[$name] = array(
					'id' => $data->getId(), 
					'label' => $data->getLabel(),
					'type' => $data->getType()
				);
				if ($data->getType() == 'choice' || $data->getType() == 'multichoice') {
					$this->populateChoiceWithSource($data);
					$options = array();
					foreach ($data->getChoices() as $choice) {
						if ($choice instanceof Choice) {
							$options[] = array(
								'label' => $choice->getLabel(),
								'name' => $choice->getValue()
							);
						} elseif ($choice instanceof ChoiceGroup) {
							foreach ($choice->getChoices() as $gchoice) {
								$options[] = array(
									'label' => $gchoice->getLabel(),
									'name' => $gchoice->getValue()
								);
							}
						}
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
				if ($data->isMemorize()) {
					$this->dataset[$name]['memorize'] = 1;
				}
			}
		}
		if (count($this->simu->getSteps()) > 0) {
			$osteps = array ();
			$osteppanels = array ();
			$ostepfieldsets = array ();
			$ostepfields = array ();
			$ostepprenotes = array ();
			$osteppostnotes = array ();
			$ostepblockinfos = array ();
			$ostepchapters = array ();
			$ostepsections = array ();
			$ostepfootnotes = array();
			$ostepactionbuttons = array();
			foreach ($this->simu->getSteps() as $step) {
				$stepLabel = $step->getLabel() != '' ? $step->getLabel() : $this->get('translator')->trans('Step %id% (nolabel)', array('%id%' => $step->getId()));
				$osteps[] = array (
					"label" => $stepLabel,
					"name" => $step->getId()
				);
				$this->dataset['step' . $step->getId() . '.dynamic'] = array(
					'id' => 10000 + $step->getId(), 
					'label' => $this->get('translator')->trans('Is step %id% interactive ?', array('%id%' => $step->getId())),
					'type' => 'choice',
					'options' => array(
						array(
							'label' => $this->get('translator')->trans('No'),
							'name' => 0
						),
						array(
							'label' => $this->get('translator')->trans('Yes'),
							'name' => 1
						)
					)
				);
				$opanels = array ();
				$opanelfieldsets = array ();
				$opanelfields = array ();
				$opanelprenotes = array ();
				$opanelpostnotes = array ();
				$opanelblockinfos = array ();
				$opanelchapters = array ();
				$opanelsections = array ();
				foreach ($step->getPanels() as $panel) {
					$panelLabel = $panel->getLabel() != '' ? $panel->getLabel() : $this->get('translator')->trans('Panel %id% (nolabel)', array('%id%' => $panel->getId()));
					$opanels[] = array (
						"label" => $panelLabel,
						"name" => $panel->getId()
					);
					$ofieldsets = array ();
					$ofieldsetfields = array ();
					$ofieldsetprenotes = array ();
					$ofieldsetpostnotes = array ();
					$oblockinfos = array ();
					$oblockinfochapters = array ();
					$oblockinfosections = array ();
					foreach ($panel->getFieldSets() as $block) {
						if ($block instanceof FieldSet) {
							$fieldset = $block;
							$fieldsetLabel = $fieldset->getLegend() != '' ? trim($fieldset->getLegend()) : $this->get('translator')->trans('Fieldset %id% (nolegend)', array('%id%' => $fieldset->getId()));
							$ofieldsets[] = array (
								"label" => $fieldsetLabel,
								"name" => $fieldset->getId()
							);
							$ofields = array ();
							$oprenotes = array();
							$opostnotes = array();
							foreach ($fieldset->getFields() as $child) {
								if ($child instanceof Field) {
									$field = $child;
									$fieldLabel = $field->getLabel() != '' ? $field->getLabel() : $this->get('translator')->trans('Field %id% (nolabel)', array('%id%' => $field->getPosition()));
									$ofields[] = array (
										"label" => $fieldLabel,
										"name" => $field->getPosition()
									);
									if ($field->getPreNote()) {
										$oprenotes[] = array(
											'label' => $fieldLabel,
											'name' => $field->getPosition()
										);
									}
									if ($field->getPostNote()) {
										$opostnotes[] = array(
											'label' => $fieldLabel,
											'name' => $field->getPosition()
										);
									}
								} elseif ($child instanceof FieldRow) {
									$fieldrow = $child;
									foreach ($fieldrow->getFields() as $field) {
										$fieldLabel = $field->getLabel() != '' ? $field->getLabel() : $this->get('translator')->trans('Field %id% (nolabel)', array('%id%' => $field->getPosition()));
										$ofields[] = array (
											"label" => $fieldLabel,
											"name" => $field->getPosition()
										);
										if ($field->getPreNote()) {
											$oprenotes[] = array(
												'label' => $fieldLabel,
												'name' => $field->getPosition()
											);
										}
										if ($field->getPostNote()) {
											$opostnotes[] = array(
												'label' => $fieldLabel,
												'name' => $field->getPosition()
											);
										}
									}
								}
							}
							if (count($ofields) > 0) {
								$ofieldsetfields[] = array(
									"label" => $fieldsetLabel,
									"name" => $fieldset->getId(),
									"fields" => array(
										array(
											"label" => $this->get('translator')->trans('whose label is'),
											"name" => "fieldId",
											"fieldType" => "select",
											"options" => $ofields
										)
									)
								);
							}
							if (count($oprenotes) > 0) {
								$ofieldsetprenotes[] = array(
									"label" => $fieldsetLabel,
									"name" => $fieldset->getId(),
									"fields" => array(
										array(
											"label" => $this->get('translator')->trans("of field"),
											"name" => "fieldId",
											"fieldType" => "select",
											"options" => $oprenotes
										)
									)
								);
							}
							if (count($opostnotes) > 0) {
								$ofieldsetpostnotes[] = array(
									"label" => $fieldsetLabel,
									"name" => $fieldset->getId(),
									"fields" => array(
										array(
											"label" => $this->get('translator')->trans("of field"),
											"name" => "fieldId",
											"fieldType" => "select",
											"options" => $opostnotes
										)
									)
								);
							}
						} elseif ($block instanceof BlockInfo) {
							$blockinfo = $block;
							$blockinfoLabel = $blockinfo->getLabel() != '' ? $blockinfo->getLabel() : $this->get('translator')->trans('Blockinfo %id% (nolabel)', array('%id%' => $blockinfo->getId()));
							$oblockinfos[] = array (
								"label" => $blockinfoLabel,
								"name" => $blockinfo->getId()
							);
							$ochapters = array ();
							$ochaptersections = array ();
							foreach ($blockinfo->getChapters() as $chapter) {
								$chapterLabel = $chapter->getLabel() != '' ? $chapter->getLabel() : $this->get('translator')->trans('Chapter %id% (nolabel)', array('%id%' => $blockinfo->getId()));
								$ochapters[] = array (
									"label" => $chapterLabel,
									"name" => $chapter->getId()
								);
								$osections = array ();
								foreach ($chapter->getSections() as $section) {
									$sectionLabel = $section->getLabel() != '' ? $section->getLabel() : $this->get('translator')->trans('Section %id% (nolabel)', array('%id%' => $blockinfo->getId()));
									$osections[] = array (
										"label" => $sectionLabel,
										"name" => $section->getId()
									);
								}

								if (count($osections) > 0) {
									$ochaptersections[] = array(
										"label" => $chapterLabel,
										"name" => $chapter->getId(),
										"fields" => array(
											array(
												"label" => $this->get('translator')->trans('whose label is'),
												"name" => "sectionId",
												"fieldType" => "select",
												"options" => $osections
											)
										)
									);
								}
							}
							if (count($ochapters) > 0) {
								$oblockinfochapters[] = array(
									"label" => $blockinfoLabel,
									"name" => $blockinfo->getId(),
									"fields" => array(
										array(
											"label" => $this->get('translator')->trans('whose label is'),
											"name" => "chapterId",
											"fieldType" => "select",
											"options" => $ochapters
										)
									)
								);
							}
							if (count($ochaptersections) > 0) {
								$oblockinfosections[] = array(
									"label" => $blockinfoLabel,
									"name" => $blockinfo->getId(),
									"fields" => array(
										array(
											"label" => $this->get('translator')->trans("of chapter"),
											"name" => "chapterId",
											"fieldType" => "select",
											"options" => $ochaptersections
										)
									)
								);
							}
						}
					}
					if (count($ofieldsets) > 0) {
						$opanelfieldsets[] = array(
							"label" => $panelLabel,
							"name" => $panel->getId(),
							"fields" => array(
								array(
									"label" => $this->get('translator')->trans('whose label is'),
									"name" => "fieldsetId",
									"fieldType" => "select",
									"options" => $ofieldsets
								)
							)
						);
					}
					if (count($ofieldsetfields) > 0) {
						$opanelfields[] = array(
							"label" => $panelLabel,
							"name" => $panel->getId(),
							"fields" => array(
								array(
									"label" => $this->get('translator')->trans("of fieldset"),
									"name" => "fieldsetId",
									"fieldType" => "select",
									"options" => $ofieldsetfields
								)
							)
						);
					}
					if (count($ofieldsetprenotes) > 0) {
						$opanelprenotes[] = array(
							"label" => $panelLabel,
							"name" => $panel->getId(),
							"fields" => array(
								array(
									"label" => $this->get('translator')->trans("of fieldset"),
									"name" => "fieldsetId",
									"fieldType" => "select",
									"options" => $ofieldsetprenotes
								)
							)
						);
					}
					if (count($ofieldsetpostnotes) > 0) {
						$opanelpostnotes[] = array(
							"label" => $panelLabel,
							"name" => $panel->getId(),
							"fields" => array(
								array(
									"label" => $this->get('translator')->trans("of fieldset"),
									"name" => "fieldsetId",
									"fieldType" => "select",
									"options" => $ofieldsetpostnotes
								)
							)
						);
					}
					if (count($oblockinfos) > 0) {
						$opanelblockinfos[] = array(
							"label" => $panelLabel,
							"name" => $panel->getId(),
							"fields" => array(
								array(
									"label" => $this->get('translator')->trans('whose label is'),
									"name" => "blockinfoId",
									"fieldType" => "select",
									"options" => $oblockinfos
								)
							)
						);
					}
					if (count($oblockinfochapters) > 0) {
						$opanelchapters[] = array(
							"label" => $panelLabel,
							"name" => $panel->getId(),
							"fields" => array(
								array(
									"label" => $this->get('translator')->trans("of blockinfo"),
									"name" => "blockinfoId",
									"fieldType" => "select",
									"options" => $oblockinfochapters
								)
							)
						);
					}
					if (count($oblockinfosections) > 0) {
						$opanelsections[] = array(
							"label" => $panelLabel,
							"name" => $panel->getId(),
							"fields" => array(
								array(
									"label" => $this->get('translator')->trans("of blockinfo"),
									"name" => "blockinfoId",
									"fieldType" => "select",
									"options" => $oblockinfosections
								)
							)
						);
					}
				}
				if (count($opanels) > 0) {
					$osteppanels[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans('whose label is'),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanels
							)
						)
					);
				}
				if (count($opanelfieldsets) > 0) {
					$ostepfieldsets[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelfieldsets
							)
						)
					);
				}
				if (count($opanelfields) > 0) {
					$ostepfields[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelfields
							)
						)
					);
				}
				if (count($opanelprenotes) > 0) {
					$ostepprenotes[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelprenotes
							)
						)
					);
				}
				if (count($opanelpostnotes) > 0) {
					$osteppostnotes[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelpostnotes
							)
						)
					);
				}
				if (count($opanelblockinfos) > 0) {
					$ostepblockinfos[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelblockinfos
							)
						)
					);
				}
				if (count($opanelchapters) > 0) {
					$ostepchapters[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelchapters
							)
						)
					);
				}
				if (count($opanelsections) > 0) {
					$ostepsections[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelsections
							)
						)
					);
				}
				$oactionbuttons = array();
				foreach ($step->getActions() as $action) {
					$oactionbuttons[] = array(
						'label' => $action->getLabel(),
						'name' => $action->getName()
					);
				}
				if (count($oactionbuttons) > 0) {
					$ostepactionbuttons[] = array(
						'label' => $stepLabel,
						'name' => $step->getId(),
						'fields' => array(
							array(
								'label' => $this->get('translator')->trans('whose label is'),
								'name' => 'actionId',
								'fieldType' => 'select',
								'options' => $oactionbuttons
							)
						)
					);
				}
				$ofootnotes = array();
				if ($step->getFootNotes() !== null) {
					$footnoteList = $step->getFootNotes();
					foreach ($footnoteList->getFootNotes() as $footnote) {
						$ofootnotes[] = array(
							'label' => $this->get('translator')->trans('FootNote %id%', array('%id%' => $footnote->getId())),
							'name' => $footnote->getId()
						);
					}
				}
				if (count($ofootnotes) > 0) {
					$ostepfootnotes[] = array(
						'label' => $stepLabel,
						'name' => $step->getId(),
						'fields' => array(
							array(
								'label' => $this->get('translator')->trans('whose label is'),
								'name' => 'footnoteId',
								'fieldType' => 'select',
								'options' => $ofootnotes
							)
						)
					);
				}
			}
			if (count($osteps) > 0) {
				$steps = array(
						"label" => $this->get('translator')->trans("step"),
						"name" => "step",
						"fields" => array(
							array(
								"label" => "",
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $osteps
							)
						)
				);
			}
			if (count($osteppanels) > 0) {
				$panels = array(
						"label" => $this->get('translator')->trans("panel"),
						"name" => "panel",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $osteppanels
							)
						)
				);
			}
			if (count($ostepfieldsets) > 0) {
				$fieldsets = array(
						"label" => $this->get('translator')->trans("fieldset"),
						"name" => "fieldset",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepfieldsets
							)
						)
				);
			}
			if (count($ostepfields) > 0) {
				$fields = array(
						"label" => $this->get('translator')->trans("field"),
						"name" => "field",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepfields
							)
						)
				);
			}
			if (count($ostepprenotes) > 0) {
				$prenotes = array(
						"label" => $this->get('translator')->trans("prenote"),
						"name" => "prenote",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepprenotes
							)
						)
				);
			}
			if (count($osteppostnotes) > 0) {
				$postnotes = array(
						"label" => $this->get('translator')->trans("postnote"),
						"name" => "postnote",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $osteppostnotes
							)
						)
				);
			}
			if (count($ostepblockinfos) > 0) {
				$blockinfos = array(
						"label" => $this->get('translator')->trans("blockinfo"),
						"name" => "blockinfo",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepblockinfos
							)
						)
				);
			}
			if (count($ostepchapters) > 0) {
				$chapters = array(
						"label" => $this->get('translator')->trans("chapter"),
						"name" => "chapter",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepchapters
							)
						)
				);
			}
			if (count($ostepsections) > 0) {
				$sections = array(
						"label" => $this->get('translator')->trans("section"),
						"name" => "section",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepsections
							)
						)
				);
			}
			if (count($ostepfootnotes) > 0) {
				$footnotes = array(
						"label" => $this->get('translator')->trans("footnote"),
						"name" => "footnote",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepfootnotes
							)
						)
				);
			}
			if (count($ostepactionbuttons) > 0) {
				$actionbuttons = array(
						"label" => $this->get('translator')->trans("actionbutton"),
						"name" => "action",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepactionbuttons
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
							'label' => $this->get('translator')->trans('whose label is'),
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
				'label' => $this->get('translator')->trans('choice'),
				'name' => 'choice',
				'fields' => array(
					array(
						'label' => $this->get('translator')->trans('of data'),
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
		if (count($panels) > 0) {
			$objects[] = $panels;
		}
		if (count($blockinfos) > 0) {
			$objects[] = $blockinfos;
		}
		if (count($chapters) > 0) {
			$objects[] = $chapters;
		}
		if (count($sections) > 0) {
			$objects[] = $sections;
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
				'label' => $this->get('translator')->trans("Choose an Action..."), 
				'name' => "", 
				'fieldType' => "textarea"
			),
			array(
				'label' => $this->get('translator')->trans("notify Error"), 
				'name' => "notifyError", 
				'fields' => array(
					array(
						'label' => "",
						'name' => "message",
						'fieldType' => "textarea"
					),
					array(
						'label' => $this->get('translator')->trans("on"),
						'name'	=> "target",
						'fieldType' => "select",
						'options' => array(
							array(
								'label' => $this->get('translator')->trans('data'),
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
								'label' => $this->get('translator')->trans('dataset'),
								'name' => 'dataset'
							)
						)
					)
				)
			),
			array(
				'label' => $this->get('translator')->trans("notify Warning"), 
				'name' => "notifyWarning", 
				'fields' => array(
					array(
						'label' => "",
						'name' => "message",
						'fieldType' => "textarea"
					),
					array(
						'label' => $this->get('translator')->trans("on"),
						'name'	=> "target",
						'fieldType' => "select",
						'options' => array(
							array(
								'label' => $this->get('translator')->trans('data'),
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
				'label' => $this->get('translator')->trans("Hide"), 
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
				'label' => $this->get('translator')->trans("Show"), 
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
				'label' => $this->get('translator')->trans("Set"), 
				'name' => "setAttribute", 
				'fields' => array(
					array(
						'label' => "",
						'name' => "attributeId",
						'fieldType' => "select",
						'options' => array(
							array(
								'label' => $this->get('translator')->trans("content"), 
								'name' => "content", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => $this->get('translator')->trans("default"), 
								'name' => "default", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => $this->get('translator')->trans("minimum"), 
								'name' => "min", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => $this->get('translator')->trans("maximum"), 
								'name' => "max", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => $this->get('translator')->trans("Result index"), 
								'name' => "index", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => $this->get('translator')->trans("explanation"), 
								'name' => "explanation", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
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
			'label' => $this->get('translator')->trans('Script'),
			'type' => 'choice',
			'options' => array(
				 array(
					'label' => $this->get('translator')->trans('Disabled'),
					'name' => 0
				),
				 array(
					'label' => $this->get('translator')->trans('Enabled'),
					'name' => 1
				)
			)
		);
		$this->dataset['dynamic'] = array(
			'id' => 20001, 
			'label' => $this->get('translator')->trans('Interactive UI'),
			'type' => 'choice',
			'options' => array(
				 array(
					'label' => $this->get('translator')->trans('No'),
					'name' => 0
				),
				 array(
					'label' => $this->get('translator')->trans('Yes'),
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
				'connector' => $brule->getConnector() != null ? $this->ruleConnector($brule->getConnector()) : null,
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

	private function ruleConnector($pconnector) {
		if ($pconnector instanceof Condition) {
			$data = $this->simu->getDataById($pconnector->getOperand());
			return array(
				'name' => $data == null ? $pconnector->getOperand() : $data->getName(),
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

	private function actionsData($ruleID, $actions) {
		$datas = array();
		foreach ($actions as $action) {
			$target = $action->getTarget();
			switch ($action->getName()) {
				case 'notifyError':
				case 'notifyWarning':
					$clause = array(
						'name' => 'action-select',
						'value' => $action->getName(),
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
													array('name' => 'panelId', 'value' => $action->getPanel(), 'fields' => array(
															array('name' => 'fieldsetId', 'value' => $action->getFieldset(), 'fields' => array(
																	array('name' => 'fieldId', 'value' => $action->getTargetId())
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
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId',	'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'panelId', 'value' => $action->getPanel(), 'fields' => array(
															array('name' => 'blockinfoId', 'value' => $action->getBlockinfo(), 'fields' => array(
																	array('name' => 'chapterId', 'value' => $action->getChapter(), 'fields' => array(
																			array('name' => 'sectionId', 'value' => $action->getTargetId())
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
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId',	'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'panelId', 'value' => $action->getPanel(), 'fields' => array(
															array('name' => 'blockinfoId', 'value' => $action->getBlockinfo(), 'fields' => array(
																	array('name' => 'chapterId', 'value' => $action->getTargetId())
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
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'panelId', 'value' => $action->getPanel(), 'fields' => array(
															array('name' => 'fieldsetId', 'value' => $action->getTargetId())
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
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'panelId', 'value' => $action->getPanel(), 'fields' => array(
															array('name' => 'blockinfoId', 'value' => $action->getTargetId())
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
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId', 'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'panelId', 'value' => $action->getTargetId())
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

	protected function formatParamValue($param) {
		$data = $this->simu->getDataById($param->getData());
		$value = $data->getValue();
		if (strlen($value) == 0) {
			return null;
		}
		switch ($data->getType()) {
			case "date":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", $value);
					$value = $date->format($format);
				}
				break;
			case "day":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", $value."/1/2015");
					$value = $date->format($format);
				}
				break;
			case "month":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", "1/".$value."/2015");
					$value = $date->format($format);
				}
				break;
			case "year":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", "1/1/".$value);
					$value = $date->format($format);
				}
				break;
		}
		return $value;
	}

	protected function populateChoiceWithSource($data) 
	{
		$choiceSource = $data->getChoiceSource();
		if ($choiceSource != null) {
			$source = $choiceSource->getId();
			if ($source != "") {
				$source = $this->simu->getSourceById($source);
				if ($source !== null) {
					$result = $this->processSource($source);
					if ($result !== null) {
						$n = 0;
						foreach ($result as $row) {
						$id = $choiceSource->getIdColumn() != '' ? $row[$choiceSource->getIdColumn()] : ++$n;
							$choice = new Choice($data, $id, $row[$choiceSource->getValueColumn()], $row[$choiceSource->getLabelColumn()]);
							$data->addChoice($choice);
						}
					}
				}
			}
		}
		foreach ($data->getChoices() as $choice) {
			if ($choice instanceof ChoiceGroup) {
				if ($choice->getChoiceSource() !== null) {
					$choiceSource = $choice->getChoiceSource();
					if ($choiceSource != null) {
						$source = $choiceSource->getId();
						if ($source != "") {
							$source = $this->simu->getSourceById($source);
							if ($source !== null) {
								$result = $this->processSource($source);
								if ($result !== null) {
									$n = 0;
									foreach ($result as $row) {
										$id = $choiceSource->getIdColumn() != '' ? $row[$choiceSource->getIdColumn()] : ++$n;
										$gchoice = new Choice($data, $id, $row[$choiceSource->getValueColumn()], $row[$choiceSource->getLabelColumn()]);
										$choice->addChoice($gchoice);
									}
								}
							}
						}
					}
				}
			}
		}
	}

	protected function processSource(Source $source) {
		$params = $source->getParameters();
		$datasource = $source->getDatasource();
		if (is_numeric($datasource)) {
			$datasource = $this->simu->getDatasourceById((int)$datasource);
		} else {
			$datasource = $this->simu->getDatasourceByName($datasource);
		}
		switch ($datasource->getType()) {
			case 'uri':
				$query = "";
				$path = "";
				$datas = array();
				foreach ($params as $param) {
					$value = $this->formatParamValue($param);
					if ($value === null) {
						return null;
					}
					if ($param->getType() == 'path') {
						$path .= "/".$value;
					} elseif ($param->getType() == 'data') {
						$name = $param->getName();
						if (isset($datas[$name])) {
							$datas[$name][] = $value;
						}  else {
							$datas[$name] = array($value);
						}
					} else {
						$query .= "&".$param->getName()."=".$value;
					}
				}
				$uri = $datasource->getUri();
				if ($path != "") {
					$uri .= $path;
				} 
				if ($query != "") {
					$uri .= "?".substr($query, 1);
				}
				$client = Client::createClient();
				if ($datasource->getMethod() == "GET") {
					$result = $client->get($uri);
				} else {
					$result = $client->post($uri, $data);
				}
				break;
			case 'database':
			case 'internal':
				$args = array();
				$args[] = $source->getRequest();
				foreach ($params as $param) {
					$value = $this->formatParamValue($param);
					if ($value === null) {
						return null;
					}
					$args[] = $value;
				}
				$query = call_user_func_array('sprintf', $args);
				$database = $this->simu->getDatabaseById($datasource->getDatabase());
				$database->connect();
				$result = $database->query($query);
				break;
		}
		switch ($source->getReturnType()) {
			case 'singleValue':
				return $result;
			case 'json':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$json = json_decode($result, true);
				$result = ResultFilter::filter("json", $json, $returnPath);
				return $result;
			case 'assocArray':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$keys = explode("/", $returnPath);
				foreach ($keys as $key) {
					if (preg_match("/^([^\[]+)\[([^\]]+)\]$/", $key, $matches)) {
						$key1 = $matches[1];
						if (! isset($result[$key1])) {
							break;
						}
						$result = $result[$key1];
						$key = $matches[2];
					}
					if (ctype_digit($key)) {
						$key = (int)$key;
					}
					if (! isset($result[$key])) {
						break;
					}
					$result = $result[$key];
				}
				return $result;
			case 'html':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$result = ResultFilter::filter("html", $result, $returnPath, $datasource->getNamespaces());
				return $result;
			case 'xml':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$result = ResultFilter::filter("xml", $result, $returnPath, $datasource->getNamespaces());
				return $result;
			case 'csv':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$result = ResultFilter::filter("csv", $result, $returnPath, null, $source->getSeparator(), $source->getDelimiter());
				return $result;
		}
		return null;
	}

	private function replaceVariable($matches) {
		if (preg_match("/^\d+$/", $matches[1])) {
			$id = (int)$matches[1];
			$data = $this->simu->getDataById($id);
		} else {
			$name = $matches[3];
			$data = $this->simu->getDataByName($name);
		}
		if ($data === null) {
			return $matches[0];
		}
		if ($matches[2] == 'L') { 
			$value = $data->getChoiceLabel();
			if ($data->getType() == 'multichoice') {
				$value = implode(',', $value);
			}
			return $value;
		} else {
			$value = $data->getValue();
			switch ($data->getType()) {
				case 'money': 
					$value = number_format ( (float)$value , 2 , "." , " "); 
				case 'percent':
				case 'number': 
					$value = str_replace('.', ',', $value);
					break;
				case 'array': 
				case 'multichoice': 
					$value = implode(',', $value);
					break;
			}
			return $value;
		}
	}

	private function replaceVariables($target) {
		$result = preg_replace_callback(
			"/#(\d+)(L?)|#\(([^\)]+)\)(L?)/",
			array($this, 'replaceVariable'),
			$target
		);
		return $result;
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
