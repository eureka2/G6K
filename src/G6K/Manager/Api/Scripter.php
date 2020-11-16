<?php declare(strict_types = 1);

/*
The MIT License (MIT)

Copyright (c) 2020 Jacques Archimède

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

namespace App\G6K\Manager\Api;

use App\G6K\Manager\Api\JSONData;
use App\G6K\Manager\Api\Obfuscator;
use Symfony\Component\Finder\Finder;

class Scripter {
	
	const SCRIPTS = ['ajax','cookie','animate','defiant','jsonpath','expand','tab','date','money','expression','rule.engine','g6k.engine'];

	private $simulator;
	private $projectDir;
	private $scriptsDirIn;
	private $scriptsDirOut;
	private $script;
	private $obfuscated = "";

	public function __construct($projectDir, $scriptsDirOut = null) {
		$this->projectDir = $projectDir;
		$this->scriptsDirIn = $projectDir . "/var/data/api/assets/scripts";
		$this->scriptsDirOut = $scriptsDirOut ?? $projectDir . "/var/data/simulators/api";
	}

	public function setSimulator($simulator) {
		$this->simulator = $simulator;
	}

	public function run() {
		$simulator = new \SimpleXMLElement($this->projectDir . "/var/data/simulators/" . $this->simulator . ".xml", LIBXML_NOWARNING, true);
		$datasources = new \SimpleXMLElement($this->projectDir . "/var/data/databases/DataSources.xml", LIBXML_NOWARNING, true);
		$json = new JSONData($this->projectDir);
		$jsondata = $json->toJSON($simulator, $datasources);
		$widgets = $jsondata['widgets'];
		$functions = $jsondata['functions'];
		$wcss = [];
		$js = [];
		$translations = [];
		foreach($widgets as $widget) {
			$finder = new Finder();
			$finder->in($this->scriptsDirIn . '/widgets/' . $widget)->name(['*.js', '*.css', '*.translation.json'])->notName('*.min.js');;
			foreach ($finder as $file) {
				$filepath = $this->scriptsDirIn . "/widgets/" . $widget ."/" . $file->getRelativePathname();
				if ($file->getExtension() === 'css') {
					$wcss[] = $filepath;
				} elseif ($file->getExtension() === 'json') {
					$translations[] = $filepath;
				} else {
					$js[] = $filepath;
				}
			}
		}
		unset($jsondata['widgets']);
		$fcss = [];
		foreach($functions as $function) {
			$finder = new Finder();
			$finder->in($this->scriptsDirIn . '/functions/' . $function)->name(['*.js', '*.css', '*.translation.json'])->notName('*.min.js');;
			foreach ($finder as $file) {
				$filepath = $this->scriptsDirIn . "/functions/" . $function ."/" . $file->getRelativePathname();
				if ($file->getExtension() === 'css') {
					$fcss[] = $filepath;
				} elseif ($file->getExtension() === 'json') {
					$translations[] = $filepath;
				} else {
					$js[] = $filepath;
				}
			}
		}
		unset($jsondata['functions']);
		$cssjs = file_get_contents($this->scriptsDirIn . "/css.js");
		$wcss = array_unique($wcss);
		foreach ($wcss as $filepath) {
			$css = file_get_contents($filepath);
			$cssjs = str_replace("var widgets = `", "var widgets = `" . $css, $cssjs);
		}
		$fcss = array_unique($fcss);
		foreach ($fcss as $filepath) {
			$css = file_get_contents($filepath);
			$cssjs = str_replace("var functions = `", "var functions = `" . $css, $cssjs);
		}
		$this->script = [];
		$this->loadScript($cssjs);
		$translator = file_get_contents($this->scriptsDirIn . "/translator.js");
		$translations = array_unique($translations);
		foreach ($translations as $filepath) {
			$translation = file_get_contents($filepath);
			$translation = explode("\n", $translation);
			array_shift($translation);
			while (trim(end($translation)) == '') {
				array_pop($translation);
			}
			array_pop($translation);
			array_push($translation, rtrim(array_pop($translation)) . ',');
			$translation = implode("\n", $translation);
			$translator = str_replace("var translations = {", "var translations = {" . "\n" . $translation, $translator);
		}
		$this->loadScript($translator);
		// $this->loadScriptFile("scripts/bootstapify.js");
		foreach (self::SCRIPTS as $scr) {
			$this->loadScriptFile($this->scriptsDirIn . "/" . $scr . ".js");
		}
		$js = array_unique($js);
		foreach ($js as $line) {
			$this->loadScriptFile($line);
		}
		$fields = json_encode($jsondata, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
		$fields = explode("\n", $fields);
		array_shift($fields);
		array_pop($fields);
		$this->loadEndScript($simulator, $fields);
		$this->script = implode("\n", $this->script);
	}

	public function save() {
		file_put_contents($this->scriptsDirOut . "/" . $this->simulator . ".js", $this->script);
		file_put_contents($this->scriptsDirOut . "/" . $this->simulator . ".min.js", $this->obfuscated);
	}

	private function loadScriptFile($file) {
		$file = file_get_contents($file);
		if ($file !== false) {
			$this->loadScript($file);
		}
	}

	private function loadScript($source) {
		if (!is_array($source)) {
			$source = explode("\n", $source);
		}
		foreach ($source as $line) {
			$this->script[] = $line;
		}
		$source = implode("\n", $source);
		$obfuscator = new Obfuscator($source);
		$source = $obfuscator->obfuscate();
		$source = $obfuscator->compact();
		$this->obfuscated .= $source;
	}

	private function loadEndScript($simulator, $fields) {
		$escript = [];
		$escript[] = "var G6K_SIMU = {";
		foreach ($fields as $line) {
			$line = preg_replace("/    /", "\t", $line);
			$escript[] = $line;
		}
		$escript[] = "};";
		$escript[] = "";
		$escript[] = "document.addEventListener( 'DOMContentLoaded', function(event) {";
		$escript[] = "	var options = {";
		$escript[] = "		simulator: G6K_SIMU,";
		$escript[] = "		form: document.querySelector('.simulator form'),";
		$escript[] = "		locale: '" . $simulator['locale'] ."',";
		$escript[] = "		dynamic: true,";
		$escript[] = "		mobile: false,";
		$escript[] = "		dateFormat: '" . $simulator->DataSet['dateFormat'] . "',";
		$escript[] = "		decimalPoint: '" . $simulator->DataSet['decimalPoint'] . "',";
		$escript[] = "		moneySymbol: '" . $simulator->DataSet['moneySymbol'] . "',";
		$escript[] = "		symbolPosition: '" . $simulator->DataSet['symbolPosition'] . "',";
		$escript[] = "		groupingSeparator: '" . $simulator->DataSet['groupingSeparator'] . "',";
		$escript[] = "		groupingSize: '" . $simulator->DataSet['groupingSize'] . "'";
		$escript[] = "	};";
		$escript[] = "	var g6k = new G6k(options);";
		$escript[] = "	g6k.run();";
		$escript[] = "});";
		$escript[] = "";
		$this->loadScript($escript);
	}

}
