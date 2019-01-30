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

use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;

/**
 * Migrates templates created under Symfony 2 or 3.
 *
 * This command allows to migrate the templates created under Symfony 2 or 3.
 *
 * Optionally, the migration can be restricted to a view (viewname)
 */
class MigrateTemplatesCommand extends CommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir, "Templates migrator");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:templates:migrate';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Migrates templates created under Symfony 2 or 3.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to migrate the templates created under Symfony 2 or 3.")."\n"
			. "\n"
			. $this->translator->trans("Optionally, the migration can be restricted to a view (viewname)")."\n"
		;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandArguments() {
		return array(
			array(
				'viewname',
				InputArgument::OPTIONAL,
				$this->translator->trans('The view name (optional), if you want to restrict the migration to a view.')
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
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		try {
			$fsystem = new Filesystem();
			$templatesDir = $this->projectDir . "/templates";
			$viewname = $input->getArgument('viewname');
			if ($viewname) {
				$templatesDir .= '/' . $viewname;
				if (! file_exists($templatesDir)) {
					$this->error($output, "The view '%s%' doesn't exists", array('%s%' => $viewname));
					return 1;
				}
			}
			$finder = new Finder();
			$finder->files()->in($templatesDir)->name('/\.twig$/');
			foreach ($finder as $file) {
				$path = str_replace('\\', '/', $file->getRealPath());
				$content = $file->getContents();
				$content = preg_replace("/EUREKAG6KBundle:([^:]+):/m", "$1/", $content);
				$content = preg_replace("|asset\('bundles/eurekag6k/base/js/|m", "asset('assets/base/js/libs/", $content);
				$content = preg_replace("|asset\('assets/base/js/libs/g6k\.|m", "asset('assets/base/js/g6k.", $content);
				$content = preg_replace("|asset\('bundles/eurekag6k/admin/js/|m", "asset('assets/admin/js/libs/", $content);
				$content = preg_replace("|asset\('assets/admin/js/libs/g6k\.|m", "asset('assets/admin/js/g6k.", $content);
				$content = preg_replace("|asset\('bundles/eurekag6k/|m", "asset('assets/", $content);
				$content = preg_replace("|\\\$\([\"']input\.listbox\-input[\"']\)\.listbox|m", "$(\":input[data-widget='abListbox']\").listbox", $content);
				$content = preg_replace("|\\\$\([\"']input\.date[\"']\)\.datepicker|m", "$(\":input[data-widget='abDatepicker']\").datepicker", $content);
				$fsystem->dumpFile($path, $content);
			} 
		} catch (\Exception $e) {
			$this->failure($output, "Error while migrating the templates : %s", array('%s%' => $e->getMessage()));
			return 1;
		}
		$this->success($output, "The templates are successfully migrated");
		return 0;
	}

}
