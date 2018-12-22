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
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Finder\Finder;

/**
 * Updates (or Creates) the manifest.json file for the assets versioning.
 *
 * This command allows to update the manifest.json file after the update of an asset.
 *
 * Run this command when an asset(css, js, images, ...) is modified.
 */
class RefreshAssetManifestCommand extends AssetManifestCommandBase
{

	/**
	 * @var array|null
	 */
	private $oldmanifest;

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir);
		if (file_exists($this->projectDir . "/manifest.json")) {
			$this->oldmanifest = json_decode(file_get_contents($this->projectDir . "/manifest.json"), true);
		} else {
			$this->oldmanifest = array();
		}
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:assets:manifest:refresh';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return  $this->translator->trans('Updates (or Creates) the manifest.json file for the assets versioning.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			   $this->translator->trans("This command allows you to update the manifest.json file after the update of an asset.")."\n"
			. "\n"
			.  $this->translator->trans("Run this command when an asset(css, js, images, ...) is modified.")."\n"
		;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandArguments() {
		return array();
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
		$templatesDir = $this->projectDir . "/templates";
		$this->publicDir = $this->projectDir . '/' . $this->parameters['public_dir'];
		$finder = Finder::create()->files()->in($templatesDir)->name('/\.twig$/');
		foreach ($finder as $file) {
			$template = $file->getContents();
			if (preg_match_all("|asset\([\"\'](assets/[^\)\'\"]+)[\)\'\"]|", $template, $m) !== false) {
				$files = $m[1];
				foreach($files as $file) {
					$this->processFile($file, $output);
				}
			}
		}
		$finder = Finder::create()->files()->in($this->publicDir . "/assets")->exclude(array('admin', 'base', 'bundles'))->name('/\.css$/');
		foreach ($finder as $file) {
			$this->processFile("assets/" . $file->getRelativePathname(), $output);
		}
		$finder = Finder::create()->files()->in($this->publicDir . "/assets/base/widgets")->name('/\.(css|js)$/');
		foreach ($finder as $file) {
			$this->processFile("assets/base/widgets/" . $file->getRelativePathname(), $output);
		}
		$finder = Finder::create()->files()->in($this->publicDir . "/assets/bundles/bazingajstranslation/js/translations")->name('/\.js$/');
		foreach ($finder as $file) {
			$this->processFile("assets/bundles/bazingajstranslation/js/translations/" . $file->getRelativePathname(), $output);
		}
		$manifest = json_encode($this->manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
		try {
			$fsystem = new Filesystem();
			$fsystem->dumpFile($this->projectDir . "/manifest.json", $manifest);
			$this->success($output, "The asset manifest is successfully refreshed");
			return 0;
		} catch (IOExceptionInterface $e) {
			$this->failure($output, "Fail to refresh the asset manifest : %s%", array('%s%' => $e->getMessage()));
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
			if (isset($this->oldmanifest[$file])) {
				if (! isset($this->manifest[$file]) && $this->oldmanifest[$file]['h'] != $md5) {
					$this->info($output, "The file %s% has been modified", array('%s%' => $file));
					$version = $this->incrementVersion($this->oldmanifest[$file]['v']);
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
		$added = false;
		$file = str_replace('\\', '/', $file);
		$file = preg_replace("/\?.+$/", "", $file);
		if (!isset($this->manifest[$file]) && is_file($this->publicDir."/".$file)) {
			$added = $this->tryToAddFile($file, $output);
		}
		return $added;
	}

}
