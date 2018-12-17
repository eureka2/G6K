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
			$errors = libxml_get_errors();
			$mess = "";
			foreach ($errors as $error) {
				$mess .= "Line ".$error->line . '.' .  $error->column . ": " .  $error->message . "\n";
			}
			libxml_clear_errors();
			$this->error($output, "XML Validation errors:");
			$this->error($output, $mess);
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
	 * Sets the widget for all field of type choice 
	 *
	 * @access  protected
	 * @param   \DOMDocument $simulator The simulator document
	 * @param   string $widget The widget name
	 * @return  bool true if widget has been set, false otherwise.
	 *
	 */
	protected function setChoiceWidget(\DOMDocument $simulator, string $widget) {
		$set = false;
		$xpath = new \DOMXPath($simulator);
		$fields = $xpath->query("//FieldSet//Field");
		for ($i = 0; $i < $fields->length; $i++) {
			$field = $this->getDOMElementItem($fields, $i);
			if (! $field->hasAttribute('widget')) {
				if ($field->parentNode->nodeName != 'FieldRow' && (! $field->hasAttribute('expanded') || $field->getAttribute('expanded') == '0')) {
					$dataId = $field->getAttribute('data');
					$type = $xpath->query("//DataSet//Data[@id='".$dataId."']/@type")->item(0)->nodeValue;
					if (in_array($type, ['choice', 'department', 'region', 'year', 'month', 'day'])) {
						$field->setAttribute('widget', $widget);
						$set = true;
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
			'--no-interaction' => true
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
