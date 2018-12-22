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
 * Adds an asset to the manifest.json file for the assets versioning.
 *
 * This command allows to add an asset to the manifest.json file after its creation.
 *
 * Run this command when an asset(css, js, images, ...) is created.
 */
class AddAssetManifestCommand extends AssetManifestCommandBase
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
		return 'g6k:assets:manifest:add-asset';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Add an asset to the manifest.json file for the assets versioning.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return 
			  $this->translator->trans("This command allows you add an asset to the manifest.json file after its creation.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the path of the asset (assetpath).")."\n"
			. "\n"
			. $this->translator->trans("Run this command when an asset(css, js, images, ...) is created.")."\n"
		;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandArguments() {
		return array(
			array(
				'assetpath',
				InputArgument::REQUIRED,
				$this->translator->trans('The path of the asset relatively to the public directory.')
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
	 * Checks the argument of the current command (g6k:assets:manifest:add-asset).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$this->askArgument($input, $output, 'assetpath', "Enter the path of the asset relatively to the public directory : ");
		$output->writeln("");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$file = str_replace('\\', '/', $input->getArgument('assetpath'));
		if (! file_exists($this->publicDir . "/" . $file)) {
			$this->error($output, "The file '%s%' doesn't exists", array('%s%' => $file));
			return 1;
		}
		try {
			$added = $this->processFile($file, $output);
			if ($added) {
				$manifest = json_encode($this->manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
				$fsystem = new Filesystem();
				$fsystem->dumpFile($this->projectDir . "/manifest.json", $manifest);
			}
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
		$path = $this->publicDir."/".$file;
		if (($md5 = md5_file($path)) !== false) {
			$version = $this->version;
			if (isset($this->manifest[$file])) {
				if ($this->manifest[$file]['h'] != $md5) {
					$this->info($output, "The file %s% has been modified", array('%s%' => $file));
					$version = $this->incrementVersion($this->manifest[$file]['v']);
				}
			} else {
				$this->info($output, "The file %s% has been added", array('%s%' => $file));
			}
			$this->manifest[$file] = array(
				'h' => $md5,
				'v' => $version
			);
			return true;
		}
		return false;
	}

	/**
	 * @inheritdoc
	 */
	protected function processFile(string $file, OutputInterface $output) {
		$file = str_replace('\\', '/', $file);
		$file = preg_replace("/\?.+$/", "", $file);
		if (is_file($this->publicDir."/".$file)) {
			return $this->tryToAddFile($file, $output);
		}
		return false;
	}

}
