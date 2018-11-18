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

use App\G6K\Manager\ExpressionParser\Parser;

/**
 *  The class JsonSQLStatement represents a prepared statement and, 
 *  after the statement is executed, an associated result set.
 */
class DMLStatement extends Statement {

	/**
	 * @var mixed|null $builtins <description of the property>
	 *
	 * @access  private
	 *
	 */
	private $builtins = null;

	/**
	 * @var mixed|null $parser <description of the property>
	 *
	 * @access  private
	 *
	 */
	private $parser = null;

	/**
	 * Class Constructor
	 *
	 * @access public
	 * @param JsonSQL $jsonsql the JsonSQL instance
	 * @param \stdClass $request the prepared statement
	 */
	public function __construct(JsonSQL $jsonsql, \stdClass &$request) {
		$this->parser = new Parser();
		$currentDate = date('Y-m-d');
		$currentTime = date('H:i:s');
		$this->builtins = array(
			'CURRENT_DATE' => $currentDate,
			'CURRENT_TIME' => $currentTime,
			'CURRENT_TIMESTAMP' => $currentDate . ' ' . $currentTime,
			'SYSDATE' => $currentDate . ' ' . $currentTime,
			'NOW' => $currentDate . ' ' . $currentTime
		);
		parent::__construct($jsonsql, $request);
	}

	/**
	 * Fetches the next row from a result set
	 *
	 * @access public
	 * @return mixed The next row from a result set.
	 */
	public function fetch() {
		return next($this->result);
	}

	/**
	 * Returns a single column from the next row of a result set
	 *
	 * @param int $c The parameter identifier
	 * @access public
	 * @return mixed a single column from the next row of a result set or false
	 */
	public function fetchColumn($c = 0) {
		$row = $this->fetch();
		return $row !== false ? $row[$c] : FALSE;
	}

	/**
	 * Returns an array containing all of the result set rows
	 *
	 * @access public
	 * @return array the array of rows in the result set or false
	 */
	public function fetchAll() {
		return $this->result;
	}

	/**
	 * Executes a prepared select statement.
	 *
	 * @access protected
	 * @return bool Always true.
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
	 * @return bool Always true.
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
	 * @return bool Always true.
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
				$this->engine->insert($this->request->into, $row);
				$this->rowCount++;
			}
		} else {
			$stmt = Statement::create($this->jsonsql, $this->request->select);
			foreach($this->params as $param) {
				$stmt->bindParam($param[0], $param[1], $param[2]);
			}
			if (!$stmt->execute()) {
				return false;
			}
			$values = $stmt->fetchAll();
			array_walk($values, function ($v, $i) {
				$row = array_combine($this->request->fields, $v);
				$this->engine->insert($this->request->into, $row);
			});
			$this->rowCount = $stmt->rowCount();
		}
		return true;
	}

	/**
	 * Executes a prepared update statement.
	 *
	 * @access protected
	 * @return bool Always true.
	 */
	protected function executeUpdate() {
		$table = $this->engine->table($this->request->update);
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
				$this->engine->replace($this->request->update, $table->key(), $row);
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
	 * @return bool Always true.
	 */
	protected function executeDelete() {
		$table = $this->engine->table($this->request->from);
		$this->rowCount = 0;
		while($table->valid()) {
			$row = $table->current();
			if ($this->evaluate($this->request->where, $row) === true) {
				$this->engine->delete($this->request->from, $table->key());
				$this->rowCount++;
			}
			$table->next();
		}
		return true;
	}

	/**
	 * Executes a prepared 'truncate' statement.
	 *
	 * @access protected
	 * @return bool Always true.
	 */
	protected function executeTruncate() {
		foreach($this->request->tables as $table) {
			$this->engine->truncate($table);
		}
		$this->rowCount = 0;
		return true;
	}

	/**
	 * From the given row, built an array 
	 * containing all the variables in the scope of the running request.
	 *
	 * @access protected
	 * @param \stdClass $row The table row 
	 * @return array The array of variables.
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
	 * @param object $row The table row 
	 * @return string|bool The evaluation of the condition.
	 * @throws JsonSQLException
	 */
	protected function evaluate($conditions, &$row) {
		$variables = $this->makeExpressionVariables($row);
		$conditions = preg_replace("/\\$(\w+)/", "$1", $conditions); 
		$conditions = preg_replace("/==/", "=", $conditions); 
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
	 * @return array The result of the selection.
	 */
	protected function select() {
		foreach($this->request->from as $k => &$t) {
			$t->table = $this->engine->table($t->table);
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
	 * @param int $len The number of tables 
	 * @return object|null The next row or null if no more row.
	 */
	protected function joins($len) {
		$tuple = array();
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
			$tuple = array();
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
					if ($from->join == DMLParser::INNER_JOIN) {
						if ($this->evaluate($from->on, $ctuple) !== true) {
							$this->request->from[$curr]->table->next();
							$done = false;
							break;
						}
						$tuple = $ctuple;
					} elseif ($from->join == DMLParser::CROSS_JOIN) {
						$tuple = $ctuple;
					} elseif ($from->join == DMLParser::LEFT_JOIN) {
						if ($this->evaluate($from->on, $ctuple) !== true) {
							foreach ($ntuple as $k => &$v) {
								$v = null;
							}
							$tuple = array_merge($tuple, $ntuple);
						} else {
							$tuple = $ctuple;
						}
					} elseif ($from->join == DMLParser::RIGHT_JOIN) {
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
		return empty($tuple) ? null : (object)$tuple;
	}

	/**
	 * Checks if a string contains an expression.
	 *
	 * @access protected
	 * @param string $string The string to check
	 * @return bool true if the string contains an expression, and false if not.
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
	 * @param string $value The value to check
	 * @return bool true if the value is a builtin value, and false if not.
	 */
	protected function isBuiltin($value) {
		return in_array(strtoupper($value), array_keys($this->builtins));
	}

	/**
	 * Realizes the operation of projection of result set 
	 *
	 * @access protected
	 * @param array $scope The result set 
	 * @return array The subset of the result set after projection 
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

	/**
	 * Returns the value of a field
	 *
	 * @access  private
	 * @param   \stdClass $row The table row 
	 * @param   mixed $column The table column 
	 * @return  mixed The value 
	 *
	 */
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
	 * @param array $result The result set 
	 * @return array The grouped result set 
	 */
	protected function aggregate($result) {
		if (count($this->request->groupby) == 0) {
			return $result;
		}
		$keys = $this->request->groupby;
		usort($result, function (\stdClass $a, \stdClass $b) use ($keys) {
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
	 * @param array $aggregates The initialized aggregate functions
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
	 * @param array $result The result set 
	 * @return array The new result set
	 */
	protected function sort($result) {
		if (count($this->request->orderby) == 0) {
			return $result;
		}
		$keys = $this->request->orderby;
		usort($result, function (\stdClass $a, \stdClass $b) use ($keys) {
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
	 * @param array $result The result set 
	 * @return array The new result set
	 */
	protected function limit($result) {
		if ($this->request->limit > 0) {
			return array_splice($result, $this->request->offset, $this->request->limit);
		} else {
			return $result;
		}
	}

	protected function executeCreateTable() {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function executeAlterTable() {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function executeDropTable() {
		throw new JsonSQLException("JsonSQL internal error");
	}

}

?>
