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
 * Removes the assets of a view from the manifest.json file for the assets versioning.
 *
 * This command allows to remove assets of a view from the manifest.json file after its deletion.
 *
 * Run this command when a view is dropped.
 */
class RemoveViewAssetManifestCommand extends AssetManifestCommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir);
		if (file_exists($this->projectDir . "/manifest.json")) {
			$this->manifest = json_decode(file_get_contents($this->projectDir . "/manifest.json"), true);
		} else {
			$this->manifest = array();
		}
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:assets:manifest:remove-view';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Removes the assets of a view from the manifest.json file for the assets versioning.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you remove assets of a view from the manifest.json file after its deletion.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the view (viewname).")."\n"
			. "\n"
			. $this->translator->trans("Run this command when a view is dropped.")."\n"
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
	 * Checks the argument of the current command (g6k:assets:manifest:remove-view).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$this->askArgument($input, $output, 'viewname', "Enter the name of the view : ");
		$output->writeln("");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$view = $input->getArgument('viewname');
		if (file_exists($this->publicDir . "/assets/" . $view)) {
			$this->error($output, "The view '%s%' still exists, drop it first.", array('%s%' => $view));
			return 1;
		}
		try {
			$removed = $this->processFile("assets/" . $view, $output);
			if (! $removed) {
				$this->failure($output, "No assets from this view were found in the manifest");
				return 0;
			}
			$manifest = json_encode($this->manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
			$fsystem = new Filesystem();
			$fsystem->dumpFile($this->projectDir . "/manifest.json", $manifest);
			$this->success($output, "The asset manifest is successfully updated");
			return 0;
		} catch (IOExceptionInterface $e) {
			$this->failure($output, "Fail to update the asset manifest : %s%", array('%s%' => $e->getMessage()));
			return 1;
		}
	}

	/**
	 * @inheritdoc
	 */
	protected function addFile(string $file, OutputInterface $output) {
		return false;
	}

	/**
	 * @inheritdoc
	 */
	protected function processFile(string $file, OutputInterface $output) {
		$removed = false;
		foreach($this->manifest as $asset => $dummy) {
			$pos = strpos($asset, $file);
			if ($pos !== false && $pos == 0) {
				unset($this->manifest[$asset]);
				$removed = true;
				$this->info($output, "The file %s% has been removed", array('%s%' => $asset));
			}
		}
		return $removed;
	}

}
