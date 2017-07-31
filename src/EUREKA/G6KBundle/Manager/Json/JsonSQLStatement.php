<?php
/**
The MIT License (MIT)

Copyright (c) 2016 Jacques Archimède

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

namespace EUREKA\G6KBundle\Manager;

use EUREKA\G6KBundle\Manager\ExpressionParser\Parser;

/**
 *  The class JsonSQLStatement Represents a prepared statement and, 
 *  after the statement is executed, an associated result set.
 */
class JsonSQLStatement  {
	private $jsonsql = null;
	private $builtins = null;
	private $request = null;
	private $result = null;
	private $rowCount = null;
	private $params = array();
	private $parser = null;

	/**
	 * Class Constructor
	 *
	 * @access public
	 * @param JsonSQL $jsonsql the JsonSQL instance
	 * @param object $request the prepared statement
	 */
	public function __construct($jsonsql, &$request) {
		$this->parser = new Parser();
		$this->jsonsql = $jsonsql;
		$this->request = $request;
		$this->result = array();
		$this->rowCount = 0;
		$currentDate = date('Y-m-d');
		$currentTime = date('H:i:s');
		$this->builtins = array(
			'CURRENT_DATE' => $currentDate,
			'CURRENT_TIME' => $currentTime,
			'CURRENT_TIMESTAMP' => $currentDate . ' ' . $currentTime,
			'SYSDATE' => $currentDate . ' ' . $currentTime,
			'NOW' => $currentDate . ' ' . $currentTime
		);
	}

	/**
	 * Binds a value to a corresponding named or question mark placeholder 
	 * in the SQL statement that was used to prepare the statement.
	 *
	 * @access public
	 * @param mixed $parameter the parameter identifier
	 * @param  mixed $value the value to bind to the parameter
	 * @param int $type the data type for the parameter using the PDO::PARAM_* constants.
	 * @return boolean TRUE on success or FALSE on failure.
	 */
	public function bindValue($parameter, $value, $type=\PDO::PARAM_STR) {
		$this->checkValue($value);
		$value = $this->jsonsql->quote($value, $type);
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
	 * @param mixed $parameter the parameter identifier
	 * @param  mixed $value the value to bind to the parameter
	 * @param int $type the data type for the parameter using the PDO::PARAM_* constants.
	 * @return boolean TRUE on success or FALSE on failure.
	 */
	public function bindParam($parameter, &$variable, $type=\PDO::PARAM_STR) {
		$this->params[] = array($parameter, &$variable, $type);
		return true;
	}

	/**
	 * Executes a prepared statement.
	 *
	 * @access public
	 * @param array $parameter An array of values with as many elements as there are bound parameters 
	 * in the SQL statement being executed. All values are treated as PDO::PARAM_STR.
	 * @return boolean TRUE on success or FALSE on failure.
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
	 * @return int the number of rows.
	 */
	public function rowCount() {
		return $this->rowCount;
	}

	/**
	 * Returns the number of columns in the result set
	 *
	 * @access public
	 * @return int the number of columns in the result set. 
	 * If there is no result set, returns 0.
	 */
	public function columnCount() {
		return $this->rowCount > 0 ? count($this->result[0]) : 0;
	}

	/**
	 * Fetches the next row from a result set
	 *
	 * @access public
	 * @return int the next row from a result set.
	 */
	public function fetch() {
		return next($this->result);
	}

	/**
	 * Returns a single column from the next row of a result set
	 *
	 * @param int $c the parameter identifier
	 * @access public
	 * @return mixed a single column from the next row of a result set or FALSE
	 */
	public function fetchColumn($c = 0) {
		$row = $this->fetch();
		return $row !== false ? $row[$c] : FALSE;
	}

	/**
	 * Returns an array containing all of the result set rows
	 *
	 * @access public
	 * @return mixed the array of rows in the result set or FALSE
	 */
	public function fetchAll() {
		return $this->result;
	}

	/**
	 * Executes a prepared select statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeSelect() {
		$result = $this->select();
		$result = $this->aggregate($result);
		$result = $this->sort($result);
		$result = $this->limit($result);
		$result = $this->project($result);
		$this->result = $result;
		$this->rowCount = count($result);
		reset($this->result);
		return true;
	}

	/**
	 * Executes a prepared select statement with set opertations.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeCompoundSelect() {
		$request = $this->request;
		$result = array();
		$nselect = count($request->selects);
		foreach ($request->selects as $i => $select) {
			$this->request = $select->request;
			$temp = $this->select();
			$temp = $this->aggregate($temp);
			$temp = $this->project($temp);
			if ($select->operator == 'unionall') {
				$result = array_merge($result, $temp);
			} elseif ($select->operator == 'union') {
				$result = array_unique(array_merge($result, $temp), SORT_REGULAR);
			} elseif ($select->operator == 'intersect') {
				$result = array_values(array_uintersect($result, $temp, function ($a, $b) {
					foreach($a as $k => $v) {
						if (!isset($b[$k]) || $b[$k] != $v) {
							return -1;
						}
					}
					return 0;
				}));
			} elseif ($select->operator == 'except') {
				$result = array_values(array_udiff($result, $temp, function ($a, $b) {
					foreach($a as $k => $v) {
						if (!isset($b[$k]) || $b[$k] != $v) {
							return -1;
						}
					}
					return 0;
				}));
			}
			if ($i == $nselect - 1) {
				$result = $this->sort($result);
				$result = $this->limit($result);
			}
		}
		$this->request = $request;
		$this->result = $result;
		$this->rowCount = count($result);
		reset($this->result);
		return true;
	}

	/**
	 * Executes a prepared insert statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeInsert() {
		if (isset($this->request->rows)) {
			$this->rowCount = 0;
			foreach($this->request->rows as $row) {
				foreach($row as $field => &$value) {
					if ($this->isExpression($value)) {
						$value = $this->evaluate($value, $row);
					} elseif ($this->isBuiltin($value)) {
						$value = $this->builtins[strtoupper($value)];
					}
				}
				$this->jsonsql->insert($this->request->into, $row);
				$this->rowCount++;
			}
		} else {
			$stmt = new JsonSQLStatement($this->jsonsql, $this->request->select);
			foreach($this->params as $param) {
				$stmt->bindParam($param[0], $param[1], $param[2]);
			}
			if (!$stmt->execute()) {
				return false;
			}
			$values = $stmt->fetchAll();
			array_walk($values, function ($v, $i) {
				$row = array_combine($this->request->fields, $v);
				$this->jsonsql->insert($this->request->into, $row);
			});
			$this->rowCount = $stmt->rowCount();
		}
		return true;
	}

	/**
	 * Executes a prepared update statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeUpdate() {
		$table = $this->jsonsql->table($this->request->update);
		$this->rowCount = 0;
		while($table->valid()) {
			$row = $table->current();
			if ($this->evaluate($this->request->where, $row) === true) {
				foreach($this->request->set as $field => $value) {
					if ($this->isExpression($value)) {
						$row->{$field} = $this->evaluate($value, $row);
					} elseif ($this->isBuiltin($value)) {
						$row->{$field} = $this->builtins[strtoupper($value)];
					} else {
						$row->{$field} = $value;
					}
				}
				$this->jsonsql->replace($this->request->update, $table->key(), $row);
				$this->rowCount++;
			}
			$table->next();
		}
		return true;
	}

	/**
	 * Executes a prepared delete statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeDelete() {
		$table = $this->jsonsql->table($this->request->from);
		$this->rowCount = 0;
		while($table->valid()) {
			$row = $table->current();
			if ($this->evaluate($this->request->where, $row) === true) {
				$this->jsonsql->delete($this->request->from, $table->key());
				$this->rowCount++;
			}
			$table->next();
		}
		return true;
	}

	/**
	 * Executes a prepared 'create table' statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeCreateTable() {
		$this->jsonsql->createTable($this->request->table, $this->request->columns, $this->request->required, $this->request->foreignkeys, $this->request->ifnotexists);
		if (isset( $this->request->select) && $this->request->withdata) {
			$stmt = new JsonSQLStatement($this->jsonsql, $this->request->select);
			foreach($this->params as $param) {
				$stmt->bindParam($param[0], $param[1], $param[2]);
			}
			if (!$stmt->execute()) {
				return false;
			}
			$result = $stmt->fetchAll();
			$fields = array_keys((array)$this->request->columns);
			array_walk($result, function ($v, $i) use ($fields) {
				$values = array();
				foreach($v as $c => $value) {
					if (preg_match("/^([^\.]+)\.([^\.]+)$/", $c)) {
						$values[] = $value;
					}
				}
				if (count($values) == 0) {
					$values = array_values($v);
				}
				$row = array_combine($fields, $values);
				$this->jsonsql->insert($this->request->table, $row);
			});
			$this->rowCount = $stmt->rowCount();
		} else {
			$this->rowCount = 0;
		}
		return true;
	}

	/**
	 * Executes a prepared 'alter table' statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeAlterTable() {
		switch ($this->request->alter) {
			case 'rename table':
				$this->jsonsql->renameTable($this->request->table, $this->request->newtable);
				break;
			case 'rename column':
				$this->jsonsql->renameColumn($this->request->table, $this->request->column->name, $this->request->column->newname);
				break;
			case 'drop column':
				$this->jsonsql->dropColumn($this->request->table, $this->request->column->name, $this->request->column->ifexists);
				break;
			case 'modify title':
				$this->jsonsql->setTableTitle($this->request->table, $this->request->title);
				break;
			case 'drop title':
				$this->jsonsql->setTableTitle($this->request->table, false);
				break;
			case 'modify comment':
				$this->jsonsql->setTableDescription($this->request->table, $this->request->comment);
				break;
			case 'drop comment':
				$this->jsonsql->setTableDescription($this->request->table, false);
				break;
			case 'modify column':
				switch ($this->request->column->action) {
					case 'set type':
						$this->jsonsql->setColumnType($this->request->table, $this->request->column->name, $this->request->column->type, $this->request->column->format, $this->request->column->datatype);
						break;
					case 'set not null':
						$this->jsonsql->setNotNull($this->request->table, $this->request->column->name, false);
						break;
					case 'set primary key':
						$this->jsonsql->setPrimaryKey($this->request->table, $this->request->column->name, false);
						break;
					case 'set autoincrement':
						$this->jsonsql->setAutoincrement($this->request->table, $this->request->column->name, false);
						break;
					case 'set default':
						$this->jsonsql->setDefault($this->request->table, $this->request->column->name, $this->request->column->default);
						break;
					case 'set title':
						$this->jsonsql->setColumnTitle($this->request->table, $this->request->column->name, $this->request->column->title);
						break;
					case 'set comment':
						$this->jsonsql->setColumnDescription($this->request->table, $this->request->column->name, $this->request->column->comment);
						break;
					case 'remove not null':
						$this->jsonsql->setNotNull($this->request->table, $this->request->column->name, true);
						break;
					case 'remove primary key':
						$this->jsonsql->setPrimaryKey($this->request->table, $this->request->column->name, true);
						break;
					case 'remove autoincrement':
						$this->jsonsql->setAutoincrement($this->request->table, $this->request->column->name, true);
						break;
					case 'remove default':
						$this->jsonsql->setDefault($this->request->table, $this->request->column->name, false);
						break;
					case 'remove title':
						$this->jsonsql->setColumnTitle($this->request->table, $this->request->column->name, false);
						break;
					case 'remove comment':
						$this->jsonsql->setColumnDescription($this->request->table, $this->request->column->name, false);
						break;
					default:
						return false;
				}
				break;
			case 'add column':
				$this->jsonsql->addColumn($this->request->table, $this->request->column->name, $this->request->column->definition, $this->request->required);
				break;
			default:
				return false;
		}
		return true;
	}

	/**
	 * Executes a prepared 'truncate' statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeTruncate() {
		foreach($this->request->tables as $table) {
			$this->jsonsql->truncate($table);
		}
		$this->rowCount = 0;
		return true;
	}

	/**
	 * Executes a prepared 'drop table' statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeDropTable() {
		foreach($this->request->tables as $table) {
			$this->jsonsql->dropTable($table, $this->request->ifexists);
		}
		$this->rowCount = 0;
		return true;
	}

	/**
	 * Checks if a value corresponds to its type and if it is safety in case of string
	 *
	 * @access protected
	 * @param string $value the value
	 * @param int $type the expected type
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
			$this->jsonsql->checkSafety($value);
		}
	}

	/**
	 * From the given row, built an array 
	 * containing all the variables in the scope of the running request.
	 *
	 * @access protected
	 * @param array $row the table row 
	 * @return array array of variables.
	 */
	protected function makeExpressionVariables(&$row) {
		$variables = array();
		foreach ($this->request->columns as $column) {
			$variables[$column] = '';
			if (isset($this->request->select[$column]) && $this->request->select[$column] != $column) {
				$variables[$this->request->select[$column]] = '';
			}
		}
		foreach ($row as $field => $value) {
			$variables[$field] = (string)$value;
			if (isset($this->request->select[$field]) && $this->request->select[$field] != $field) {
				$variables[$this->request->select[$field]] = (string)$value;
			}
		}
		return array_merge($this->builtins, $variables);
	}

	/**
	 * Evaluates a condition with the values of the given row.
	 *
	 * @access protected
	 * @param string $conditions the condition to evaluate 
	 * @param array $row the table row 
	 * @return mixed the evaluation of the condition.
	 * @throws JsonSQLException
	 */
	protected function evaluate($conditions, &$row) {
		$variables = $this->makeExpressionVariables($row);
		$conditions = preg_replace("/\\$(\w+)/", "$1", $conditions); 
		$expr = $this->parser->parse($conditions);
		$expr->postfix();
		$expr->setVariables($variables);
		$ret = $expr->evaluate();
		if ($ret == 'false') {
			$ret = false;
		} elseif ($ret == 'true') {
			$ret = true;
		}
		return $ret;
	}

	/**
	 * Selects rows that satisfy the where clause of the request.
	 *
	 * @access protected
	 * @return array the result of th selection.
	 */
	protected function select() {
		foreach($this->request->from as $k => &$t) {
			$t->table = $this->jsonsql->table($t->table);
		}
		$len = count($this->request->from);
		$result = array();
		while(($row = $this->joins($len)) !== null) {
			if ($this->evaluate($this->request->where, $row) === true) {
				$result[] = $row;
			}
		}
		return $result;
	}

	/**
	 * Returns the next row resulting from the joining of tables in the query.
	 *
	 * @access protected
	 * @param int $len number of tables 
	 * @return object|null the next row or null if no more row.
	 */
	protected function joins($len) {
		$done = false;
		while (!$done) {
			$curr = $len - 1;
			while ($curr >= 0 && ! $this->request->from[$curr]->table->valid()) {
				$curr--;
			}
			if ($curr < 0) {
				return null;
			}
			for ($i = $curr + 1; $i < $len; $i++) {
				$this->request->from[$i]->table->rewind();
			}
			$tuple = null;
			foreach($this->request->from as $i => $from) {
				$row = (array)$from->table->current();
				$ntuple = array();
				foreach ($row as $k => $v) {
					$ntuple[$k] = $v;
					$ntuple[$from->alias . "__" . $k] = $v;
				}
				if ($i ==0 ) {
					$tuple = $ntuple;
				} else {
					$ctuple = array_merge($tuple, $ntuple);
					if ($from->join == JsonSQL::INNER_JOIN) {
						if ($this->evaluate($from->on, $ctuple) !== true) {
							$this->request->from[$curr]->table->next();
							$done = false;
							break;
						}
						$tuple = $ctuple;
					} elseif ($from->join == JsonSQL::CROSS_JOIN) {
						$tuple = $ctuple;
					} elseif ($from->join == JsonSQL::LEFT_JOIN) {
						if ($this->evaluate($from->on, $ctuple) !== true) {
							foreach ($ntuple as $k => &$v) {
								$v = null;
							}
							$tuple = array_merge($tuple, $ntuple);
						} else {
							$tuple = $ctuple;
						}
					} elseif ($from->join == JsonSQL::RIGHT_JOIN) {
						if ($this->evaluate($from->on, $ctuple) !== true) {
							foreach ($tuple as $k => &$v) {
								$v = null;
							}
							$tuple = array_merge($tuple, $ntuple);
						} else {
							$tuple = $ctuple;
						}
					}
				}
				$done = true;
			}
		}
		$this->request->from[$curr]->table->next();
		return (object)$tuple;
	}

	/**
	 * Checks if a string contains an expression.
	 *
	 * @access protected
	 * @param string $string the string to check
	 * @return bool TRUE if the string contains an expression, and FALSE if not.
	 */
	protected function isExpression($string) {
		if (preg_match("/^\d{4}\-\d{1,2}\-\d{1,2}( \d{1,2}\:\d{1,2}:\d{1,2})?$/", $string)) { // date
			return false;
		}
		return preg_match('/[\(\+\-\/\*\%]/', $string);
	}

	/**
	 * Determines if the given value is a builtin value.
	 *
	 * @access protected
	 * @param string $value the value to check
	 * @return bool TRUE if the value is a builtin value, and FALSE if not.
	 */
	protected function isBuiltin($value) {
		return in_array(strtoupper($value), array_keys($this->builtins));
	}

	/**
	 * Realizes the operation of projection of result set 
	 *
	 * @access protected
	 * @param array $scope the result set 
	 * @return array subset of the result set after projection 
	 */
	protected function project($scope) {
		$result = array();
		$prev = array();
		$nTables = count($this->request->from);
		foreach($scope as $row) {
			$returnobj = array();
			foreach ($this->request->select as $field => $alias) {
				if ($field == '*') {
					if ($nTables == 1) {
						foreach ($this->request->columns as $column) {
							if (strstr($column, "__") === false) {
								$returnobj[$column] = $this->fieldValue($row, $column);
							}
						}
					} else {
						foreach ($this->request->columns as $column) {
							$alias = preg_replace("/__/", ".", $column);
							$returnobj[$alias] = $this->fieldValue($row, $column);
						}
					}
				} elseif ($this->isBuiltin($field)) {
					$returnobj[$alias] = $this->builtins[strtoupper($field)];
				} elseif ($this->isExpression($field)) {
					$returnobj[$alias] = $this->evaluate($field, $row);
				} else {
					$returnobj[$alias] = $this->fieldValue($row, $field);
				}
			}
			$curr = (array)$returnobj;
			if (!$this->request->distinct || $curr != $prev) {
				$prev = $curr;
				$result[] = array_change_key_case($curr);
			}
		}
		return $result;
	}

	private function fieldValue($row, $column) {
		if (!isset($row->$column)) {
			$value = '';
		} elseif (is_bool($row->$column)) {
			$value = $row->$column ? 1 : 0;
		} else {
			$value = $row->$column;
		}
		return $value;
	}

	/**
	 * Performs group by clause on the given result set, if any
	 *
	 * @access protected
	 * @param array $result the result set 
	 * @return array the grouped result set 
	 */
	protected function aggregate($result) {
		if (count($this->request->groupby) == 0) {
			return $result;
		}
		$keys = $this->request->groupby;
		usort($result, function ($a, $b) use ($keys) {
			foreach ($keys as $key) {
				if ($this->isExpression($key)) {
					$v1 = $this->evaluate($key, $a);
					$v2 = $this->evaluate($key, $b);
				} else {
					$v1 = $a->$key;
					$v2 = $b->$key;
				}
				if ($v1 < $v2) {
					return -1;
				} elseif ($v1 > $v2) {
					return 1;
				}
			}
			return 0;
		});
		$countast = 0;
		$aggregates = array();
		$this->resetAggregates($aggregates);
		$grouped = array();
		$prev = null;
		foreach ($result as $row) {
			$curr = array_intersect_key((array)$row, array_flip($this->request->groupby));
			if ($prev !== null && $curr != $prev) {
				$res = (object)array_merge(array('count__all' => $countast), $aggregates, $prev);
				if ($this->evaluate($this->request->having, $res) === true) {
					$grouped[] = $res;
				}
				$countast = 0;
				$this->resetAggregates($aggregates);
			}
			$prev = $curr;
			$countast++;
			foreach ($this->request->columns as $column) {
				if (isset($row->$column)) {
					$aggregates['count__'.$column]++;
					$aggregates['sum__'.$column] += $row->$column;
					if ($aggregates['max__'.$column] === null || $row->$column > $aggregates['max__'.$column]) {
						$aggregates['max__'.$column] = $row->$column;
					}
					if ($aggregates['min__'.$column] === null || $row->$column < $aggregates['min__'.$column]) {
						$aggregates['min__'.$column] = $row->$column;
					}
					$aggregates['avg__'.$column] = $aggregates['sum__'.$column] / $aggregates['count__'.$column];
				}
			}
		}
		if ($prev !== null) {
			$res = (object)array_merge(array('count__all' => $countast), $aggregates, $prev);
			if ($this->evaluate($this->request->having, $res) === true) {
				$grouped[] = $res;
			}
		}
		return $grouped;
	}

	/**
	 * Initializes aggregate functions for all columns in the query
	 *
	 * @access protected
	 * @param array $aggregates the initialized aggregate functions
	 * @return void
	 */
	protected function resetAggregates(&$aggregates) {
		foreach ($this->request->columns as $column) {
			$aggregates['count__'.$column] = 0;
			$aggregates['sum__'.$column] = 0;
			$aggregates['max__'.$column] = null;
			$aggregates['min__'.$column] = null;
			$aggregates['avg__'.$column] = null;
		}
	}

	/**
	 * Sorts the result set according to the 'order by' clause.
	 *
	 * @access protected
	 * @param array $result the result set 
	 * @return array the new result set
	 */
	protected function sort($result) {
		if (count($this->request->orderby) == 0) {
			return $result;
		}
		$keys = $this->request->orderby;
		usort($result, function ($a, $b) use ($keys) {
			foreach ($keys as $key => $order) {
				if ($this->isExpression($key)) {
					$v1 = $this->evaluate($key, $a);
					$v2 = $this->evaluate($key, $b);
				} else {
					$v1 = $a->$key;
					$v2 = $b->$key;
				}
				if ($v1 < $v2) {
					return $order == 'asc' ? -1 : 1;
				} elseif ($v1 > $v2) {
					return $order == 'asc' ? 1 : -1;
				}
			}
			return 0;
		});
		return $result;
	}

	/**
	 * Applies the 'limit' clause on the result set
	 *
	 * @access protected
	 * @param array $result the result set 
	 * @return array the new result set
	 */
	protected function limit($result) {
		if ($this->request->limit > 0) {
			return array_splice($result, $this->request->offset, $this->request->limit);
		} else {
			return $result;
		}
	}
}

/**
 * This class Represents an error raised by JsonSQL.
 *
 * @package EUREKA\G6KBundle\Entity
 * @version 1.0
 * @author Jacques Archimède
 */
class JsonSQLException extends \Exception {

	/**
	 * Class constructor
	 *
	 * @access public
	 * @param string $message the Exception message to throw. 
	 * @param int $code the Exception code
	 * @param Exception $previous the previous exception used for the exception chaining.
	 */
	public function __construct($message, $code = 0, \Exception $previous = null) {
		parent::__construct($message, $code, $previous);
	}

	/**
	 * Returns the string representation of the exception.
	 *
	 * @access public
	 * @return string the string representation of the exception.
	 */
	public function __toString() {
		return __CLASS__ . ": [{$this->code}]: {$this->message}\n";
	}
}

?>
