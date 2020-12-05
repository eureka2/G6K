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
	private $publicDir;
	private $scriptsDirIn;
	private $scriptsDirOut;
	private $script;
	private $obfuscated = "";

	public function __construct($projectDir, $publicDir = 'calcul', $scriptsDirOut = null) {
		$this->projectDir = $projectDir;
		$this->publicDir = $publicDir;
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
		$widgetExternals = $jsondata["widgetExternals"];
		$functionExternals = $jsondata["functionExternals"];
		$locale = substr($jsondata["locale"], 0, 2);
		$messages = $this->loadTranslations($locale, 'messages');
		$commands = $this->loadTranslations($locale, 'commands');
		$translations = "\tvar translations = {\n" . $messages . ",\n" . $commands . "\n\t};";
		$translations = explode("\n", $translations);
		array_unshift($translations, "");
		array_unshift($translations, "	'use strict';");
		array_unshift($translations, "(function (global) {");
		$translations[] = "";
		$translations[] = "	function Translator() {";
		$translations[] = "	};";
		$translations[] = "";
		$translations[] = "	Translator.locale = 'en';";
		$translations[] = "";
		$translations[] = "	Translator.trans = function (message, params, domain) {";
		$translations[] = "		domain = domain || 'messages';";
		$translations[] = "		if (translations[domain]) {";
		$translations[] = "			var messages = translations[domain];";
		$translations[] = "			var locale = Translator.locale.substr(0, 2);";
		$translations[] = "			if (messages[locale] && messages[locale][message]) {";
		$translations[] = "				message = messages[locale][message];";
		$translations[] = "			}";
		$translations[] = "			if (typeof params != \"undefined\") {";
		$translations[] = "				for (var param in params) {";
		$translations[] = "					var value = params[param];";
		$translations[] = "					message = message.replace('%' + param + '%', value);";
		$translations[] = "				}";
		$translations[] = "			}";
		$translations[] = "		}";
		$translations[] = "		return message;";
		$translations[] = "	};";
		$translations[] = "";
		$translations[] = "	global.Translator = Translator;";
		$translations[] = "}(this));";
		$translations[] = "";
		file_put_contents($this->projectDir . "/trans.txt", implode("\n", $translations));
		$externalCss = [];
		$externalJs = [];
		$wcss = [];
		$js = [];
		foreach($widgets as $widget) {
			$finder = new Finder();
			$finder->in($this->scriptsDirIn . '/widgets/' . $widget)->name(['*.js', '*.css'])->notName('*.min.js');;
			foreach ($finder as $file) {
				$filepath = $this->scriptsDirIn . "/widgets/" . $widget ."/" . $file->getRelativePathname();
				if ($file->getExtension() === 'css') {
					$wcss[] = $filepath;
				} else {
					$js[] = $filepath;
				}
			}
			if (isset($widgetExternals[$widget])) {
				foreach ($widgetExternals[$widget]['css'] as $external) {
					$externalCss[] = $external;
				}
				foreach ($widgetExternals[$widget]['js'] as $external) {
					$externalJs[] = $external;
				}
			}
		}
		unset($jsondata['widgets']);
		unset($jsondata['widgetExternals']);
		$fcss = [];
		foreach($functions as $function) {
			$finder = new Finder();
			$finder->in($this->scriptsDirIn . '/functions/' . $function)->name(['*.js', '*.css', '*.translation.json'])->notName('*.min.js');;
			foreach ($finder as $file) {
				$filepath = $this->scriptsDirIn . "/functions/" . $function ."/" . $file->getRelativePathname();
				if ($file->getExtension() === 'css') {
					$fcss[] = $filepath;
				} else {
					$js[] = $filepath;
				}
			}
			if (isset($functionExternals[$function])) {
				foreach ($functionExternals[$function]['css'] as $external) {
					$externalCss[] = $external;
				}
				foreach ($functionExternals[$function]['js'] as $external) {
					$externalJs[] = $external;
				}
			}
		}
		unset($jsondata['functions']);
		unset($jsondata['functionExternals']);
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
		$this->loadScript($translations);
		$this->loadScript($cssjs);
		$this->loadScriptFile($this->scriptsDirIn . "/bootstrapify.js");
		foreach (self::SCRIPTS as $scr) {
			$this->loadScriptFile($this->scriptsDirIn . "/" . $scr . ".js");
		}
		$js = array_unique($js);
		foreach ($js as $line) {
			$this->loadScriptFile($line);
		}
		if (count($externalCss) > 0 || count($externalJs) > 0) {
			$loader = [];
			$loader[] = 'window.addEventListener(\'DOMContentLoaded\', function(event) {';
			$loader[] = '	var head = document.querySelector(\'head\');';
			$loader[] = '	var body = document.querySelector(\'body\');';
			$loader[] = '	var link, script;';
			foreach ($externalCss as $css) {
				$loader[] = '	link = document.createElement(\'link\');';
				$loader[] = '	link.type = "text/css";';
				$loader[] = '	link.rel = "stylesheet";';
				$loader[] = '	link.href = "' . $css . '";';
				$loader[] = '	head.appendChild(link);';
			}
			foreach ($externalJs as $js) {
				$loader[] = '	script = document.createElement(\'script\');';
				$loader[] = '	script.type = "text/javascript";';
				if (preg_match("/ async/", $js)) {
					$loader[] = '	script.async = true;';
					$js = str_replace(" async", "", $js);
				}
				if (preg_match("/ defer/", $js)) {
					$loader[] = '	script.defer = true;';
					$js = str_replace(" defer", "", $js);
				}
				$loader[] = '	script.src = "' . $js . '";';
				$loader[] = '	body.appendChild(script);';
			}
			$loader[] = '});';
			$loader[] = '';
			$this->loadScript($loader);
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

	private function loadTranslations($locale = 'fr', $domain = 'messages') {
		$translationsfile = file_get_contents($this->publicDir . "/assets/bundles/bazingajstranslation/js/translations/" . $domain . "/" . $locale . ".json"); 
		$translations = json_decode($translationsfile, true);
		$translations = $translations['translations'][$locale][$domain];
		$translations = [ $domain => [ 'fr' => $translations ] ];
		$translations = preg_replace("/    /", "\t", json_encode($translations, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES));
		$translations = preg_replace("/\n/", "\n\t", $translations);
		$translations = explode("\n", $translations);
		array_shift($translations);
		array_pop($translations);
		return implode("\n", $translations);
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
		$this->loadScript($escript);
	}

}
