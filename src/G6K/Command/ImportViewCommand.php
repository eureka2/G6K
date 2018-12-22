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
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

/**
 * Creates and optionally imports a view from a previously exported view with G6K.
 *
 * This command allows to create a view and optionally import the templates and assets from a previously exported view in a .zip files with G6K.
 */
class ImportViewCommand extends ViewCommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir, "View Importer");
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
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		return array();
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
		$this->askArgument($input, $output, 'viewname', "Enter the name of the view : ");
		$this->askArgument($input, $output, 'viewpath', "Enter the directory where are located the view files : ");
		$output->writeln("");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$view = $input->getArgument('viewname');
		$viewpath = str_replace('\\', '/', $input->getArgument('viewpath'));
		$viewurl = $input->getArgument('viewurl');
		$templates = $viewpath ? $viewpath . '/' . $view . "-templates.zip" : "";
		$assets = $viewpath ? $viewpath . '/' . $view . "-assets.zip" : "";
		if ($templates != '' && ! file_exists($templates)) {
			$this->error($output, "The compressed templates file '%s%' doesn't exists", array('%s%' => $templates));
			return 1;
		}
		if ($assets != '' && ! file_exists($assets)) {
			$this->error($output, "The compressed assets file '%s%' doesn't exists", array('%s%' => $assets));
			return 1;
		}
		if ($viewurl && ! filter_var($viewurl, FILTER_VALIDATE_URL, FILTER_FLAG_HOST_REQUIRED)) {
			$this->error($output, "The url of the website '%s%' isn't valid", array('%s%' => $viewurl));
			return 1;
		}
		if ($viewpath && $viewpath != '') {
			$this->info($output, "Importing the view '%view%' located in '%viewpath%'", array('%view%' => $view, '%viewpath%' => $viewpath));
		} else {
			$this->info($output, "Creating the view '%view%' from the Default view", array('%view%' => $view));
		}
		$fsystem = new Filesystem();
		$templatesDir = $this->projectDir . "/templates";
		$assetsDir = $this->projectDir . '/' . $this->parameters['public_dir']. "/assets";
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
			$archive->extractTo($templatesDir . '/' . $view, $extract);
			$archive->close();
			$this->migrate3To4($view, $output);
		} else {
			try {
				$fsystem->mkdir($templatesDir . '/' . $view);
				if ($fsystem->exists($templatesDir . '/Default')) {
					$fsystem->mirror($templatesDir . '/Default', $templatesDir . '/' . $view);
				}
			} catch (IOExceptionInterface $e) {
				$this->error($output, "Error while creating '%view%' in '%viewpath%' : %message%", array('%view%' => $view, '%viewpath%' => $templatesDir, '%message%' => $e->getMessage()));
				return 1;
			}
		}
		if ($assets != '') {
			$archive->open($assets, \ZipArchive::CHECKCONS);
			$archive->extractTo($assetsDir . '/' . $view);
			$archive->close();
		} else {
			try {
				$fsystem->mkdir($assetsDir . '/' . $view);
				if ($fsystem->exists($assetsDir . '/Default')) {
					$fsystem->mirror($assetsDir . '/Default', $assetsDir . '/' . $view);
				}
			} catch (IOExceptionInterface $e) {
				$this->error($output, "Error while creating '%view%' in '%viewpath%' : %message%", array('%view%' => $view, '%viewpath%' => $assetsDir, '%message%' => $e->getMessage()));
				$this->comment($output, "The view '%s%' is partially created", array('%s%' => $view));
				return 1;
			}
		}
		if ($viewurl) {
			if (! $this->updateViewParameters($view, $viewurl, $output)) {
				$this->comment($output, "The view '%s%' is partially created", array('%s%' => $view));
				return 1;
			}
		}
		$this->success($output, "The view '%s%' is successfully created", array('%s%' => $view));
		$this->refreshAssetsManifest($output);
		return 0;
	}

}
