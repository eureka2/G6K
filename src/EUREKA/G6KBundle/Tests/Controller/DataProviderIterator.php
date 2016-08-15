<?php

namespace EUREKA\G6KBundle\Tests\Controller;

class DataProviderIterator implements \Iterator {
	protected $simus;
	protected $curr = 0;
	protected $num = 0;
	protected $key = "";
	protected $current;

	public function __construct() {
		$this->simus = array();
		$testsDir = dirname(dirname(__DIR__)) . '/Resources/data/tests';
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

	public function __destruct() {
		foreach ($this->simus as $simu) {
			fclose($simu[1]);
		}
	}

    public function rewind() {
		for ($i = 0; $i < count($this->simus); $i++) {
			rewind($this->simus[$i][1]);
			$this->simus[$i][2] = false;
		}
		$this->curr = 0;
		$this->num = 0;
		$this->next();
   }

    public function valid() {
        return $this->current !== null;
    }

    public function key() {
        return $this->key;
    }

    public function current() {
        return $this->current;
    }

    public function next() {
		$next = $this->advance();
        $this->num++;
		$this->key = $this->num . ": " . array_shift($next);
        $this->current = $next;
    }
	
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
		for ($i = 0; $i < count($fieldsName); $i++) {
			$name = $fieldsName[$i];
			$value = $i < count($values) ?  $values[$i] : "";
			$fields[$name] = $value;
		}
		return array($testkey, $view, $simu, $fields);
	}
	
	private function readAndSkipBlank($fh) {
		$rec = trim(fgets($fh));
		while ($rec == "" && !feof($fh)) {
			$rec = trim(fgets($fh));
		}
		return $rec;
	}

}
?>