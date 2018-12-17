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
class CopySimulatorCommand extends SimulatorCommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir, "Simulator Copier");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:simulator:copy';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Copies a simulator from another instance of G6K.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to copy a simulator and its stylesheets from another instance of G6K after a fresh installation.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the simulator (simulatorname).")."\n"
			. $this->translator->trans("- the full path of the directory (anotherg6kpath) where the other instance of G6K is installed.")."\n"
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
				'anotherg6kpath',
				InputArgument::REQUIRED,
				$this->translator->trans('The installation directory of the other instance of G6K.')
			)
		);
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		return array(
			array(
				'default-choice-widget', 
				'c', 
				InputOption::VALUE_OPTIONAL, 
				$this->translator->trans('Default widget for unexpanded choice fields.'),
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
		$this->askArgument($input, $output, 'anotherg6kpath', "Enter the installation directory of the other instance of G6K : ");
		$output->writeln("");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$simulatorsDir = $this->projectDir . DIRECTORY_SEPARATOR . "var" . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'simulators';
		$assetsDir = $this->projectDir."/".$this->parameters['public_dir']."/assets";
		$viewsDir = $this->projectDir."/templates";
		$simulatorname = $input->getArgument('simulatorname');
		$anotherg6kpath = $input->getArgument('anotherg6kpath');
		$widget = $input->getOption('default-choice-widget');
		if ($widget && ! file_exists($assetsDir . '/base/widgets/' . $widget)) {
			$this->error($output, "The widget '%s%' doesn't exists", array('%s%' => $widget));
			return 1;
		}
		if (! file_exists($anotherg6kpath)) {
			$this->error($output, "The directory of the other instance '%s%' doesn't exists", array('%s%' => $anotherg6kpath));
			return 1;
		}
		$this->info($output, "Finding the %name%.xml file from the other instance '%s%' in progress", array('%name%' => $simulatorname, '%s%' => $anotherg6kpath));
		$simufiles = $this->findFile($anotherg6kpath, $simulatorname.'.xml', $input, $output, ['path' => '/simulators/', 'notPath' => '/work/']);
		if (empty($simufiles)) {
			return 1;
		}
		$simufile = $simufiles[0];
		$this->info($output, "Finding the %simulatorname%.css files from the other instance '%s%' in progress", array('%simulatorname%' => $simulatorname, '%s%' => $anotherg6kpath));
		$stylesheets = $this->findFile($anotherg6kpath, $simulatorname.'.css', $input, $output, ['path' => '/css/', 'multiple' => true]);
		$stylesheets = array_filter($stylesheets, function ($stylesheet) use ($assetsDir) {
			$view = basename(dirname(dirname($stylesheet)));
			return file_exists($assetsDir ."/" . $view);
		});
		$this->info($output, "Copying the simulator '%simulatorname%' located in '%simulatorpath%'", array('%simulatorname%' => $simulatorname, '%simulatorpath%' => dirname($simufile)));
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
			$view = empty($stylesheets) ? 'Demo' : basename(dirname(dirname($stylesheets[0])));
			$simulator->documentElement->setAttribute('defaultView', $view);
		}
		$this->fixDatasourcesReference($simulator, $anotherg6kpath, $input, $output);
		if ($widget) {
			$this->setChoiceWidget($simulator, $widget);
		}
		$formatted = preg_replace_callback('/^( +)</m', function($a) { 
			return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
		}, $simulator->saveXML(null, LIBXML_NOEMPTYTAG));
		$fsystem->dumpFile($simulatorsDir.'/'.$simu.'.xml', $formatted);
		if (empty($stylesheets)) {
			$fsystem->dumpFile($assetsDir.'/'.$view.'/css/'.$simu.'.css', '@import "common.css";'."\n");
			$this->addToManifest('assets/'.$view.'/css/'.$simu.'.css', $output);
		} else {
			foreach($stylesheets as $stylesheet) {
				$view = basename(dirname(dirname($stylesheet)));
				$fsystem->copy($stylesheet, $assetsDir.'/'.$view.'/css/'.$simu.'.css', true);
				$this->addToManifest('assets/'.$view.'/css/'.$simu.'.css', $output);
			}
		}
		$this->success($output, "The simulator '%s%' is successfully copied", array('%s%' => $simu));
		return 0;
	}

}
