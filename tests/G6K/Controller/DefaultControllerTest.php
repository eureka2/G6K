<?php

/*
The MIT License (MIT)

Copyright (c) 2017-2018 Jacques Archimède

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

namespace App\Tests\G6K\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\DomCrawler\Field\ChoiceFormField;
use Symfony\Component\DomCrawler\Field\InputFormField;
use Symfony\Component\DomCrawler\Field\TextareaFormField;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Process\ExecutableFinder;
use Symfony\Component\Dotenv\Dotenv;

/**
 *
 * This class run functional tests of the simulation engine (DefaultController) from tab delimited text files
 * These text files located in the "var/data/tests" directory contain the data of each of the simulators to be tested.
 *
 * This class can use either PhantomJS or SlimerJS as Javascript engine, the one installed
 *
 * @copyright Jacques Archimède
 *
 */
class DefaultControllerTest extends WebTestCase
{

	/**
	 * @var int        $testCount The number of tests performed
	 *
	 * @access  private
	 * @static 
	 *
	 */
	private static $testCount = 0;

	/**
	 * @var string|null $jsEngine The executable path of the Javascript engine
	 *
	 * @access  private
	 * @static 
	 *
	 */
	private static $jsEngine = null;

	/**
	 * @var int $startTime The start time of the tests
	 *
	 * @access  private
	 * @static 
	 *
	 */
	private static $startTime = null;

	/**
	 * Sets static variables before running tests
	 *
	 * @access  public
	 * @static 
	 * @return  void
	 *
	 */
	public static function setUpBeforeClass () {
		$dotenv = new Dotenv();
		$dotenv->load(dirname(dirname(dirname(__DIR__))) . DIRECTORY_SEPARATOR . '.env');
		$finder = new ExecutableFinder();
		self::$jsEngine = $finder->find("phantomjs");
		fwrite(STDOUT, "Starting up of functional tests");
		self::$startTime = time();
		if (self::$jsEngine !== null) {
			fwrite(STDOUT, " with PhantomJS (webkit engine)"); 
		} else {
			self::$jsEngine = $finder->find("slimerjs");
			if (self::$jsEngine !== null) {
				fwrite(STDOUT, " with SlimerJS (gecko engine)");
			}
		}
		self::$jsEngine = null;
		fwrite(STDOUT, PHP_EOL); 
	}

	/**
	 * Displays the name of the test at launch
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function setUp () {
		self::$testCount++;
		fwrite(STDOUT, "Test number " . self::$testCount . " : " . $this->getName() . PHP_EOL); 
	}

	/**
	 * Displays the test statistics after the tests are over
	 *
	 * @access  public
	 * @static 
	 * @return  void
	 *
	 */
	public static function tearDownAfterClass () {
		$s = time() - self::$startTime;
		$h = floor($s / 3600);
		$s -= $h * 3600;
		$m = floor($s / 60);
		$s -= $m * 60;
		$duration = $h.':'.sprintf('%02d', $m).':'.sprintf('%02d', $s);
		fwrite(STDOUT, "End functional tests\n"); 
		fwrite(STDOUT, "Tests duration : ". $duration . PHP_EOL); 
	}

	/**
	 * Starts the functional tests of a simulator in a given view on the Calcul action of the DefaultController
	 *
	 * @dataProvider simusProvider
	 */
	 public function testCalcul($view, $simu, $fields)
	{
		$this->runSimuTest($view, $simu, $fields);
	}

	/**
	 * Returns the custom data provider iterator for the tests
	 *
	 * @access  public
	 * @return  \App\G6K\Tests\Controller\DataProviderIterator The custom data provider iterator
	 *
	 */
	public function simusProvider()
	{
		return new DataProviderIterator();
	}

	/**
	 * Starts the functional tests of a simulator in a given view
	 *
	 * @access  private
	 * @param   string $view The name of the view
	 * @param   string $simu The name of the simulator
	 * @param   array $fields The fields and values that make up the test set
	 * @return  void
	 *
	 */
	private function runSimuTest($view, $simu, $fields) {
		if (self::$jsEngine !== null) {
			try {
				$this->runSimuTestWithJS($view, $simu, $fields);
			} catch (ProcessFailedException $e) {
				$this->runSimuTestWithoutJS($view, $simu, $fields);
			}
		} else {
			$this->runSimuTestWithoutJS($view, $simu, $fields);
		}
	}

	/**
	 * Starts the functional tests of a simulator in a given view with a Javascript engine
	 *
	 * @access  private
	 * @param   string $view The name of the view
	 * @param   string $simu The name of the simulator
	 * @param   array $fields The fields and values that make up the test set
	 * @return  void
	 * @throws \RuntimeException
	 * @throws \Symfony\Component\Process\Exception\ProcessFailedException
	 *
	 */
	private function runSimuTestWithJS($view, $simu, $fields) {
		$url = $this->makeUrl($view, $simu);
		$jfields = json_encode($fields);
		$testscript = <<<EOS
"use strict";
var page = require('webpage').create(),
	system = require('system');
var fields = JSON.parse('$jfields');
var names = Object.keys(fields);
var f = 0, n = names.length;

function processPage() {
	while (f < n) {
		var name= names[f];
		var value = fields[name];
		var newpage = page.evaluate(function (name, value) {
			var isAButton = $("#g6k_form button[name='" + name + "']");
			if (isAButton.length > 0) {
				isAButton.trigger("click");
				return true;
			} else if (value != '') {
				var output = $("span#" + name);
				if (output.length > 0) {
					alert('$simu' + "\\t" + name + "\\t" + value + "\\t" + $.trim(output.text()) + "\\tE");
				} else {
					var input = $("#g6k_form input[name='" + name + "'], #g6k_form select[name='" + name + "']");
					if (input.length > 0) {
						input.val(value);
					}
				}
			}
			return false;
		}, name, value);
		f++;
		if (newpage) {
			break;
		}
	}
}

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  system.stderr.writeLine(msgStack.join("\\n"));
  phantom.exit(1);
};

page.onError = function(msg, trace) {
  var msgStack = ['PAGE ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  system.stderr.writeLine(msgStack.join("\\n"));
};

page.onConsoleMessage = function(msg) {
    system.stderr.writeLine(msg);
};

page.onAlert = function(msg) {
    system.stdout.writeLine(msg);
};

page.open('$url', function (status) {
	if (status === 'fail') {
		phantom.exit();
	}
});
page.onLoadFinished = function(status) {
	if (status === 'fail') {
		phantom.exit();
	}
	processPage();
	if  (f >= n) {
		phantom.exit();
	}
};
EOS;
		$file = tempnam(sys_get_temp_dir(), self::$jsEngine);
		// @codeCoverageIgnoreStart
        if (false === $file) {
            throw new \RuntimeException('Could not create temp file. Check temp directory permissions.');
        }
		$file .= ".js";
        // @codeCoverageIgnoreEnd
		file_put_contents($file, $testscript);
		$process = new Process(array(self::$jsEngine, $file));
		$process->run(function ($type, $buffer) {
			$lines = explode("\n", $buffer);
			foreach ($lines as $line) {
				if (Process::ERR === $type) {
					fwrite(STDOUT, 'ERR > '.$line . PHP_EOL);
				} else {
					if ($line != "") {
						try {
							list($s, $name, $expected, $actual) = explode("\t", $line);
							if (preg_match("/^~/", $expected)) {
								$this->assertContains($expected, $actual, "Failure when checking content of " . $name . " for " . $s, false);
							} else {
								$this->assertEquals($expected, $actual, "Failure when checking content of " . $name . " for " . $s);
							}
						} catch (\Exception $e) {
							fwrite(STDOUT, 'ERR > '.$line . PHP_EOL);
						}
					}
				}
			}
		});
		unlink($file);
		if (!$process->isSuccessful()) {
			throw new ProcessFailedException($process);
		}
	}

	/**
	 * Starts the functional tests of a simulator in a given view with a crawler
	 *
	 * @access  private
	 * @param   string $view The name of the view
	 * @param   string $simu The name of the simulator
	 * @param   array $fields The fields and values that make up the test set
	 * @return  void
	 *
	 */
	private function runSimuTestWithoutJS($view, $simu, $fields) {
		$client = static::createClient();
		$crawler = $client->request('GET', $simu);
		$g6kform = $crawler->filter("#g6k_form");
		$inputs = array();
		foreach ($fields as $name => $value) {
			if (!$g6kform->form()->has($name) && $crawler->selectButton($name)) { // button
				$form = $crawler->selectButton($name)->form();
				foreach ($inputs as $input => $val) {
					if ($form->has($input)) {
						$formField = $form[$input];
						if ($formField instanceof ChoiceFormField) {
							if ($formField->getType() == 'checkbox') {
								if ($val == '1' || $val == 'true') {
									$formField->tick();
								} else {
									$formField->untick();
								}
							} else {
								$formField->select($val);
							}
						} elseif ($formField instanceof InputFormField) {
							$formField->setValue($val);
						} elseif ($formField instanceof TextareaFormField) {
							$formField->setValue($val);
						} else {
							$formField->setValue($val);
						}
					}
				}
				$inputs = array();
				$form->getNode()->setAttribute("action", $simu);
				$crawler = $client->submit($form, array($name => "1"));
				$g6kform = $crawler->filter("#g6k_form");
			} elseif ($value != "") {
				if (($val = $this->isOutput($crawler, $name)) !== false) {
					$this->assertEquals($value, $val, "Failure when checking content of " . $name . " for " . $simu);
				} else { // input}
					$inputs[$name] = $value;
				}
			}
		}
	}

	private function makeUrl($view, $simu) {
		$client = static::createClient();
		$https = $client->getServerParameter('HTTPS');
		$scheme = ($https != '' ? 'https://' : 'http://' );
		$server = $client->getServerParameter('HTTP_HOST');
		$dir = dirname(dirname(dirname(__DIR__)));
		$root = basename($dir);
		$finder = new Finder();
		$finder->files()->in($dir)->name("index.php");
		$webapp = current(iterator_to_array($finder))->getRelativePath();
		return $scheme.$server."/".$root."/".$webapp.$simu.$view;
	}

	private function isOutput($crawler, $name) {
		$output = false;
		$element = $crawler->filter("span[id=" . $name . "]");
		if ($element->count() > 0) {
			$output = $element->text();
		}
		return $output;
	}

}
