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
use Symfony\Component\Finder\Finder;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Yaml\Yaml;

/**
 * Copies one or all views from another instance of G6K.
 */
class CopyViewCommand extends ViewCommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir, "View Copier");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:view:copy';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Copies one or all views from another instance of G6K.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to copy one or all views from another instance of G6K after a fresh installation.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the view (viewname).")."\n"
			. $this->translator->trans("- the full path of the directory (anotherg6kpath) where the other instance of G6K is installed.")."\n"
			. $this->translator->trans("and optionally:")."\n"
			. $this->translator->trans("- the url (viewurl) of the website where this view is used.")."\n"
			. "\n"
			. $this->translator->trans("To copy all views, enter 'all' as view name.")."\n"
			. $this->translator->trans("In this case, one or more views can be excluded with the --exclude (-x) option.")."\n"
		;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandArguments() {
		return array(
			array(
				'viewname',
				InputArgument::REQUIRED,
				$this->translator->trans("The name of the view or 'all'.")
			),
			array(
				'anotherg6kpath',
				InputArgument::REQUIRED,
				$this->translator->trans('The installation directory of the other instance of G6K.')
			),
			array(
				'viewurl',
				InputArgument::OPTIONAL,
				$this->translator->trans('The url of the website where this view is used.')
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
				$this->translator->trans("One or more views to exclude when <viewname> is 'all'."),
			)
		);
	}

	/**
	 * Checks the argument of the current command (g6k:view:copy).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$this->askArgument($input, $output, 'viewname', "Enter the name of the view : ");
		$this->askArgument($input, $output, 'anotherg6kpath', "Enter the installation directory of the other instance of G6K : ");
		$output->writeln("");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$view = $input->getArgument('viewname');
		$anotherg6kpath = str_replace('\\', '/', $input->getArgument('anotherg6kpath'));
		$viewurl = $input->getArgument('viewurl');
		$exclude = $input->getOption('exclude') ?? [];
		if (! file_exists($anotherg6kpath)) {
			$this->error($output, "The directory of the other instance '%s%' doesn't exists", array('%s%' => $anotherg6kpath));
			return 1;
		}
		$this->info($output, "Finding the templates directory of the other instance '%s%' in progress", array('%s%' => $anotherg6kpath));
		$templatesDir1 = $this->findTemplatesDirectory($anotherg6kpath, $input, $output);
		if ($templatesDir1 === 1) {
			$this->error($output, "Can not find the templates directory of the other instance '%s%'", array('%s%' => $anotherg6kpath));
			return 1;
		} elseif ($templatesDir1 === 2) { 
			$this->error($output, "Multiple templates directories were found in the other instance '%s%'", array('%s%' => $anotherg6kpath));
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
		$otherConfigFile = $anotherg6kpath."/src/EUREKA/G6KBundle/Resources/config/parameters.yml";
		$otherConfig = null;
		if (!file_exists($otherConfigFile)) {
			$otherConfigFile = $anotherg6kpath."/config/packages/g6k.yml";
			if (! file_exists($otherConfigFile)) {
				$otherConfigFile = '';
			}
		}
		if ($otherConfigFile != '') {
			$config = file_get_contents($otherConfigFile);
			$otherConfig = Yaml::parse($config);
		}
		$views = [];
		if ($view == 'all') {
			$finder = new Finder();
			$finder->directories()->in($templatesDir1)->depth('== 0')->exclude(['admin', 'base', 'bundles', 'Default', 'Demo', 'Theme']);
			foreach ($finder as $dir) {
				$view = $dir->getRelativePathname();
				if (!in_array($view, $exclude)) {
					$views[] = $view;
				}
			}
		} else {
			$views[] = $view;
		}
		$oneOk = false;
		foreach ($views as $view) {
			$viewpath = $viewurl;
			if (!$viewpath && $otherConfig !== null) {
				if (isset($otherConfig['parameters']['viewpath'][$view])) {
					$viewpath = $otherConfig['parameters']['viewpath'][$view];
				}
			}
			if ($this->copy($view, $anotherg6kpath, $templatesDir1, $assetsDir1, $viewpath, $output)) {
				$this->success($output, "The view '%s%' is successfully created", array('%s%' => $view));
				$oneOk = true;
			}
		}
		if ($oneOk) {
			$this->refreshAssetsManifest($output);
		}
		return $oneOk ? 0 : 1;
	}

	private function copy(string $view, string $anotherg6kpath, string $templatesDir1, string $assetsDir1, string $viewurl, OutputInterface $output) {
		if (!file_exists($templatesDir1 . '/' . $view)) {
			$this->error($output, "The view '%view%' doesn't exists in the templates directory '%s%'", array('%view%' => $view, '%s%' => $templatesDir1));
			return false;
		}
		if (!file_exists($assetsDir1 . '/' . $view)) {
			$this->error($output, "The view '%view%' doesn't exists in the assets directory '%s%'", array('%view%' => $view, '%s%' => $assetsDir1));
			return false;
		}
		if ($viewurl && ! filter_var($viewurl, FILTER_VALIDATE_URL, FILTER_FLAG_HOST_REQUIRED)) {
			$this->error($output, "The url of the website '%s%' isn't valid", array('%s%' => $viewurl));
			return false;
		}
		$this->info($output, "Copying the view '%view%' from '%anotherg6kpath%'", array('%view%' => $view, '%anotherg6kpath%' => $anotherg6kpath));
		$templatesDir2 = $this->projectDir . "/templates";
		$assetsDir2 = $this->projectDir . '/' . $this->parameters['public_dir'] . '/assets';
		$fsystem = new Filesystem();
		try {
			$fsystem->mkdir($templatesDir2 . '/' . $view);
			$fsystem->mirror($templatesDir1 . '/' . $view, $templatesDir2 . '/' . $view, null);
		} catch (IOExceptionInterface $e) {
			$this->error($output, "Error while creating '%view%' in '%viewpath%' : %message%", array('%view%' => $view, '%viewpath%' => $templatesDir2, '%message%' => $e->getMessage()));
			return false;
		}
		$this->migrate3To4($view, $output);
		try {
			$fsystem->mkdir($assetsDir2 . '/' . $view);
			$simulatorsDir1 = $anotherg6kpath."/var/data/simulators";
			if (! file_exists($simulatorsDir1)) {
				$simulatorsDir1 = $anotherg6kpath."/src/EUREKA/G6KBundle/Resources/data/simulators";
			}
			$simulatorsDir2 = $this->projectDir."/var/data/simulators";
			$dirIterator = new \RecursiveIteratorIterator(new \RecursiveCallbackFilterIterator(
				new \RecursiveDirectoryIterator($assetsDir1 . '/' . $view),
				function (\SplFileInfo $current, $key, \RecursiveIterator $iterator) use ($view, $simulatorsDir1, $simulatorsDir2) {
					if ($iterator->hasChildren()) {
						return true;
					}
					if ($current->isFile()) {
						$name = str_replace('\\', '/', $current->getRealPath());
						if (preg_match("|/".$view."/css/([^/]+).css$|", $name, $m)) {
							if (file_exists($simulatorsDir1."/".$m[1].".xml") && !file_exists($simulatorsDir2."/".$m[1].".xml")) {
								return false;
							}
						}
						return true;
					}
					return true;
				}
			), \RecursiveIteratorIterator::SELF_FIRST);
			$fsystem->mirror($assetsDir1 . '/' . $view, $assetsDir2 . '/' . $view, $dirIterator);
		} catch (IOExceptionInterface $e) {
			$this->error($output, "Error while creating '%view%' in '%viewpath%' : %message%", array('%view%' => $view, '%viewpath%' => $assetsDir2, '%message%' => $e->getMessage()));
			$this->comment($output, "The view '%s%' is partially created", array('%s%' => $view));
			return false;
		}
		if ($viewurl) {
			if (! $this->updateViewParameters($view, $viewurl, $output)) {
				$this->comment($output, "The view '%s%' is partially created", array('%s%' => $view));
				return false;
			}
		}
		return true;
	}

}
