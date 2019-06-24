<?php

/*
The MIT License (MIT)

Copyright (c) 2018-2019 Jacques Archimède

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
use Symfony\Component\Finder\Finder;
use Symfony\Component\Filesystem\Filesystem;

/**
 * Copies one or all simulators from another instance of G6K.
 *
 * This command allows to copy simulators and eventually, their stylesheets.
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
		return $this->translator->trans('Copies one or all simulators from another instance of G6K.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to copy one or all simulators and their stylesheets from another instance of G6K after a fresh installation.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the simulator (simulatorname).")."\n"
			. $this->translator->trans("- the full path of the directory (anotherg6kpath) where the other instance of G6K is installed.")."\n"
			. "\n"
			. $this->translator->trans("To copy all simulators, enter 'all' as simulator name.")."\n"
			. $this->translator->trans("In this case, one or more simulators can be excluded with the --exclude (-x) option.")."\n"
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
				$this->translator->trans("The name of the simulator or 'all'.")
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
				'exclude', 
				'x', 
				InputOption::VALUE_OPTIONAL|InputOption::VALUE_IS_ARRAY, 
				$this->translator->trans("One or more simulators to exclude when <simulatorname> is 'all'."),
			),
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
		$this->askArgument($input, $output, 'anotherg6kpath', "Enter the installation directory of the other instance of G6K : ");
		$output->writeln("");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$simulatorname = $input->getArgument('simulatorname');
		$anotherg6kpath = str_replace('\\', '/', $input->getArgument('anotherg6kpath'));
		$widgets = $input->getOption('default-widget') ?? [];
		$exclude = $input->getOption('exclude') ?? [];
		foreach($widgets as $widget) {
			if (! file_exists($this->projectDir."/".$this->parameters['public_dir']."/assets/base/widgets/".$widget)) {
				$this->error($output, "The widget '%s%' doesn't exists", array('%s%' => $widget));
				return 1;
			}
		}
		if (! file_exists($anotherg6kpath)) {
			$this->error($output, "The directory of the other instance '%s%' doesn't exists", array('%s%' => $anotherg6kpath));
			return 1;
		}
		$this->info($output, "Finding the simulators directory of the other instance '%s%' in progress", array('%s%' => $anotherg6kpath));
		$simulatorsDir1 = $this->findSimulatorsDirectory($anotherg6kpath, $input, $output);
		if ($simulatorsDir1 === 1) {
			$this->error($output, "Can not find the simulators directory of the other instance '%s%'", array('%s%' => $anotherg6kpath));
			return 1;
		} elseif ($simulatorsDir1 === 2) { 
			$this->error($output, "Multiple simulators directories were found in the other instance '%s%'", array('%s%' => $anotherg6kpath));
			return 1;
		}
		$this->info($output, "Finding the assets directory of the other instance '%s%' in progress", array('%s%' => $anotherg6kpath));
		$assetsDir1 = $this->findAssetsDirectory($anotherg6kpath, $input, $output);
		if ($assetsDir1 === 1) {
			$this->error($output, "Can not find the assets directory of the other instance '%s%'", array('%s%' => $anotherg6kpath));
			return 1;
		} elseif ($assetsDir1 === 2) { 
			$this->error($output, "Multiple assets directories were found in the other instance '%s%'", array('%s%' => $anotherg6kpath));
			return 1;
		}
		$simulators = [];
		if ($simulatorname == 'all') {
			$finder = new Finder();
			$finder->files()->in($simulatorsDir1)->depth('== 0')->name('*.xml');
			foreach ($finder as $file) {
				$name = preg_replace("/.xml$/", "", basename($file->getRelativePathname()));
				if (!in_array($name, $exclude)) {
					$simulators[] = $name;
				}
			}
		} else {
			$simulators[] = $simulatorname;
		}
		$oneOk = false;
		foreach ($simulators as $simulatorname) {
			if ($this->copy($simulatorname, $anotherg6kpath, $simulatorsDir1, $assetsDir1, $widgets, $input, $output)) {
				$this->success($output, "The simulator '%s%' is successfully copied", array('%s%' => $simulatorname));
				$oneOk = true;
			}
		}
		return $oneOk ? 0 : 1;
	}

	private function copy(string $simulatorname, string $anotherg6kpath, string $simulatorsDir1, string $assetsDir1, array $widgets, InputInterface $input, OutputInterface $output) {
		$simufile = $simulatorsDir1.'/'.$simulatorname.'.xml';
		if (!file_exists($simufile)) {
			$this->error($output, "The simulator XML file '%s%' doesn't exists", array('%s%' => $simufile));
			return false;
		}
		$simulatorsDir2 = $this->projectDir . '/var/data/simulators';
		$assetsDir2 = $this->projectDir."/".$this->parameters['public_dir']."/assets";
		$viewsDir2 = $this->projectDir."/templates";
		$this->info($output, "Finding the %simulatorname%.css files from the other instance '%s%' in progress", array('%simulatorname%' => $simulatorname, '%s%' => $anotherg6kpath));
		$stylesheets = $this->findFile($assetsDir1, $simulatorname.'.css', $input, $output, ['path' => '/css/', 'multiple' => true]);
		$this->info($output, "Copying the simulator '%simulatorname%' located in '%simulatorpath%'", array('%simulatorname%' => $simulatorname, '%simulatorpath%' => dirname($simufile)));
		$simulator = new \DOMDocument();
		$simulator->preserveWhiteSpace  = false;
		$simulator->formatOutput = true;
		$simulator->load($simufile);
		if (!$this->validatesAgainstSchema($simulator, $output)) {
			return false;
		}
		$fsystem = new Filesystem();
		$simu = $simulator->documentElement->getAttribute('name');
		$view = $simulator->documentElement->getAttribute('defaultView');
		if (! $fsystem->exists(array($viewsDir2.'/'.$view, $assetsDir2.'/'.$view))) {
			if (! $this->runEmbeddedCommand(['command' => 'g6k:view:copy', 'viewname' => $view, 'anotherg6kpath' => $anotherg6kpath], $input, $output)) {
				$view = 'Demo';
				foreach($stylesheets as $stylesheet) {
					$sview = basename(dirname(dirname($stylesheet)));
					if (file_exists($assetsDir2 ."/" . $sview)) {
						$view = $sview;
						break;
					}
				}
				$simulator->documentElement->setAttribute('defaultView', $view);
			}
		}
		$stylesheets = array_filter($stylesheets, function ($stylesheet) use ($assetsDir2) {
			$sview = basename(dirname(dirname($stylesheet)));
			return file_exists($assetsDir2 ."/" . $sview);
		});
		$this->copyTemplates($simulator, $anotherg6kpath, $fsystem, $input, $output);
		$this->fixDatasourcesReference($simulator, $anotherg6kpath, $input, $output);
		$this->fixNewAttributes($simulator);
		if (!empty($widgets)) {
			$this->setWidgets($simulator, $widgets);
		}
		$this->copyDatasources($simulator, $anotherg6kpath, $input, $output);
		$formatted = preg_replace_callback('/^( +)</m', function($a) { 
			return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
		}, $simulator->saveXML(null, LIBXML_NOEMPTYTAG));
		$fsystem->dumpFile($simulatorsDir2.'/'.$simu.'.xml', $formatted);
		if (empty($stylesheets)) {
			$fsystem->dumpFile($assetsDir2.'/'.$view.'/css/'.$simu.'.css', '@import "common.css";'."\n");
			$this->addToManifest('assets/'.$view.'/css/'.$simu.'.css', $output);
		} else {
			foreach($stylesheets as $stylesheet) {
				$view = basename(dirname(dirname($stylesheet)));
				$fsystem->copy($stylesheet, $assetsDir2.'/'.$view.'/css/'.$simu.'.css', true);
				$this->addToManifest('assets/'.$view.'/css/'.$simu.'.css', $output);
			}
		}
		return true;
	}

	private function copyDatasources(\DOMDocument $simulator, string $anotherg6kpath, InputInterface $input, OutputInterface $output) {
		$datasources = new \DOMDocument();
		$datasources->preserveWhiteSpace  = false;
		$datasources->formatOutput = true;
		$datasources->load($this->projectDir."/var/data/databases/DataSources.xml");
		$xpaths = new \DOMXPath($datasources);
		$xpath = new \DOMXPath($simulator);
		$sources = $xpath->query("/Simulator/Sources/Source");
		$len = $sources->length;
		$copieds = [];
		for($i = 0; $i < $len; $i++) {
			$source = $this->getDOMElementItem($sources, $i);
			$datasourcename = $source->getAttribute('datasource');
			if (!in_array($datasourcename, $copieds)) {
				$dss = $xpaths->query("/DataSources/DataSource[@name='" . $datasourcename . "']");
				if ($dss->length == 0) {
					if ($this->runEmbeddedCommand(['command' => 'g6k:datasource:copy', 'datasourcename' => $datasourcename, 'anotherg6kpath' => $anotherg6kpath], $input, $output)) {
						$copieds[] = $datasourcename;
					}
				}
			}
		}
	}

	private function copyTemplates(\DOMDocument $simulator, string $anotherg6kpath, Filesystem $fsystem, InputInterface $input, OutputInterface $output) {
		$xpath = new \DOMXPath($simulator);
		$steps = $xpath->query("/Simulator/Steps/Step");
		$len = $steps->length;
		$viewsDir1 = $this->findTemplatesDirectory($anotherg6kpath, $input, $output);
		$viewsDir2 = $this->projectDir."/templates";
		$view = $simulator->documentElement->getAttribute('defaultView');
		$pdfDir1 = $this->findPDFFormsDirectory($anotherg6kpath, $input, $output);
		$pdfDir2 = $this->projectDir."/var/data/pdfforms";
		for($i = 0; $i < $len; $i++) {
			$step = $this->getDOMElementItem($steps, $i);
			$template = str_replace(':', '/', $step->getAttribute('template'));
			$sOutput = $step->getAttribute('output');
			if ($sOutput == 'inlineFilledPDF' || $sOutput == 'downloadableFilledPDF') {
				$info = pathinfo($template, PATHINFO_FILENAME) . ".info";
				if ($fsystem->exists($pdfDir1.'/'.$template)) {
					$this->info($output, "Copying the PDF '%pdf%' of the other instance '%s%'", ['%pdf%' => $template, '%s%' => $anotherg6kpath]);
					$fsystem->copy($pdfDir1.'/'.$template, $pdfDir2.'/'.$template);
				}
				if ($fsystem->exists($pdfDir1.'/'.$info)) {
					$this->info($output, "Copying the infos about the PDF '%pdf%' of the other instance '%s%'", ['%pdf%' => $info, '%s%' => $anotherg6kpath]);
					$fsystem->copy($pdfDir1.'/'.$info, $pdfDir2.'/'.$info);
				}
			} else {
				if (! $fsystem->exists($viewsDir2.'/'.$view.'/'.$template)) {
					$this->info($output, "Migrating the template '%template%' of the other instance '%s%'", ['%template%' => $template, '%s%' => $anotherg6kpath]);
					$contents = file_get_contents($viewsDir1.'/'.$view.'/'.$template);
					$contents = preg_replace("/EUREKAG6KBundle:([^:]+):/m", "$1/", $contents);
					$contents = preg_replace("|asset\('bundles/eurekag6k/base/js/|m", "asset('assets/base/js/libs/", $contents);
					$contents = preg_replace("|asset\('assets/base/js/libs/g6k\.|m", "asset('assets/base/js/g6k.", $contents);
					$contents = preg_replace("|asset\('bundles/eurekag6k/admin/js/|m", "asset('assets/admin/js/libs/", $contents);
					$contents = preg_replace("|asset\('assets/admin/js/libs/g6k\.|m", "asset('assets/admin/js/g6k.", $contents);
					$contents = preg_replace("|asset\('bundles/eurekag6k/|m", "asset('assets/", $contents);
					$contents = preg_replace("|\\\$\([\"']input\.listbox\-input[\"']\)\.listbox|m", "$(\":input[data-widget='abListbox']\").listbox", $contents);
					$contents = preg_replace("|\\\$\([\"']input\.date[\"']\)\.datepicker|m", "$(\":input[data-widget='abDatepicker']\").datepicker", $contents);
					$fsystem->dumpFile($viewsDir2.'/'.$view.'/'.$template, $contents);
				}
			}
		}
	}

}
