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
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Console\Question\Question;

/**
 * Creates and optionally imports a view from a previously exported view with G6K.
 *
 * This command allows to create a view and optionally import the templates and assets from a previously exported view in a .zip files with G6K.
 */
class ImportViewCommand extends CommandBase
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
		return 'g6k:view:import';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Creates and optionally imports a view from a previously exported view with G6K.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to create a view and optionally import the templates and assets from a previously exported view in a .zip files with G6K.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the view (viewname).")."\n"
			. $this->translator->trans("- the full path of the directory (viewpath) where the .zip files are located.")."\n"
			. $this->translator->trans("and optionally:")."\n"
			. $this->translator->trans("- the url (viewurl) of the website where this view is used.")."\n"
			. $this->translator->trans("The file names will be composed as follows:")."\n"
			. $this->translator->trans("- <viewpath>/<viewname>-templates.zip for the compressed twig templates file")."\n"
			. $this->translator->trans("- <viewpath>/<viewname>-assets.zip for the compressed assets file")."\n"
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
				'viewpath',
				InputArgument::REQUIRED,
				$this->translator->trans('The directory where are located the view files.')
			),
			array(
				'viewurl',
				InputArgument::OPTIONAL,
				$this->translator->trans('The url of the website where this view is used.')
			)
		);
	}

	/**
	 * Checks the argument of the current command (g6k:view:import).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$questionHelper = $this->getHelper('question');
		$viewname = $input->getArgument('viewname');
		if (! $viewname) {
			$question = new Question($this->translator->trans("Enter the name of the view : "));
			$viewname = $questionHelper->ask($input, $output, $question);
			if ($viewname !== null) {
				$input->setArgument('viewname', $viewname);
			}
			$output->writeln('');
		}
		$viewpath = $input->getArgument('viewpath');
		if (! $viewpath) {
			$question = new Question($this->translator->trans("Enter the directory where are located the view files : "));
			$viewpath = $questionHelper->ask($input, $output, $question);
			if ($viewpath !== null) {
				$input->setArgument('viewpath', $viewpath);
			}
			$output->writeln('');
		}
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		$view = $input->getArgument('viewname');
		$viewpath = $input->getArgument('viewpath');
		$viewurl = $input->getArgument('viewurl');
		$templates = $viewpath ? $viewpath . DIRECTORY_SEPARATOR . $view . "-templates.zip" : "";
		$assets = $viewpath ? $viewpath . DIRECTORY_SEPARATOR . $view . "-assets.zip" : "";
		$output->writeln([
			$this->translator->trans("G6K version %s%", array('%s%' => $this->version)),
			'',
			$this->translator->trans("View Importer"),
			'=======================================',
			'',
		]);
		if ($templates != '' && ! file_exists($templates)) {
			$output->writeln($this->translator->trans("View Importer: The compressed templates file '%s%' doesn't exists", array('%s%' => $templates)));
			return 1;
		}
		if ($assets != '' && ! file_exists($assets)) {
			$output->writeln($this->translator->trans("View Importer: The compressed assets file '%s%' doesn't exists", array('%s%' => $assets)));
			return 1;
		}
		if ($viewurl && ! filter_var($viewurl, FILTER_VALIDATE_URL, FILTER_FLAG_HOST_REQUIRED)) {
			$output->writeln($this->translator->trans("View Importer: The url of the website '%s%' isn't valid", array('%s%' => $viewurl)));
			return 1;
		}
		if ($viewpath) {
			$output->writeln($this->translator->trans("View Importer: Importing the view '%view%' located in '%viewpath%'", array('%view%' => $view, '%viewpath%' => $viewpath)));
		} else {
			$output->writeln($this->translator->trans("View Importer: Creating the view '%view%' from the Default view", array('%view%' => $view)));
		}
		$fsystem = new Filesystem();
		$templatesDir = $this->projectDir . DIRECTORY_SEPARATOR . "templates";
		$assetsDir = $this->projectDir . DIRECTORY_SEPARATOR . $this->parameters['public_dir']. DIRECTORY_SEPARATOR . "assets";
		$archive = new \ZipArchive();
		if ($templates != '') {
			$archive->open($templates, \ZipArchive::CHECKCONS);
			$extract = array();
			for( $i = 0; $i < $archive->numFiles; $i++ ){
				$info = $archive->statIndex( $i );
				if (preg_match("/\.twig$/", $info['name'])) { // keep only twig files
					array_push($extract, $info['name']);
				}
			}
			$archive->extractTo($templatesDir . DIRECTORY_SEPARATOR . $view, $extract);
			$archive->close();
			$this->migrate3To4($view, $output);
		} else {
			try {
				$fsystem->mkdir($templatesDir . DIRECTORY_SEPARATOR . $view);
				if ($fsystem->exists($templatesDir . DIRECTORY_SEPARATOR . 'Default')) {
					$fsystem->mirror($templatesDir . DIRECTORY_SEPARATOR . 'Default', $templatesDir . DIRECTORY_SEPARATOR . $view);
				}
			} catch (IOExceptionInterface $e) {
				$output->writeln($this->translator->trans("View Importer: Error while creating '%view%' in '%viewpath%' : %message%", array('%view%' => $view, '%viewpath%' => $templatesDir, '%message%' => $e->getMessage())));
				return 1;
			}
		}
		if ($assets != '') {
			$archive->open($assets, \ZipArchive::CHECKCONS);
			$archive->extractTo($assetsDir . DIRECTORY_SEPARATOR . $view);
			$archive->close();
		} else {
			try {
				$fsystem->mkdir($assetsDir . DIRECTORY_SEPARATOR . $view);
				if ($fsystem->exists($assetsDir . DIRECTORY_SEPARATOR . 'Default')) {
					$fsystem->mirror($assetsDir . DIRECTORY_SEPARATOR . 'Default', $assetsDir . DIRECTORY_SEPARATOR . $view);
				}
			} catch (IOExceptionInterface $e) {
				$output->writeln($this->translator->trans("View Importer: Error while creating '%view%' in '%viewpath%' : %message%", array('%view%' => $view, '%viewpath%' => $assetsDir, '%message%' => $e->getMessage())));
				$output->writeln($this->translator->trans("View Importer: The view '%s%' is partially created", array('%s%' => $view)));
				return 1;
			}
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
				$output->writeln($this->translator->trans("View Importer: Error while updating '%view%' for '%s%' : %message%", array('%view%' => $configFile, '%s%' => $view, '%message%' => $e->getMessage())));
				$output->writeln($this->translator->trans("View Importer: The view '%s%' is partially created", array('%s%' => $view)));
				return 1;
			}
		}
		$output->writeln($this->translator->trans("View Importer: The view '%s%' is successfully created", array('%s%' => $view)));
		$this->refreshAssetsManifest($output);
		return 0;
	}

	/**
	 * Updates (or Creates) the manifest.json file for the assets versioning.
	 *
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return void
	 *
	 */
	private function refreshAssetsManifest($output) {
		$command = $this->getApplication()->find('g6k:assets:manifest:refresh');
		$input = new ArrayInput(array(
			'command' => 'g6k:assets:manifest:refresh',
			'--no-interaction' => true
		));
		$output->writeln("");
		$output->writeln($this->translator->trans("View Importer: Refreshing the assets manifest"));
		$returnCode = $command->run($input, $output);
		if ($returnCode == 0) {
			$output->writeln($this->translator->trans("View Importer: Refreshing manifest done!"));
		} else {
			$output->writeln($this->translator->trans("View Importer: Refreshing manifest not done!"));
		}
	}

	/**
	 * Migrates the templates written for Symfony 2 or 3.
	 *
	 * @param   string $view The view name
	 * @return void
	 *
	 */
	private function migrate3To4($view, $output) {
		$command = $this->getApplication()->find('g6k:templates:migrate');
		$input = new ArrayInput(array(
			'command' => 'g6k:templates:migrate',
			'viewname' => $view,
			'--no-interaction' => true
		));
		$output->writeln("");
		$output->writeln($this->translator->trans("View Importer: migration of the templates"));
		$returnCode = $command->run($input, $output);
		if ($returnCode == 0) {
			$output->writeln($this->translator->trans("View Importer: Migration of the templates is done!"));
		} else {
			$output->writeln($this->translator->trans("View Importer: Migration of the templates is not done!"));
		}
	}

}
