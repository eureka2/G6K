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

/**
 *
 * This class implements a custom data provider iterator for the functional tests
 *
 * It reads all the tab delimited text files in the var/data/tests directory and provides their lines one by one to the test program. 
 *
 * @copyright Jacques Archimède
 *
 */
class DataProviderIterator implements \Iterator {

	/**
	 * @var array      $simus The list of simulators who have a test set
	 *
	 * @access  protected
	 *
	 */
	protected $simus;

	/**
	 * @var int        $curr A pointer to the current test set of a simulator
	 *
	 * @access  protected
	 *
	 */
	protected $curr = 0;

	/**
	 * @var int        $num The number of the current test set
	 *
	 * @access  protected
	 *
	 */
	protected $num = 0;

	/**
	 * @var string     $key The key of the current test element
	 *
	 * @access  protected
	 *
	 */
	protected $key = "";

	/**
	 * @var mixed      $current The current test element
	 *
	 * @access  protected
	 *
	 */
	protected $current;

	/**
	 * Constructor of class DataProviderIterator
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function __construct() {
		$this->simus = array();
		$testsDir = dirname(dirname(dirname(__DIR__))) . '/var/data/tests';
		if (is_dir($testsDir)) {
			$files = scandir($testsDir);
			foreach ($files as $file) {
				if (preg_match("/([^\.]+)\.txt$/", $file, $matches)) {
					$simu = '/' . $matches[1];
					$fh = fopen($testsDir . "/" . $file, "r");
					array_push($this->simus, array($simu, $fh, false));
				}
			}
		}
	}

	/**
	 * Destructor of class DataProviderIterator
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function __destruct() {
		foreach ($this->simus as $simu) {
			fclose($simu[1]);
		}
	}

	/**
	 * Rewind the Iterator to the first test element
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function rewind() {
		$nsimus = count($this->simus);
		for ($i = 0; $i < $nsimus; $i++) {
			rewind($this->simus[$i][1]);
			$this->simus[$i][2] = false;
		}
		$this->curr = 0;
		$this->num = 0;
		$this->next();
	}

	/**
	 *  Checks if current test element is valid
	 *
	 * @access  public
	 * @return  bool true if current test element is valid, false otherwise
	 *
	 */
	public function valid() {
		return $this->current !== null;
	}

	/**
	 * Returns the key of the current test element
	 *
	 * @access  public
	 * @return  string The key of the current test element
	 *
	 */
	public function key() {
		return $this->key;
	}

	/**
	 * Returns the current test element
	 *
	 * @access  public
	 * @return  array The current test element
	 *
	 */
	public function current() {
		return $this->current;
	}

	/**
	 * Move forward to next test element
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function next() {
		$next = $this->advance();
		$this->num++;
		if ($next !== null) {
			$this->key = $this->num . ": " . array_shift($next);
		}
		$this->current = $next;
	}

	/**
	 * Advances to the next test element and returns it
	 *
	 * @access  private
	 * @return array|null The next test element
	 *
	 */
	private function advance() {
		$fh = $this->simus[$this->curr][1];
		$test = $this->readAndSkipBlank($fh);
		if (feof($fh)) {
			$this->curr++;
			return $this->curr < count($this->simus) ? $this->advance() : null;
		}
		$simu = $this->simus[$this->curr][0];
		$fieldsName = $this->simus[$this->curr][2];
		if ($fieldsName === false) {
			$this->num = 0;
			$fieldsName = explode("\t", $test);
			array_shift($fieldsName); // shift test name header
			array_shift($fieldsName); // shift view header
			$this->simus[$this->curr][2] = $fieldsName;
			$test = $this->readAndSkipBlank($fh);
			if (feof($fh)) {
				$this->curr++;
				return $this->curr < count($this->simus) ? $this->advance() : null;
			}
		}
		$values = explode("\t", $test);
		$testkey = array_shift($values);
		$view = array_shift($values);
		if ($view != "") {
			$view = "/" . $view;
		}
		$fields = array();
		$nnames = count($fieldsName);
		for ($i = 0; $i < $nnames; $i++) {
			$name = $fieldsName[$i];
			$value = $i < count($values) ?  $values[$i] : "";
			$fields[$name] = $value;
		}
		return array($testkey, $view, $simu, $fields);
	}

	/**
	 * Reads the next line that is not empty from the current test file
	 *
	 * @access  private
	 * @param   resource $fh The file pointer resource
	 * @return  string The next line
	 *
	 */
	private function readAndSkipBlank($fh) {
		$rec = trim(fgets($fh));
		while ($rec == "" && !feof($fh)) {
			$rec = trim(fgets($fh));
		}
		return $rec;
	}

}

?>
