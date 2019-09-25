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

namespace App\G6K\Manager;

use App\G6K\Manager\DatasourcesTrait;
use App\G6K\Model\Database;

/**
 * Base class for concrete classes that convert input files of a particular format into SQL database
 *
 * @copyright Jacques Archimède
 *
 */
abstract class SQLConverterBase {

	use DatasourcesTrait;

	/**
	 * @var array      $parameters The database parameters
	 *
	 * @access  protected
	 *
	 */
	protected $parameters = array(
		'database_driver' => 'pdo_sqlite',
		'database_host' => null,
		'database_port' => null,
		'database_name' => null,
		'database_user' => null,
		'database_password' => null,
		'database_path' => null
	);

	/**
	 * @var string      $databasesDir The G6K databases directory
	 *
	 * @access  protected
	 *
	 */
	protected $databasesDir;

	/**
	 * @var \SimpleXMLElement      $datasources The data sources
	 *
	 * @access  protected
	 *
	 */
	protected $datasources;

	/**
	 * @var \App\G6K\Model\Database      $database The Database object
	 *
	 * @access  protected
	 *
	 */
	protected $database;

	/**
	 * Constructor of class JSONToSQLConverter
	 *
	 * @access  public
	 * @param   array $fparameters The database parameters
	 * @param   string $databasesDir The G6K databases directory
	 * @return  void
	 *
	 */
	public function __construct($fparameters, $databasesDir) {
		$this->databasesDir = $databasesDir;
		$this->parameters = array_merge($this->parameters, $fparameters);
		$this->datasources =  new \SimpleXMLElement($this->databasesDir."/DataSources.xml", LIBXML_NOWARNING, true);
	}

	/**
	 * Checks if a parameter exists.
	 *
	 * @access  protected
	 * @param   string $parameter The parameter name
	 * @return  bool true if the parameter exists, false if not
	 *
	 */
	protected function hasConfigParameter($parameter) {
		return isset($this->parameters[$parameter]);
	}

	/**
	 * Gets a parameter with its name.
	 *
	 * @access  protected
	 * @param   string $parameter The parameter name
	 * @return  string|null The parameter value
	 *
	 */
	protected function getConfigParameter($parameter) {
		return $this->parameters[$parameter] ?? null;
	}

	/**
	 * Returns the data type of a database column
	 *
	 * @access  protected
	 * @param   \stdClass $coldef The database column definition
	 * @return  string The data type
	 *
	 */
	protected function getType(\stdClass $coldef) {
		$driver = $this->parameters['database_driver'];
		if ($coldef->type == 'string') {
			if(isset($coldef->format)) {
				return $this->datatypes[$driver][$coldef->format];
			} elseif(isset($coldef->maxLength)) {
				return "VARCHAR(".$coldef->maxLength.")";
			} else {
				return $this->datatypes[$driver][$coldef->type];
			} 
		}
		$type = $this->datatypes[$driver][$coldef->type];
		if(isset($coldef->maxLength)) {
			$type .= "(".$coldef->maxLength.")";
		}
		return $type;
	}

	/**
	 * Prepares a value according to its type for its insertion in a SQL database
	 *
	 * @access  protected
	 * @param   string $type The type of the value
	 * @param   string $value The value
	 * @return  string The new value
	 *
	 */
	protected function getValue($type, $value) {
		if ($type == 'string') {
			$value = $this->database->quote($value, \PDO::PARAM_STR);
		} elseif ($type == 'integer') {
			$value = $this->database->quote($value, \PDO::PARAM_INT);
		} elseif ($type == 'boolean') {
			$value = $value ? "'1'" : "'0'";
		}
		return $value;
	}

	/**
	 * Decodes a properties list from JSON schema
	 *
	 * @access  protected
	 * @param   string $arg The properties list
	 * @return  \stdClass The decoded properties
	 *
	 */
	protected function properties($arg) {
		$props = array();
		$params = array_map(function ($i) { return trim($i); }, str_getcsv($arg, ",", "'"));
		foreach($params as $prop) {
			list($property, $value) = explode(':', $prop);
			$props[$property] = $value;
		}
		return (object)$props;
	}
	/**
	 * Connects to the database
	 *
	 * @access  protected
	 * @param   string $dbschema The database name
	 * @param   string $dbtype The database type
	 * @return  void
	 *
	 */
	protected function connectDatabase($dbschema, $dbtype) {
		$this->database = new Database(null, $this->databasesDir, 1, $dbtype, str_replace('-', '_', $dbschema));
		if ($this->parameters['database_host'] !== null && $this->parameters['database_host'] != "") {
			$this->database->setHost($this->parameters['database_host']);
		}
		if ($this->parameters['database_port'] !== null && $this->parameters['database_port'] != "") {
			$this->database->setPort((int)$this->parameters['database_port']);
		}
		if ($this->parameters['database_user'] !== null && $this->parameters['database_user'] != "") {
			$this->database->setUser($this->parameters['database_user']);
		}
		if ($this->parameters['database_password'] !== null && $this->parameters['database_password'] != "") {
			$this->database->setPassword($this->parameters['database_password']);
		}
		$this->database->connect(false);
	}

	/**
	 * Imports file(s) to a SQL database and returns an array descriptor of the database for the update of DataSources.xml
	 *
	 * @access  public
	 * @param   array $inputs An associative array containing files name
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @param   callable|null $fprogress a function receiving the row number that's inserted
	 * @return  array The array descriptor of the SQL database
	 * @throws \Exception
	 *
	 */
	abstract public function convert($inputs, $translator = null, $fprogress = null);
}

?>
