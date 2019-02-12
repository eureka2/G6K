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

use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Exception\LogicException;
use Symfony\Component\Yaml\Yaml;

use App\G6K\Manager\ExpressionParser\DateFunction;
use App\G6K\Manager\ExpressionParser\MoneyFunction;

use App\G6K\Model\Data;

/**
Base class for all command of the g6k:simulator namespace.
 */
abstract class SimulatorCommandBase extends CommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir, $name = "Simulator Manager") {
		parent::__construct($projectDir, $name);
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		throw new LogicException("getCommandName method is not implemented");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		throw new LogicException("getCommandDescription method is not implemented");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		throw new LogicException("getCommandHelp method is not implemented");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandArguments() {
		throw new LogicException("getCommandArguments method is not implemented");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		throw new LogicException("getCommandOptions method is not implemented");
	}

	/**
	 * Validates the simulator against its schema
	 *
	 * @access  protected
	 * @param   \DOMDocument $simulator The simulator document
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  bool true if simulator is valid, false if not.
	 *
	 */
	protected function validatesAgainstSchema(\DOMDocument $simulator, OutputInterface $output) {
		$schema = $this->projectDir."/var/doc/Simulator.xsd";
		libxml_use_internal_errors(true);
		if (!$simulator->schemaValidate($schema)) {
			$this->error($output, "XML Validation errors:");
			$errors = libxml_get_errors();
			foreach ($errors as $error) {
				$mess = trim($error->message);
				if ($error->file) {
					$mess .= " in " . basename($error->file);
				}
				$mess .= " on line $error->line\n";
				switch ($error->level) {
					case LIBXML_ERR_WARNING:
						$this->warning($output, "Warning $error->code : " .$mess);
						break;
					case LIBXML_ERR_ERROR:
						$this->error($output, "Error $error->code : " .$mess);
						break;
					case LIBXML_ERR_FATAL:
						$this->fatal($output, "Fatal Error $error->code : " .$mess);
						break;
					default:
						$this->info($output, "$error->code : " .$mess);
				}
			}
			libxml_clear_errors();
			return false;
		}
		return true;
	}

	/**
	 * Replaces the numeric data source reference by the name of the data source
	 * The name of the data source if extracted from the DataSources.xml 
	 *
	 * @access  protected
	 * @param   \DOMDocument $simulator The simulator document
	 * @param   string $path The path where to find DataSources.xml
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  bool false if DataSources.xml is not found, true otherwise.
	 *
	 */
	protected function fixDatasourcesReference(\DOMDocument $simulator, string $path, InputInterface $input, OutputInterface $output) {
		$toFixed = [];
		$xpath = new \DOMXPath($simulator);
		$sources = $xpath->query("/Simulator/Sources/Source");
		$len = $sources->length;
		for($i = 0; $i < $len; $i++) {
			$source = $this->getDOMElementItem($sources, $i);
			$datasource = $source->getAttribute('datasource');
			if (is_numeric($datasource)) {
				$toFixed[] = $source;
			}
		}
		if (empty($toFixed)) {
			return true;
		}
		$this->info($output, "Finding the %name%.xml file from the other instance '%s%' in progress", array('%name%' => 'DataSources', '%s%' => $path));
		$datasources = $this->findFile($path, 'DataSources.xml', $input, $output, ['notPath' => '/deployment/']);
		if (empty($datasources)) {
			return false;
		}
		$datasource = new \DOMDocument();
		$datasource->preserveWhiteSpace  = false;
		$datasource->formatOutput = true;
		$datasource->load($datasources[0]);
		$xpaths = new \DOMXPath($datasource);
		foreach($toFixed as $source){
			$id = $source->getAttribute('datasource');
			$names = $xpaths->query("//DataSource[@id='".$id."']/@name");
			$name = $names->item(0)->nodeValue;
			$source->setAttribute('datasource', $name);
		}
		return true;
	}

	/**
	 * Sets the missing new attributes of the schema: 
	 * - regionale settings (locale, timezone and grouping separator) by those of this platform
	 * - pdfFooter flag
	 *
	 * @access  protected
	 * @param   \DOMDocument $simulator The simulator document
	 * @return  void
	 *
	 */
	protected function fixNewAttributes(\DOMDocument $simulator) {
		if (! $simulator->documentElement->hasAttribute('locale')) {
			$simulator->documentElement->setAttribute('locale', $this->parameters['app_locale']);
		}
		if (! $simulator->documentElement->hasAttribute('timezone')) {
			$simulator->documentElement->setAttribute('timezone', (DateFunction::$timezone)->getName());
		}
		$dataset = $this->getDOMElementItem($simulator->documentElement->getElementsByTagName("DataSet"), 0);
		if (! $dataset->hasAttribute('groupingSeparator')) {
			$dataset->setAttribute('groupingSeparator', MoneyFunction::$groupingSeparator);
		}
		if (! $dataset->hasAttribute('groupingSize')) {
			$dataset->setAttribute('groupingSize', MoneyFunction::$groupingSize);
		}
		$steps = $simulator->documentElement->getElementsByTagName("Step");
		foreach ($steps as $stepNode) {
			$step = $this->castDOMElement($stepNode);
			if ($step->hasAttribute('output') && in_array($step->getAttribute('output'), ['inlinePDF', 'downloadablePDF'])) {
				if (! $step->hasAttribute('pdfFooter')) {
					$step->setAttribute('pdfFooter', '0');
				}
			}
			$actionList = $this->getDOMElementItem($step->getElementsByTagName("ActionList"), 0);
			if ($actionList) {
				$actions = $actionList->getElementsByTagName("Action");
				foreach ($actions as $action) {
					if (! $action->hasAttribute('shape')) {
						$action->setAttribute('shape', 'button');
					}
					if (! $action->hasAttribute('location')) {
						$action->setAttribute('location', 'bottom');
					}
				}
			}
		}
	}

	/**
	 * Sets the default widgets
	 *
	 * @access  protected
	 * @param   \DOMDocument $simulator The simulator document
	 * @param   array $widgets The widget list
	 * @return  bool true if at least one of the widget has been set, false otherwise.
	 *
	 */
	protected function setWidgets(\DOMDocument $simulator, array $widgets) {
		$set = false;
		$config = Yaml::parse(file_get_contents($this->projectDir."/config/packages/g6k.yml"));
		$config = $config['parameters']['widgets'];
		$xpath = new \DOMXPath($simulator);
		$fields = $xpath->query("//FieldSet//Field");
		for ($i = 0; $i < $fields->length; $i++) {
			$field = $this->getDOMElementItem($fields, $i);
			if ($field->getAttribute('usage') == 'input' && ! $field->hasAttribute('widget')) {
				if ($field->parentNode->nodeName != 'FieldRow') {
					$dataId = $field->getAttribute('data');
					$datas = $xpath->query("//DataSet//Data[@id='".$dataId."']");
					$data = $this->getDOMElementItem($datas, 0);
					$type = $data->getAttribute('type');
					$input = 'text';
					switch ($type) {
						case 'boolean':
						case 'multichoice':
							$input = 'checkbox';
							break;
						case 'number':
						case 'integer':
							$input = 'number';
							break;
						case 'textarea':
							$input = 'textarea';
							break;
						case 'choice':
						case 'department':
						case 'region':
						case 'country':
						case 'year':
						case 'month':
						case 'day':
							$expanded = $field->hasAttribute('expanded') ? $field->getAttribute('expanded') : '0';
							$input = ($expanded == '1') ? 'radio' : 'select';
							break;
					}
					foreach($widgets as $widget) {
						if (isset($config[$widget])) {
							$targets = $config[$widget]['target'];
							if ($targets[0] == 'all') {
								$targets = Data::TYPES;
							}
							$inputs = $config[$widget]['input'];
							if ($inputs[0] == 'all') {
								$inputs = ['text', 'checkbox', 'number', 'textarea', 'radio', 'select'];
							}
							if (in_array($type, $targets) && in_array($input, $inputs)) {
								$field->setAttribute('widget', $widget);
								$set = true;
								break;
							}
						}
					}
				}
			}
		}
		return $set;
	}

	/**
	 * Adds a stylesheet to the assets manifest
	 *
	 * @param   string $assetpath The asset path
	 * @return void
	 *
	 */
	protected function addToManifest($assetpath, $output) {
		$command = $this->getApplication()->find('g6k:assets:manifest:add-asset');
		$input = new ArrayInput(array(
			'command' => 'g6k:assets:manifest:add-asset',
			'assetpath' => $assetpath,
			'--no-interaction' => true,
			'--html' => $this->isHtml()
		));
		$output->writeln("");
		$this->info($output, "Adding the stylesheet to the assets manifest");
		$returnCode = $command->run($input, $output);
		if ($returnCode == 0) {
			$this->success($output, "Adding of the stylesheet is done!");
		} else {
			$this->error($output, "Adding of the stylesheet is not done!");
		}
	}

}
