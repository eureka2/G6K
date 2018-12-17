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
use Symfony\Component\Finder\Finder;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Console\Question\ChoiceQuestion;

/**
 * Copies a view from another instance of G6K.
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
		return $this->translator->trans('Copies a view from another instance of G6K.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to copy a view from another instance of G6K after a fresh installation.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the view (viewname).")."\n"
			. $this->translator->trans("- the full path of the directory (anotherg6kpath) where the other instance of G6K is installed.")."\n"
			. $this->translator->trans("and optionally:")."\n"
			. $this->translator->trans("- the url (viewurl) of the website where this view is used.")."\n"
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
				$this->translator->trans('The name of the view.')
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
		return array();
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
		$anotherg6kpath = $input->getArgument('anotherg6kpath');
		$viewurl = $input->getArgument('viewurl');
		if (! file_exists($anotherg6kpath)) {
			$this->error($output, "The directory of the other instance '%s%' doesn't exists", array('%s%' => $anotherg6kpath));
			return 1;
		}
		$this->info($output, "Finding the templates directory of the other instance '%s%' in progress", array('%s%' => $anotherg6kpath));
		$finder = new Finder();
		$finder->files()->in($anotherg6kpath)->path('/admin/layout')->name('pagelayout.html.twig');
		if ($finder->count() == 0) {
			$this->error($output, "Can not find the templates directory of the other instance '%s%'", array('%s%' => $anotherg6kpath));
			return 1;
		}
		if ($finder->count() > 1) {
			if ($input->isInteractive()) {
				$choices = [];
				foreach($finder as $file) {
					$choices[] = dirname(dirname(dirname($file->getRelativePathname())));
				}
				$helper = $this->getHelper('question');
				$question = new ChoiceQuestion(
					$this->translator->trans($this->name) . ": " . $this->translator->trans("Multiple templates directories were found in the other instance, please choose one :"),
					$choices,
					0
				);
				$question->setErrorMessage($this->translator->trans('Your choice %s is invalid.'));
				$choice = $helper->ask($input, $output, $question);
				$this->info($output, "You have just selected: '%s%'", array('%s%' => $choice));
				$templatesDir1 = $anotherg6kpath . DIRECTORY_SEPARATOR . $choice;
			} else {
				$this->error($output, "Multiple templates directories were found in the other instance '%s%'", array('%s%' => $anotherg6kpath));
				return 1;
			}
		} else {
			foreach($finder as $file) {
				$templatesDir1 = dirname(dirname(dirname($file->getRealPath())));
				break;
			}
		}
		$this->info($output, "Finding the assets directory of the other instance '%s%' in progress", array('%s%' => $anotherg6kpath));
		$finder = new Finder();
		$finder->files()->in($anotherg6kpath)->path('/admin/js')->name('g6k.admin.js');
		if ($finder->count() == 0) {
			$this->error($output, "Can not find the assets directory of the other instance '%s%'", array('%s%' => $anotherg6kpath));
			return 1;
		}
		if ($finder->count() > 1) {
			if ($input->isInteractive()) {
				$choices = [];
				foreach($finder as $file) {
					$choices[] = dirname(dirname(dirname($file->getRelativePathname())));
				}
				$helper = $this->getHelper('question');
				$question = new ChoiceQuestion(
					$this->translator->trans($this->name) . ": " . $this->translator->trans("Multiple assets directories were found in the other instance, please choose one :"),
					$choices,
					0
				);
				$question->setErrorMessage($this->translator->trans('Your choice %s is invalid.'));
				$choice = $helper->ask($input, $output, $question);
				$this->info($output, "You have just selected: '%s%'", array('%s%' => $choice));
				$assetsDir1 = $anotherg6kpath . DIRECTORY_SEPARATOR . $choice;
			} else {
				$this->error($output, "Multiple assets directories were found in the other instance '%s%'", array('%s%' => $anotherg6kpath));
				return 1;
			}
		} else {
			foreach($finder as $file) {
				$assetsDir1 = dirname(dirname(dirname($file->getRealPath())));
				break;
			}
		}
		if (!file_exists($templatesDir1 . DIRECTORY_SEPARATOR . $view)) {
			$this->error($output, "The view '%view%' doesn't exists in the templates directory '%s%'", array('%view%' => $view, '%s%' => $templatesDir1));
			return 1;
		}
		if (!file_exists($assetsDir1 . DIRECTORY_SEPARATOR . $view)) {
			$this->error($output, "The view '%view%' doesn't exists in the assets directory '%s%'", array('%view%' => $view, '%s%' => $assetsDir1));
			return 1;
		}
		if ($viewurl && ! filter_var($viewurl, FILTER_VALIDATE_URL, FILTER_FLAG_HOST_REQUIRED)) {
			$this->error($output, "The url of the website '%s%' isn't valid", array('%s%' => $viewurl));
			return 1;
		}
		$this->info($output, "Copying the view '%view%' from '%anotherg6kpath%'", array('%view%' => $view, '%anotherg6kpath%' => $anotherg6kpath));
		$templatesDir2 = $this->projectDir . DIRECTORY_SEPARATOR . "templates";
		$assetsDir2 = $this->projectDir . DIRECTORY_SEPARATOR . $this->parameters['public_dir']. DIRECTORY_SEPARATOR . "assets";

		$fsystem = new Filesystem();
		try {
			$fsystem->mkdir($templatesDir2 . DIRECTORY_SEPARATOR . $view);
			$fsystem->mirror($templatesDir1 . DIRECTORY_SEPARATOR . $view, $templatesDir2 . DIRECTORY_SEPARATOR . $view, null, ['delete' => true]);
		} catch (IOExceptionInterface $e) {
			$this->error($output, "Error while creating '%view%' in '%viewpath%' : %message%", array('%view%' => $view, '%viewpath%' => $templatesDir2, '%message%' => $e->getMessage()));
			return 1;
		}
		$this->migrate3To4($view, $output);
		try {
			$fsystem->mkdir($assetsDir2 . DIRECTORY_SEPARATOR . $view);
			$fsystem->mirror($assetsDir1 . DIRECTORY_SEPARATOR . $view, $assetsDir2 . DIRECTORY_SEPARATOR . $view, null, ['delete' => true]);
		} catch (IOExceptionInterface $e) {
			$this->error($output, "Error while creating '%view%' in '%viewpath%' : %message%", array('%view%' => $view, '%viewpath%' => $assetsDir2, '%message%' => $e->getMessage()));
			$this->comment($output, "The view '%s%' is partially created", array('%s%' => $view));
			return 1;
		}
		if ($viewurl) {
			try {
				$configFile = $this->projectDir . DIRECTORY_SEPARATOR . 'config'. DIRECTORY_SEPARATOR . "packages". DIRECTORY_SEPARATOR . "g6k.yml";
				$domain = parse_url ($viewurl, PHP_URL_HOST);
				$domain = preg_replace("/^www\./", "", $domain);
				if ($domain !== null) {
					$config = file_get_contents($configFile);
					$yaml = Yaml::parse($config);
					$updated = false;
					if (! isset( $yaml['parameters']['domainview'][$domain])) {
						$config = preg_replace("/^(    domainview:)/m", "$1\n        ".$domain.": ".$view, $config);
						$updated = true;
					}
					if (! isset($yaml['parameters']['viewpath'][$view])) {
						$config = preg_replace("/^(    viewpath:)/m", "$1\n        ".$view.": ".$viewurl, $config);
						$updated = true;
					}
					if ($updated) {
						file_put_contents($configFile, $config);
					}
				}
			} catch (\Exception $e) {
				$this->error($output, "Error while updating '%view%' for '%s%' : %message%", array('%view%' => $configFile, '%s%' => $view, '%message%' => $e->getMessage()));
				$this->comment($output, "The view '%s%' is partially created", array('%s%' => $view));
				return 1;
			}
		}
		$this->refreshAssetsManifest($output);
		$this->success($output, "The view '%s%' is successfully created", array('%s%' => $view));
		return 0;
	}

}
