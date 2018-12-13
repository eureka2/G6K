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
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Filesystem\Filesystem;

/**
 * Imports a simulator from an exported xml file.
 *
 * This command allows to import a simulator and eventually, its stylesheets.
 */
class ImportSimulatorCommand extends CommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir);
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:simulator:import';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Imports a simulator from an exported xml file.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to import a simulator and eventually, its stylesheets.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the simulator (simulatorname).")."\n"
			. $this->translator->trans("- the full path of the directory (simulatorpath) where the XML file of your simulator is located.")."\n"
			. $this->translator->trans("and optionally:")."\n"
			. $this->translator->trans("- the full path of the directory (stylesheetpath) where the css file of the stylesheet is located.")."\n"
			. "\n"
			. $this->translator->trans("The file names will be composed as follows:")."\n"
			. $this->translator->trans("- <simulatorpath>/<simulatorname>.xml for the simulator XML file")."\n"
			. $this->translator->trans("- <stylesheetpath>/<simulatorname>.css for the stylesheet file")."\n"
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
			),
			array(
				'simulatorpath',
				InputArgument::REQUIRED,
				$this->translator->trans('The directory where is located the simulator XML file.')
			),
			array(
				'stylesheetpath',
				InputArgument::OPTIONAL,
				$this->translator->trans('The directoty where is located the stylesheet, if any.')
			)
		);
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		return array();
	}

	/**
	 * Checks the argument of the current command (g6k:simulator:import).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$this->askArgument($input, $output, 'simulatorname', "Enter the name of the simulator : ");
		$this->askArgument($input, $output, 'simulatorpath', "Enter the directory where is located the simulator XML file: ");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		$simupath = $input->getArgument('simulatorpath');
		$simufile = $simupath . DIRECTORY_SEPARATOR . $input->getArgument('simulatorname') . ".xml";
		$csspath = $input->getArgument('stylesheetpath');
		$stylesheet = $csspath ? $csspath . DIRECTORY_SEPARATOR . $input->getArgument('simulatorname') . ".css" : "";
		$output->writeln([
			$this->translator->trans("Simulator Importer"),
			'===================',
			'',
		]);
		if (! file_exists($simufile)) {
			$output->writeln($this->translator->trans("The simulator XML file '%s%' doesn't exists", array('%s%' => $simufile)));
			return 1;
		}
		if (! file_exists($stylesheet)) {
			$output->writeln($this->translator->trans("The stylesheet file '%s%' doesn't exists", array('%s%' => $stylesheet)));
			return 1;
		}
		$output->writeln($this->translator->trans("Importing the simulator '%simulatorname%' located in '%simulatorpath%'", array('%simulatorname%' => $input->getArgument('simulatorname'), '%simulatorpath%' => $input->getArgument('simulatorpath'))));
		$schema = $this->projectDir."/var/doc/Simulator.xsd";
		$simulatorsDir = $this->projectDir . DIRECTORY_SEPARATOR . "var" . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'simulators';
		$assetsDir = $this->projectDir."/".$this->parameters['public_dir']."/assets";
		$viewsDir = $this->projectDir."/templates";
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
			$output->writeln([
				$this->translator->trans("XML Validation errors:"),
				$mess
			]);
			return 1;
		}
		$fsystem = new Filesystem();
		$xpath = new \DOMXPath($dom);
		$simu = $dom->documentElement->getAttribute('name');
		$view = $dom->documentElement->getAttribute('defaultView');
		if (! $fsystem->exists(array($viewsDir.'/'.$view, $assetsDir.'/'.$view))) {
			$view = 'Demo';
			$dom->documentElement->setAttribute('defaultView', $view);
		}
		$sources = $xpath->query("/Simulator/Sources/Source");
		$len = $sources->length;
		for($i = 0; $i < $len; $i++) {
			$source = $this->getDOMElementItem($sources, $i);
			$datasource = $source->getAttribute('datasource');
			if (is_numeric($datasource)) {
				$source->setAttribute('datasource', $simu);
			}
		}
		$formatted = preg_replace_callback('/^( +)</m', function($a) { 
			return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
		}, $dom->saveXML(null, LIBXML_NOEMPTYTAG));
		$fsystem->dumpFile($simulatorsDir.'/'.$simu.'.xml', $formatted);
		if ($stylesheet != '') {
			if (! $fsystem->exists($assetsDir.'/'.$view.'/css')) {
				$fsystem->mkdir($assetsDir.'/'.$view.'/css');
			}
			$fsystem->copy($stylesheet, $assetsDir.'/'.$view.'/css/'.$simu.'.css', true);
			$this->addToManifest('assets/'.$view.'/css/'.$simu.'.css', $output);
		} else if (! $fsystem->exists($assetsDir.'/'.$view.'/css/'.$simu.'.css')) {
			if ($view == 'Demo') {
				$fsystem->dumpFile($assetsDir.'/'.$view.'/css/'.$simu.'.css', '@import "common.css";'."\n");
			} else {
				if (! $fsystem->exists($assetsDir.'/'.$view.'/css')) {
					$fsystem->mkdir($assetsDir.'/'.$view.'/css');
				}
				$fsystem->copy($assetsDir.'/Demo/css/common.css', $assetsDir.'/'.$view.'/css/'.$simu.'.css');
			}
			$this->addToManifest('assets/'.$view.'/css/'.$simu.'.css', $output);
		}
		$output->writeln($this->translator->trans("The simulator '%s%' is successfully imported", array('%s%' => $simu)));
		return 0;
	}

	/**
	 * Adds a stylesheet to the assets manifest
	 *
	 * @param   string $assetpath The asset path
	 * @return void
	 *
	 */
	private function addToManifest($assetpath, $output) {
		$command = $this->getApplication()->find('g6k:assets:manifest:add-asset');
		$input = new ArrayInput(array(
			'command' => 'g6k:assets:manifest:add-asset',
			'assetpath' => $assetpath,
			'--no-interaction' => true
		));
		$output->writeln("");
		$output->writeln($this->translator->trans("View Importer: Adding the stylesheet to the assets manifest"));
		$returnCode = $command->run($input, $output);
		if ($returnCode == 0) {
			$output->writeln($this->translator->trans("View Importer: Adding of the stylesheet is done!"));
		} else {
			$output->writeln($this->translator->trans("View Importer: Adding of the stylesheet is not done!"));
		}
	}

	/**
	 * Retuns the DOMElement at position $index of the DOMNodeList
	 *
	 * @access  private
	 * @param   \DOMNodeList $nodes The DOMNodeList
	 * @param   int $index The position in the DOMNodeList
	 * @return  \DOMElement|null The DOMElement.
	 *
	 */
	private function getDOMElementItem($nodes, $index) {
		$node = $nodes->item($index);
		if ($node && $node->nodeType === XML_ELEMENT_NODE) {
			return $node;
		}
		return null;
	}
}
