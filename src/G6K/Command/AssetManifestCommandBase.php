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

use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Exception\LogicException;

/**
 * Base class for all command of the g6k:assets namespace.
 */
abstract class AssetManifestCommandBase extends CommandBase
{

	/**
	 * @var array|null
	 */
	protected $manifest;

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir, $name = "Asset manifest editor") {
		parent::__construct($projectDir, $name);
		$this->manifest = array();
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		throw new LogicException("getCommandName method is not implemented");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		throw new LogicException("getCommandDescription method is not implemented");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		throw new LogicException("getCommandHelp method is not implemented");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandArguments() {
		throw new LogicException("getCommandArguments method is not implemented");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		throw new LogicException("getCommandOptions method is not implemented");
	}

	/**
	 * Adds a file to the manifest.
	 *
	 * @param   string $file The relative path name of the file
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return bool
	 *
	 */
	abstract protected function addFile(string $file, OutputInterface $output);

	/**
	 * Processes a file
	 *
	 * @param   string $file The relative path name of the file
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return bool
	 *
	 */
	abstract protected function processFile(string $file, OutputInterface $output);

	/**
	 * Try to add a file to the manifest.
	 *
	 * @param   string $file The relative path name of the file
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return bool
	 *
	 */
	protected function tryToAddFile(string $file, OutputInterface $output) {
		$added = false;
		$path = $this->publicDir."/".$file;
		$extension = preg_replace("/.+\.([^\.]+)$/", "$1", $file);
		switch ($extension) {
			case 'css':
				$css = file_get_contents($path);
				$importeds = array();
				if (preg_match_all("|@import\s+[^'\"]*['\"]([^'\"]*)['\"]|", $css, $m) !== false) {
					$importeds =array_merge($importeds, $m[1]);
				}
				if (preg_match_all("|url\s*\(\s*([^\)]*)\)|", $css, $m) !== false) {
					$importeds =array_merge($importeds, array_map(function($u) {
						return preg_replace("/^['\"]/", "", preg_replace("/['\"]$/", "", $u));
					}, $m[1]));
				}
				$rewritecss = false;
				$importeds = array_unique($importeds);
				foreach($importeds as $imported) {
					$ifile = $this->resolvePath($imported, dirname($file));
					if ($this->processFile($ifile, $output)) {
						$ifile = preg_replace("/\?.+$/", "", $ifile);
						$version = $this->manifest[$ifile]['v'];
						if (! preg_match("|[\?\&]version=" . $version . "$|", $imported)) {
							$versionized = $this->versionize($imported, $version);
							$rewritecss = true;
							$css = str_replace($imported, $versionized, $css);
						}
					}
				}
				if ($rewritecss) {
					file_put_contents($path, $css);
				}
				$added = $this->addFile($file, $output);
				break;
			case 'js':
				if (preg_match("|/locales/|", $file) || preg_match("|/bazingajstranslation/js/translations/|", $file)) {
					if (! preg_match("|[/\.]" . $this->parameters['app_language'] . "[^/]*\.js$|", $path) &&
						! preg_match("|/config\.js$|", $path)) {
						return false;
					}
				}
				$added = $this->addFile($file, $output);
				break;
			default:
				if (preg_match("|/documentation/|", $file)) {
					if (! preg_match("|/documentation/" . $this->parameters['app_language'] . "/|", $file)) {
						return false;
					}
				}
				$added = $this->addFile($file, $output);
		}
		return $added;
	}

	/**
	 * Adds version number to path
	 *
	 * @param  string $path    The version number
	 * @param  string $version The path
	 * @return string          The new path
	 *
	 */
	protected function versionize(string $path, string $version) {
		$path = preg_replace("|[\?\&]version\=.+$|", "", $path);
		if (preg_match("/^(.+)\?([^\?]+)$/", $path, $m)) {
			return sprintf('%s&version=%s', ltrim($path, '/'), $version);
		} else {
			return sprintf('%s?version=%s', ltrim($path, '/'), $version);
		}
	}

	/**
	 * Increments version of an asset
	 *
	 * @param  string $version The current version
	 * @return string          The incremented version
	 *
	 */
	protected function incrementVersion(string $version) {
		if (preg_match("/^(.+)-(\d+)$/", $version, $m)) {
			return $m[1] . "-" . ((int)$m[2] + 1);
		} else {
			return $version . "-1";
		}
	}

}
