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
use EUREKA\G6KBundle\Entity\Step;
use EUREKA\G6KBundle\Entity\Action;
use EUREKA\G6KBundle\Entity\FootNotes;
use EUREKA\G6KBundle\Entity\FootNote;
use EUREKA\G6KBundle\Entity\Panel;
use EUREKA\G6KBundle\Entity\FieldSet;
use EUREKA\G6KBundle\Entity\Column;
use EUREKA\G6KBundle\Entity\FieldRow;
use EUREKA\G6KBundle\Entity\Field;
use EUREKA\G6KBundle\Entity\BlockInfo;
use EUREKA\G6KBundle\Entity\FieldNote;
use EUREKA\G6KBundle\Entity\Chapter;
use EUREKA\G6KBundle\Entity\Section;
use EUREKA\G6KBundle\Entity\BusinessRule;
use EUREKA\G6KBundle\Entity\Connector;
use EUREKA\G6KBundle\Entity\Condition;
use EUREKA\G6KBundle\Entity\RuleAction;
use EUREKA\G6KBundle\Entity\Profiles;
use EUREKA\G6KBundle\Entity\Profile;
use EUREKA\G6KBundle\Entity\DOMClient as Client;
use EUREKA\G6KBundle\Entity\ResultFilter;
use EUREKA\G6KBundle\Entity\SQLSelectTokenizer;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
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
	private $steps = array();

	public function indexAction(Request $request, $simulator = null, $crud = null)
	{
		if ($crud == 'export') {
			return $this->doExportSimulator($simulator);
		} elseif ($crud == 'publish') {
			return $this->doPublishSimulator($simulator);
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
		$updated = false;
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
					if (file_exists($simu_dir."/work/".$simu)) {
						$this->simu->load($simu_dir."/work/".$simu);
						$updated = true;
					} else {
						$this->simu->load($simu_dir."/".$simu);
					}
					$this->loadBusinessRules();
				} catch (\Exception $e) {
					$this->simu = null;
				}
			}
		}
		$hiddens['updated'] = $updated;
		if ($crud == 'create') {
			$hiddens['action'] = 'create';
			$this->simu = new Simulator($this);
			$this->simu->loadEmptySimulator();
			$this->loadBusinessRules();
		} elseif ($crud == 'save') {
			if (isset($form['create'])) {
				return $this->doCreate($simulator, $form);
			} elseif (isset($form['update'])) {
				$this->update($simulator, $form);
				return new RedirectResponse($this->generateUrl('eureka_g6k_admin_simulator', array('simulator' => $this->simu->getName())));
			} elseif (isset($form['delete'])) {
				// TODO: doDelete
			}
		} elseif ($crud == 'import') {
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
			$dstype = (string)$ds['type'];
			$dbtype = '';
			$tables = array();
			if (($dstype == 'internal' || $dstype == 'database') && $ds->Table) {
				$databases = $sources->xpath("/DataSources/Databases/Database[@id='".(string)$ds['database']."']");
				$dbtype = (string)$databases[0]['type'];
				foreach($ds->Table as $dstable) {
					$columns = array();
					foreach($dstable->Column as $dscolumn) {
						$choices = array();
						if ((string)$dscolumn['type'] == 'choice' && $dscolumn->Choices) {
							foreach($dscolumn->Choices->Choice as $dschoice) {
								$choices[] = array(
									'id' => (int)$dschoice['id'],
									'value' => (string)$dschoice['value'],
									'label' => (string)$dschoice['label']
								);
							}
						}
						$columns[strtolower((string)$dscolumn['name'])] = array(
							'id' => (int)$dscolumn['id'],
							'name' => (string)$dscolumn['name'],
							'type' => (string)$dscolumn['type'],
							'label' => (string)$dscolumn['label'],
							'description' => (string)$dscolumn->Description,
							'choices' => $choices
						);
					}
					$tables[strtolower((string)$dstable['name'])] = array(
						'id' => (int)$dstable['id'],
						'name' => (string)$dstable['name'],
						'label' => (string)$dstable['label'],
						'description' => (string)$dstable->Description,
						'columns' => $columns
					);
				}
			}
			$datasources[(string)$ds['name']] = array(
				'id' => (string)$ds['id'],
				'name' => (string)$ds['name'],
				'type' => (string)$ds['type'],
				'method' => (string)$ds['method'],
				'description' => (string)$ds->Description,
				'dbtype' => $dbtype,
				'tables' => $tables
			);
		}
		if ($this->simu != null) {
			$tokenizer = new SQLSelectTokenizer();
			foreach ($this->simu->getSources() as $source) {
				$datasource = $source->getDatasource();
				if (is_numeric($datasource)) {
					$datasource = $this->simu->getDatasourceById((int)$datasource);
					$name = $datasource->getName();
				} else {
					$name = $datasource;
				}
				if ($source->getRequest() != "" && $source->getRequestType() == "simple") {
					$tokenizer->setTables($datasources[$name]['tables']);
					$num = 0;
					$sql = preg_replace_callback("/('%([sdf])'|%([sdf])\b)/", function($a) use ($num) { 
						$num++;
						return '$' . $num . '$' . $a[count($a) - 1]; 
					}, $source->getRequest());
					$sql = preg_replace_callback("/'%(\d+)\$([sdf])'/", function($a) { 
						return '$' . $a[1] . '$' . $a[2]; 
					}, $sql);
					$sql = preg_replace_callback('/%(\d+)\$([sdf])\b/', function($a) { 
						return '$' . $a[1] . '$' . $a[2]; 
					}, $sql);
					$parsed = $tokenizer->parseSetOperations($sql);
					if ($parsed->statement == 'compound select' || count($parsed->from) > 1) {
						$source->setRequestType("complex");
					} else {
						$table = strtolower($parsed->from[0]->table);
						$parsed->from[0]->label = $datasources[$name]['tables'][$table]['label'];
						foreach($parsed->select as &$col) {
							$colname = strtolower($col->column);
							if (isset($datasources[$name]['tables'][$table]['columns'][$colname])) {
								$col->label = $datasources[$name]['tables'][$table]['columns'][$colname]['label'];
							} else {
								$col->label = $col->column;
							}
						}
						foreach($parsed->orderby as &$col) {
							$colname = strtolower($col->key);
							if (isset($datasources[$name]['tables'][$table]['columns'][$colname])) {
								$col->label = $datasources[$name]['tables'][$table]['columns'][$colname]['label'];
							} else {
								$col->label = $col->key;
							}
						}
						$nparsed = array(
							'select' => $parsed->select,
							'from' => $parsed->from[0],
							'where' => $parsed->where,
							'conditions' => $parsed->conditions,
							'orderby' => $parsed->orderby,
							'limit' => $parsed->limit,
							'offset' => $parsed->offset
						);
						$source->setParsed($nparsed);
					}
				}
			}
		}
		$valid = true;
		if ($simulator != null) {
			$schema = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/doc/Simulator.xsd";
			$dom = new \DOMDocument();
			$dom->preserveWhiteSpace  = false;
			$dom->formatOutput = true;
			if (file_exists($simu_dir . '/work/' . $simulator . '.xml')) {
				$dom->load( $simu_dir . '/work/' . $simulator . '.xml');
			} else {
				$dom->load( $simu_dir . '/' . $simulator . '.xml');
			}
			libxml_use_internal_errors(true);
			$valid = $dom->schemaValidate($schema);
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
					'valid' => $valid,
					'dataset' => $this->dataset,
					'steps' => $this->steps,
					'actions' => $this->actions,
					'rules' => $this->rules,
					'datasources' => $datasources,
					'views' => $views,
					'hiddens' => $hiddens,
					'widgets' => $this->getWidgets()
				)
			);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}

	public function getWidgets() {
		$widgets = array();
		if ($this->container->hasParameter('widgets')) {
			foreach ($this->container->getParameter('widgets') as $name => $widget) {
				$widgets[$name] = $this->get('translator')->trans($widget['label']);
			}
		}
		return $widgets;
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

	protected function doCreate($simulator, $form) {
		$this->simu = new Simulator($this);
		$this->simu->loadEmptySimulator();
		$this->update($simulator, $form);
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_simulator', array('simulator' => $this->simu->getName())));
	}

	protected function update($simulator, $form) {
		$fs = new Filesystem();
		$bundle = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true);
		$publicdir = $bundle->getPath()."/Resources/public";
		$simu_dir = $bundle->getPath()."/Resources/data/simulators";
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
		if (isset($form['create'])) {
			$simulator = $simulatorData["name"];
		}
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
					if (isset($gdata['choicesource']) && !empty($gdata['choicesource'])) {
						$source = $gdata['choicesource'];
						$choiceSourceObj = new ChoiceSource($dataObj, (int)$source['id'], $source['valueColumn'], $source['labelColumn']);
						if (isset($source['idColumn'])) {
							$choiceSourceObj->setIdColumn($source['idColumn']);
						}
						$dataObj->setChoiceSource($choiceSourceObj);
					} elseif (isset($gdata['choices']) && count($gdata['choices']) > 0) {
						foreach ($gdata['choices'] as $choice) {
							$choiceObj = new Choice($dataObj, $choice['id'], $choice['value'], $choice['label']);
							$dataObj->addChoice($choiceObj);
						}
					}
					if (isset($gdata['description'])) {
						$dataObj->setDescription(trim($gdata['description']));
					}
					$dataGroupObj->addData($dataObj);
				}
				$this->simu->addData($dataGroupObj);
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
				if (isset($data['choicesource']) && !empty($data['choicesource'])) {
					$source = $data['choicesource'];
					$choiceSourceObj = new ChoiceSource($dataObj, (int)$source['id'], $source['valueColumn'], $source['labelColumn']);
					if (isset($source['idColumn'])) {
						$choiceSourceObj->setIdColumn($source['idColumn']);
					}
					$dataObj->setChoiceSource($choiceSourceObj);
				} elseif (isset($data['choices']) && count($data['choices']) > 0) {
					foreach ($data['choices'] as $choice) {
						$choiceObj = new Choice($dataObj, $choice['id'], $choice['value'], $choice['label']);
						$dataObj->addChoice($choiceObj);
					}
				}
				if (isset($data['description'])) {
					$dataObj->setDescription(trim($data['description']));
				}
				$this->simu->addData($dataObj);
			}
		}

		$steps = json_decode($form['steps'], true);
		// file_put_contents($simu_dir."/work/".$simulator."-steps.json", var_export($steps, true));

		$this->simu->setSteps(array());
		$step0 = false;
		foreach($steps as $s => $step) {
			$stepObj = new Step($this, (int)$step['id'], $step['name'], $step['label'], $step['template']);
			if ($stepObj->getId() == 0) {
				$step0 = true;
			}
			$stepObj->setOutput($step['output']);
			$stepObj->setDescription($step['description']);
			$stepObj->setDynamic($step['dynamic'] == '1');
			foreach ($step['panels'] as $p => $panel) {
				$panelObj = new Panel($stepObj, (int)$panel['id']);
				$panelObj->setName($panel['name']);
				$panelObj->setLabel($panel['label']);
				foreach ($panel['blocks'] as $b => $block) {
					if ($block['type'] == 'fieldset') {
						$fieldset = $block;
						$fieldsetObj = new FieldSet($panelObj, (int)$fieldset['id']);
						$fieldsetObj->setLegend($fieldset['legend']);
						if ($fieldset['disposition'] != "") {
							$fieldsetObj->setDisposition($fieldset['disposition']);
						}
						if ($fieldset['display'] != "") {
							$fieldsetObj->setDisplay($fieldset['display']);
						}
						if ($fieldset['popinLink'] != "") {
							$fieldsetObj->setPopinLink($fieldset['popinLink']);
						}
						if ($fieldset['disposition'] == "grid") {
							if (isset($fieldset['columns'])) {
								foreach ($fieldset['columns'] as $column) {
									$columnObj = new Column(null, (int)$column['id'], $column['name'], $column['type']);
									$columnObj->setLabel($column['label']);
									$fieldsetObj->addColumn($columnObj);
								}
							}
							foreach ($fieldset['fieldrows'] as $fieldrow) {
								$fieldRowObj = new FieldRow($fieldsetObj, (int)$fieldrow['id'], $fieldrow['label']);
								$fieldRowObj->setColon($fieldrow['colon'] == '' || $fieldrow['colon'] == '1');
								$fieldRowObj->setHelp($fieldrow['help'] == '1');
								$fieldRowObj->setEmphasize($fieldrow['emphasize'] == '1');
								$fieldRowObj->setDataGroup($fieldrow['datagroup']);
								foreach ($fieldrow['fields'] as $field) {
									$fieldObj = new Field($fieldsetObj, (int)$field['position'], (int)$field['data'], $field['label']);
									$fieldObj->setUsage($field['usage']);
									$fieldObj->setPrompt($field['prompt']);
									$fieldObj->setNewline($field['newline'] == '' || $field['newline'] == '1');
									$fieldObj->setRequired($field['required'] == '1');
									$fieldObj->setVisibleRequired($field['visibleRequired'] == '1');
									$fieldObj->setColon($field['colon'] == '' || $field['colon'] == '1');
									$fieldObj->setUnderlabel($field['underlabel'] == '1');
									$fieldObj->setHelp($field['help'] == '1');
									$fieldObj->setEmphasize($field['emphasize'] == '1');
									$fieldObj->setExplanation($field['explanation']);
									$fieldObj->setExpanded($field['expanded'] == '1');
									$fieldObj->setWidget($field['widget']);
									if (isset($field['Note'])) {
										$note = $field['Note'];
										if ($note['position'] == 'beforeField') {
											$noteObj = new FieldNote($this);
											$noteObj->setText($note['text']);
											$fieldObj->setPreNote($noteObj);
										} elseif ($note['position'] == 'afterField') {
											$noteObj = new FieldNote($this);
											$noteObj->setText($note['text']);
											$fieldObj->setPostNote($noteObj);
										}
									}
									$fieldRowObj->addField($fieldObj);
								}
								$fieldsetObj->addField($fieldRowObj);
							} 
						} else {
							foreach ($fieldset['fields'] as $field) {
								$fieldObj = new Field($fieldsetObj, (int)$field['position'], (int)$field['data'], $field['label']);
								$fieldObj->setUsage($field['usage']);
								$fieldObj->setPrompt($field['prompt']);
								$fieldObj->setNewline($field['newline'] == '' || $field['newline'] == '1');
								$fieldObj->setRequired($field['required'] == '1');
								$fieldObj->setVisibleRequired($field['visibleRequired'] == '1');
								$fieldObj->setColon($field['colon'] == '' || $field['colon'] == '1');
								$fieldObj->setUnderlabel($field['underlabel'] == '1');
								$fieldObj->setHelp($field['help'] == '1');
								$fieldObj->setEmphasize($field['emphasize'] == '1');
								$fieldObj->setExplanation($field['explanation']);
								$fieldObj->setExpanded($field['expanded'] == '1');
								$fieldObj->setWidget($field['widget']);
								if (isset($field['Note'])) {
									$note = $field['Note'];
									if ($note['position'] == 'beforeField') {
										$noteObj = new FieldNote($this);
										$noteObj->setText($note['text']);
										$fieldObj->setPreNote($noteObj);
									} elseif ($note['position'] == 'afterField') {
										$noteObj = new FieldNote($this);
										$noteObj->setText($note['text']);
										$fieldObj->setPostNote($noteObj);
									}
								}
								$fieldsetObj->addField($fieldObj);
							}
						}
						$panelObj->addFieldSet($fieldsetObj);
					} elseif ($block['type'] == 'blockinfo') {
						$blockinfo = $block;
						$blockinfoObj = new BlockInfo($panelObj, (int)$blockinfo['id']);
						$blockinfoObj->setName($blockinfo['name']);
						$blockinfoObj->setLabel($blockinfo['label']);
						foreach ($blockinfo['chapters'] as $c => $chapter) {
							$chapterObj = new Chapter($blockinfoObj, (int)$chapter['id']);
							$chapterObj->setName($chapter['name']);
							$chapterObj->setLabel($chapter['label']);
							$chapterObj->setIcon($chapter['icon']);
							$chapterObj->setCollapsible($chapter['collapsible'] == '1');
							foreach ($chapter['sections'] as $section) {
								$sectionObj = new Section($chapterObj, (int)$section['id']);
								$sectionObj->setName($section['name']);
								$sectionObj->setLabel($section['label']);
								$sectionObj->setContent($section['content']);
								if (isset($section['annotations'])) {
									$sectionObj->setAnnotations($section['annotations']);
								}
								$chapterObj->addSection($sectionObj);
							}
							$blockinfoObj->addChapter($chapterObj);
						}
						$panelObj->addFieldSet($blockinfoObj);
					}
				}
				$stepObj->addPanel($panelObj);
			}
			foreach ($step['actions'] as $action) {
				$actionObj = new Action($stepObj, $action['name'], $action['label']);
				$actionObj->setClass($action['class']);
				$actionObj->setWhat($action['what']);
				$actionObj->setFor($action['for']);
				$actionObj->setUri($action['uri']);
				$stepObj->addAction($actionObj);
			}
			if (isset($step['footNotes'])) {
				$footnotes = $step['footNotes'];
				if (isset($footnotes['footNotes']) && count($footnotes['footNotes']) > 0) {
					$footnotesObj = new FootNotes($stepObj);
					if ($footnotes['position'] != "") {
						$footnotesObj->setPosition($footnotes['position']);
					}
					foreach ($footnotes['footNotes'] as $footnote) {
						$footnoteObj = new FootNote($stepObj, (int)$footnote['id']);
						$footnoteObj->setText($footnote['text']);
						$footnotesObj->addFootNote($footnoteObj);
					}
					$stepObj->setFootNotes($footnotesObj);
				}
			}
			$this->simu->addStep($stepObj);
		}
		if (!$step0) {
			$this->simu->setDynamic(false);
		}

		$rulesData = json_decode($form['rules'], true);
		// file_put_contents($simu_dir."/work/".$simulator."-rules.json", var_export($rulesData, true));

		$this->simu->setBusinessRules(array());

		foreach($rulesData as $id => $brule) {
			$businessRuleObj = new BusinessRule($this->simu, 'rule-'.mt_rand(), (int)$brule['id'], (string)$brule['name']);
			$businessRuleObj->setLabel((string)$brule['label']);
			if (isset($brule["connector"])) {
				if (isset($brule["connector"]["name"])) {
					$businessRuleObj->setConditions($this->makeCond($brule["connector"]));
				} else {
					$businessRuleObj->setConditions($this->infix($brule["connector"]));
				}
				$businessRuleObj->setConnector($this->loadConnector($brule["connector"]));
			}
			foreach ($brule["ifdata"] as $ida => $action) {
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
					case 'unsetAttribute':
						$target = $action['fields'][0]['value'];
						$data = $this->simu->getDataByName($action['fields'][0]['fields'][0]['value']);
						$ruleActionObj->setTarget($target);
						$ruleActionObj->setValue('');
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
								$panel = $action['fields'][0]['fields'][0]['fields'][0]['value'];
								$fieldset = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
								$disposition = $this->simu->getStepById($step)->getPanelById($panel)->getFieldSetById($fieldset)->getDisposition();
								$ruleActionObj->setPanel($panel);
								$ruleActionObj->setFieldset($fieldset);
								if ($disposition == 'grid') {
									$ruleActionObj->setFieldrow($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
									$ruleActionObj->setField($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								} else {
									$ruleActionObj->setField($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								}
								break;
							case 'prenote':
								$panel = $action['fields'][0]['fields'][0]['fields'][0]['value'];
								$fieldset = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
								$disposition = $this->simu->getStepById($step)->getPanelById($panel)->getFieldSetById($fieldset)->getDisposition();
								$ruleActionObj->setPanel($panel);
								$ruleActionObj->setFieldset($fieldset);
								if ($disposition == 'grid') {
									$ruleActionObj->setFieldrow($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
									$ruleActionObj->setPrenote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								} else {
									$ruleActionObj->setPrenote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								}
								break;
							case 'postnote':
								$panel = $action['fields'][0]['fields'][0]['fields'][0]['value'];
								$fieldset = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
								$disposition = $this->simu->getStepById($step)->getPanelById($panel)->getFieldSetById($fieldset)->getDisposition();
								$ruleActionObj->setPanel($panel);
								$ruleActionObj->setFieldset($fieldset);
								if ($disposition == 'grid') {
									$ruleActionObj->setFieldrow($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
									$ruleActionObj->setPostnote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								} else {
									$ruleActionObj->setPostnote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								}
								break;
							case 'column':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setColumn($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'fieldrow':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldrow($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
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
			foreach ($brule["elsedata"] as $ida => $action) {
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
					case 'unsetAttribute':
						$target = $action['fields'][0]['value'];
						$data = $this->simu->getDataByName($action['fields'][0]['fields'][0]['value']);
						$ruleActionObj->setTarget($target);
						$ruleActionObj->setValue('');
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
								$panel = $action['fields'][0]['fields'][0]['fields'][0]['value'];
								$fieldset = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
								$disposition = $this->simu->getStepById($step)->getPanelById($panel)->getFieldSetById($fieldset)->getDisposition();
								$ruleActionObj->setPanel($panel);
								$ruleActionObj->setFieldset($fieldset);
								if ($disposition == 'grid') {
									$ruleActionObj->setFieldrow($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
									$ruleActionObj->setField($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								} else {
									$ruleActionObj->setField($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								}
								break;
							case 'prenote':
								$panel = $action['fields'][0]['fields'][0]['fields'][0]['value'];
								$fieldset = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
								$disposition = $this->simu->getStepById($step)->getPanelById($panel)->getFieldSetById($fieldset)->getDisposition();
								$ruleActionObj->setPanel($panel);
								$ruleActionObj->setFieldset($fieldset);
								if ($disposition == 'grid') {
									$ruleActionObj->setFieldrow($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
									$ruleActionObj->setPrenote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								} else {
									$ruleActionObj->setPrenote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								}
								break;
							case 'postnote':
								$panel = $action['fields'][0]['fields'][0]['fields'][0]['value'];
								$fieldset = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
								$disposition = $this->simu->getStepById($step)->getPanelById($panel)->getFieldSetById($fieldset)->getDisposition();
								$ruleActionObj->setPanel($panel);
								$ruleActionObj->setFieldset($fieldset);
								if ($disposition == 'grid') {
									$ruleActionObj->setFieldrow($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
									$ruleActionObj->setPostnote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								} else {
									$ruleActionObj->setPostnote($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								}
								break;
							case 'column':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setColumn($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								break;
							case 'fieldrow':
								$ruleActionObj->setPanel($action['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldset($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
								$ruleActionObj->setFieldrow($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
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
		// file_put_contents($simu_dir."/work/".$simulator."-sources.json", var_export($sources, true));

		$this->simu->setSources(array());
		foreach($sources as $id => $source) {
			$sourceObj = new Source($this, (int)$source['id'], $source['datasource'], $source['returnType']);
			if (isset($source['label'])) {
				$sourceObj->setLabel($source['label']);
			}
			if (isset($source['requestType']) && $source['requestType'] == 'simple') {
				$sourceObj->setRequest($this->composeSimpleSQLRequest($source));
			} elseif (isset($source['request'])) {
				$sourceObj->setRequest($source['request']);
			}
			if (isset($source['requestType'])) {
				$sourceObj->setRequestType($source['requestType']);
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
					$parameterObj->setOrigin($parameter['origin']);
					$parameterObj->setName($parameter['name']);
					$parameterObj->setFormat($parameter['format']);
					if ($parameter['origin'] == 'data') {
						$data = $this->simu->getDataByName($parameter['data']);
						$parameterObj->setData($data->getId());
					}
					$parameterObj->setConstant($parameter['constant']);
					$parameterObj->setOptional($parameter['optional'] == '1');
					$sourceObj->addParameter($parameterObj);
				}
			}
			$this->simu->addSource($sourceObj);
		}

		$profiles = json_decode($form['profiles'], true);
		// file_put_contents($simu_dir."/work/".$simulator."-profiles.json", var_export($profiles, true));

		$profilesObj = new Profiles($this->simu);
		$profilesObj->setLabel($profiles['label']);
		foreach ($profiles['profiles'] as $profile) {
			$profileObj = new Profile($profile['id'], $profile['name']);
			$profileObj->setLabel($profile['label']);
			$profileObj->setDescription($profile['description']);
			foreach ($profile['datas'] as $data) {
				$profileObj->addData((int)$data['id'], $data['default']);
			}
			$profilesObj->addProfile($profileObj);
		}
		$this->simu->setProfiles($profilesObj);

		if (isset($form['create'])) {
			$this->simu->save($simu_dir."/".$simulator.".xml");
		} else {
			$this->simu->save($simu_dir."/work/".$simulator.".xml");
		}
		$view = $this->simu->getDefaultView();
		if ($view != '' && ! $fs->exists($publicdir.'/'.$view.'/css/'.$simulator.'.css')) {
			if ($fs->exists($publicdir.'/'.$view.'/css/common.css')) {
				$fs->dumpFile($publicdir.'/'.$view.'/css/'.$simulator.'.css', '@import "common.css";'."\n");
			}
		}
	}

	private function composeSimpleSQLRequest($source) {
		$request = 'SELECT';
		$selectList = array();
		foreach ($source['columns'] as $col) {
			$column = $col['column'];
			if ($col['alias'] != $col['column']) {
				$column .= ' as ' . $col['alias'];
			}
			$selectList[] = $column;
		}
		$request .= ' ' . implode(', ', $selectList);
		$request .= ' FROM ' . $source['table'];
		if ($source['filter'] != '' && $source['filter'] != 'true') {
			$request .= ' WHERE ' . $source['filter'];
		}
		$orderbykeys = array();
		foreach ($source['orderby'] as $orderby) {
			if ( $orderby['order'] == 'desc') {
				$orderbykeys[] = $orderby['key'] . ' DESC';
			} else {
				$orderbykeys[] = $orderby['key'];
			}
		}
		if (count($orderbykeys) > 0) {
			$request .= ' ORDER BY ' . implode(', ', $orderbykeys);
		}
		$limit = $source['nbresult'];
		$offset = $source['from'];
		if ($limit > 0) {
			$request .= ' LIMIT ' . $limit;
			if ($offset > 0) {
				$request .= ' OFFSET ' . $offset;
			}
		} else if ($offset > 0 && $source['dbtype'] == 'pgsql') {
			$request .= 'LIMIT ALL OFFSET ' . $offset;
		}
		$request = preg_replace_callback('/\$(\d+)\$([sdf])\b/', function($a) { 
			return '%' . $a[1] . '$' . $a[2]; 
		}, $request);
		return $request;
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
		if (file_exists($simu_dir . "/work/" . $simu . ".xml")) {
			$simu_file = $simu_dir . "/work/" . $simu . ".xml";
		} else {
			$simu_file = $simu_dir . "/" . $simu . ".xml";
		}
		$simulator = new \SimpleXMLElement($simu_file, LIBXML_NOWARNING, true);
		$view = (string)$simulator["defaultView"];
		$content = array(
			array(
				'name' => $simu . ".xml",
				'data' => file_get_contents($simu_file),
				'modtime' => filemtime($simu_file)
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

	protected function doPublishSimulator($simu) {
		$simu_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/simulators";
		$schema_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/doc";
		$fs = new Filesystem();
		if ($fs->exists($simu_dir . "/work/" . $simu . ".xml")) {
			libxml_use_internal_errors(true);
			$xml = new \DOMDocument();
			$xml->load($simu_dir . "/work/" . $simu . ".xml");
			if (!$xml->schemaValidate($schema_dir . "/Simulator.xsd")) {
				$libxmlErrors = libxml_get_errors();
				$response = new StreamedResponse();
				$response->setCallback(function() use($libxmlErrors) {
					foreach ($libxmlErrors as $error) {
						switch ($error->level) {
							case LIBXML_ERR_WARNING:
								print "Warning $error->code : ";
								break;
							case LIBXML_ERR_ERROR:
								print "Error $error->code : ";
								break;
							case LIBXML_ERR_FATAL:
								print "Fatal Error $error->code : ";
								break;
						}
						print trim($error->message);
						if ($error->file) {
							print " in " . basename($error->file);
						}
						print " on line $error->line\n";
						print "<br>\n";
						flush();
					}
				});
				libxml_clear_errors();
				return $response;
			} else {
				$fs->copy($simu_dir . "/work/" . $simu . ".xml", $simu_dir . "/" . $simu . ".xml");
				return new RedirectResponse($this->generateUrl('eureka_g6k_admin_simulator', array('simulator' => $simu)));
			}
		}
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
		$columns = array();
		$fieldrows = array();
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
		$this->steps = array();
		if (count($this->simu->getSteps()) > 0) {
			$osteps = array ();
			$osteppanels = array ();
			$ostepfieldsets = array ();
			$ostepcolumns = array ();
			$ostepfieldrows = array ();
			$ostepfields = array ();
			$ostepprenotes = array ();
			$osteppostnotes = array ();
			$ostepblockinfos = array ();
			$ostepchapters = array ();
			$ostepsections = array ();
			$ostepfootnotes = array();
			$ostepactionbuttons = array();
			foreach ($this->simu->getSteps() as $step) {
				$tstep = array(
					'id' => $step->getId(),
					'name' => $step->getName(),
					'label' => $step->getLabel(),
					'template' => $step->getTemplate(),
					'output' => $step->getOutput(),
					'dynamic' => $step->isDynamic() ? '1' : '0',
					'description' => $step->getDescription(),
					'panels' => array(),
					'actions' => array(),
					'footNotes' => array()
				);
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
				$opanelcolumns = array ();
				$opanelfieldrows = array ();
				$opanelfields = array ();
				$opanelprenotes = array ();
				$opanelpostnotes = array ();
				$opanelblockinfos = array ();
				$opanelchapters = array ();
				$opanelsections = array ();
				foreach ($step->getPanels() as $panel) {
					$tpanel = array(
						'id' => $panel->getId(),
						'name' => $panel->getName(),
						'label' => $panel->getLabel(),
						'blocks' => array()
					);
					$panelLabel = $panel->getLabel() != '' ? $panel->getLabel() : $this->get('translator')->trans('Panel %id% (nolabel)', array('%id%' => $panel->getId()));
					$opanels[] = array (
						"label" => $panelLabel,
						"name" => $panel->getId()
					);
					$ofieldsets = array ();
					$ofieldsetcolumns = array ();
					$ofieldsetfieldrows = array ();
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
							$ocolumns = array ();
							$ofieldrows = array ();
							$ofieldrowfields = array ();
							$ofieldrowprenotes = array ();
							$ofieldrowpostnotes = array ();
							if ($fieldset->getDisposition() != 'grid') {
								$tblock = array(
									'type' => 'fieldset',
									'id' => $block->getId(),
									'disposition' => $block->getDisposition(),
									'display' => $block->getDisplay(),
									'popinLink' => $block->getPopinLink(),
									'legend' => $block->getLegend(),
									'fields' => array()
								);
								$ofields = array();
								$oprenotes = array();
								$opostnotes = array();
								foreach ($fieldset->getFields() as $field) {
									$tfield = array(
										'type' => 'field',
										'position' => $field->getPosition(),
										'data' => $field->getData(),
										'usage' => $field->getUsage(),
										'label' => $field->getLabel(),
										'newline' => $field->isNewline() ? '1' : '0',
										'prompt' => $field->getPrompt(),
										'required' => $field->isRequired() ? '1' : '0',
										'visibleRequired' => $field->isVisibleRequired() ? '1' : '0',
										'colon' => $field->hasColon() ? '1' : '0',
										'underlabel' => $field->isUnderlabel() ? '1' : '0',
										'help' => $field->hasHelp() ? '1' : '0',
										'emphasize' => $field->isEmphasized() ? '1' : '0',
										'explanation' => $field->getExplanation(),
										'expanded' => $field->isExpanded() ? '1' : '0',
										'widget' => $field->getWidget()
									);
									$fieldLabel = $field->getLabel() != '' ? $field->getLabel() : $this->get('translator')->trans('Field %id% (nolabel)', array('%id%' => $field->getPosition()));
									$ofields[] = array (
										"label" => $fieldLabel,
										"name" => $field->getPosition()
									);
									if ($field->getPreNote()) {
										$tfield['Note'] = array(
											'position' => 'beforeField',
											'text' => $field->getPreNote()->getText()
										);
										$oprenotes[] = array(
											'label' => $fieldLabel,
											'name' => $field->getPosition()
										);
									}
									if ($field->getPostNote()) {
										$tfield['Note'] = array(
											'position' => 'afterField',
											'text' => $field->getPostNote()->getText()
										);
										$opostnotes[] = array(
											'label' => $fieldLabel,
											'name' => $field->getPosition()
										);
									}
									$tblock['fields'][] = $tfield;
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
							} else {
								$tblock = array(
									'type' => 'fieldset',
									'id' => $block->getId(),
									'disposition' => $block->getDisposition(),
									'display' => $block->getDisplay(),
									'popinLink' => $block->getPopinLink(),
									'legend' => $block->getLegend(),
									'columns' => array(),
									'fieldrows' => array()
								);
								foreach ($fieldset->getColumns() as $column) {
									$tcolumn = array(
										'id' => $column->getId(),
										'name' => $column->getName(),
										'label' => $column->getLabel(),
										'type' => $column->getType()
									);
									$ocolumns[] = array (
										"label" => $column->getLabel(),
										"name" => $column->getId()
									);
									$tblock['columns'][] = $tcolumn;
								}
								foreach ($fieldset->getFields() as $fieldrow) {
									$tfieldrow = array(
										'type' => 'fieldrow',
										'id' => $fieldrow->getId(),
										'label' => $fieldrow->getLabel(),
										'help' => $fieldrow->hasHelp() ? '1' : '0',
										'colon' => $fieldrow->hasColon() ? '1' : '0',
										'emphasize' => $fieldrow->isEmphasized() ? '1' : '0',
										'datagroup' => $fieldrow->getDatagroup(),
										'fields' => array()
									);
									$fieldrowLabel = $fieldrow->getLabel() != '' ? $fieldrow->getLabel() : $this->get('translator')->trans('Fieldrow %id% (nolabel)', array('%id%' => $fieldrow->getId()));
									$ofieldrows[] = array (
										"label" => $fieldrowLabel,
										"name" => $fieldrow->getId()
									);
									$ofields = array();
									$oprenotes = array();
									$opostnotes = array();
									foreach ($fieldrow->getFields() as $field) {
										$tfield = array(
											'position' => $field->getPosition(),
											'data' => $field->getData(),
											'usage' => $field->getUsage(),
											'label' => $field->getLabel(),
											'newline' => $field->isNewline() ? '1' : '0',
											'prompt' => $field->getPrompt(),
											'required' => $field->isRequired() ? '1' : '0',
											'visibleRequired' => $field->isVisibleRequired() ? '1' : '0',
											'colon' => $field->hasColon() ? '1' : '0',
											'underlabel' => $field->isUnderlabel() ? '1' : '0',
											'help' => $field->hasHelp() ? '1' : '0',
											'emphasize' => $field->isEmphasized() ? '1' : '0',
											'explanation' => $field->getExplanation(),
											'expanded' => $field->isExpanded() ? '1' : '0',
											'widget' => $field->getWidget()
										);
										$fieldLabel = $field->getLabel() != '' ? $field->getLabel() : $this->get('translator')->trans('Field %id% (nolabel)', array('%id%' => $field->getPosition()));
										$ofields[] = array (
											"label" => $fieldLabel,
											"name" => $field->getPosition()
										);
										if ($field->getPreNote()) {
											$tfield['preNote'] = array(
												'text' => $field->getPreNote()->getText()
											);
											$oprenotes[] = array(
												'label' => $fieldLabel,
												'name' => $field->getPosition()
											);
										}
										if ($field->getPostNote()) {
											$tfield['postNote'] = array(
												'text' => $field->getPostNote()->getText()
											);
											$opostnotes[] = array(
												'label' => $fieldLabel,
												'name' => $field->getPosition()
											);
										}
										$tfieldrow['fields'][] = $tfield;
									}
									if (count($ofields) > 0) {
										$ofieldrowfields[] = array(
											"label" => $fieldrowLabel,
											"name" => $fieldrow->getId(),
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
										$ofieldrowprenotes[] = array(
											"label" => $fieldrowLabel,
											"name" => $fieldrow->getId(),
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
										$ofieldrowpostnotes[] = array(
											"label" => $fieldrowLabel,
											"name" => $fieldrow->getId(),
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
									$tblock['fieldrows'][] = $tfieldrow;
								}
							}
							if (count($ocolumns) > 0) {
								$ofieldsetcolumns[] = array(
									"label" => $fieldsetLabel,
									"name" => $fieldset->getId(),
									"fields" => array(
										array(
											"label" => $this->get('translator')->trans('whose label is'),
											"name" => "columnId",
											"fieldType" => "select",
											"options" => $ocolumns
										)
									)
								);
							}
							if (count($ofieldrows) > 0) {
								$ofieldsetfieldrows[] = array(
									"label" => $fieldsetLabel,
									"name" => $fieldset->getId(),
									"fields" => array(
										array(
											"label" => $this->get('translator')->trans('whose label is'),
											"name" => "fieldrowId",
											"fieldType" => "select",
											"options" => $ofieldrows
										)
									)
								);
							}
							if (count($ofieldrowfields) > 0) {
								$ofieldsetfields[] = array(
									"label" => $fieldsetLabel,
									"name" => $fieldset->getId(),
									"fields" => array(
										array(
											"label" => $this->get('translator')->trans("of fieldrow"),
											"name" => "fieldrowId",
											"fieldType" => "select",
											"options" => $ofieldrowfields
										)
									)
								);
							}
							$tpanel['blocks'][] = $tblock;
						} elseif ($block instanceof BlockInfo) {
							$tblock = array(
								'type' => 'blockinfo',
								'id' => $block->getId(),
								'name' => $block->getName(),
								'label' => $block->getLabel(),
								'chapters' => array()
							);
							$blockinfo = $block;
							$blockinfoLabel = $blockinfo->getLabel() != '' ? $blockinfo->getLabel() : $this->get('translator')->trans('Blockinfo %id% (nolabel)', array('%id%' => $blockinfo->getId()));
							$oblockinfos[] = array (
								"label" => $blockinfoLabel,
								"name" => $blockinfo->getId()
							);
							$ochapters = array ();
							$ochaptersections = array ();
							foreach ($blockinfo->getChapters() as $chapter) {
								$tchapter = array(
									'id' => $chapter->getId(),
									'name' => $chapter->getName(),
									'label' => $chapter->getLabel(),
									'icon' => $chapter->getIcon(),
									'collapsible' => $chapter->isCollapsible() ? '1' : '0',
									'sections' => array()
								);
								$chapterLabel = $chapter->getLabel() != '' ? $chapter->getLabel() : $this->get('translator')->trans('Chapter %id% (nolabel)', array('%id%' => $chapter->getId()));
								$ochapters[] = array (
									"label" => $chapterLabel,
									"name" => $chapter->getId()
								);
								$osections = array ();
								foreach ($chapter->getSections() as $section) {
									$tsection = array(
										'id' => $section->getId(),
										'name' => $section->getName(),
										'label' => $section->getLabel(),
										'content' => $section->getContent(),
										'annotations' => $section->getAnnotations()
									);
									$sectionLabel = $section->getLabel() != '' ? $section->getLabel() : $this->get('translator')->trans('Section %id% (nolabel)', array('%id%' => $section->getId()));
									$osections[] = array (
										"label" => $sectionLabel,
										"name" => $section->getId()
									);
									$tchapter['sections'][] = $tsection;
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
								$tblock['chapters'][] = $tchapter;
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
							$tpanel['blocks'][] = $tblock;
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
					if (count($ofieldsetcolumns) > 0) {
						$opanelcolumns[] = array(
							"label" => $panelLabel,
							"name" => $panel->getId(),
							"fields" => array(
								array(
									"label" => $this->get('translator')->trans("of fieldset"),
									"name" => "fieldsetId",
									"fieldType" => "select",
									"options" => $ofieldsetcolumns
								)
							)
						);
					}
					if (count($ofieldsetfieldrows) > 0) {
						$opanelfieldrows[] = array(
							"label" => $panelLabel,
							"name" => $panel->getId(),
							"fields" => array(
								array(
									"label" => $this->get('translator')->trans("of fieldset"),
									"name" => "fieldsetId",
									"fieldType" => "select",
									"options" => $ofieldsetfieldrows
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
					$tstep['panels'][] = $tpanel;
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
				if (count($opanelcolumns) > 0) {
					$ostepcolumns[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelcolumns
							)
						)
					);
				}
				if (count($opanelfieldrows) > 0) {
					$ostepfieldrows[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelfieldrows
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
					$tactionbutton = array(
						'name' => $action->getName(),
						'label' => $action->getLabel(),
						'what' => $action->getWhat(),
						'for' => $action->getFor(),
						'uri' => $action->getUri(),
						'class' => $action->getClass()
					);
					$oactionbuttons[] = array(
						'label' => $action->getLabel(),
						'name' => $action->getName()
					);
					$tstep['actions'][] = $tactionbutton;
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
					$tfootnotes = array(
						'position' => $footnoteList->getPosition(),
						'footNotes' => array()
					);
					foreach ($footnoteList->getFootNotes() as $footnote) {
						$tfootnote = array(
							'id' => $footnote->getId(),
							'text' => $footnote->getText()
						);
						$ofootnotes[] = array(
							'label' => $this->get('translator')->trans('FootNote %id%', array('%id%' => $footnote->getId())),
							'name' => $footnote->getId()
						);
						$tfootnotes['footNotes'][] = $tfootnote;
					}
					$tstep['footNotes'] = $tfootnotes;
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
				$this->steps[] = $tstep;
			}
			if (count($osteps) > 0) {
				$steps = array(
						"label" => $this->get('translator')->trans("the step"),
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
						"label" => $this->get('translator')->trans("the panel"),
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
						"label" => $this->get('translator')->trans("the fieldset"),
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
			if (count($ostepcolumns) > 0) {
				$columns = array(
						"label" => $this->get('translator')->trans("the column"),
						"name" => "column",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepcolumns
							)
						)
				);
			}
			if (count($ostepfieldrows) > 0) {
				$fieldrows = array(
						"label" => $this->get('translator')->trans("the fieldrow"),
						"name" => "fieldrow",
						"fields" => array(
							array(
								"label" => $this->get('translator')->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepfieldrows
							)
						)
				);
			}
			if (count($ostepfields) > 0) {
				$fields = array(
						"label" => $this->get('translator')->trans("the field"),
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
						"label" => $this->get('translator')->trans("the prenote"),
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
						"label" => $this->get('translator')->trans("the postnote"),
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
						"label" => $this->get('translator')->trans("the blockinfo"),
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
						"label" => $this->get('translator')->trans("the chapter"),
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
						"label" => $this->get('translator')->trans("the section"),
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
						"label" => $this->get('translator')->trans("the footnote"),
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
						"label" => $this->get('translator')->trans("the actionbutton"),
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
				'label' => $this->get('translator')->trans('the choice'),
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
		if (count($columns) > 0) {
			$objects[] = $columns;
		}
		if (count($fieldrows) > 0) {
			$objects[] = $fieldrows;
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
								'label' => $this->get('translator')->trans('the data'),
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
								'label' => $this->get('translator')->trans('the dataset'),
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
								'label' => $this->get('translator')->trans('the data'),
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
								'label' => $this->get('translator')->trans("the content"), 
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
								'label' => $this->get('translator')->trans("the default"), 
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
								'label' => $this->get('translator')->trans("the minimum"), 
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
								'label' => $this->get('translator')->trans("the maximum"), 
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
								'label' => $this->get('translator')->trans("the result index"), 
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
								'label' => $this->get('translator')->trans("the explanation"), 
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
			),
			array(
				'label' => $this->get('translator')->trans("Unset"), 
				'name' => "unsetAttribute", 
				'fields' => array(
					array(
						'label' => "",
						'name' => "attributeId",
						'fieldType' => "select",
						'options' => array(
							array(
								'label' => $this->get('translator')->trans("the content"), 
								'name' => "content", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => $this->get('translator')->trans("the default"), 
								'name' => "default", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => $this->get('translator')->trans("the minimum"), 
								'name' => "min", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => $this->get('translator')->trans("the maximum"), 
								'name' => "max", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => $this->get('translator')->trans("the result index"), 
								'name' => "index", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => $this->get('translator')->trans("the explanation"), 
								'name' => "explanation", 
								'fields' => array(
									array(
										'label' => $this->get('translator')->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
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
							$step = $action->getStep();
							$panel = $action->getPanel();
							$fieldset = $action->getFieldset();
							$disposition = $this->simu->getStepById($step)->getPanelById($panel)->getFieldSetById($fieldset)->getDisposition();
							if ($disposition == 'grid') {
								$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
										array('name' => 'objectId',	'value' => $target, 'fields' => array(
												array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
														array('name' => 'panelId', 'value' => $action->getPanel(), 'fields' => array(
																array('name' => 'fieldsetId', 'value' => $action->getFieldset(), 'fields' => array(
																		array('name' => 'fieldrowId', 'value' => $action->getFieldrow(), 'fields' => array(
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
										)
									)
								);
							} else {
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
							}
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
						case 'column':
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId',	'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'panelId', 'value' => $action->getPanel(), 'fields' => array(
															array('name' => 'fieldsetId', 'value' => $action->getFieldset(), 'fields' => array(
																	array('name' => 'columnId', 'value' => $action->getTargetId())
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
						case 'fieldrow':
							$clause = array('name' => 'action-select', 'value' => $action->getName(), 'fields' => array(
									array('name' => 'objectId',	'value' => $target, 'fields' => array(
											array('name' => 'stepId', 'value' => $action->getStep(), 'fields' => array(
													array('name' => 'panelId', 'value' => $action->getPanel(), 'fields' => array(
															array('name' => 'fieldsetId', 'value' => $action->getFieldset(), 'fields' => array(
																	array('name' => 'fieldrowId', 'value' => $action->getTargetId())
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
				case 'unsetAttribute':
					$clause = array('name' => 'action-select', 'value' => 'unsetAttribute', 'fields' => array(
							array('name' => 'attributeId', 'value' => $target, 'fields' => array(
									array('name' => 'fieldName', 'value' => $this->findDataNameById($action->getData()))
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

	public function findAction($name, $fromNode) {
		foreach ($fromNode as $action) {
			if ($action['name'] == $name) {
				return $action;
			}
		}
		return null;
	}

	public function findActionField($fields, $currentNode) {
		foreach ($fields as $field) {
			$name = array_keys($field)[0];
			$value = $field[$name];
			$currentNode = $this->findActionOption($name, $value, $currentNode);
			if ($currentNode == null) { 
				return null; 
			}
		}
		return $currentNode;
	}

	public function findActionOption($name, $value, $node) {
		$fields = isset($node['fields']) ? $node['fields'] : array();
		foreach ($fields as $field) {
			if ($field['name'] == $name) {
				$options =  isset($field['options']) ? $field['options'] : array();
				foreach ($options as $option) {
					if ($option['name'] == $value) {
						return $option;
					}
				}
			}
		}
		return null;
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
				$headers = array();
				foreach ($params as $param) {
					if ($param->getOrigin() == 'data') {
						$value = $this->formatParamValue($param);
					} else {
						$value = $param->getConstant();
					}
					if ($value === null) {
						return null;
					}
					$value = urlencode($value);
					if ($param->getType() == 'path') {
						$path .= "/".$value;
					} elseif ($param->getType() == 'data') {
						$name = $param->getName();
						if (isset($datas[$name])) {
							$datas[$name][] = $value;
						}  else {
							$datas[$name] = array($value);
						}
					} elseif ($param->getType() == 'header') {
						if ($value != '') {
							$name = 'HTTP_' . str_replace('-', '_', strtoupper($param->getName()));
							$headers[] = array(
								$name => $value
							);
						}
					} elseif ($value != '' || ! $param->isOptional()) {
						$query .= "&".urlencode($param->getName())."=".$value;
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
					$result = $client->get($uri, $headers);
				} else {
					$result = $client->post($uri, $headers, $datas);
				}
				break;
			case 'database':
			case 'internal':
				$args = array();
				$args[] = $source->getRequest();
				foreach ($params as $param) {
					if ($param->getOrigin() == 'data') {
						$value = $this->formatParamValue($param);
					} else {
						$value = $param->getConstant();
					}
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
		$result = preg_replace_callback(
			'/\<var\s+[^\s]*\s*data-id="(\d+)(L?)"[^\>]*\>[^\<]+\<\/var\>/',
			array($this, 'replaceVariable'),
			$result
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
