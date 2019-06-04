<?php

/*
The MIT License (MIT)

Copyright (c) 2018 Jacques Archimède

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

namespace App\G6K\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;

use App\G6K\Manager\SQLSelectTokenizer;

/**
 * Validates a simulator against the Simulator.xsd schema file.
 *
 */
class ValidateSimulatorCommand extends SimulatorCommandBase
{

	/**
	 * @var array Table list per data source
	 */
	 private $tables = array();

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir, "Simulator Validator");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:simulator:validate';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Validates a simulator against the Simulator.xsd schema file.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to validates a simulator against the Simulator.xsd schema file.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the simulator (simulatorname).")."\n"
			. "\n"
			. $this->translator->trans("If the name of the simulator is 'all', all simulators will be validated.")."\n"
		;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandArguments() {
		return array(
			array(
				'simulatorname',
				InputArgument::REQUIRED,
				$this->translator->trans('The name of the simulator.')
			)
		);
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		return array(
			array(
				'working-version', 
				'w', 
				InputOption::VALUE_NONE, 
				$this->translator->trans('Validate working version.'),
			),
			array(
				'schema-only', 
				's', 
				InputOption::VALUE_NONE, 
				$this->translator->trans('Validate against the schema only, not the content.'),
			)
		);
	}

	/**
	 * Checks the argument of the current command (g6k:simulator:validate).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$this->askArgument($input, $output, 'simulatorname', "Enter the name of the simulator : ");
		$output->writeln("");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$work = $input->getOption('working-version');
		$schemaOnly = $input->getOption('schema-only');
		$simulatorsDir = $this->projectDir . '/var/data/simulators';
		if ($work) {
			$simulatorsDir .= "/work";
		}
		$simulatorname = (string)$input->getArgument('simulatorname');
		if ($simulatorname == 'all' && ! file_exists($simulatorsDir."/all.xml")) {
			$finder = new Finder();
			$finder->files()->in($simulatorsDir)->name('/\.xml$/');
			$allok = true;
			foreach ($finder as $file) {
				$simulatorname = basename($file->getRelativePathname(), '.xml');
				if (!$this->validate($simulatorsDir, $simulatorname, $schemaOnly, $output)) {
					$allok = false;
				}
			}
			return $allok ? 0 : 1;
		} else {
			return $this->validate($simulatorsDir, $simulatorname, $schemaOnly, $output) ? 0 : 1;
		}
	}

	/**
	 * Validates the simulator
	 *
	 * @access  private
	 * @param   string $simulatorsDir The directory where is located the simulator
	 * @param   string $simulatorname The simulator name
	 * @param   bool $schemaOnly true if the validation is against the schema only
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  bool true if simulator is valid, false if not.
	 *
	 */
	private function validate(string $simulatorsDir, string $simulatorname, bool $schemaOnly, OutputInterface $output) {
		$simufile = $simulatorsDir."/".$simulatorname. ".xml";
		if (! file_exists($simufile)) {
			$this->error($output, "The simulator XML file '%s%' doesn't exists", array('%s%' => $simufile));
			return false;
		}
		$this->info($output, "Validating the simulator '%simulatorname%' located in '%simulatorpath%'", array('%simulatorname%' => $simulatorname, '%simulatorpath%' => $simulatorsDir));
		$simulator = new \DOMDocument();
		$simulator->preserveWhiteSpace  = false;
		$simulator->formatOutput = true;
		libxml_use_internal_errors(true);
		$simulator->load($simufile);
		$ok = true;
		if (!$this->validatesAgainstSchema($simulator, $output)) {
			$ok = false;
		} elseif (! $schemaOnly) {
			$simulatorxpath = new \DOMXPath($simulator);
			$simu = $simulator->documentElement->getAttribute('name');
			$datasourcesfile = $this->projectDir."/var/data/databases/DataSources.xml";
			$datasources = new \DOMDocument();
			$datasources->preserveWhiteSpace  = false;
			$datasources->formatOutput = true;
			$datasources->load($datasourcesfile);
			$datasourcesxpath = new \DOMXPath($datasources);
			if ($simulator->documentElement->hasAttribute('defaultView') && ! $this->checkDefaultViewElements($simu, $simulatorxpath, $output)) {
				$ok = false;
			}
			if (! $this->checkDataReferences($simu, $simulatorxpath, $output)) {
				$ok = false;
			}
			if (! $this->checkDataUniqueness($simu, $simulatorxpath, $output)) {
				$ok = false;
			}
			if (! $this->checkSources($simu, $simulatorxpath, $datasourcesxpath, $output)) {
				$ok = false;
			}
			if (! $this->checkBusinessRules($simu, $simulatorxpath, $output)) {
				$ok = false;
			}
			if (! $this->checkBusinessRulesUniqueness($simu, $simulatorxpath, $output)) {
				$ok = false;
			}
		}
		if ($ok) {
			$this->success($output, "The simulator '%s%' is successfully validated", array('%s%' => $simulatorname));
		} else {
			$this->failure($output, "The simulator xml file of '%s%' has some errors.", array('%s%' => $simulatorname));
		}
		return $ok;
	}

	/**
	 * Checks the existence of the elements of the default view
	 *
	 * @access  private
	 * @param   string $simu The simulator name
	 * @param   \DOMXPath $simulatorxpath The simulator xpath
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  bool true if the elements exist, false if not.
	 *
	 */
	private function checkDefaultViewElements(string $simu, \DOMXPath $simulatorxpath, OutputInterface $output) {
		$ok = true;
		$assetsDir = $this->projectDir."/".$this->parameters['public_dir']."/assets";
		$viewsDir = $this->projectDir."/templates";
		$fsystem = new Filesystem();
		$view = $simulatorxpath->query("/Simulator/@defaultView")->item(0)->nodeValue;
		if (! $fsystem->exists($assetsDir.'/'.$view.'/css/'.$simu.'.css')) {
			$this->error($output, "The stylesheet associated to '%simulatorname%' doesn't exists.", array('%simulatorname%' => $simu));
			$ok = false;
		}
		$steps = $simulatorxpath->query("/Simulator/Steps/Step");
		$len = $steps->length;
		for($i = 0; $i < $len; $i++) {
			$step = $this->getDOMElementItem($steps, $i);
			$outputType = $step->getAttribute('output');
			if ($outputType != 'inlineFilledPDF' && $outputType != 'downloadableFilledPDF') {
				$template = str_replace(':', '/', $step->getAttribute('template'));
				if (! $fsystem->exists($viewsDir.'/'.$view.'/'.$template)) {
					$this->error($output, "In line %line%, the template '%template%' associated to step %step% of '%simulatorname%' doesn't exists.", array('%line%' => $step->getLineNo(), '%template%' => $template, '%step%' => $step->getAttribute('id'), '%simulatorname%' => $simu));
					$ok = false;
				}
			}
		}
		return $ok;
	}

	/**
	 * Checks the references of data
	 *
	 * @access  private
	 * @param   string $simu The simulator name
	 * @param   \DOMXPath $simulatorxpath The simulator xpath
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  bool true if the references are valids, false if not.
	 *
	 */
	private function checkDataReferences(string $simu, \DOMXPath $simulatorxpath, OutputInterface $output) {
		$ok = true;
		$usedData = array();
		$dataRefs = $simulatorxpath->query("//Field/@data|//Parameter/@data|//Profile/Data/@id|//BusinessRule//Action/@data");
		foreach($dataRefs as $ref) {
			$data = $ref->nodeValue;
			$usedData[$data] = true;
			$datas = $simulatorxpath->query("//DataSet//Data[@id='".$data."']");
			if ($datas->length == 0) {
				$this->error($output, "In line %line%, the data '%data%' referenced by an element '%element%' of '%simulatorname%' doesn't exists.", array('%line%' => $ref->getLineNo(), '%data%' => $data, '%element%' => $ref->ownerElement->getNodePath(), '%simulatorname%' => $simu));
				$ok = false;
			}
		}
		$texts = $simulatorxpath->query("//Description|//Legend|//FootNote|//PreNote|//PostNote|//Section|//Annotations|//Conditions/@value|//Condition/@expression|//DataSet/Data/@content|//DataSet/Data/@default|//DataSet/Data/@min|//DataSet/Data/@max|//DataSet/DataGroup/Data/@content|//DataSet/DataGroup/Data/@default|//DataSet/DataGroup/Data/@min|//DataSet/DataGroup/Data/@max|//BusinessRule//Action/@value");
		foreach($texts as $text) {
			if (preg_match_all("|\#(\d+)|",  $text->nodeValue, $m) !== false) {
				foreach($m[1] as $data) {
					$usedData[$data] = true;
					$datas = $simulatorxpath->query("//DataSet//Data[@id='".$data."']");
					if ($datas->length == 0) {
						$this->error($output, "In line %line%, the data '%data%' referenced in the element '%element%' text of '%simulatorname%' doesn't exists.", array('%line%' => $text->getLineNo(), '%data%' => $data, '%element%' => $text->getNodePath(), '%simulatorname%' => $simu));
						$ok = false;
					}
				}
			}
		}
		$datas = $simulatorxpath->query("//DataSet//Data");
		$len = $datas->length;
		if ($len > 0) {
			for($i = 0; $i < $len; $i++) {
				$data = $this->getDOMElementItem($datas, $i);
				$id = $data->getAttribute('id');
				if (!isset($usedData[$id])) {
					$this->info($output, "NOTICE: The data #%id%: %name% isn't used.", array('%id%' => $id, '%name%' => $data->getAttribute('name')));
				}
			}
		}
		return $ok;
	}

	/**
	 * Checks the uniqueness of id and data names
	 *
	 * @access  private
	 * @param   string $simu The simulator name
	 * @param   \DOMXPath $simulatorxpath The simulator xpath
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  bool true if id and data names are unique, false if not.
	 *
	 */
	private function checkDataUniqueness(string $simu, \DOMXPath $simulatorxpath, OutputInterface $output) {
		$ok = true;
		$usedIds = array();
		$usedNames = array();
		$datas = $simulatorxpath->query("//DataSet//Data");
		$len = $datas->length;
		if ($len > 0) {
			for($i = 0; $i < $len; $i++) {
				$data = $this->getDOMElementItem($datas, $i);
				$id = $data->getAttribute('id');
				if (isset($usedIds[$id])) {
					$this->info($output, "ERROR: The data id #%id% is used multiple times.", array('%id%' => $id));
					$ok = false;
				} else {
					$usedIds[$id] = true;
				}
				$name = $data->getAttribute('name');
				if (isset($usedNames[$name])) {
					$this->info($output, "ERROR: The data name '%name%' is used multiple times.", array('%name%' => $name));
					$ok = false;
				} else {
					$usedNames[$name] = true;
				}
			}
		}
		return $ok;
	}

	/**
	 * Checks the data sources
	 *
	 * @access  private
	 * @param   string $simu The simulator name
	 * @param   \DOMXPath $simulatorxpath The simulator xpath
	 * @param   \DOMXPath $datasourcesxpath The datasources xpath
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  bool true if the sources are valids, false if not.
	 *
	 */
	private function checkSources(string $simu, \DOMXPath $simulatorxpath, \DOMXPath $datasourcesxpath, OutputInterface $output) {
		$ok = true;
		$tokenizer = new SQLSelectTokenizer();
		$sources = $simulatorxpath->query("/Simulator/Sources/Source");
		$len = $sources->length;
		if ($len > 0) {
			for($i = 0; $i < $len; $i++) {
				$source = $this->getDOMElementItem($sources, $i);
				$datasourcename = $source->getAttribute('datasource');
				if (is_numeric($datasourcename)) {
					$datasource = $datasourcesxpath->query("/DataSources/DataSource[@id='".$datasourcename."']");
				} else {
					$datasource = $datasourcesxpath->query("/DataSources/DataSource[@name='".$datasourcename."']");
				}
				if ($datasource->length == 0) {
					$this->error($output, "In line %line%, the '%datasource%' associated to source %source% of '%simulatorname%' doesn't exists.", array('%line%' => $source->getLineNo(), '%datasource%' => $datasourcename, '%source%' => $source->getAttribute('id'), '%simulatorname%' => $simu));
					$ok = false;
				} else {
					$id = $source->getAttribute('id');
					$indexes = $simulatorxpath->query("//Sources/Source[@id='".$id ."']/@returnPath|//Data[@source='".$id ."']/@index|//Data/Choices/Source[@id='".$id ."']/@valueColumn|//Data/Choices/Source[@id='".$id ."']/@labelColumn");
					if ($indexes->length > 0) {
						$datasource = $this->getDOMElementItem($datasource, 0);
						$requestType = $source->hasAttribute('requestType') ? $source->getAttribute('requestType'): 'simple';
						$request = $source->getAttribute('request');
						if ($request != "" && $requestType == "simple") {
							$datasourceid = $datasource->getAttribute('id');
							$datasourcename = $datasource->getAttribute('name');
							if (!isset($this->tables[$datasourcename])) {
								$this->tables[$datasourcename] = $this->parseDatasourceTables((int)$datasourceid, $datasourcesxpath, $output);
							}
							$tokenizer->setTables($this->tables[$datasourcename]);
							$parsed = $tokenizer->parseSetOperations($request);
							$columns = array();
							foreach($parsed->select as $column) {
								$columns[] = $column->alias;
							}
							foreach($indexes as $index) {
								$acolumns = array();
								if ($index->nodeName == 'returnPath') {
									$parts = explode("/", $index->nodeValue);
									foreach($parts as $part) {
										if (!is_numeric($part)) {
											$acolumns[] = $part;
										}
									}
								} else {
									$acolumns[] = preg_replace("/(^'|'$)/", "", $index->nodeValue);
								}
								foreach($acolumns as $column) {
									if (!in_array($column, $columns)) {
										$this->error($output, "In line %line%, the column '%column%' of '%attribute%' in '%element%' isn't returned by the source %source% of '%simulatorname%'.", array('%line%' => $source->getLineNo(), '%column%' => $column, '%attribute%' => $index->nodeName, '%element%' => $index->ownerElement->getNodePath(), '%source%' => $id, '%simulatorname%' => $simu));
										$ok = false;
									}
								}
							}
						}
					}
				}
			}
		}
		$sourceRefs = $simulatorxpath->query("//Data/@source|//Choices/Source/@id");
		foreach($sourceRefs as $ref) {
			$source = $ref->nodeValue;
			$sources = $simulatorxpath->query("//Sources/Source[@id='".$source."']");
			if ($sources->length == 0) {
				$this->error($output, "In line %line%, the source '%source%' used by an element '%element%' of '%simulatorname%' doesn't exists.", array('%line%' => $ref->getLineNo(), '%source%' => $source, '%element%' => $ref->ownerElement->getNodePath(), '%simulatorname%' => $simu));
				$ok = false;
			}
		}
		return $ok;
	}

	/**
	 * Checks the business rules
	 *
	 * @access  private
	 * @param   string $simu The simulator name
	 * @param   \DOMXPath $simulatorxpath The simulator xpath
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  bool true if the rules are valids, false if not.
	 *
	 */
	private function checkBusinessRules(string $simu, \DOMXPath $simulatorxpath, OutputInterface $output) {
		$ok = true;
		$operands = $simulatorxpath->query("//Condition/@operand");
		foreach($operands as $operand) {
			if (! in_array($operand->nodeValue, ['dynamic', 'script']) && ! preg_match("/^step\d+\.dynamic$/", $operand->nodeValue)) {
				$datas = $simulatorxpath->query("//DataSet//Data[@name='".$operand->nodeValue."']");
				if ($datas->length == 0) {
					$this->error($output, "In line %line%, the data '%data%' used in the element '%element%' of '%simulatorname%' doesn't exists.", array('%line%' => $operand->getLineNo(), '%data%' => $operand->nodeValue, '%element%' => $operand->ownerElement->getNodePath(), '%simulatorname%' => $simu));
					$ok = false;
				}
			}
		}
		$operators = $simulatorxpath->query("//Condition/@operator");
		foreach($operators as $operator) {
			if (! in_array($operator->nodeValue, ['=', '!=', '>', '>=', '<', '<=', 'isTrue', 'isFalse', '~', '!~', 'matches', 'present', 'blank'])) {
				$this->error($output, "In line %line%, the operator '%operator%' used in the element '%element%' of '%simulatorname%' is invalid.", array('%line%' => $operator->getLineNo(), '%operator%' => $operator->nodeValue, '%element%' => $operator->ownerElement->getNodePath(), '%simulatorname%' => $simu));
				$ok = false;
			}
			if (in_array($operator->nodeValue, ['=', '!=', '>', '>=', '<', '<=', '~', '!~', 'matches']) && ! $operator->ownerElement->hasAttribute('expression')) {
				$this->error($output, "In line %line%, the expression is required when the operator '%operator%' is used in the element '%element%' of '%simulatorname%'", array('%line%' => $operator->getLineNo(), '%operator%' => $operator->nodeValue, '%element%' => $operator->ownerElement->getNodePath(), '%simulatorname%' => $simu));
				$ok = false;
			}
			if (in_array($operator->nodeValue, ['isTrue', 'isFalse', 'present', 'blank']) && $operator->ownerElement->hasAttribute('expression')) {
				$this->error($output, "In line %line%, the expression must not be used with the operator '%operator%' in the element '%element%' of '%simulatorname%'", array('%line%' => $operator->getLineNo(), '%operator%' => $operator->nodeValue, '%element%' => $operator->ownerElement->getNodePath(), '%simulatorname%' => $simu));
				$ok = false;
			}
		}
		$actions = $simulatorxpath->query("//BusinessRule//Action");
		for($i = 0; $i < $actions->length; $i++) {
			$action = $this->getDOMElementItem($actions, $i);
			$targetname = $action->getAttribute('target');
			if ($targetname != 'dataset') {
				$query = $this->makeQuery($action);
				$targets = $simulatorxpath->query($query);
				if ($targetname == 'choice' && $targets->length > 0) {
					$query = "//Data[@id='".$this->getDOMElementItem($targets, 0)->getAttribute('data')."']//Choice[@id='".$action->getAttribute('choice')."']";
					$targets = $simulatorxpath->query($query);
				}
				if ($targets->length == 0) {
					if (in_array($targetname, ['content', 'default', 'min', 'max','index'])) {
						if ($action->hasAttribute('data')) {
							$targetname = 'data';
						} elseif ($action->hasAttribute('datagroup')) {
							$targetname = 'datagroup';
						} else {
							$targetname = 'dataset';
						}
					}
					$this->error($output, "In line %line%, the '%targetname%' '%target%' referenced in the rule action '%element%' of '%simulatorname%' doesn't exists.", array('%line%' => $action->getLineNo(), '%targetname%' => $targetname, '%target%' => $action->getAttribute($targetname), '%element%' => $action->getNodePath(), '%simulatorname%' => $simu));
					$ok = false;
				}
			}
		}
		return $ok;
	}

	/**
	 * Computes a xpath query to access the target element of a rule action
	 *
	 * @access  private
	 * @param   \DOMElement $action The rule action
	 * @return  string The computed xpath query.
	 *
	 */
	private function makeQuery(\DOMElement $action) {
		$path = ['Data'=>'id', 'DataGroup'=>'name', 'Step'=>'id', 'FootNote'=>'id', 'ActionList/Action'=>'name', 'Panel'=>'id', 'FieldSet'=>'id', 'FieldRow'=>'id', 'Field'=>'position', 'PreNote'=>'position', 'PostNote'=>'position', 'BlockInfo'=>'id', 'Chapter'=>'id', 'Section'=>'id'];
		$query = "";
		foreach($path as $element => $id) {
			$attr = strtolower(preg_replace("|^.+/|", "", $element));
			if ($action->hasAttribute($attr)) {
				if ($attr == 'prenote' || $attr == 'postnote') {
					$query .= "//Field[@".$id."='".$action->getAttribute($attr)."']";
				} else {
					$query .= "//".$element."[@".$id."='".$action->getAttribute($attr)."']";
				}
			}
		}
		return $query;
	}

	/**
	 * Extracts the tables of the given datasource id from the DataSources.xml file
	 *
	 * @access  private
	 * @param   int $id The datasource id
	 * @param   \DOMXPath $datasourcesxpath The datasources xpath
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  array The parsed tables.
	 *
	 */
	private function parseDatasourceTables(int $id, \DOMXPath $datasourcesxpath, OutputInterface $output) {
		$tables = array();
		$datasources = $datasourcesxpath->query("/DataSources/DataSource[@id='" . $id . "']");
		if ($datasources->length > 0) {
			$datasource = $this->getDOMElementItem($datasources, 0);
			if (in_array($datasource->getAttribute('type'), ['internal', 'database'])) {
				$dstables = $datasource->getElementsByTagName('Table');
				for($t = 0; $t < $dstables->length; $t++) {
					$table = $this->getDOMElementItem($dstables, $t);
					$columns = array();
					$dscolumns = $datasource->getElementsByTagName('Column');
					for($c = 0; $c < $dscolumns->length; $c++) {
						$column = $this->getDOMElementItem($dscolumns, $c);
						$choices = array();
						if ($column->getAttribute('type') == 'choice') {
							$dschoices = $datasource->getElementsByTagName('Choices');
							if ($dschoices->length > 0) {
								$dschoices = $this->getDOMElementItem($dschoices, 0);
								$dschoices = $dschoices->getElementsByTagName('Choice');
								for($ch = 0; $ch < $dschoices->length; $ch++) {
									$choice = $this->getDOMElementItem($dschoices, $ch);
									$choices[] = [
										'id' => (int)$choice->getAttribute('id'),
										'value' => $choice->getAttribute('value'),
										'label' => $choice->getAttribute('label')
									];
								}
							}
						}
						$columns[strtolower($column->getAttribute('name'))] = [
							'id' => (int)$column->getAttribute('id'),
							'name' => $column->getAttribute('name'),
							'type' => $column->getAttribute('type'),
							'label' => $column->getAttribute('label'),
							'description' => "", // $column->Description,
							'choices' => $choices
						];
					}
					$tables[strtolower($table->getAttribute('name'))] = [
						'id' => (int)$table->getAttribute('id'),
						'name' => $table->getAttribute('name'),
						'label' => $table->getAttribute('label'),
						'description' => "", // $table->Description,
						'columns' => $columns
					];
				}
			}
		}
		return $tables;
	}

	/**
	 * Checks the uniqueness of id and business rule names
	 *
	 * @access  private
	 * @param   string $simu The simulator name
	 * @param   \DOMXPath $simulatorxpath The simulator xpath
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  bool true if id and data names are unique, false if not.
	 *
	 */
	private function checkBusinessRulesUniqueness(string $simu, \DOMXPath $simulatorxpath, OutputInterface $output) {
		$ok = true;
		$usedIds = array();
		$usedNames = array();
		$brules = $simulatorxpath->query("//BusinessRules/BusinessRule");
		$len = $brules->length;
		if ($len > 0) {
			for($i = 0; $i < $len; $i++) {
				$data = $this->getDOMElementItem($brules, $i);
				$id = $data->getAttribute('id');
				if (isset($usedIds[$id])) {
					$this->info($output, "ERROR: The business rule id #%id% is used multiple times.", array('%id%' => $id));
					$ok = false;
				} else {
					$usedIds[$id] = true;
				}
				$name = $data->getAttribute('name');
				if (isset($usedNames[$name])) {
					$this->info($output, "ERROR: The business rule name '%name%' is used multiple times.", array('%name%' => $name));
					$ok = false;
				} else {
					$usedNames[$name] = true;
				}
			}
		}
		return $ok;
	}


}
