<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2018 Jacques Archimède

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

namespace App\G6K\Manager\Json\JsonSQL;

use App\G6K\Manager\Json\JsonSQL;

/**
 *  The class JsonSQLStatement represents a prepared statement and, 
 *  after the statement is executed, an associated result set.
 */
abstract class Statement  {

	/**
	 * @var \App\G6K\Manager\Json\JsonSQL $jsonsql the JsonSQL instance
	 *
	 * @access  protected
	 *
	 */
	protected $jsonsql = null;

	/**
	 * @var object $request The prepared statement
	 *
	 * @access  protected
	 *
	 */
	protected $request = null;

	/**
	 * @var array $result The result set
	 *
	 * @access  protected
	 *
	 */
	protected $result = null;

	/**
	 * @var int $rowCount The number of rows affected by the last SQL statement
	 *
	 * @access  protected
	 *
	 */
	protected $rowCount = null;

	/**
	 * @var array      $params The list of parameters to be bound
	 *
	 * @access  protected
	 *
	 */
	protected $params = array();

	/**
	 * @var \App\G6K\Manager\Json\JsonSQL\Engine $engine The JsonSQL engine
	 *
	 * @access  protected
	 *
	 */
	protected $engine = null;

	/**
	 * Class Constructor
	 *
	 * @access protected
	 * @param JsonSQL $jsonsql The JsonSQL instance
	 * @param \stdClass $request The prepared statement
	 */
	protected function __construct(JsonSQL $jsonsql, \stdClass &$request) {
		$this->jsonsql = $jsonsql;
		$this->engine = $jsonsql->getEngine();
		$this->request = $request;
		$this->result = array();
		$this->rowCount = 0;
	}


	/**
	 * Statement factory
	 *
	 * @access public
	 * @static 
	 * @param JsonSQL $jsonsql The JsonSQL instance
	 * @param \stdClass &$request The prepared statement
	 */
	public function create(JsonSQL $jsonsql, \stdClass &$request) {
		switch($request->statement) {
			case 'select':
			case 'compound select':
			case 'insert':
			case 'update':
			case 'delete':
			case 'truncate':
				return new DMLStatement($jsonsql, $request);
			case 'create table':
			case 'alter table':
			case 'drop table':
				return new DDLStatement($jsonsql, $request);
			default:
				throw new JsonSQLException("Unexpected statement : " . $request->statement);
			
		}
	}

	/**
	 * Binds a value to a corresponding named or question mark placeholder 
	 * in the SQL statement that was used to prepare the statement.
	 *
	 * @access public
	 * @param mixed $parameter The parameter identifier
	 * @param  mixed $value The value to bind to the parameter
	 * @param int $type The data type for the parameter using the PDO::PARAM_* constants.
	 * @return bool true on success or false on failure.
	 */
	public function bindValue($parameter, $value, $type=\PDO::PARAM_STR) {
		$this->checkValue($value);
		$value = $this->engine->quote($value, $type);
		if (in_array($this->request->statement, array('select', 'delete'))) {
			if (is_int($parameter)) {
				$this->request->where = preg_replace_callback("/\?/",
					function($found) use ($parameter, $value) {
						$parameter--;
						if ($parameter==0) return preg_replace("/\?/", $value, reset($found));
						return reset($found);
					}, $this->request->where, $parameter);
				return true;
			} elseif (preg_match("/^\:/", $parameter)) {
				$this->request->where = preg_replace('/\\'.$parameter.'/', $value, $this->request->where);
				return true;
			}
		} elseif ($this->request->statement == 'insert') {
			if (is_int($parameter)) {
				foreach($this->request->values as $v => $val) {
					if ($val == '?')  {
						$parameter--;
						if ($parameter == 0) {
							$this->request->values[$v] = $value;
							return true;
						}
					}
				}
			} elseif (preg_match("/^\:/", $parameter)) {
				foreach($this->request->values as $v => $val) {
					if ($val == $parameter)  {
						$this->request->values[$v] = $value;
						return true;
					}
				}
			}
		}
		return false;
	}

	/**
	 * Binds a PHP variable to a corresponding named or question mark placeholder 
	 * in the SQL statement that was used to prepare the statement.
	 * the variable is bound as a reference and will only be evaluated 
	 * at the time that execute() is called.
	 *
	 * @access public
	 * @param mixed $parameter The parameter identifier
	 * @param  mixed &$variable The variable to bind to the parameter
	 * @param int $type The data type for the parameter using the PDO::PARAM_* constants.
	 * @return bool true on success or false on failure.
	 */
	public function bindParam($parameter, &$variable, $type=\PDO::PARAM_STR) {
		$this->params[] = array($parameter, &$variable, $type);
		return true;
	}

	/**
	 * Executes a prepared statement.
	 *
	 * @access public
	 * @param array $parameters An array of values with as many elements as there are bound parameters 
	 * in the SQL statement being executed. All values are treated as PDO::PARAM_STR.
	 * @return bool true on success or false on failure.
	 */
	public function execute($parameters = array()) {
		foreach($parameters as $parameter => $value) {
			if (!$this->bindValue($parameter, $value)) {
				return false;
			}
		}
		foreach($this->params as $param) {
			if (!$this->bindValue($param[0], $param[1], $param[2])) {
				return false;
			}
		}
		if ($this->request->statement == 'compound select') {
			return $this->executeCompoundSelect();
		} elseif ($this->request->statement == 'select') {
			return $this->executeSelect();
		} elseif ($this->request->statement == 'insert') {
			return $this->executeInsert();
		} elseif ($this->request->statement == 'update') {
			return $this->executeUpdate();
		} elseif ($this->request->statement == 'delete') {
			return $this->executeDelete();
		} elseif ($this->request->statement == 'create table') {
			return $this->executeCreateTable();
		} elseif ($this->request->statement == 'alter table') {
			return $this->executeAlterTable();
		} elseif ($this->request->statement == 'truncate') {
			return $this->executeTruncate();
		} elseif ($this->request->statement == 'drop table') {
			return $this->executeDropTable();
		}
		$this->params = array();
		return false;
	}

	/**
	 * Returns the number of rows affected by the last SQL statement
	 *
	 * @access public
	 * @return int The number of rows.
	 */
	public function rowCount() {
		return $this->rowCount;
	}

	/**
	 * Returns the number of columns in the result set
	 *
	 * @access public
	 * @return int The number of columns in the result set. 
	 * If there is no result set, returns 0.
	 */
	public function columnCount() {
		return $this->rowCount > 0 ? count($this->result[0]) : 0;
	}

	/**
	 * Checks if a value corresponds to its type and if it is safety in case of string
	 *
	 * @access protected
	 * @param string $value The value
	 * @param int $type The expected type
	 * @return void
	 * @throws JsonSQLException
	 */
	protected function checkValue($value, $type=\PDO::PARAM_STR) {
		if ($type == \PDO::PARAM_INT) {
			if (!is_int($value)) {
				throw new JsonSQLException("syntax error : int value expected");
			}
		} elseif ($type == \PDO::PARAM_BOOL) {
			if (!is_bool($value)) {
				throw new JsonSQLException("syntax error : bool value expected");
			}
		} else {
			$dmlparser = new DMLParser($this->jsonsql, "");
			$dmlparser->checkSafety($value);
		}
	}

	/**
	 * Executes a prepared select statement with set opertations.
	 *
	 * @access protected
	 * @return bool Always true.
	 */
	abstract protected function executeCompoundSelect();

	/**
	 * Executes a prepared select statement.
	 *
	 * @access protected
	 * @return bool Always true.
	 */
	abstract protected function executeSelect();

	/**
	 * Executes a prepared insert statement.
	 *
	 * @access protected
	 * @return bool Always true.
	 */
	abstract protected function executeInsert();

	/**
	 * Executes a prepared update statement.
	 *
	 * @access protected
	 * @return bool Always true.
	 */
	abstract protected function executeUpdate();

	/**
	 * Executes a prepared delete statement.
	 *
	 * @access protected
	 * @return bool Always true.
	 */
	abstract protected function executeDelete();

	/**
	 * Executes a prepared 'create table' statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	abstract protected function executeCreateTable();

	/**
	 * Executes a prepared 'alter table' statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	abstract protected function executeAlterTable();

	/**
	 * Executes a prepared 'truncate' statement.
	 *
	 * @access protected
	 * @return bool Always true.
	 */
	abstract protected function executeTruncate();

	/**
	 * Executes a prepared 'drop table' statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	abstract protected function executeDropTable();

}

?>
