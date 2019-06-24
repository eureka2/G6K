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

/**
 * Imports a simulator from an exported xml file.
 *
 * This command allows to import a simulator and eventually, its stylesheets.
 */
class ImportSimulatorCommand extends SimulatorCommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir, "Simulator Importer");
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
			. $this->translator->trans("- the full path of the directory (pdfformspath) where the PDF Form file is located.")."\n"
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
				$this->translator->trans('The directory where is located the stylesheet, if any.')
			),
			array(
				'pdfformspath',
				InputArgument::OPTIONAL,
				$this->translator->trans('The directory where is located the PDF Form, if any.')
			)
		);
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		return array(
			array(
				'default-widget', 
				'w', 
				InputOption::VALUE_OPTIONAL|InputOption::VALUE_IS_ARRAY, 
				$this->translator->trans('Default widget for compatible input fields.'),
			)
		);
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
		$output->writeln("");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$simulatorsDir = $this->projectDir . '/var/data/simulators';
		$assetsDir = $this->projectDir."/".$this->parameters['public_dir']."/assets";
		$viewsDir = $this->projectDir."/templates";
		$simupath = str_replace('\\', '/', $input->getArgument('simulatorpath'));
		$simufile = $simupath . '/'. $input->getArgument('simulatorname') . ".xml";
		$csspath = $input->getArgument('stylesheetpath');
		$pdfpath = $input->getArgument('pdfformspath');
		$stylesheet = $csspath ? $csspath . '/' . $input->getArgument('simulatorname') . ".css" : "";
		if (! file_exists($simufile)) {
			$this->error($output, "The simulator XML file '%s%' doesn't exists", array('%s%' => $simufile));
			return 1;
		}
		if ($stylesheet != "" && ! file_exists($stylesheet)) {
			$this->error($output, "The stylesheet file '%s%' doesn't exists", array('%s%' => $stylesheet));
			return 1;
		}
		$widgets = $input->getOption('default-widget') ?? [];
		foreach($widgets as $widget) {
			if ($widget && ! file_exists($assetsDir . '/base/widgets/' . $widget)) {
				$this->error($output, "The widget '%s%' doesn't exists", array('%s%' => $widget));
				return 1;
			}
		}
		$this->info($output, "Importing the simulator '%simulatorname%' located in '%simulatorpath%'", array('%simulatorname%' => $input->getArgument('simulatorname'), '%simulatorpath%' => $input->getArgument('simulatorpath')));
		$simulator = new \DOMDocument();
		$simulator->preserveWhiteSpace  = false;
		$simulator->formatOutput = true;
		$simulator->load($simufile);
		if (!$this->validatesAgainstSchema($simulator, $output)) {
			return 1;
		}
		$fsystem = new Filesystem();
		$simu = $simulator->documentElement->getAttribute('name');
		$view = $simulator->documentElement->getAttribute('defaultView');
		if (! $fsystem->exists(array($viewsDir.'/'.$view, $assetsDir.'/'.$view))) {
			$view = 'Demo';
			$simulator->documentElement->setAttribute('defaultView', $view);
		}
		$this->fixDatasourcesReference($simulator, $this->projectDir."/var/data/databases", $input, $output);
		$this->fixNewAttributes($simulator);
		if (!empty($widgets)) {
			$this->setWidgets($simulator, $widgets);
		}
		$formatted = preg_replace_callback('/^( +)</m', function($a) { 
			return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
		}, $simulator->saveXML(null, LIBXML_NOEMPTYTAG));
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
		if ($pdfpath) {
			$pdfDir = $this->projectDir."/var/data/pdfforms";
			$xpath = new \DOMXPath($simulator);
			$steps = $xpath->query("/Simulator/Steps/Step");
			$len = $steps->length;
			for($i = 0; $i < $len; $i++) {
				$step = $this->getDOMElementItem($steps, $i);
				$sOutput = $step->getAttribute('output');
				if ($sOutput == 'inlineFilledPDF' || $sOutput == 'downloadableFilledPDF') {
					$template = str_replace(':', '/', $step->getAttribute('template'));
					$info = pathinfo($template, PATHINFO_FILENAME) . ".info";
					if ($fsystem->exists($pdfpath.'/'.$template)) {
						$fsystem->copy($pdfpath.'/'.$template, $pdfDir.'/'.$template);
					}
					if ($fsystem->exists($pdfpath.'/'.$info)) {
						$fsystem->copy($pdfpath.'/'.$info, $pdfDir.'/'.$info);
					}
				}
			}
		}
		$this->success($output, "The simulator '%s%' is successfully imported", array('%s%' => $simu));
		return 0;
	}

}
