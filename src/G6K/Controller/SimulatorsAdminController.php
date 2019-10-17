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

namespace App\G6K\Controller;

use App\G6K\Model\Simulator;
use App\G6K\Model\Source;
use App\G6K\Model\Parameter;
use App\G6K\Model\ChoiceGroup;
use App\G6K\Model\Choice;
use App\G6K\Model\ChoiceSource;
use App\G6K\Model\DataGroup;
use App\G6K\Model\Data;
use App\G6K\Model\Step;
use App\G6K\Model\Action;
use App\G6K\Model\FootNotes;
use App\G6K\Model\FootNote;
use App\G6K\Model\Panel;
use App\G6K\Model\FieldSet;
use App\G6K\Model\Column;
use App\G6K\Model\FieldRow;
use App\G6K\Model\Field;
use App\G6K\Model\BlockInfo;
use App\G6K\Model\FieldNote;
use App\G6K\Model\Chapter;
use App\G6K\Model\Section;
use App\G6K\Model\BusinessRule;
use App\G6K\Model\Connector;
use App\G6K\Model\Condition;
use App\G6K\Model\RuleAction;
use App\G6K\Model\Profiles;
use App\G6K\Model\Profile;
use App\G6K\Model\RichText;

use App\G6K\Manager\ControllersTrait;
use App\G6K\Manager\SQLSelectTokenizer;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Finder\Finder;

/**
 *
 * The SimulatorsAdminController class is the controller that handles all actions of the simulator management interface.
 *
 * These actions are:
 *
 * - Creation of a simulator
 * - Modification of a simulator
 * - Import / Export of a simulator
 * - Publication of a simulator
 * - Deletion of a simulator
 *
 * @author Jacques Archimède
 *
 */
class SimulatorsAdminController extends BaseAdminController {

	use ControllersTrait;

	/**
	 * @const string
	 */
	const SQL_SELECT_KEYWORD = 'SELECT ';

	/**
	 * @const string
	 */
	const SQL_FROM_KEYWORD = 'FROM ';

	/**
	 * @const string
	 */
	const SQL_WHERE_KEYWORD = 'WHERE ';

	/**
	 * @const string
	 */
	const SQL_ORDER_BY_KEYWORD = 'ORDER BY ';

	/**
	 * @const string
	 */
	const SQL_LIMIT_KEYWORD = 'LIMIT ';

	/**
	 * @var \App\G6K\Model\Simulator|null $simu Instance of the Simulator class
	 *
	 * @access  public
	 *
	 */
	public $simu = null;

	/**
	 * @var array      $dataset array of data defined in the simulator for use in Javascript functions
	 *
	 * @access  private
	 *
	 */
	private $dataset = array();

	/**
	 * @var array      $actions array of business rules actions for use in Javascript functions
	 *
	 * @access  private
	 *
	 */
	private $actions = array();

	/**
	 * @var array      $rules array of business rules for use in Javascript functions
	 *
	 * @access  private
	 *
	 */
	private $rules = array();

	/**
	 * @var array      $steps array of steps  for use in Javascript functions
	 *
	 * @access  private
	 *
	 */
	private $steps = array();

	/**
	 * @var array      $uricache cache of uris
	 *
	 * @access  public
	 *
	 */
	public $uricache = array();

	/**
	 * Entry point for the route paths begining by /admin/simulators
	 *
	 * These route paths are :
	 *
	 * - /admin/simulators
	 * - /admin/simulators/{simulator}
	 * - /admin/simulators/{simulator}/{crud}
	 * 
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string|null $simulator (default: null) simulator name
	 * @param   string|null $crud (default: null) operation to execute on the simulator (create, save, import, doimport, export, publish)
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response <description of the return value>
	 *
	 */
	public function index(Request $request, $simulator = null, $crud = null)
	{
		$this->initialize();
		$this->uricache = array();
		return $this->runIndex($request, $simulator, $crud);
	}

	/**
	 * Dispatches the index action to the appropriate processing based on the value of the crud parameter.
	 *
	 * If the crud parameter contains no value, shows the simulator management interface.
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $simulator simulator name
	 * @param   string $crud (default: null) operation to execute on the simulator (create, save, import, doimport, export, publish)
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse|\Symfony\Component\HttpFoundation\Response <description of the return value>
	 *
	 */
	protected function runIndex(Request $request, $simulator, $crud)
	{
		if ($crud == 'export') {
			return $this->doExportSimulator($simulator);
		} elseif ($crud == 'publish') {
			return $this->doPublishSimulator($request, $simulator);
		} elseif ($crud == 'deploy') {
			return $this->doDeploySimulator($request, $simulator);
		}
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;

		$simus = array_filter(scandir($this->simulatorsDir), function ($simu) { return preg_match("/.xml$/", $simu); } );

		$hiddens = array();
		$hiddens['script'] = $script;
		$hiddens['action'] = 'show';
		$simulators = array();
		$updated = false;
		$categories = [];
		$notCategorized = $this->getTranslator()->trans("Not categorized");
		foreach($simus as $simu) {
			$simupath = $this->simulatorsDir."/work/".$simu;
			if (! file_exists($simupath)) {
				$simupath = $this->simulatorsDir."/".$simu;
			}
			$s = new \SimpleXMLElement($simupath, LIBXML_NOWARNING, true);
			$file = preg_replace("/.xml$/", "", $simu);
			$simulators[] = array(
				'file' => $file, 
				'name' => $s['name'], 
				'label' => $s['label'], 
				'category' => (string)$s['category'] == '' ? 
					$notCategorized :
					$s['category'],
				'description' => array(
					'content' => $s->Description,
					'edition' => (string)$s->Description['edition']
				)
			);
			$category = (string)$s['category'];
			if ($category != '') {
				$categories[$category] = true;
			}
			if ($simulator !== null && $file == $simulator) {
				$this->simu = new Simulator($this);
				try {
					if (file_exists($this->simulatorsDir."/work/".$simu)) {
						$this->simu->load($this->simulatorsDir."/work/".$simu);
						$updated = true;
					} else {
						$this->simu->load($this->simulatorsDir."/".$simu);
					}
					$this->loadBusinessRules();
				} catch (\Exception $e) {
					$this->simu = null;
				}
			}
		}
		usort($simulators, function($a, $b) use ($notCategorized) {
			$cmp = strcmp($a["category"], $b["category"]);
			if ($cmp == 0) {
				return strcmp($a["label"], $b["label"]);
			} elseif ($a["category"] == $notCategorized) {
				return 1;
			} elseif ($b["category"] == $notCategorized) {
				return -1;
			} else {
				return $cmp;
			}
		});
		$categories = array_keys($categories);
		$hiddens['updated'] = $updated;
		if ($crud == 'create') {
			$hiddens['action'] = 'create';
			$this->simu = new Simulator($this);
			$this->simu->loadEmptySimulator();
			$this->loadBusinessRules();
		} elseif ($crud == 'clone') {
			$hiddens['action'] = 'clone';
			$hiddens['cloned'] = $simulator;
			$this->simu->setName($this->getTranslator()->trans("new"));
			$this->simu->setLabel($this->getTranslator()->trans("Simulator of calculation of ..."));
		} elseif ($crud == 'save') {
			if (isset($form['create']) || isset($form['clone'])) {
				return $this->doCreate($simulator, $form);
			} elseif (isset($form['update'])) {
				$this->update($simulator, $form);
				return new RedirectResponse($this->generateUrl('eureka_g6k_admin_simulator', array('simulator' => $this->simu->getName())));
			} elseif (isset($form['delete'])) {
				$this->doDeleteWorkingVersion($simulator);
				return new RedirectResponse($this->generateUrl('eureka_g6k_admin_simulators'));
			}
		} elseif ($crud == 'delete-working-version') {
			$this->doDeleteWorkingVersion($simulator);
			return new RedirectResponse($this->generateUrl('eureka_g6k_admin_simulator', array('simulator' => $simulator)));
		} elseif ($crud == 'delete') {
			$this->doDelete($simulator);
			return new RedirectResponse($this->generateUrl('eureka_g6k_admin_simulators'));
		} elseif ($crud == 'import') {
			$hiddens['action'] = 'import';
		} elseif ($crud == 'doimport') {
			return $this->doImportSimulator($request);
		}
		$views = array();
		$dirs = scandir($this->viewsDir);
		foreach ($dirs as $dir) {
			if ($dir != "." && $dir != ".." && $dir != "admin" && $dir != "base" && $dir != "bundles" && $dir != "Theme") {
				$o = $this->viewsDir . "/" . $dir;
				if (filetype($o) == "dir") {
					$views[$dir] = $dir;
				}
			}
		}
		$sources = new \SimpleXMLElement($this->databasesDir."/DataSources.xml", LIBXML_NOWARNING, true);
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
		if ($this->simu !== null) {
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
		if ($simulator !== null && $simulator != 'new') {
			$command = [
				'command' => 'g6k:simulator:validate',
				'simulatorname' => $simulator
			];
			if (file_exists($this->simulatorsDir . '/work/' . $simulator . '.xml')) {
				$command['--working-version'] = true;
			}
			$valid = $this->runConsoleCommand($command);
		}
		$ua = new \Detection\MobileDetect();
		$widgets = $this->getWidgets();
		$typewidgets = $this->getWidgetsByType();
		$inputwidgets = $this->getWidgetsByInputType();
		$functions = $this->getFunctions();
		$deployment = 	$this->hasParameter('deployment') && 
						$this->authorizationChecker->isGranted('ROLE_MANAGER') && 
						$simulator !== null && $simulator != 'new' && $valid &&
						!file_exists($this->simulatorsDir . '/work/' . $simulator . '.xml');
		try {
			return $this->render(
				'admin/pages/simulators.html.twig',
				array(
					'ua' => $ua,
					'browserengine' => $this->getBrowserEngine($request),
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'nav' => 'simulators',
					'categories' => $categories,
					'simulators' => $simulators,
					'simulator' => $this->simu,
					'valid' => $valid,
					'dataset' => $this->dataset,
					'steps' => $this->steps,
					'actions' => $this->actions,
					'rules' => $this->rules,
					'datasources' => $datasources,
					'views' => $views,
					'languages' => $this->getLanguages(),
					'hiddens' => $hiddens,
					'script' => $script,
					'view' => null,
					'widgets' => $widgets,
					'typewidgets' => $typewidgets,
					'inputwidgets' => $inputwidgets,
					'functions' => $functions,
					'deployment' => $deployment
				)
			);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $e;
		}
	}

	/**
	 * Entry point for the route path /admin/regional-settings/{locale}
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $locale 
	 * @return  \Symfony\Component\HttpFoundation\Response The regional settings in json format
	 *
	 */
	public function regionalSettings(Request $request, $locale)
	{
		$this->initialize();
		$settings = $this->getRegionalSettings($locale);
		$response = new Response();
		$response->setContent(json_encode($settings, JSON_UNESCAPED_UNICODE));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	/**
	 * Entry point for the route path : /admin/validate
	 *
	 * Validates the xml file of the simulator against the XML schema.
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
	public function validate(Request $request) {
		$this->initialize();
		return $this->runValidation($request);
	}

	/**
	 * Validates the xml file of the simulator, whose name appears in the 'xml' field of the form passed by the query, against the XML schema
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
	protected function runValidation(Request $request) {
		$form = $request->request->all();
		$schema = $this->projectDir."/var/doc/Simulator.xsd";
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

	/**
	 * Creates a simulator with the data in the form fields.
	 *
	 * Route path : /admin/simulators/{simulator}/save
	 *
	 * $form['create'] isset
	 *
	 * @access  protected
	 * @param   string $simulator simulator name
	 * @param   array $form The form fields
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse
	 *
	 */
	protected function doCreate($simulator, $form) {
		$this->simu = new Simulator($this);
		$this->simu->loadEmptySimulator();
		$this->update($simulator, $form);
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_simulator', array('simulator' => $this->simu->getName())));
	}

	/**
	 * Updates the simulator whose name is in the $simulator parameter with the data in the form fields.
	 *
	 * Route path : /admin/simulators/{simulator}/save
	 *
	 * $form['update'] isset
	 *
	 * @access  protected
	 * @param   string $simulator simulator name
	 * @param   mixed $form The form fields
	 * @return  void
	 *
	 */
	protected function update($simulator, $form) {
		$fs = new Filesystem();
		$simulatorData = json_decode($form['simulator'], true);
		$this->simu->setName($simulatorData["name"]);
		$this->simu->setLabel($simulatorData["label"]);
		$this->simu->setCategory($simulatorData["category"]);
		$this->simu->setDefaultView($simulatorData["defaultView"]);
		$this->simu->setReferer($simulatorData["referer"]);
		$this->simu->setLocale($simulatorData["locale"]);
		$this->simu->setTimezone($simulatorData["timezone"]);
		$this->simu->setDynamic($simulatorData['dynamic'] == '1');
		$this->simu->setMemo($simulatorData['memo'] == '1');
		$this->simu->setDescription(
			new RichText(
				trim($this->replaceSpecialTags($simulatorData['description']['content'])),
				$simulatorData['description']['edition']
			)
		);
		$this->simu->setRelatedInformations(
			new RichText(
				trim($this->replaceSpecialTags($simulatorData['relatedInformations']['content'])),
				$simulatorData['relatedInformations']['edition']
			)
		);
		$this->simu->setDateFormat($simulatorData['dateFormat']);
		$this->simu->setDecimalPoint($simulatorData['decimalPoint']);
		$this->simu->setGroupingSeparator($simulatorData['groupingSeparator']);
		$this->simu->setGroupingSize($simulatorData['groupingSize']);
		$this->simu->setMoneySymbol($simulatorData['moneySymbol']);
		$this->simu->setSymbolPosition($simulatorData['symbolPosition']);
		if (isset($form['create']) || isset($form['clone'])) {
			$simulator = $simulatorData["name"];
		}

		$datas = json_decode($form['datas'], true);
		$this->simu->setDatas(array());
		foreach($datas as $i => $data) {
			if ($data['element'] == 'datagroup') {
				$this->simu->addData($this->makeDataGroup($data));
			} else {
				$this->simu->addData($this->makeData($data));
			}
		}

		$steps = json_decode($form['steps'], true);
		$this->simu->setSteps(array());
		$step0 = false;
		foreach($steps as $s => $step) {
			$stepObj = $this->makeStep($step);
			if ($stepObj->getId() == 0) {
				$step0 = true;
			}
			$this->simu->addStep($stepObj);
		}
		if (!$step0) {
			$this->simu->setDynamic(false);
		}

		$rulesData = json_decode($form['rules'], true);
		$this->simu->setBusinessRules(array());
		foreach($rulesData as $id => $brule) {
			$this->simu->addBusinessRule($this->makeBusinessRule($brule));
		}

		$sources = json_decode($form['sources'], true);
		$this->simu->setSources(array());
		foreach($sources as $id => $source) {
			$this->simu->addSource($this->makeSource($source));
		}

		$profiles = json_decode($form['profiles'], true);
		$this->simu->setProfiles($this->makeProfiles($profiles));

		if (isset($form['create']) || isset($form['clone'])) {
			$this->simu->save($this->simulatorsDir."/".$simulator.".xml");
		} else {
			$this->simu->save($this->simulatorsDir."/work/".$simulator.".xml");
		}
		$view = $this->simu->getDefaultView();
		if ($view != '' && ! $fs->exists($this->publicDir.'/assets/'.$view.'/css/'.$simulator.'.css')) {
			if (isset($form['clone']) && $fs->exists($this->publicDir.'/assets/'.$view.'/css/'.$form['cloned'].'.css')) {
				$fs->copy($this->publicDir.'/assets/'.$view.'/css/'.$form['cloned'].'.css', $this->publicDir.'/assets/'.$view.'/css/'.$simulator.'.css');
			} elseif ($fs->exists($this->publicDir.'/assets/'.$view.'/css/common.css')) {
				$fs->dumpFile($this->publicDir.'/assets/'.$view.'/css/'.$simulator.'.css', '@import "common.css";'."\n");
				$this->runConsoleCommand(array(
					'command' => 'g6k:assets:manifest:add-asset',
					'assetpath' => 'assets/'.$view.'/css/'.$simulator.'.css'
				));
			}
		}
		if ($simulator != $simulatorData["name"]) {
			$fs->rename($this->simulatorsDir."/work/".$simulator.".xml", $this->simulatorsDir."/work/".$simulatorData["name"].".xml");
			$this->doRename($simulator, $simulatorData["name"]);
		}
	}

	/**
	 * Deletes a simulator whose name is in the $simulator parameter
	 *
	 * Route path : /admin/simulators/{simulator}/delete
	 *
	 * @access  protected
	 * @param   string $simulator simulator name
	 * @return  void
	 *
	 */
	protected function doDelete($simulator) {
		$fs = new Filesystem();
		try {
			$this->doDeleteWorkingVersion($simulator);
			if ($fs->exists($this->simulatorsDir."/".$simulator.".xml")) {
				$fs->remove($this->simulatorsDir."/".$simulator.".xml");
			}
			$finder = new Finder();
			$finder->name($simulator.'.css')->in($this->publicDir.'/assets')->exclude('admin')->exclude('base')->exclude('bundles');
			foreach ($finder as $file) {
				$fs->remove($file->getRealPath());
				$this->runConsoleCommand(array(
					'command' => 'g6k:assets:manifest:remove-asset',
					'assetpath' => 'assets/' . $file->getRelativePathname()
				));
			}
		} catch (\Exception $e) {
		}
	}

	/**
	 * Renames a simulator 
	 *
	 * @access  protected
	 * @param   string $oldName old name
	 * @param   string $newName new name
	 * @return  void
	 *
	 */
	protected function doRename($oldName, $newName) {
		$fs = new Filesystem();
		try {
			$simulator = new \DOMDocument();
			$simulator->preserveWhiteSpace  = false;
			$simulator->formatOutput = true;
			$simulator->load($this->simulatorsDir."/".$oldName.".xml");
			$simulator->documentElement->setAttribute('name', $newName);
			$simulator->save($this->simulatorsDir."/".$newName.".xml");
			$fs->remove($this->simulatorsDir."/".$oldName.".xml");
			$finder = new Finder();
			$finder->name($oldName.'.css')->in($this->publicDir.'/assets')->exclude('admin')->exclude('base')->exclude('bundles');
			foreach ($finder as $file) {
				$this->runConsoleCommand(array(
					'command' => 'g6k:assets:manifest:remove-asset',
					'assetpath' => 'assets/' . $file->getRelativePathname()
				));
				$fs->rename($file->getRealPath(), $file->getPath() . '/' . $newName.'.css');
				$this->runConsoleCommand(array(
					'command' => 'g6k:assets:manifest:add-asset',
					'assetpath' => 'assets/' . dirname($file->getRelativePathname()) . '/' . $newName.'.css'
				));
			}
		} catch (\Exception $e) {
		}
	}

	/**
	 * Deletes a simulator whose name is in the $simulator parameter
	 *
	 * Route path : /admin/simulators/{simulator}/delete-working-version
	 *
	 * or /admin/simulators/{simulator}/save and $form['delete'] isset
	 *
	 * @access  protected
	 * @param   string $simulator simulator name
	 * @return  void
	 *
	 */
	protected function doDeleteWorkingVersion($simulator) {
		$fs = new Filesystem();
		try {
			if ($fs->exists($this->simulatorsDir."/work/".$simulator.".xml")) {
				$fs->remove($this->simulatorsDir."/work/".$simulator.".xml");
			}
		} catch (\Exception $e) {
		}
	}

	/**
	 * Creates a Source object from an associative array of source attributes
	 *
	 * @access  protected
	 * @param   array $source array of attributes
	 * @return  \App\G6K\Model\Source the Source object
	 *
	 */
	protected function makeSource($source) {
		$sourceObj = new Source($this->simu, (int)$source['id'], $source['datasource'], $source['returnType']);
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
				$sourceObj->addParameter($this->makeParameter($parameter, $sourceObj));
			}
		}
		return $sourceObj;
	}

	/**
	 * Creates a Parameter object for a Source from an associative array of parameter attributes
	 *
	 * @access  protected
	 * @param   array $parameter array of attributes
	 * @param   \App\G6K\Model\Source $sourceObj the Source object
	 * @return  \App\G6K\Model\Parameter the Parameter object
	 *
	 */
	protected function makeParameter($parameter, $sourceObj) {
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
		return $parameterObj;
	}

	/**
	 * Creates a DataGroup object from an associative array of datagroup attributes
	 *
	 * @access  protected
	 * @param   array $datagroup array of attributes
	 * @return  \App\G6K\Model\DataGroup the DataGroup object
	 *
	 */
	protected function makeDataGroup($datagroup) {
		$dataGroupObj = new DataGroup($this->simu, (int)$datagroup['id'], $datagroup['name']);
		$dataGroupObj->setLabel($datagroup['label']);
		$dataGroupObj->setDescription(
			new RichText(
				trim($this->replaceSpecialTags($datagroup['description']['content'])),
				$datagroup['description']['edition']
			)
		);
		foreach ($datagroup['datas'] as $data) {
			$dataGroupObj->addData($this->makeData($data));
		}
		return $dataGroupObj;
	}

	/**
	 * Creates a Data object from an associative array of data attributes
	 *
	 * @access  protected
	 * @param   array $data array of attributes
	 * @return  \App\G6K\Model\Data the Data object
	 *
	 */
	protected function makeData($data) {
		$dataObj = new Data($this->simu, (int)$data['id'], $data['name']);
		$dataObj->setLabel($data['label']);
		$dataObj->setType($data['type']);
		if (isset($data['min'])) {
			$dataObj->setUnparsedMin($data['min']);
		}
		if (isset($data['max'])) {
			$dataObj->setUnparsedMax($data['max']);
		}
		if (isset($data['pattern'])) {
			$dataObj->setPattern($data['pattern']);
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
			$dataObj->setDescription(
				new RichText(
					trim($this->replaceSpecialTags($data['description']['content'])),
					$data['description']['edition']
				)
			);
		}
		return $dataObj;
	}

	/**
	 * Creates a Step object from an associative array of step attributes
	 *
	 * @access  protected
	 * @param   array $step array of attributes
	 * @return  \App\G6K\Model\Step the Step object
	 *
	 */
	protected function makeStep($step) {
		$stepObj = new Step($this->simu, (int)$step['id'], $step['name'], $step['label'], $step['template']);
		$stepObj->setOutput($step['output']);
		$stepObj->setPdfFooter(isset($step['pdfFooter']) && $step['pdfFooter'] == '1');
		$stepObj->setDescription(
			new RichText(
				trim($this->replaceSpecialTags($step['description']['content'])),
				$step['description']['edition']
			)
		);
		$stepObj->setDynamic($step['dynamic'] == '1');
		foreach ($step['panels'] as $p => $panel) {
			$stepObj->addPanel($this->makePanel($panel, $stepObj));
		}
		foreach ($step['actions'] as $action) {
			$stepObj->addAction($this->makeAction($action, $stepObj));
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
					$footnoteObj->setText(
						new RichText(
							trim($this->replaceSpecialTags($footnote['text']['content'])),
							$footnote['text']['edition']
						)
					);
					$footnotesObj->addFootNote($footnoteObj);
				}
				$stepObj->setFootNotes($footnotesObj);
			}
		}
		return $stepObj;
	}

	/**
	 * Creates a Panel object for a Step from an associative array of panel attributes
	 *
	 * @access  protected
	 * @param   array $panel array of attributes
	 * @param   \App\G6K\Model\Step $stepObj the Step object
	 * @return  \App\G6K\Model\Panel the Panel object
	 *
	 */
	protected function makePanel($panel, $stepObj) {
		$panelObj = new Panel($stepObj, (int)$panel['id']);
		$panelObj->setName($panel['name']);
		$panelObj->setLabel($panel['label']);
		foreach ($panel['blocks'] as $b => $block) {
			if ($block['type'] == 'fieldset') {
				$panelObj->addFieldSet($this->makeFieldSet($block, $panelObj));
			} elseif ($block['type'] == 'blockinfo') {
				$panelObj->addFieldSet($this->makeBlockInfo($block, $panelObj));
			}
		}
		return $panelObj;
	}

	/**
	 * Creates a FieldSet object for a Panel from an associative array of fieldset attributes
	 *
	 * @access  protected
	 * @param   array $fieldset array of attributes
	 * @param   \App\G6K\Model\Panel $panelObj the Panel object
	 * @return  \App\G6K\Model\FieldSet the FieldSet object
	 *
	 */
	protected function makeFieldSet($fieldset, $panelObj) {
		$fieldsetObj = new FieldSet($panelObj, (int)$fieldset['id']);
		$fieldsetObj->setLegend(
			new RichText(
				trim($this->replaceSpecialTags($fieldset['legend']['content'])),
				$fieldset['legend']['edition']
			)
		);
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
				$fieldsetObj->addField($this->makeFieldRow($fieldrow, $fieldsetObj));
			} 
		} else {
			foreach ($fieldset['fields'] as $field) {
				$fieldsetObj->addField($this->makeField($field, $fieldsetObj));
			}
		}
		return $fieldsetObj;
	}

	/**
	 * Creates a FieldRow object for a FieldSet from an associative array of fieldrow attributes
	 *
	 * @access  protected
	 * @param   array $fieldrow array of attributes
	 * @param   \App\G6K\Model\FieldSet $fieldsetObj the FieldSet object
	 * @return  \App\G6K\Model\FieldRow the FieldRow object
	 *
	 */
	protected function makeFieldRow($fieldrow, $fieldsetObj) {
		$fieldRowObj = new FieldRow($fieldsetObj, (int)$fieldrow['id'], $fieldrow['label']);
		$fieldRowObj->setColon($fieldrow['colon'] == '' || $fieldrow['colon'] == '1');
		$fieldRowObj->setHelp($fieldrow['help'] == '1');
		$fieldRowObj->setEmphasize($fieldrow['emphasize'] == '1');
		$fieldRowObj->setDataGroup($fieldrow['datagroup']);
		foreach ($fieldrow['fields'] as $field) {
			$fieldRowObj->addField($this->makeField($field, $fieldsetObj));
		}
		return $fieldRowObj;
	}

	/**
	 * Creates a Field object for a FieldSet from an associative array of field attributes
	 *
	 * @access  protected
	 * @param   array $field array of attributes
	 * @param   \App\G6K\Model\FieldSet $fieldsetObj the FieldSet object
	 * @return  \App\G6K\Model\Field the Field object
	 *
	 */
	protected function makeField($field, $fieldsetObj) {
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
		if ($fieldsetObj->getDisposition() != 'grid' && isset($field['Note'])) {
			$note = $field['Note'];
			if ($note['position'] == 'beforeField') {
				$noteObj = new FieldNote($fieldObj);
				$noteObj->setText(
					new RichText(
						trim($this->replaceSpecialTags($note['text']['content'])),
						$note['text']['edition']
					)
				);
				$fieldObj->setPreNote($noteObj);
			} elseif ($note['position'] == 'afterField') {
				$noteObj = new FieldNote($fieldObj);
				$noteObj->setText(
					new RichText(
						trim($this->replaceSpecialTags($note['text']['content'])),
						$note['text']['edition']
					)
				);
				$fieldObj->setPostNote($noteObj);
			}
		}
		return $fieldObj;
	}

	/**
	 * Creates a BlockInfo object for a Panel from an array associative of blockinfo attributes
	 *
	 * @access  protected
	 * @param   array $blockinfo array of attributes
	 * @param   \App\G6K\Model\Panel $panelObj the Panel object
	 * @return  \App\G6K\Model\BlockInfo the BlockInfo object
	 *
	 */
	protected function makeBlockInfo($blockinfo, $panelObj) {
		$blockinfoObj = new BlockInfo($panelObj, (int)$blockinfo['id']);
		$blockinfoObj->setName($blockinfo['name']);
		$blockinfoObj->setLabel($blockinfo['label']);
		if ($blockinfo['display'] != "") {
			$blockinfoObj->setDisplay($blockinfo['display']);
		}
		if ($blockinfo['popinLink'] != "") {
			$blockinfoObj->setPopinLink($blockinfo['popinLink']);
		}
		foreach ($blockinfo['chapters'] as $c => $chapter) {
			$blockinfoObj->addChapter($this->makeChapter($chapter, $blockinfoObj));
		}
		return $blockinfoObj;
	}

	/**
	 * Creates a Chapter object for a BlockInfo from an associative array of chapter attributes
	 *
	 * @access  protected
	 * @param   array $chapter array of attributes
	 * @param   \App\G6K\Model\BlockInfo $blockinfoObj the BlockInfo object
	 * @return  \App\G6K\Model\Chapter the Chapter object
	 *
	 */
	protected function makeChapter($chapter, $blockinfoObj) {
		$chapterObj = new Chapter($blockinfoObj, (int)$chapter['id']);
		$chapterObj->setName($chapter['name']);
		$chapterObj->setLabel($chapter['label']);
		$chapterObj->setIcon($chapter['icon']);
		$chapterObj->setCollapsible($chapter['collapsible'] == '1');
		foreach ($chapter['sections'] as $section) {
			$chapterObj->addSection($this->makeSection($section, $chapterObj));
		}
		return $chapterObj;
	}

	/**
	 * Creates a Section object for a Chapter from an associative array of section attributes
	 *
	 * @access  protected
	 * @param   array $section array of attributes
	 * @param   \App\G6K\Model\Chapter $chapterObj the Chapter object
	 * @return  \App\G6K\Model\Section the Section object
	 *
	 */
	protected function makeSection($section, $chapterObj) {
		$sectionObj = new Section($chapterObj, (int)$section['id']);
		$sectionObj->setName($section['name']);
		$sectionObj->setLabel($section['label']);
		$sectionObj->setContent(
			new RichText(
				trim($this->replaceSpecialTags($section['content']['content'])),
				$section['content']['edition']
			)
		);
		if (isset($section['annotations'])) {
			$sectionObj->setAnnotations(
				new RichText(
					trim($this->replaceSpecialTags($section['annotations']['content'])),
					$section['annotations']['edition']
				)
			);
		}
		return $sectionObj;
	}

	/**
	 * Creates a BusinessRule object from an associative array of business rule attributes
	 *
	 * @access  protected
	 * @param   array $brule array of attributes
	 * @return  \App\G6K\Model\BusinessRule the BusinessRule object
	 *
	 */
	protected function makeBusinessRule($brule) {
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
			$businessRuleObj->addIfAction($this->makeRuleAction($ida, $action));
		}
		foreach ($brule["elsedata"] as $ida => $action) {
			$businessRuleObj->addElseAction($this->makeRuleAction($ida, $action));
		}
		return $businessRuleObj;
	}

	/**
	 * Creates a RuleAction object from an associative array of action attributes
	 *
	 * @access  protected
	 * @param   int $id id of the latest rule action
	 * @param   array $action array of attributes
	 * @return  \App\G6K\Model\RuleAction the RuleAction object
	 *
	 */
	protected function makeRuleAction($id, $action) {
		$ruleActionObj = new RuleAction((int)$id + 1, (string)$action['value']);
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
						$ruleActionObj->setPanel($panel);
						$ruleActionObj->setFieldset($fieldset);
						$disposition = $this->findDisposition($ruleActionObj);
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
						$ruleActionObj->setPanel($panel);
						$ruleActionObj->setFieldset($fieldset);
						$disposition = $this->findDisposition($ruleActionObj);
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
						$ruleActionObj->setPanel($panel);
						$ruleActionObj->setFieldset($fieldset);
						$disposition = $this->findDisposition($ruleActionObj);
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
						$panel = $action['fields'][0]['fields'][0]['fields'][0]['value'];
						$fieldset = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
						$ruleActionObj->setPanel($panel);
						$ruleActionObj->setFieldset($fieldset);
						$disposition = $this->findDisposition($ruleActionObj);
						if ($disposition == 'grid') {
							$ruleActionObj->setFieldrow($action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value']);
							$position = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
							$choice = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
						} else {
							$position = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
							$choice = $action['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['fields'][0]['value'];
						}
						$ruleActionObj->setField($position);
						$ruleActionObj->setChoice($choice);
						break;
				}
				break;
		}
		return $ruleActionObj;
	}

	/**
	 * Creates a Profiles object from an associative array of profiles attributes
	 *
	 * @access  protected
	 * @param   array $profiles array of attributes
	 * @return  \App\G6K\Model\Profiles the Profiles object
	 *
	 */
	protected function makeProfiles($profiles) {
		$profilesObj = new Profiles($this->simu);
		$profilesObj->setLabel($profiles['label']);
		foreach ($profiles['profiles'] as $profile) {
			$profilesObj->addProfile($this->makeProfile($profile));
		}
		return $profilesObj;
	}

	/**
	 * Creates a Profile object from an associative array of profile attributes
	 *
	 * @access  protected
	 * @param   array $profile array of attributes
	 * @return  \App\G6K\Model\Profile the Profile object
	 *
	 */
	protected function makeProfile($profile) {
		$profileObj = new Profile($profile['id'], $profile['name']);
		$profileObj->setLabel($profile['label']);
		$profileObj->setDescription(
			new RichText(
				trim($this->replaceSpecialTags($profile['description']['content'])),
				$profile['description']['edition']
			)
		);
		foreach ($profile['datas'] as $data) {
			$profileObj->addData((int)$data['id'], $data['default']);
		}
		return $profileObj;
	}

	/**
	 * Creates an Action button object for a Step from an associative array of action attributes
	 *
	 * @access  protected
	 * @param   array $action array of attributes
	 * @param   \App\G6K\Model\Step $stepObj the Step object
	 * @return  \App\G6K\Model\Action the Action object
	 *
	 */
	protected function makeAction($action, $stepObj) {
		$actionObj = new Action($stepObj, $action['name'], $action['label']);
		$actionObj->setClass($action['class']);
		$actionObj->setWhat($action['what']);
		$actionObj->setFor($action['for']);
		$actionObj->setUri($action['uri']);
		$actionObj->setLocation($action['location']);
		$actionObj->setShape($action['shape']);
		return $actionObj;
	}

	/**
	 * Composes a simple SQL request from the supplied elements in the source associative array
	 *
	 * @access  private
	 * @param   array $source
	 * @return  string the SQL request string
	 *
	 */
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
		$request .= ' ' . self::SQL_FROM_KEYWORD . $source['table'];
		if ($source['filter'] != '' && $source['filter'] != 'true') {
			$request .= ' ' . self::SQL_WHERE_KEYWORD . $source['filter'];
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
			$request .= ' ' . self::SQL_ORDER_BY_KEYWORD . implode(', ', $orderbykeys);
		}
		$limit = $source['nbresult'];
		$offset = $source['from'];
		if ($limit > 0) {
			$request .= ' ' . self::SQL_LIMIT_KEYWORD . $limit;
			if ($offset > 0) {
				$request .= ' OFFSET ' . $offset;
			}
		} else if ($offset > 0 && $source['dbtype'] == 'pgsql') {
			$request .= ' ' . self::SQL_LIMIT_KEYWORD . 'ALL OFFSET ' . $offset;
		}
		$request = preg_replace_callback('/\$(\d+)\$([sdf])\b/', function($a) { 
			return '%' . $a[1] . '$' . $a[2]; 
		}, $request);
		return $request;
	}

	/**
	 * Creates a Connector or a Condition object from an associative array of attributes
	 *
	 * If the array contains the key 'all', 'any' or 'none' then a Connector object is returned else a Condition object is returned.
	 *
	 * @access  private
	 * @param   array $connector array of attributes
	 * @param   \App\G6K\Model\Connector $parentConnector (default: null) Parent connector
	 * @return  \App\G6K\Model\Connector|\App\G6K\Model\Condition
	 *
	 */
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

	/**
	 * Exports a simulator 
	 *
	 * Route path : /admin/simulators/{simulator}/export
	 *
	 * Creates a compressed file containing the XML definition and the stylesheet of the simulator for downloading by the user.
	 * The XML file is  the working version if it exists otherwise it is the published version.
	 *
	 * @access  protected
	 * @param   string $simu simulator name
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
	protected function doExportSimulator($simu) {
		if (file_exists($this->simulatorsDir . "/work/" . $simu . ".xml")) {
			$simu_file = $this->simulatorsDir . "/work/" . $simu . ".xml";
		} else {
			$simu_file = $this->simulatorsDir . "/" . $simu . ".xml";
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
		if (file_exists($this->publicDir . "/assets/" . $view . "/css/" . $simu . ".css")) {
			$content[] = array(
				'name' => $simu . ".css",
				'data' => file_get_contents($this->publicDir . "/assets/" . $view . "/css/" . $simu . ".css"),
				'modtime' => filemtime($this->publicDir . "/assets/" . $view . "/css/" . $simu . ".css")

			);
		}
		if ($simulator->Steps) {
			foreach ($simulator->Steps->Step as $step) {
				$output = (string)$step['output'];
				if ($output == 'inlineFilledPDF' || $output == 'downloadableFilledPDF') {
					$template = str_replace(':', '/', (string)$step['template']);
					$content[] = array(
						'name' => $template,
						'data' => file_get_contents($this->pdfFormsDir . "/" . $template),
						'modtime' => filemtime($this->pdfFormsDir . "/" . $template)

					);
					$info = $this->pdfFormsDir . "/" . pathinfo($template, PATHINFO_FILENAME) . ".info";
					if (file_exists($info)) {
						$content[] = array(
							'name' => basename($info),
							'data' => file_get_contents($info),
							'modtime' => filemtime($info)

						);
					}
				}
			}
		}
		$zipcontent = $this->zip($content);
		$response = new Response();
		$response->headers->set('Cache-Control', 'private');
		$response->headers->set('Content-type', 'application/octet-stream');
		$response->headers->set('Content-Disposition', sprintf('attachment; filename="%s"', (string)$simulator['name'] . ".zip"));
		$response->headers->set('Content-length', (string)strlen($zipcontent));
		$response->sendHeaders();
		$response->setContent($zipcontent);
		return $response;
	}

	/**
	 * Makes the header for an action report
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @param   string $simu The name of the simulator
	 * @param   string $heading The title of the header
	 * @return  string
	 *
	 */
	protected function makeReportHeader(Request $request, $simu, $heading){
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
		$ua = new \Detection\MobileDetect();
		return rtrim($this->renderView(
			'admin/pages/report/simulators-header.html.twig',
			array(
				'ua' => $ua,
				'browserengine' => $this->getBrowserEngine($request),
				'path' => $request->getScheme().'://'.$request->getHttpHost(),
				'nav' => 'simulators',
				'view' => null,
				'heading' => $heading,
				'simulator' => $simu,
				'script' => $script,
				'dataset' => array(),
				'steps' => array(),
				'actions' => array(),
				'rules' => array(),
				'datasources' => array(),
				'views' => array(),
				'widgets' => array(),
				'functions' => array(),
				'hiddens' => array()
			)
		));
	}

	/**
	 * Makes the footer for an action report
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @param   string $simu The name of the simulator
	 * @return  string
	 *
	 */
	protected function makeReportFooter(Request $request, $simu){
		$ua = new \Detection\MobileDetect();
		return $this->renderView(
			'admin/pages/report/simulators-footer.html.twig',
			array(
				'ua' => $ua,
				'browserengine' => $this->getBrowserEngine($request),
				'path' => $request->getScheme().'://'.$request->getHttpHost(),
				'nav' => 'simulators',
				'simulator' => $simu
			)
		);
	}

	/**
	 * Publishes a simulator ie copies the xml file of the simulator from the work directory to the main directory of simulators
	 *
	 * Route path : /admin/simulators/{simulator}/publish
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $simu simulator name
	 * @return  \Symfony\Component\HttpFoundation\StreamedResponse
	 *
	 */
	protected function doPublishSimulator(Request $request, $simu) {
		$translator = $this->translator;
		$heading = $translator->trans('Publishing of the « %simulator% » simulator.', array('%simulator%' => $simu));
		$header = $this->makeReportHeader($request, $simu, $heading);
		$footer = $this->makeReportFooter($request, $simu);
		$fs = new Filesystem();
		if ($fs->exists($this->simulatorsDir . "/work/" . $simu . ".xml")) {
			$response = $this->runStreamedConsoleCommand([
				'command' => 'g6k:simulator:validate',
				'simulatorname' => $simu,
				'--working-version' => true
			], function() use ($header) {
				print $header;
				flush();
			}, function($ok) use ($footer, $translator, $simu, $fs) {
				if ($ok) {
					$fs->copy($this->simulatorsDir . "/work/" . $simu . ".xml", $this->simulatorsDir . "/" . $simu . ".xml");
					print '<span class="alert-success">' . $translator->trans("The simulator « %simulator% » is successfully published.", ['%simulator%' => $simu]) . "</span>\n";
				} else {
					print '<span class="alert-danger">' . $translator->trans("The simulator « %simulator% » can't be published.", ['%simulator%' => $simu]) . "</span>\n";
				}
				print $footer . "\n";
				flush();
			});
		} else {
			$response = new StreamedResponse(function() use($header, $footer, $translator) {
				print $header;
				flush();
				print '<span class="alert-danger">' . $translator->trans("Unable to find the working version of the simulator « %simulator% »", ['%simulator%' => $simu]) . "</span>\n";
				print $footer."\n";
				flush();
			});
		}
		return $response;
	}

	/**
	 * Deploys a simulator on front-end servers
	 *
	 * Route path : /admin/simulators/{simulator}/deploy
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @param   string $simu The name of the simulator to deploy
	 * @return  \Symfony\Component\HttpFoundation\StreamedResponse
	 *
	 */
	protected function doDeploySimulator(Request $request, $simu){
		if (! $this->authorizationChecker->isGranted('ROLE_MANAGER')) {
			$form = array();
			return $this->errorResponse($form, $this->translator->trans("Access denied!"));
		}
		$this->simu = new Simulator($this);
		$this->simu->load($this->simulatorsDir."/".$simu.'.xml');
		try {
			$report = $this->deployer->deploy($this->simu);
		} catch (\Exception $ex) {
		}
		$heading = $this->translator->trans('Deployment of the « %simulator% » simulator', ['%simulator%' => $this->simu->getName()]);
		$header = $this->makeReportHeader($request, $this->simu->getName(), $heading);
		$footer = $this->makeReportFooter($request, $this->simu->getName());
		$response = new StreamedResponse();
		$response->setCallback(function() use($header, $report, $footer) {
			print $header;
			flush();
			foreach ($report as $error) {
				print $error."\n";
				flush();
			}
			print $footer."\n";
			flush();
		});
		return $response;
	}

	/**
	 * Imports a simulator by copying the uploaded definition xml file into the main simulator directory as well as the css file into the css directory of the default view if this file is uploaded by the user.
	 *
	 * Before copying, the file is validated against the xml schema and if there is an error, a Response object is generated with the error message returned by the validator.
	 *
	 * If a css file is not provided and it does not already exist in the view directory, a css file is created by importing common.css from the 'Demo' view.
	 *
	 * Route path : /admin/simulators/{simulator}/doimport
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @return  \Symfony\Component\HttpFoundation\StreamedResponse
	 *
	 */
	protected function doImportSimulator(Request $request) {
		$files = $request->files->all();
		$fs = new Filesystem();
		$uploadDir = str_replace("\\", "/", $this->getParameter('upload_directory'));
		$simu = '';
		$simufile = '';
		$stylesheet = '';
		$pdffile = '';
		$pdfinfofile = '';
		$pdfform = '';
		foreach ($files as $fieldname => $file) {
			if ($file && $file->isValid()) {
				$filePath = $uploadDir . "/" . $this->fileUploader->upload($file);
				if ($fieldname == 'simulator-file') {
					$simufile = $filePath;
					$simu = $file->getClientOriginalName();
					if (preg_match("/^(.+)\.xml$/", $simu, $m)) {
						$simu = trim($m[1]);
					}
				} elseif ($fieldname == 'simulator-stylesheet') {
					$stylesheet = $filePath;
				} elseif ($fieldname == 'simulator-pdfform') {
					$pdffile = $filePath;
					$pdfform = $file->getClientOriginalName();
					if (preg_match("/^(.+)\.pdf$/", $pdfform, $m)) {
						$pdfform = trim($m[1]);
					}
				} elseif ($fieldname == 'simulator-pdfinfo') {
					$pdfinfofile = $filePath;
				}
			}
		}
		$translator = $this->translator;
		if ($simu != '' && $simufile != '') {
			$fs->rename($simufile, $uploadDir . "/" . $simu . ".xml", true);
			$simufile = $uploadDir . "/" . $simu . ".xml";
			if ($stylesheet != '') {
				$fs->rename($stylesheet, $uploadDir . "/" . $simu . ".css", true);
				$stylesheet = $uploadDir . "/" . $simu . ".css";
			}
			if ($pdfform != '') {
				if ($pdffile != '') {
					$fs->rename($pdffile, $uploadDir . "/" . $pdfform . ".pdf", true);
					$pdffile = $uploadDir . "/" . $pdfform . ".pdf";
				}
				if ($pdfinfofile != '') {
					$fs->rename($pdfinfofile, $uploadDir . "/" . $pdfform . ".info", true);
					$pdffile = $uploadDir . "/" . $pdfform . ".info";
				}
			}
			$heading = $translator->trans('Importing the « %simulator% » simulator', ['%simulator%' => $simu]);
			$header = $this->makeReportHeader($request, $simu, $heading);
			$footer = $this->makeReportFooter($request, $simu);
			$response = $this->runStreamedConsoleCommand([
				'command' => 'g6k:simulator:import',
				'simulatorname' => $simu,
				'simulatorpath' => $uploadDir,
				'stylesheetpath' => $stylesheet != '' ? $uploadDir : false,
				'pdfformspath' => $pdffile != '' ? $uploadDir : false,
				'--default-widget' => ['abDatepicker', 'abListbox', 'AutoMoneyFormat']
			], function() use ($header) {
				print $header;
				flush();
			}, function($ok) use ($footer, $translator, $simu, $simufile, $stylesheet, $fs) {
				if ($ok) {
					print '<span class="alert-success">' . $translator->trans("The simulator « %simulator% » is successfully imported.", ['%simulator%' => $simu]) . "</span>\n";
				} else {
					print '<span class="alert-danger">' . $translator->trans("The simulator « %simulator% » can't be imported.", ['%simulator%' => $simu]) . "</span>\n";
				}
				print $footer . "\n";
				flush();
				try {
					if ($simufile != '') {
						$fs->remove($simufile);
					}
					if ($stylesheet != '') {
						$fs->remove($stylesheet);
					}
				} catch (IOExceptionInterface $e) {
				}
			});
		} else {
			$simu = $translator->trans("Unknown");
			$heading = $translator->trans('Importing the « %simulator% » simulator', ['%simulator%' => $simu]);
			$header = $this->makeReportHeader($request, $simu, $heading);
			$footer = $this->makeReportFooter($request, $simu);
			$response = new StreamedResponse(function() use($header, $footer, $translator) {
				print $header;
				flush();
				print '<span class="alert-danger">' . $translator->trans("The uploaded files of the simulator can't be found.") . "</span>\n";
				print $footer."\n";
				flush();
			});
		}
		return $response;
	}

	/**
	 * Constructs a condition in a string from an associative array containing the name, operator and value of the condition.
	 *
	 * @access  private
	 * @param   array $val Name, operator and value of the condition
	 * @return  string The condition
	 *
	 */
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

	/**
	 * Converts an array of conditions connected with the connector 'all' to a string expression in conjunctive form
	 *
	 * @access  private
	 * @param   array $conds The array of conditions
	 * @return  string The string expression in conjunctive form
	 *
	 */
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

	/**
	 * Converts an array of conditions connected with the connector 'any' to a string expression in disjunctive form
	 *
	 * @access  private
	 * @param   array $conds The array of conditions
	 * @return  string The string expression in disjunctive form
	 *
	 */
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

	/**
	 * Converts a boolean expression from an array to an infixed string
	 *
	 * Conversion example:
	 * <pre>
	 * &#36conds = array(
	 *     'any' => array(
	 *         array(
	 *             'all' => array(
	 *                 array(
	 *                     'name' => 'income',
	 *                     'operator' => '&gt;=',
	 *                     'value' => 2000
	 *                  ),
	 *                  array(
	 *                     'name' => 'rate',
	 *                     'operator' => '&gt;',
	 *                     'value' => 15.5
	 *                  )
	 *             )
	 *         ),
	 *         array(
	 *             'name' => 'nChildren',
	 *             'operator' => '&lt;',
	 *             'value' => 5
	 *         )
	 *     )
	 * );
	 * </pre>
	 * is converted to:
	 * <pre>
	 * "(#1 &gt;= 2000 && #2 &gt; 15.5) || #3 &lt; 5"
	 * </pre>
	 * where :
	 *
	 * - #1 is the id of the data whose name is 'income' prefixed by #
	 * - #2 is the id of the data whose name is 'rate' prefixed by #
	 * - #3 is the id of the data whose name is 'nChildren' prefixed by #
	 *
	 * @access  private
	 * @param   array $conds The array of boolean expression
	 * @return  string The infixed expression
	 *
	 */
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

	/**
	 * Load business rules
	 *
	 * @access  protected
	 * @return  void
	 *
	 */
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
		$fchoices = array();
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
					if ($gdata->getDescription() && $gdata->getDescription()->getContent() != '') {
						$description = $this->paragraphs($gdata->getDescription());
						$this->dataset[$name]['description'] = array( 'content' => $description->getContent(), 'edition' => $description->getEdition() );
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
					if ($gdata->getPattern() != '') {
						$this->dataset[$name]['pattern'] = $gdata->getPattern();
					}
					if ($gdata->getContent() != '' && ! preg_match("/[\?:]/", $gdata->getContent())) {
						$this->dataset[$name]['unparsedContent'] = $gdata->getContent();
					}
					if ($gdata->getUnit() != '') {
						$this->dataset[$name]['unit'] = $gdata->getUnit();
					}
					if ($gdata->getRound() != '' && $gdata->getRound() !== null) {
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
				if ($data->getDescription() && $data->getDescription()->getContent() != '') {
					$description = $this->paragraphs($data->getDescription());
					$this->dataset[$name]['description'] = array( 'content' => $description->getContent(), 'edition' => $description->getEdition() );
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
				if ($data->getPattern() != '') {
					$this->dataset[$name]['pattern'] = $data->getPattern();
				}
				if ($data->getContent() != '' && ! preg_match("/[\?:]/", $data->getContent())) {
					$this->dataset[$name]['unparsedContent'] = $data->getContent();
				}
				if ($data->getUnit() != '') {
					$this->dataset[$name]['unit'] = $data->getUnit();
				}
				if ($data->getRound() != '' && $data->getRound() !== null) {
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
			$ostepchoices = array();
			$ostepblockinfos = array ();
			$ostepchapters = array ();
			$ostepsections = array ();
			$ostepfootnotes = array();
			$ostepactionbuttons = array();
			foreach ($this->simu->getSteps() as $step) {
				$description = $step->getDescription();
				$tstep = array(
					'id' => $step->getId(),
					'name' => $step->getName(),
					'label' => $step->getLabel(),
					'template' => $step->getTemplate(),
					'output' => $step->getOutput(),
					'pdfFooter' => $step->getPdfFooter(),
					'dynamic' => $step->isDynamic() ? '1' : '0',
					'description' => array(
						'content' => $description->getContent(),
						'edition' => $description->getEdition()
					),
					'panels' => array(),
					'actions' => array(),
					'footNotes' => array()
				);
				$stepLabel = $step->getLabel() != '' ? $step->getLabel() : $this->translator->trans('Step %id% (nolabel)', array('%id%' => $step->getId()));
				$osteps[] = array (
					"label" => $stepLabel,
					"name" => $step->getId()
				);
				$this->dataset['step' . $step->getId() . '.dynamic'] = array(
					'id' => 10000 + $step->getId(), 
					'label' => $this->translator->trans('Is step %id% interactive ?', array('%id%' => $step->getId())),
					'type' => 'choice',
					'options' => array(
						array(
							'label' => $this->translator->trans('No'),
							'name' => 0
						),
						array(
							'label' => $this->translator->trans('Yes'),
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
				$opanelchoices = array();
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
					$panelLabel = $panel->getLabel() != '' ? $panel->getLabel() : $this->translator->trans('Panel %id% (nolabel)', array('%id%' => $panel->getId()));
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
					$ofieldsetchoices = array();
					$oblockinfos = array ();
					$oblockinfochapters = array ();
					$oblockinfosections = array ();
					foreach ($panel->getFieldSets() as $block) {
						if ($block instanceof FieldSet) {
							$fieldset = $block;
							$fieldsetLabel = $fieldset->getLegend()->getContent() != '' ? trim($fieldset->getLegend()->getContent()) : $this->translator->trans('Fieldset %id% (nolegend)', array('%id%' => $fieldset->getId()));
							$ofieldsets[] = array (
								"label" => $fieldsetLabel,
								"name" => $fieldset->getId()
							);
							$ocolumns = array ();
							$ofieldrows = array ();
							$ofieldrowfields = array ();
							$ofieldrowchoices = array ();
							if ($fieldset->getDisposition() != 'grid') {
								$legend = $block->getLegend();
								$tblock = array(
									'type' => 'fieldset',
									'id' => $block->getId(),
									'disposition' => $block->getDisposition(),
									'display' => $block->getDisplay(),
									'popinLink' => $block->getPopinLink(),
									'legend' => array(
										'content' => $legend->getContent(),
										'edition' => $legend->getEdition()
									),
									'fields' => array()
								);
								$ofields = array();
								$oprenotes = array();
								$opostnotes = array();
								$ochoices = array();
								foreach ($fieldset->getFields() as $field) {
									$data = $this->simu->getDataById($field->getData());
									$name = $data->getName();
									$tfield = $this->loadBusinessRuleField($field);
									$fieldLabel = $field->getLabel() != '' ? $field->getLabel() : $this->translator->trans('Field %id% (nolabel)', array('%id%' => $field->getPosition()));
									$ofields[] = array (
										"label" => $fieldLabel,
										"name" => $field->getPosition()
									);
									if (isset($this->dataset[$name]) && isset($this->dataset[$name]['options'])) {
										$ochoices[] = array (
											"label" => $fieldLabel,
											"name" => $field->getPosition(),
											"fields" => array(
												array(
													"label" => $this->translator->trans('whose label is'),
													"name" => "choiceId",
													"fieldType" => "select",
													"options" => $this->dataset[$name]['options']
												)
											)
										);
									}
									if ($field->getPreNote()) {
										$text = $field->getPreNote()->getText();
										$tfield['Note'] = array(
											'position' => 'beforeField',
											'text' => array(
												'content' => $text->getContent(),
												'edition' => $text->getEdition()
											)
										);
										$oprenotes[] = array(
											'label' => $fieldLabel,
											'name' => $field->getPosition()
										);
									}
									if ($field->getPostNote()) {
										$text = $field->getPostNote()->getText();
										$tfield['Note'] = array(
											'position' => 'afterField',
											'text' => array(
												'content' => $text->getContent(),
												'edition' => $text->getEdition()
											)
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
												"label" => $this->translator->trans('whose label is'),
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
												"label" => $this->translator->trans("of field"),
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
												"label" => $this->translator->trans("of field"),
												"name" => "fieldId",
												"fieldType" => "select",
												"options" => $opostnotes
											)
										)
									);
								}
								if (count($ochoices) > 0) {
									$ofieldsetchoices[] = array(
										"label" => $fieldsetLabel,
										"name" => $fieldset->getId(),
										"fields" => array(
											array(
												"label" => $this->translator->trans("of field"),
												"name" => "fieldId",
												"fieldType" => "select",
												"options" => $ochoices
											)
										)
									);
								}
							} else {
								$legend = $block->getLegend();
								$tblock = array(
									'type' => 'fieldset',
									'id' => $block->getId(),
									'disposition' => $block->getDisposition(),
									'display' => $block->getDisplay(),
									'popinLink' => $block->getPopinLink(),
									'legend' => array(
										'content' => $legend->getContent(),
										'edition' => $legend->getEdition()
									),
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
									$fieldrowLabel = $fieldrow->getLabel() != '' ? $fieldrow->getLabel() : $this->translator->trans('Fieldrow %id% (nolabel)', array('%id%' => $fieldrow->getId()));
									$ofieldrows[] = array (
										"label" => $fieldrowLabel,
										"name" => $fieldrow->getId()
									);
									$ofields = array();
									$ochoices = array();
									foreach ($fieldrow->getFields() as $rfield) {
										$data = $this->simu->getDataById($rfield->getData());
										$name = $data->getName();
										$fieldLabel = $rfield->getLabel() != '' ? $rfield->getLabel() : $this->translator->trans('Field %id% (nolabel)', array('%id%' => $rfield->getPosition()));
										$ofields[] = array (
											"label" => $fieldLabel,
											"name" => $rfield->getPosition()
										);
										if (isset($this->dataset[$name]) && isset($this->dataset[$name]['options'])) {
											$ochoices[] = array (
												"label" => $fieldLabel,
												"name" => $rfield->getPosition(),
												"fields" => array(
													array(
														"label" => $this->translator->trans('whose label is'),
														"name" => "choiceId",
														"fieldType" => "select",
														"options" => $this->dataset[$name]['options']
													)
												)
											);
										}
										$tfieldrow['fields'][] = $this->loadBusinessRuleField($rfield);
									}
									if (count($ofields) > 0) {
										$ofieldrowfields[] = array(
											"label" => $fieldrowLabel,
											"name" => $fieldrow->getId(),
											"fields" => array(
												array(
													"label" => $this->translator->trans('whose label is'),
													"name" => "fieldId",
													"fieldType" => "select",
													"options" => $ofields
												)
											)
										);
									}
									if (count($ochoices) > 0) {
										$ofieldrowchoices[] = array(
											"label" => $fieldrowLabel,
											"name" => $fieldrow->getId(),
											"fields" => array(
												array(
													"label" => $this->translator->trans("of field"),
													"name" => "fieldId",
													"fieldType" => "select",
													"options" => $ochoices
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
											"label" => $this->translator->trans('whose label is'),
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
											"label" => $this->translator->trans('whose label is'),
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
											"label" => $this->translator->trans("of fieldrow"),
											"name" => "fieldrowId",
											"fieldType" => "select",
											"options" => $ofieldrowfields
										)
									)
								);
							}
							if (count($ofieldrowchoices) > 0) {
								$ofieldsetchoices[] = array(
									"label" => $fieldsetLabel,
									"name" => $fieldset->getId(),
									"fields" => array(
										array(
											"label" => $this->translator->trans("of fieldrow"),
											"name" => "fieldrowId",
											"fieldType" => "select",
											"options" => $ofieldrowchoices
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
								'display' => $block->getDisplay(),
								'popinLink' => $block->getPopinLink(),
								'chapters' => array()
							);
							$blockinfo = $block;
							$blockinfoLabel = $blockinfo->getLabel() != '' ? $blockinfo->getLabel() : $this->translator->trans('Blockinfo %id% (nolabel)', array('%id%' => $blockinfo->getId()));
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
								$chapterLabel = $chapter->getLabel() != '' ? $chapter->getLabel() : $this->translator->trans('Chapter %id% (nolabel)', array('%id%' => $chapter->getId()));
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
										'content' => array(
											'content' => $section->getContent()->getContent(),
											'edition' => $section->getContent()->getEdition()
										),
										'annotations' => array(
											'content' => $section->getAnnotations()->getContent(),
											'edition' => $section->getAnnotations()->getEdition()
										)
									);
									$sectionLabel = $section->getLabel() != '' ? $section->getLabel() : $this->translator->trans('Section %id% (nolabel)', array('%id%' => $section->getId()));
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
												"label" => $this->translator->trans('whose label is'),
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
											"label" => $this->translator->trans('whose label is'),
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
											"label" => $this->translator->trans("of chapter"),
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
									"label" => $this->translator->trans('whose label is'),
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
									"label" => $this->translator->trans("of fieldset"),
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
									"label" => $this->translator->trans("of fieldset"),
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
									"label" => $this->translator->trans("of fieldset"),
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
									"label" => $this->translator->trans("of fieldset"),
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
									"label" => $this->translator->trans("of fieldset"),
									"name" => "fieldsetId",
									"fieldType" => "select",
									"options" => $ofieldsetpostnotes
								)
							)
						);
					}
					if (count($ofieldsetchoices) > 0) {
						$opanelchoices[] = array(
							"label" => $panelLabel,
							"name" => $panel->getId(),
							"fields" => array(
								array(
									"label" => $this->translator->trans("of fieldset"),
									"name" => "fieldsetId",
									"fieldType" => "select",
									"options" => $ofieldsetchoices
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
									"label" => $this->translator->trans('whose label is'),
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
									"label" => $this->translator->trans("of blockinfo"),
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
									"label" => $this->translator->trans("of blockinfo"),
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
								"label" => $this->translator->trans('whose label is'),
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
								"label" => $this->translator->trans("of panel"),
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
								"label" => $this->translator->trans("of panel"),
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
								"label" => $this->translator->trans("of panel"),
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
								"label" => $this->translator->trans("of panel"),
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
								"label" => $this->translator->trans("of panel"),
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
								"label" => $this->translator->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelpostnotes
							)
						)
					);
				}
				if (count($opanelchoices) > 0) {
					$ostepchoices[] = array(
						"label" => $stepLabel,
						"name" => $step->getId(),
						"fields" => array(
							array(
								"label" => $this->translator->trans("of panel"),
								"name" => "panelId",
								"fieldType" => "select",
								"options" => $opanelchoices
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
								"label" => $this->translator->trans("of panel"),
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
								"label" => $this->translator->trans("of panel"),
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
								"label" => $this->translator->trans("of panel"),
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
						'location' => $action->getLocation(),
						'shape' => $action->getShape(),
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
								'label' => $this->translator->trans('whose label is'),
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
						$text = $footnote->getText();
						$tfootnote = array(
							'id' => $footnote->getId(),
							'text' => array(
								'content' => $text->getContent(),
								'edition' => $text->getEdition()
							)
						);
						$ofootnotes[] = array(
							'label' => $this->translator->trans('FootNote %id%', array('%id%' => $footnote->getId())),
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
								'label' => $this->translator->trans('whose label is'),
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
						"label" => $this->translator->trans("the step"),
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
						"label" => $this->translator->trans("the panel"),
						"name" => "panel",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $osteppanels
							)
						)
				);
			}
			if (count($ostepfieldsets) > 0) {
				$fieldsets = array(
						"label" => $this->translator->trans("the fieldset"),
						"name" => "fieldset",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepfieldsets
							)
						)
				);
			}
			if (count($ostepcolumns) > 0) {
				$columns = array(
						"label" => $this->translator->trans("the column"),
						"name" => "column",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepcolumns
							)
						)
				);
			}
			if (count($ostepfieldrows) > 0) {
				$fieldrows = array(
						"label" => $this->translator->trans("the fieldrow"),
						"name" => "fieldrow",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepfieldrows
							)
						)
				);
			}
			if (count($ostepfields) > 0) {
				$fields = array(
						"label" => $this->translator->trans("the field"),
						"name" => "field",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepfields
							)
						)
				);
			}
			if (count($ostepprenotes) > 0) {
				$prenotes = array(
						"label" => $this->translator->trans("the prenote"),
						"name" => "prenote",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepprenotes
							)
						)
				);
			}
			if (count($osteppostnotes) > 0) {
				$postnotes = array(
						"label" => $this->translator->trans("the postnote"),
						"name" => "postnote",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $osteppostnotes
							)
						)
				);
			}
			if (count($ostepchoices) > 0) {
				$fchoices = array(
						"label" => $this->translator->trans("the choice"),
						"name" => "choice",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepchoices
							)
						)
				);
			}
			if (count($ostepblockinfos) > 0) {
				$blockinfos = array(
						"label" => $this->translator->trans("the blockinfo"),
						"name" => "blockinfo",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepblockinfos
							)
						)
				);
			}
			if (count($ostepchapters) > 0) {
				$chapters = array(
						"label" => $this->translator->trans("the chapter"),
						"name" => "chapter",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepchapters
							)
						)
				);
			}
			if (count($ostepsections) > 0) {
				$sections = array(
						"label" => $this->translator->trans("the section"),
						"name" => "section",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepsections
							)
						)
				);
			}
			if (count($ostepfootnotes) > 0) {
				$footnotes = array(
						"label" => $this->translator->trans("the footnote"),
						"name" => "footnote",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepfootnotes
							)
						)
				);
			}
			if (count($ostepactionbuttons) > 0) {
				$actionbuttons = array(
						"label" => $this->translator->trans("the actionbutton"),
						"name" => "action",
						"fields" => array(
							array(
								"label" => $this->translator->trans("of step"),
								"name" => "stepId",
								"fieldType" => "select", 
								"options" => $ostepactionbuttons
							)
						)
				);
			}
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
		if (count($fchoices) > 0) {
			$objects[] = $fchoices;
		}
		$notifyFields = array(
			array(
				'label' => "",
				'name' => "message",
				'fieldType' => "textarea"
			),
			array(
				'label' => $this->translator->trans("on"),
				'name'	=> "target",
				'fieldType' => "select",
				'options' => array(
					array(
						'label' => $this->translator->trans('the data'),
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
						'label' => $this->translator->trans('the dataset'),
						'name' => 'dataset'
					)
				)
			)
		);
		$this->actions = array(
			array(
				'label' => $this->translator->trans("Choose an Action..."), 
				'name' => "", 
				'fieldType' => "textarea"
			),
			array(
				'label' => $this->translator->trans("notify Error"), 
				'name' => "notifyError", 
				'fields' => $notifyFields
			),
			array(
				'label' => $this->translator->trans("notify Warning"), 
				'name' => "notifyWarning", 
				'fields' => $notifyFields
			),
			array(
				'label' => $this->translator->trans("Hide"), 
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
				'label' => $this->translator->trans("Show"), 
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
				'label' => $this->translator->trans("Set"), 
				'name' => "setAttribute", 
				'fields' => array(
					array(
						'label' => "",
						'name' => "attributeId",
						'fieldType' => "select",
						'options' => array(
							array(
								'label' => $this->translator->trans("the content"), 
								'name' => "content", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => $this->translator->trans("the default"), 
								'name' => "default", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => $this->translator->trans("the minimum"), 
								'name' => "min", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => $this->translator->trans("the maximum"), 
								'name' => "max", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => $this->translator->trans("the result index"), 
								'name' => "index", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => true
									)
								)
							),
							array(
								'label' => $this->translator->trans("the explanation"), 
								'name' => "explanation", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
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
				'label' => $this->translator->trans("Unset"), 
				'name' => "unsetAttribute", 
				'fields' => array(
					array(
						'label' => "",
						'name' => "attributeId",
						'fieldType' => "select",
						'options' => array(
							array(
								'label' => $this->translator->trans("the content"), 
								'name' => "content", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => $this->translator->trans("the default"), 
								'name' => "default", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => $this->translator->trans("the minimum"), 
								'name' => "min", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => $this->translator->trans("the maximum"), 
								'name' => "max", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => $this->translator->trans("the result index"), 
								'name' => "index", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
										'name' => "fieldName",
										'fieldType' => "field",
										'newValue' => false
									)
								)
							),
							array(
								'label' => $this->translator->trans("the explanation"), 
								'name' => "explanation", 
								'fields' => array(
									array(
										'label' => $this->translator->trans("of"),
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
			foreach (array(1, 2) as $a) {
				$this->actions[$a]['fields'][1]['options'][] = array(
					'label' => $this->translator->trans('the datagroup'),
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
		}
		$this->dataset['script'] = array(
			'id' => 20000, 
			'label' => $this->translator->trans('Script'),
			'type' => 'choice',
			'options' => array(
				 array(
					'label' => $this->translator->trans('Disabled'),
					'name' => 0
				),
				 array(
					'label' => $this->translator->trans('Enabled'),
					'name' => 1
				)
			)
		);
		$this->dataset['dynamic'] = array(
			'id' => 20001, 
			'label' => $this->translator->trans('Interactive UI'),
			'type' => 'choice',
			'options' => array(
				 array(
					'label' => $this->translator->trans('No'),
					'name' => 0
				),
				 array(
					'label' => $this->translator->trans('Yes'),
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
				'connector' => $brule->getConnector() !== null ? $brule->ruleConnector($brule->getConnector()) : null,
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

	/**
	 * makes an array of attributes of the field from the field object
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Field $field The field object
	 * @return  array Array of attributes of the field
	 *
	 */
	protected function loadBusinessRuleField(Field $field) {
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
		return $tfield;
	}

	/**
	 * Builds an actions data array for the Javascript rule engine
	 *
	 * @access  private
	 * @param   int $ruleID rule ID
	 * @param   array $actions array of RuleAction objects
	 * @return  array The actions data array
	 *
	 */
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
							$disposition = $this->findDisposition($action);
							if ($disposition == 'grid') {
								$clause = $this->makeClause(array(
									'action-select' => $action->getName(),
									'objectId' => $target,
									'stepId' => $action->getStep(),
									'panelId' => $action->getPanel(),
									'fieldsetId' => $action->getFieldset(),
									'fieldrowId' => $action->getFieldrow(),
									'fieldId' => $action->getTargetId()
								));
							} else {
								$clause = $this->makeClause(array(
									'action-select' => $action->getName(),
									'objectId' => $target,
									'stepId' => $action->getStep(),
									'panelId' => $action->getPanel(),
									'fieldsetId' => $action->getFieldset(),
									'fieldId' => $action->getTargetId()
								));
							}
							break;
						case 'section':
							$clause = $this->makeClause(array(
								'action-select' => $action->getName(),
								'objectId' => $target,
								'stepId' => $action->getStep(),
								'panelId' => $action->getPanel(),
								'blockinfoId' => $action->getBlockinfo(),
								'chapterId' => $action->getChapter(),
								'sectionId' => $action->getTargetId()
							));
							break;
						case 'chapter':
							$clause = $this->makeClause(array(
								'action-select' => $action->getName(),
								'objectId' => $target,
								'stepId' => $action->getStep(),
								'panelId' => $action->getPanel(),
								'blockinfoId' => $action->getBlockinfo(),
								'chapterId' => $action->getTargetId()
							));
							break;
						case 'column':
							$clause = $this->makeClause(array(
								'action-select' => $action->getName(),
								'objectId' => $target,
								'stepId' => $action->getStep(),
								'panelId' => $action->getPanel(),
								'fieldsetId' => $action->getFieldset(),
								'columnId' => $action->getTargetId()
							));
							break;
						case 'fieldrow':
							$clause = $this->makeClause(array(
								'action-select' => $action->getName(),
								'objectId' => $target,
								'stepId' => $action->getStep(),
								'panelId' => $action->getPanel(),
								'fieldsetId' => $action->getFieldset(),
								'fieldrowId' => $action->getTargetId()
							));
							break;
						case 'fieldset':
							$clause = $this->makeClause(array(
								'action-select' => $action->getName(),
								'objectId' => $target,
								'stepId' => $action->getStep(),
								'panelId' => $action->getPanel(),
								'fieldsetId' => $action->getTargetId()
							));
							break;
						case 'blockinfo':
							$clause = $this->makeClause(array(
								'action-select' => $action->getName(),
								'objectId' => $target,
								'stepId' => $action->getStep(),
								'panelId' => $action->getPanel(),
								'blockinfoId' => $action->getTargetId()
							));
							break;
						case 'panel':
							$clause = $this->makeClause(array(
								'action-select' => $action->getName(),
								'objectId' => $target,
								'stepId' => $action->getStep(),
								'panelId' => $action->getTargetId()
							));
							break;
						case 'step':
							$clause = $this->makeClause(array(
								'action-select' => $action->getName(),
								'objectId' => $target,
								'stepId' => $action->getTargetId()
							));
							break;
						case 'footnote':
							$clause = $this->makeClause(array(
								'action-select' => $action->getName(),
								'objectId' => $target,
								'stepId' => $action->getStep(),
								'footnoteId' => $action->getTargetId()
							));
							break;
						case 'action':
							$clause = $this->makeClause(array(
								'action-select' => $action->getName(),
								'objectId' => $target,
								'stepId' => $action->getStep(),
								'actionId' => $action->getTargetId()
							));
							break;
						case 'choice':
							$disposition = $this->findDisposition($action);
							if ($disposition == 'grid') {
								$clause = $this->makeClause(array(
									'action-select' => $action->getName(),
									'objectId' => $target,
									'stepId' => $action->getStep(),
									'panelId' => $action->getPanel(),
									'fieldsetId' => $action->getFieldset(),
									'fieldrowId' => $action->getFieldrow(),
									'fieldId' => $action->getField(),
									'choiceId' => $action->getTargetId()
								));
							} else {
								$clause = $this->makeClause(array(
									'action-select' => $action->getName(),
									'objectId' => $target,
									'stepId' => $action->getStep(),
									'panelId' => $action->getPanel(),
									'fieldsetId' => $action->getFieldset(),
									'fieldId' => $action->getField(),
									'choiceId' => $action->getTargetId()
								));
							}
							break;
					}
					break;
				case 'setAttribute':
					$clause = $this->makeClause(array(
						'action-select' => 'setAttribute',
						'attributeId' => $target,
						'fieldName' => $this->findDataNameById($action->getData()),
						'newValue' => $action->getValue()
					));
					if (preg_match_all("/#(\d+)/", $action->getValue(), $matches)) {
						foreach($matches[1] as $id) {
							$name = $this->findDataNameById($id);
							if (! isset($this->dataset[$name]['rulesActionsDependency'])) {
								$this->dataset[$name]['rulesActionsDependency'] = array();
							}
							$this->dataset[$name]['rulesActionsDependency'][] = $ruleID;
						}
					}
					break;
				case 'unsetAttribute':
					$clause = $this->makeClause(array(
						'action-select' => 'unsetAttribute',
						'attributeId' => $target,
						'fieldName' => $this->findDataNameById($action->getData())
					));
					break;
			}
			$datas[] = $clause;
		}
		return $datas;
	}

	/**
	 * Finds the disposition of a fieldset where one of the elements is the target of a rule action
	 *
	 * @access  private
	 * @param   \App\G6K\Model\RuleAction $action The rule action
	 * @return  string
	 *
	 */
	private function findDisposition(RuleAction $action) {
		$step = $action->getStep();
		$panel = $action->getPanel();
		$fieldset = $action->getFieldset();
		return $this->simu->getStepById((int)$step)->getPanelById((int)$panel)->getFieldSetById((int)$fieldset)->getDisposition();
	}

	/**
	 * Makes a clause from the fields of a rule cation
	 *
	 * @access  private
	 * @param   array $fields The fields of the rule action
	 * @return  array
	 *
	 */
	private function makeClause($fields) {
		$clause = array();
		$entry = &$clause;
		foreach($fields as $name => $value) {
			$entry['fields'] = array(array('name' => $name, 'value' => $value));
			$entry = &$entry['fields'][0]; 
		}
		return $clause['fields'][0];
	}

	/**
	 * Transforms the lines of a text into html paragraphs
	 *
	 * @access  private
	 * @param   \App\G6K\Model\RichText|string $string
	 * @return  \App\G6K\Model\RichText|string
	 *
	 */
	private function paragraphs ($string) {
		if ($string instanceof RichText && ! $string->isManual()) {
			return $string;
		}
		$text = $string instanceof RichText ? $string->getContent(): $string;
		$result = "";
		$paras = explode("\n", trim($text));
		foreach ($paras as $para) {
			$para = trim($para);
			if ($para == '' || $para == "&nbsp;") {
				$result .= "<br>";
			} else {
				$result .= "<p>";
				$result .= $para;
				$result .= "</p>";
			}
		}
		if ($string instanceof RichText) {
			$string->setContent($result);
			return $string;
		} else {
			return $result;
		}
	}

	/**
	 * Searches for the name of a data in the dataset from its identifier
	 *
	 * @access  private
	 * @param   int $id data id
	 * @return  string|null data name
	 *
	 */
	private function findDataNameById($id) {
		foreach ($this->dataset as $name => $data) {
			if ($data['id'] == $id) {
				return $name;
			}
		}
		return null;
	}

	/**
	 * Returns the available locales of the server
	 *
	 * @access  private
	 * @return  array The available locales
	 *
	 */
	private function getLocales() {
		$currencyPerLocale = array_reduce(
			\ResourceBundle::getLocales(''),
			function (array $currencies, string $locale) {
				$currencies[$locale] = \NumberFormatter::create(
					$locale,
					\NumberFormatter::CURRENCY
				)->getTextAttribute(\NumberFormatter::CURRENCY_CODE);

				return $currencies;
			},
			[]
		);
		return array_filter($currencyPerLocale, function($curr) { return !empty($curr); });
	}

	/**
	 * Returns the languages for the current locale
	 *
	 * @access  public
	 * @return  array The available languages
	 *
	 */
	public function getLanguages() {
		$locale = $this->getParameter('app_locale');
		$locales = $this->getLocales();
		$inlocale = substr($locale, 0, 2);
		$languages = array();
		foreach($locales as $lang => $c) {
			$loc = str_replace('_', '-', $lang);
			if ($loc != 'en-US-POSIX') {
				$middle = '';
				if (preg_match("/^\w+-(\w+)-\w+$/", $loc, $m)) {
					$middle = " - " . $m[1];
				}
				$country = \Locale::getDisplayRegion($loc, $inlocale);
				$dialect = \Locale::getDisplayLanguage($loc, $inlocale);
				$dialect = mb_strtoupper(mb_substr($dialect, 0, 1)) . mb_substr($dialect, 1);
				$language = $dialect . $middle;
				if (!empty($country)) {
					$language .= " (" . $country . ")";
				} elseif (strpos($loc, '-') !== false) {
					$language .= " (" . $loc . ")";
				}
				$languages[$loc] = $language;
			}
		}
		$undlocale = str_replace('-', '_', $locale);
		setlocale(LC_ALL, $undlocale);
		asort($languages, SORT_LOCALE_STRING);
		return $languages;
	}

	/**
	 * Returns the time zones for the given locale
	 *
	 * @access  public
	 * @param   string $locale The given locale
	 * @return  array The time zones
	 *
	 */
	public function getTimezones($locale) {
		$timezones = array();
		$country = substr($locale, -2);
		$zones = \DateTimeZone::listIdentifiers(\DateTimeZone::PER_COUNTRY, $country);
		foreach($zones as $tz) {
			$timezones[$tz] = $tz;
		}
		return $timezones;
	}

	/**
	 * Returns all the currency symbols
	 *
	 * @access  public
	 * @return  array The currency symbols
	 *
	 */
	public function getCurrencySymbols() {
		$symbols = array();
		$locales = $this->getLocales();
		foreach($locales as $locale => $currencyCode) {
			$undlocale = str_replace('-', '_', $locale);
			$formatter = new \NumberFormatter($undlocale . '@currency=' . $currencyCode , \NumberFormatter::CURRENCY);
			$symbol = normalizer_normalize($formatter->getSymbol(\NumberFormatter::CURRENCY_SYMBOL));
			$symbols[$symbol] = $symbol;
		}
		return $symbols;
	}

	/**
	 * Returns the regional settings for the given locale
	 *
	 * @access  public
	 * @param   string $locale The given locale
	 * @return  array The regional settings
	 *
	 */
	public function getRegionalSettings($locale) {
		function utf8($text) {
			return mb_convert_encoding($text, "UTF-8");
		}
		function capitalize($text) {
			return  mb_strtoupper(mb_substr($text, 0, 1)) . mb_substr($text, 1);
		}
		$undlocale = str_replace('-', '_', $locale);
		$inlocale = substr($locale, 0, 2);
		$settings = array();
		$settings['language'] = capitalize(\Locale::getDisplayLanguage($locale, 'en'));
		$settings['native-language'] = capitalize(\Locale::getDisplayLanguage($locale, $inlocale));
		$settings['region'] = \Locale::getDisplayRegion($locale, 'en');
		$settings['native-region'] = \Locale::getDisplayRegion($locale, $inlocale);
		$formatter = new \IntlDateFormatter($undlocale, \IntlDateFormatter::FULL, \IntlDateFormatter::FULL, NULL, NULL, "MMMM");
		$monthNames = array();
		for ($i = 1; $i <= 12; $i++) {
			$monthNames[] = capitalize(utf8(mb_convert_case (datefmt_format($formatter, mktime(0, 0, 0, $i)), MB_CASE_LOWER, 'UTF-8')));
		}
		$settings['month_names'] = implode("|", $monthNames);
		$formatter->setPattern("MMM");
		$monthNames = array();
		for ($i = 1; $i <= 12; $i++) {
			$monthNames[] = capitalize(utf8(mb_convert_case(datefmt_format($formatter, mktime(0, 0, 0, $i)), MB_CASE_LOWER, 'UTF-8')));
		}
		$settings['month_names_short'] = implode("|", $monthNames);
		$formatter->setPattern("cccc");
		$dayNames = array();
		for ($i = 0; $i < 7; $i++) {
			$dayNames[] = capitalize(utf8(mb_convert_case(datefmt_format($formatter, mktime(0, 0, 0, 12, 30 + $i, 2018)), MB_CASE_LOWER, 'UTF-8')));
		}
		$settings['day_names'] = implode("|", $dayNames);
		$formatter->setPattern("ccc");
		$dayNames = array();
		for ($i = 0; $i < 7; $i++) {
			$dayNames[] = capitalize(utf8(mb_convert_case(datefmt_format($formatter, mktime(0, 0, 0, 12, 30 + $i, 2018)), MB_CASE_LOWER, 'UTF-8')));
		}
		$settings['day_names_short'] = implode("|", $dayNames);
		$settings['date_timezone'] = $formatter->getTimeZone()->getID();
		$formatter = new \IntlDateFormatter($undlocale, \IntlDateFormatter::SHORT, \IntlDateFormatter::NONE, NULL, \IntlDateFormatter::GREGORIAN);
		$settings['date_input_format'] = preg_replace (['/d+/', '/M+/', '/y+/', '/\s*G+\s*/'], ['d', 'm', 'Y', ''], $formatter->getPattern());
		$timezones = $this->getTimezones($locale);
		$settings['date_timezones'] = $timezones;
		$currencyCode = \NumberFormatter::create($locale, \NumberFormatter::CURRENCY)->getTextAttribute(\NumberFormatter::CURRENCY_CODE);
		$formatter = new \NumberFormatter($undlocale . '@currency=' . $currencyCode , \NumberFormatter::CURRENCY);
		$settings['currency_grouping_separator'] = str_replace(["\xc2\xa0", "\xe2\x80\xaf"], [' ', ' '],  normalizer_normalize($formatter->getSymbol(\NumberFormatter::MONETARY_GROUPING_SEPARATOR_SYMBOL)));
		$settings['currency_grouping_size'] = $formatter->getAttribute(\NumberFormatter::GROUPING_SIZE);
		$settings['currency_decimal_point'] = $formatter->getSymbol(\NumberFormatter::DECIMAL_SEPARATOR_SYMBOL);
		$settings['currency_symbol'] = normalizer_normalize($formatter->getSymbol(\NumberFormatter::CURRENCY_SYMBOL));
		$settings['currency_symbols'] = $this->getCurrencySymbols();
		$formatter = new \NumberFormatter($inlocale, \NumberFormatter::CURRENCY);
		$moneySymbol = $formatter->getSymbol(\NumberFormatter::CURRENCY_SYMBOL);
		$pattern = $formatter->getPattern();
		$settings['currency_symbol_position'] = preg_match("/^".$moneySymbol."/", $pattern) ? 'before' : 'after';
		$formatter = new \NumberFormatter($undlocale, \NumberFormatter::DECIMAL);
		$settings['number_grouping_separator'] = str_replace(["\xc2\xa0", "\xe2\x80\xaf"], [' ', ' '],  normalizer_normalize($formatter->getSymbol(\NumberFormatter::GROUPING_SEPARATOR_SYMBOL)));
		$settings['number_grouping_size'] = $formatter->getAttribute(\NumberFormatter::GROUPING_SIZE);
		$settings['number_decimal_point'] = $formatter->getSymbol(\NumberFormatter::DECIMAL_SEPARATOR_SYMBOL);
		$settings['number_fraction_digit'] = $formatter->getAttribute(\NumberFormatter::FRACTION_DIGITS);
		$formatter = new \NumberFormatter($undlocale, \NumberFormatter::PERCENT);
		$settings['percent_grouping_separator'] = str_replace(["\xc2\xa0", "\xe2\x80\xaf"], [' ', ' '],  normalizer_normalize($formatter->getSymbol(\NumberFormatter::GROUPING_SEPARATOR_SYMBOL)));
		$settings['percent_grouping_size'] = $formatter->getAttribute(\NumberFormatter::GROUPING_SIZE);
		$settings['percent_decimal_point'] = $formatter->getSymbol(\NumberFormatter::DECIMAL_SEPARATOR_SYMBOL);
		$settings['percent_symbol'] = normalizer_normalize($formatter->getSymbol(\NumberFormatter::PERCENT_SYMBOL));
		return $settings;
	}

}

?>
