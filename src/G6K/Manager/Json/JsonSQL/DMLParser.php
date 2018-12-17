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
use App\G6K\Manager\Splitter;

/**
 * This class allows you  to store and retrieve data from files in JSON format using SQL standard.
 * - The data are described by a json schema in compliance with the spécifications of http://json-schema.org
 * - This schema can be generated on this site: http://jsonschema.net
 * 
 * - The API is very similar to PDO
 *
 * - The JSON schema is saved in a file whose name is in the form <database name>.schema.json
 * - The data is saved in a file whose name is in the form <database name>.json
 *
 * @author Jacques Archimède
 */
class DMLParser extends Parser {

	/**
	 * Types of JOINS :
	 * CROSS_JOIN: Returns the Cartesian product of the sets of rows from the joined tables
	 * @const integer
	 */
	const CROSS_JOIN = 0;

	/**
	 * INNER_JOIN: Returns all rows when there is at least one match in BOTH tables
	 * 
	 * @const integer
	 */
	const INNER_JOIN = 1;

	/**
	 * LEFT_JOIN: Return all rows from the left table, and the matched rows from the right table
	 * 
	 * @const integer
	 */
	const LEFT_JOIN = 2;

	/**
	 * RIGHT_JOIN: Return all rows from the right table, and the matched rows from the left table
	 * 
	 * @const integer
	 */
	const RIGHT_JOIN = 3;

	/**
	 * Conversion table of SQL functions in PHP functions
	 *
	 * @var array
	 * @access private
	 */
	private $synonyms = array(
		'char_length' => 'mb_strlen',
		'character_length' => 'mb_strlen',
		'ceiling' => 'ceil',
		'instr' => 'mb_strpos',
		'length' => 'mb_strlen',
		'len' => 'mb_strlen',
		'ln' => 'log',
		'lcase' => 'mb_strtolower ',
		'lower' => 'mb_strtolower ',
		'mid' => 'mb_substr',
		'position' => 'mb_strpos',
		'power' => 'pow',
		'random' => 'rand',
		'reverse' => 'strrev',
		'substr' => 'mb_substr',
		'substring' => 'mb_substr',
		'ucase' => 'mb_strtoupper',
		'upper' => 'mb_strtoupper'
	);

	/**
	 * Allowed PHP functions in conditions
	 *
	 * @var array
	 * @access private
	 */
	private $allowed = array(
		'abs',
		'acos',
		'acosh',
		'asin',
		'asinh',
		'atan2',
		'atan',
		'atanh',
		'ceil',
		'cos',
		'cosh',
		'decbin',
		'dechex',
		'decoct',
		'deg2rad',
		'exp',
		'floor',
		'fmod',
		'intdiv',
		'log10',
		'log',
		'max',
		'min',
		'pi',
		'pow',
		'preg_match',
		'rad2deg',
		'rand',
		'round',
		'sin',
		'sinh',
		'sqrt',
		'srand',
		'strftime',
		'tan',
		'tanh',
		'implode',
		'in_array',
		'is_null',
		'lcfirst',
		'ltrim',
		'rtrim',
		'mb_strlen',
		'mb_strpos',
		'strrev',
		'mb_strtolower',
		'mb_strtoupper',
		'mb_substr',
		'trim',
		'ucfirst',
		'count',
		'sum',
		'avg'
	);

	/**
	 * Constructor of class DMLParser
	 *
	 * @access  public
	 * @param   \App\G6K\Manager\Json\JsonSQL $jsonsql The JsonSQL instance
	 * @param   string $sql The DML statement
	 * @return  void
	 *
	 */
	public function __construct(JsonSQL $jsonsql, $sql) {
		parent::__construct($jsonsql, $sql);
	}

	/**
	 * Parses a sql select request according to this BNF syntax :
	 *
	 *	SELECT [ ALL | DISTINCT ] ( expression [ AS alias ] | * | table_name.* ) {',' ( expression [ AS alias ]  | * | table_name.* ) }
	 *	FROM table_name [ AS alias ] {',' table_name [ AS alias ]} { [ CROSS | INNER | LEFT [OUTER] | RIGHT [OUTER] ] JOIN table_name [ AS alias ] [ ON condition ] }
	 *	[ WHERE condition ]
	 *	[ GROUP BY expression {',' expression} ]
	 *	[ HAVING condition ]
	 *	[ ORDER BY expression [ ASC | DESC ] {',' expression [ ASC | DESC ]} ]
	 *	[LIMIT {[offset,] row_count | row_count OFFSET offset}]
	 *
	 * or eBNF syntax :
	 *
	 *	'SELECT' ( 'ALL' | 'DISTINCT' ) ? ( expression ( 'AS' ? alias ) ? | '*' | table_name '.*' ) ( ',' ( expression ( 'AS' ? alias ) ? | '*' | table_name '.*' ) ) * 
	 *	'FROM' table_name ( 'AS' ? alias ) ? ( ',' table_name ( 'AS' ? alias ) ? ) * ( ( ( 'CROSS' | 'INNER' | 'LEFT' ( 'OUTER' ) ? | 'RIGHT' ( 'OUTER' ) ? ) ? 'JOIN' table_name ( 'AS' ? alias ) ? ( 'ON' condition ) ? ) ) * 
	 *	( 'WHERE' condition ) ? 
	 *	( 'GROUP BY' expression ( ',' expression ) * ( 'HAVING' condition ) ? ) ? 
	 *	( 'ORDER BY' expression ( 'ASC' | 'DESC' ) ? ( ',' expression ( 'ASC' | 'DESC' ) ? ) * ) ? 
	 *	( 'LIMIT' ( ( offset ',' ) ? row_count | row_count 'OFFSET' offset ) ) ? 
	 *
	 * @access protected
	 * @param string $sql The select statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	protected function parseSelect($sql) {
		$clauses = Splitter::splitKeywords($sql, array("select", "distinct", "all", "from", "where", "group\s+by", "having", "order\s+by", "limit", "offset"));
		if (isset($clauses['distinct']) && isset($clauses['all'])) {
			throw new JsonSQLException("syntax error : distinct and all keywords are mutually exclusive");
		}
		if (!isset($clauses['from'])) {
			throw new JsonSQLException("syntax error : missing from clause");
		}
		$distinct = false;
		if (isset($clauses['distinct'])) {
			if ($clauses['select'] != '') {
				throw new JsonSQLException("syntax error near distinct");
			}
			$clauses['select'] = $clauses['distinct'];
			$distinct = true;
		}
		if (isset($clauses['all'])) {
			if ($clauses['select'] != '') {
				throw new JsonSQLException("syntax error near all");
			}
			$clauses['select'] = $clauses['all'];
		}
		$fromclauses = Splitter::splitKeywords(Parser::SQL_FROM_KEYWORD . $clauses['from'], array("from", "cross\s+join", "inner\s+join", "left\s+(outer\s+)?join", "right\s+(outer\s+)?join", "full\s+(outer\s+)?join", "join"));
		if (isset($fromclauses['join'])) {
			$fromclauses['innerjoin'] = $fromclauses['join'];
		}
		if (isset($fromclauses['leftouterjoin'])) {
			$fromclauses['leftjoin'] = $fromclauses['leftouterjoin'];
		}
		if (isset($fromclauses['rightouterjoin'])) {
			$fromclauses['rightjoin'] = $fromclauses['rightouterjoin'];
		}
		if (isset($fromclauses['fullouterjoin']) || isset($fromclauses['fulljoin'])) {
				throw new JsonSQLException("full outer join isn't currently supported");
		}
		$opts = array (
			'statement' => 'select',
			'select' => Splitter::splitList($clauses['select']),
			'distinct' => $distinct,
			'from' => Splitter::splitList($fromclauses['from']),
			'where' => !isset($clauses['where']) ? "true" : $clauses['where'],
			'groupby' => !isset($clauses['groupby']) ? array() : Splitter::splitList($clauses['groupby']),
			'having' => !isset($clauses['having']) ? "true" : $clauses['having'],
			'orderby' => !isset($clauses['orderby']) ? array() : Splitter::splitList($clauses['orderby']),
			'limit' => !isset($clauses['limit']) ? array() : explode(',', preg_replace('/\s+/', '', $clauses['limit'])),
			'offset' => !isset($clauses['offset']) ? 0 : (int)trim($clauses['offset']) - 1
		);
		unset($fromclauses['from']);
		$request = (object)array_merge(array( 'select' => array('*'), 'distinct' => false, 'from' => array('json'), 'where' => "true", 'groupby' => array(), 'having' => "true", 'orderby' => array(), 'limit' => array() ), $opts);
		$tables = array();
		foreach ($request->from as $from) {
			if (preg_match('/^([^\s]+)\s+as\s+([^\s]+)$/i', $from, $matches)) {
				$table = preg_replace(array('/^`/', '/`$/'), array('', ''), $matches[1]);
				$alias = $matches[2];
			} elseif (preg_match('/^([^\s]+)\s+(\w+)$/i', $from, $matches)) {
				$table = preg_replace(array('/^`/', '/`$/'), array('', ''), $matches[1]);
				$alias = $matches[2];
			} elseif (preg_match('/^`?\w+`?$/', $from)) {
				$table = $alias = preg_replace(array('/^`/', '/`$/'), array('', ''), $from);
			} else {
				throw new JsonSQLException("syntax error near : " . $from);
			}
			$tables[] = (object)array(
				'table' => $table,
				'alias' => $alias,
				'join'  => self::CROSS_JOIN,
				'on'    => 'true'
			);
		}
		foreach ($fromclauses as $join => $jclause) {
			$jclauses = is_array($jclause) ? $jclause : array($jclause);
			foreach($jclauses as $clause) {
				$joinclauses = Splitter::splitKeywords(Parser::SQL_FROM_KEYWORD . $clause, array("from", "as", "on"));
				if ($join == 'crossjoin') {
					if (isset($joinclauses['on'])) {
						throw new JsonSQLException("syntax error near : on " . $joinclauses['on']);
					}
					$tables[] = (object)array(
						'table' => preg_replace(array('/^`/', '/`$/'), array('', ''), $joinclauses['from']),
						'alias' => isset($joinclauses['as']) ? $joinclauses['as'] : $joinclauses['from'],
						'join'  => self::CROSS_JOIN,
						'on'    => 'true'
					);
				} elseif ($join == 'innerjoin') {
					if (!isset($joinclauses['on'])) {
						throw new JsonSQLException("syntax error : missing 'on' clause for inner join");
					}
					$tables[] = (object)array(
						'table' => preg_replace(array('/^`/', '/`$/'), array('', ''), $joinclauses['from']),
						'alias' => isset($joinclauses['as']) ? $joinclauses['as'] : $joinclauses['from'],
						'join'  => self::INNER_JOIN,
						'on'    => $joinclauses['on']
					);
				} elseif ($join == 'leftjoin') {
					if (!isset($joinclauses['on'])) {
						throw new JsonSQLException("syntax error : missing 'on' clause for left join");
					}
					$tables[] = (object)array(
						'table' => preg_replace(array('/^`/', '/`$/'), array('', ''), $joinclauses['from']),
						'alias' => isset($joinclauses['as']) ? $joinclauses['as'] : $joinclauses['from'],
						'join'  => self::LEFT_JOIN,
						'on'    => $joinclauses['on']
					);
				} elseif ($join == 'rightjoin') {
					if (!isset($joinclauses['on'])) {
						throw new JsonSQLException("syntax error : missing 'on' clause for right join");
					}
					$tables[] = (object)array(
						'table' => preg_replace(array('/^`/', '/`$/'), array('', ''), $joinclauses['from']),
						'alias' => isset($joinclauses['as']) ? $joinclauses['as'] : $joinclauses['from'],
						'join'  => self::RIGHT_JOIN,
						'on'    => $joinclauses['on']
					);
				}
			}
		}
		$request->from = $tables;
		$request->columns = array();
		foreach($request->from as $from) {
			foreach($this->engine->getDb()->schema->properties->{$from->table}->items->properties as $name => $column) {
				$request->columns[] = $name;
				$request->columns[] = $from->alias . "__" . $name;
			}
		}
		$columns = array();
		$columnsAliases = array();
		foreach ($request->select as $field) {
			if (preg_match('/^(.+)\s+as\s+([^\s]+)$/i', $field, $matches)) {
				$column = $matches[1];
				$alias = $matches[2];
			} else {
				$column = $alias = $field;
			}
			$column = preg_replace('/(\s*)count\s*\(\s*\*\s*\)/i', '$1count__all', $column);
			$column = preg_replace('/(\s*)(count|sum|avg|min|max)\s*\(([^\)]+)\)/i', '$1$2__$3', $column);
			$column = preg_replace("/(\w+)\.(\w+)/", "$1__$2", $column);
			$column = $this->parseExpression($column, $request->columns);
			$columns[$column] = $alias;
			$columnsAliases[$alias] = $column;
		}
		$request->select = $columns;
		$request->where = $this->parseConditions($request->where, $request->columns, $request->select);
		$request->having = $this->parseConditions($request->having, $request->columns, $request->select);
		$request->having = preg_replace('/(\s*)count\s*\(\s*\*\s*\)/i', '$1count__all', $request->having);
		$request->having = preg_replace('/(\s*)(count|sum|avg|min|max)\s*\(([^\)]+)\)/i', '$1$2__$3', $request->having);
		foreach($request->from as &$from) {
			$from->on = $this->parseConditions($from->on, $request->columns, $request->select);
		}
		$sortkeys = array();
		foreach ($request->orderby as $sortkey) {
			if (preg_match('/^(.+)\s+(asc|desc)$/i', $sortkey, $matches)) {
				$key = $matches[1];
				$order = strtolower($matches[2]);
			} else {
				$key = $sortkey;
				$order = "asc";
			}
			if (ctype_digit($key)) {
				$key = array_keys($request->select)[(int)$key - 1];
			} elseif (isset($columnsAliases[$key])) {
				$key = $columnsAliases[$key];
			}
			$sortkeys[$key] = $order;
		}
		$request->orderby = $sortkeys;
		foreach ($request->groupby as &$key) {
			if (ctype_digit($key)) {
				$key = array_keys($request->select)[(int)$key - 1];
			} elseif (isset($columnsAliases[$key])) {
				$key = $columnsAliases[$key];
			}
		}
		if ($distinct) {
			if (count(array_diff(array_keys($request->orderby), array_values($request->select))) > 0) {
				throw new JsonSQLException("The columns in the ORDER BY list must be a subset of the columns in the SELECT list");
			}
			foreach($request->select as $field => $alias) {
				if (!isset($request->orderby[$alias])) {
					$request->orderby[$alias] = "asc";
				}
			}
		}
		if (count($request->limit) == 0) {
			$request->limit = 0;
			$request->offset = 0;
		} elseif (count($request->limit) == 1) {
			$request->limit = (int)$request->limit[0];
		} elseif (count($request->limit) > 1) {
			$request->limit = (int)$request->limit[1];
			if (!isset($clauses['offset'])) {
				$request->offset = (int)$request->limit[0] - 1;
			}
		}
		return $request;
	}

	/**
	 * Parses a sql compound select request containing set operations according to this BNF syntax :
	 *
	 * select_statement [ UNION | UNION ALL | INTERSECT | EXCEPT | MINUS ] select_statement 
	 * { select_statement [ UNION | UNION ALL | INTERSECT | EXCEPT | MINUS ] select_statement }
	 *
	 * or eBNF syntax :
	 *
	 * select_statement (( 'UNION' | 'UNION ALL' | 'INTERSECT' | 'EXCEPT' | 'MINUS' ) select_statement) * 
	 *
	 * if the statement contains no set operator, just parses the select request
	 *
	 * @access protected
	 * @param string $sql The select statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	protected function parseSetOperations($sql) {
		$chunks = preg_split("/\b(union|union\s+all|intersect|except|minus)\s+select\b/i", "union all " . $sql, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
		$chunksCount = count($chunks);
		if ($chunksCount % 2 > 0) {
			throw new JsonSQLException("syntax error near : " . $sql);
		}
		if ($chunksCount == 2) {
			return $this->parseSelect($sql);
		}
		$request = (object)array(
			'statement' => 'compound select',
			'selects' => array()
		);
		for ($i = 0; $i < $chunksCount; $i += 2) {
			$operator = preg_replace(array('/\s+/', '/select$/'), array('', ''), strtolower($chunks[$i]));
			$req =  $this->parseSelect(Parser::SQL_SELECT_KEYWORD . trim($chunks[$i+1]));
			if ($i < $chunksCount - 2) {
				if (count($req->orderby) > 0) {
					throw new JsonSQLException("only the last SELECT may have an ORDER BY clause");
				}
				if ($req->limit > 0 || $req->offset > 0) {
					throw new JsonSQLException("only the last SELECT may have a LIMIT clause");
				}
			}
			$request->selects[] = (object)array(
				'operator' => $operator,
				'request' => $req
			);
		}
		return $request;
	}

	/**
	 * Parses a sql insert into statement according to this BNF syntax :
	 *
	 *	INSERT INTO table_name ( [ '(' column_name { ', ' column_name } ')' ] 
	 *	VALUES '(' ( expression | DEFAULT ) {', ' ( expression | DEFAULT ) }  ')' 
	 * {', ' '(' ( expression | DEFAULT ) {', ' ( expression | DEFAULT ) }  ')' }
	 *	| select_statement
	 *	)
	 *
	 * or eBNF syntax :
	 *
	 *	'INSERT INTO' table_name ( ( '(' column_name ( ', ' column_name ) * ')' ) ?
	 *	'VALUES' '(' ( expression | 'DEFAULT' ) ( ', ' ( expression | 'DEFAULT' ) )  * ')'
	 *	( ', ' '(' ( expression | 'DEFAULT' ) ( ', ' ( expression | 'DEFAULT' ) )  * ')' ) * 
	 *	| select_statement 
	 *	)
	 *
	 * @access protected
	 * @param string $sql The insert into statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	protected function parseInsert($sql) {
		$clauses = Splitter::splitKeywords($sql, array("insert\s+into", "values", "select"));
		if (!isset($clauses['insertinto'])) {
			throw new JsonSQLException("syntax error : missing insert into clause");
		}
		if (!isset($clauses['values']) && !isset($clauses['select'])) {
			throw new JsonSQLException("syntax error : missing values or select clause");
		}
		if (isset($clauses['values']) && isset($clauses['select'])) {
			throw new JsonSQLException("syntax error : values and select clause are mutually exclusive");
		}
		if (preg_match('/^`?\w+`?$/', $clauses['insertinto'])) {
			$table = preg_replace(array('/^`/', '/`$/'), array('', ''), $clauses['insertinto']);
			if (!isset($this->engine->getDb()->schema->properties->{$table})) {
				throw new JsonSQLException("Table '$table' doesn't exists");
			}
			$fields = array();
			foreach($this->engine->getDb()->schema->properties->{$table}->items->properties as $name => $column) {
				$fields[] = $name;
			}
		} elseif (preg_match('/^`?(\w+)`?\s+\(([^\)]+)\)$/', $clauses['insertinto'], $m)) {
			$table = preg_replace(array('/^`/', '/`$/'), array('', ''), $m[1]);
			if (!isset($this->engine->getDb()->schema->properties->{$table})) {
				throw new JsonSQLException("Table '$table' doesn't exists");
			}
			$fields = Splitter::splitList($m[2]);
			foreach($fields as $field) {
				if (!isset($this->engine->getDb()->schema->properties->{$table}->items->properties->{$field})) {
					throw new JsonSQLException("Column '$field' doesn't exists");
				}
			}
		} else {
			throw new JsonSQLException("syntax error near : " . $clauses['insertinto']);
		}
		$request = (object)array('statement' => 'insert', 'into' => $table);
		$request->columns = array();
		foreach($this->engine->getDb()->schema->properties->{$table}->items->properties as $name => $column) {
			$request->columns[] = $name;
			$request->columns[] = $table . "__" . $name;
		}
		if (isset($clauses['values'])) {
			if (preg_match_all("/\(([^()]|(?R))*\)/", $clauses['values'], $m) == 0) {
				throw new JsonSQLException("syntax error near : " . $clauses['values']);
			}
			$request->rows = array();
			foreach ($m[0] as $list) {
				$values = Splitter::splitList(substr($list, 1, -1));
				if (count($fields) != count($values)) {
					throw new JsonSQLException("syntax error : number of columns and number of values must be equals");
				}
				$row = array_combine($fields, $values);
				foreach($this->engine->getDb()->schema->properties->{$table}->items->properties as $name => $column) {
					if (isset($row[$name])) {
						if ($this->isExpression($row[$name])) {
							$row[$name] = $this->parseExpression($row[$name], $request->columns);
						} elseif (strcasecmp($row[$name], 'default') != 0) {
							$row[$name] = $this->engine->normalizeValue($column->type, $row[$name]);
						}
					}
				}
				$request->rows[] = $row;
			}
		} else {
			$select = Parser::SQL_SELECT_KEYWORD . $clauses['select'];
			if (extension_loaded('apc') && ini_get('apc.enabled')) {
				$request->select = $this->engine->loadRequestFromCache($select);
			} else {
				$dmlparser = new DMLParser($this->jsonsql, $select);
				$request->select = $dmlparser->parse();
			}
			if (count($fields) != count($request->select->select)) {
				throw new JsonSQLException("syntax error : number of columns and number of select list columns must be equals");
			}
			$request->fields = $fields;
		}
		return $request;
	}

	/**
	 * Parses a sql update statement according to this BNF syntax :
	 *
	 *	UPDATE table_name 
	 *	SET column_name = expression { ', ' column_name = expression }
	 *	[ WHERE condition ]
	 *
	 * or eBNF syntax :
	 *
	 *	'UPDATE' table_name 
	 *	'SET' column_name '=' expression ( ', ' column_name '=' expression ) * 
	 *	( 'WHERE' condition ) ? 
	 *
	 * @access protected
	 * @param string $sql The update statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	protected function parseUpdate($sql) {
		$clauses = Splitter::splitKeywords($sql, array("update", "set", "where"));
		if (!isset($clauses['set'])) {
			throw new JsonSQLException("syntax error : missing set clause");
		}
		$ops = array (
			'statement' => 'update',
			'update' => preg_replace(array('/^`/', '/`$/'), array('', ''), $clauses['update']),
			'set' => Splitter::splitList($clauses['set']),
			'where' => !isset($clauses['where']) ? "true" : $clauses['where'],
		);
		$request = (object)array_merge(array( 'where' => "true" ), $ops);
		$request->columns = array();
		foreach($this->engine->getDb()->schema->properties->{$request->update}->items->properties as $name => $column) {
			$request->columns[] = $name;
			$request->columns[] = $request->update . "__" . $name;
		}
		$setclauses = array();
		foreach ($request->set as $setclause) {
			if (preg_match('/^\s*(\w+)\s*=\s*(.+)$/', $setclause, $m)) {
				$setclauses[$m[1]] = $m[2];
			} else {
				throw new JsonSQLException("syntax error near : " . $setclause);
			}
		}
		foreach($this->engine->getDb()->schema->properties->{$request->update}->items->properties as $name => $column) {
			if (isset($setclauses[$name])) {
				if ($this->isExpression($setclauses[$name])) {
					$setclauses[$name] = $this->parseExpression($setclauses[$name], $request->columns);
				} else {
					$setclauses[$name] = $this->engine->normalizeValue($column->type, $setclauses[$name]);
				}
			}
		}
		$request->set = $setclauses;
		$request->where = $this->parseConditions($request->where, $request->columns);
		return $request;
	}

	/**
	 * Parses a sql delete from statement according to this BNF syntax :
	 *	DELETE FROM table_name [ WHERE condition ]
	 *
	 * or eBNF syntax :
	 *	'DELETE FROM' table_name ( 'WHERE' condition ) ? 
	 *
	 * @access protected
	 * @param string $sql The delete from statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	protected function parseDelete($sql) {
		$clauses = Splitter::splitKeywords($sql, array("delete\s+from", "where"));
		if (!isset($clauses['deletefrom'])) {
			throw new JsonSQLException("syntax error : missing delete from clause");
		}
		$ops = array (
			'statement' => 'delete',
			'from' => preg_replace(array('/^`/', '/`$/'), array('', ''), trim($clauses['deletefrom'])),
			'where' => !isset($clauses['where']) ? "true" : $clauses['where'],
		);
		$request = (object)array_merge(array( 'from' => 'json', 'where' => "true" ), $ops);
		$request->columns = array();
		foreach($this->engine->getDb()->schema->properties->{$request->from}->items->properties as $name => $column) {
			$request->columns[] = $name;
			$request->columns[] = $request->from . "__" . $name;
		}
		$request->where = $this->parseConditions($request->where, $request->columns);
		return $request;
	}

	/**
	 * Parses a sql truncate table statement according to this BNF syntax :
	 *
	 *	TRUNCATE TABLE table_name { ', ' table_name }
	 *
	 * or eBNF syntax :
	 *
	 *	'TRUNCATE TABLE' table_name ( ', ' table_name ) *
	 *
	 * @access protected
	 * @param string $sql The truncate table statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	protected function parseTruncate($sql) {
		if (preg_match('/^\s*truncate\s+table\s+(.*)$/', $sql, $m)) {
			$tables = array_map(function($i) {
				return preg_replace(array('/^`/', '/`$/'), array('', ''), $i);
			}, Splitter::splitList($m[1]));
		} else {
			throw new JsonSQLException("syntax error");
		}
		return (object)array (
			'statement' => 'truncate',
			'tables' => $tables
		);
	}

	/**
	 * Parses and converts a sql expression into a php one
	 *
	 * @access protected
	 * @param string $expression The expression to parse
	 * @param array $columns The columns of the request
	 * @return string The parsed expression
	 */
	protected function parseExpression($expression, &$columns) {
		$expression = preg_replace("/(\w+)\.(\w+)/", "$1__$2", $expression);
		$expression = preg_replace('/\|\|/', '.', $expression);
		$expression = $this->replaceSynonyms($expression);
		$expression = preg_replace_callback("/\bconcat\s*\(([^()]|(?R))*\)/i", function ($m) {
			return preg_replace("/concat\s*\(/i", "implode(array(", $m[0]).")";
		}, $expression);
		$expression = preg_replace_callback("/\bmb_substr\s*\(((?>[^()]+)|(?R))*\)/i", function ($m) {
			$args = explode(',', $m[1]);
			$args[count($args) - 2] .= " - 1";
			return 'mb_substr('.implode(',', $args).')';
		}, $expression);
		$expression = preg_replace_callback("/\bmb_strpos\s*\(((?>[^()]+)|(?R))*\)/i", function ($m) {
			return 'mb_strpos('.$m[1].') + 1';
		}, $expression);
		$expression = preg_replace_callback("/\bstrftime\s*\(((?>[^()]+)|(?R))*\)/i", function ($m) {
			$args = explode(',', $m[1]);
			$args[1] = "strtotime(".$args[1].")";
			return 'strftime('.implode(',', $args).')';
		}, $expression);
		$expression = str_replace(
			array('{',     '}',     '[',      ']',    '`',    ';'),
			array('&#123', '&#125', '&#91',   '&#93', '&#96', '&#59'),
			$expression
		);
		if ($this->isExpression($expression)) {
			$expression = preg_replace("/\b(".implode("|", array('CURRENT_DATE','CURRENT_TIME','CURRENT_TIMESTAMP','SYSDATE','NOW'))."|".implode("|", $columns).")\b/i", "\$$1", $expression);
			$this->checkSafety($expression);
		}
		return $expression;
	}

	/**
	 * Parses and converts sql conditions into a php one
	 *
	 * @access protected
	 * @param string $conditions The conditions to parse
	 * @param array $columns The columns of the request
	 * @param array $select The select list of the request
	 * @return string The converted conditions
	 */
	protected function parseConditions($conditions, &$columns, $select = array()) {
		$conditions = preg_replace("/([\w\.]+)\s+between\s+([^\s]+)\s+and\s+([^\s\(\)]+)/i", "$1 >= $2 and $1 <= $3", $conditions);
		$conditions = preg_replace("/([\w\.]+)\s+is\s+null/i", "is_null($1)", $conditions);
		$conditions = preg_replace("/([\w\.]+)\s+is\s+not\s+null/i", "!is_null($1)", $conditions);
		$conditions = preg_replace_callback(
			"/([\w\.]+)\s+not\s+like\s+'([^']+)'/i", 
			function($matches) {
				$pattern = preg_replace("/\%/", ".*", $matches[2]);
				$pattern = preg_replace("/\_/", ".", $pattern);
				return "!preg_match('/^".$pattern."$/', ". $matches[1].")";
			}, 
			$conditions
		);
		$conditions = preg_replace_callback(
			"/([\w\.]+)\s+like\s+'([^']+)'/i", 
			function($matches) {
				$pattern = preg_replace("/\%/", ".*", $matches[2]);
				$pattern = preg_replace("/\_/", ".", $pattern);
				return "preg_match('/^".$pattern."$/', ". $matches[1].")";
			}, 
			$conditions
		);
		$conditions = preg_replace('/\|\|/', '.', $conditions);
		$conditions = preg_replace('/\|/', '', $conditions); // suppress single pipes for security reason
		$conditions = preg_replace(array("/\s+and\s+/", "/\s+or\s+/", "/\s+not\s+/"), array(" && ", " || ", "!"), $conditions);
		$conditions = preg_replace("/(\w+)\.(\w+)/", "$1__$2", $conditions);
		$conditions = $this->replaceSynonyms($conditions);
		$conditions = preg_replace('/(?<!<|>)=/m', '==', $conditions);
		$conditions = preg_replace_callback("/\bconcat\s*\(([^()]|(?R))*\)/i", function ($m) {
			return preg_replace("/concat\s*\(/i", "implode(array(", $m[0]).")";
		}, $conditions);
		$conditions = preg_replace_callback("/([\w\.]+)\s+in\s+\(([^()]|(?R))*\)/i", function ($m) {
			$args = preg_replace("/^".$m[1]."\s+in\s+\(/", "", $m[0]);
			return "in_array(".$m[1].", array(" . $args.")";
		}, $conditions);
		$conditions = preg_replace_callback("/\bmb_substr\s*\(((?>[^()]+)|(?R))*\)/i", function ($m) {
			$args = explode(',', $m[1]);
			$args[count($args) - 2] .= " - 1";
			return 'mb_substr('.implode(',', $args).')';
		}, $conditions);
		$conditions = preg_replace_callback("/\bmb_strpos\s*\(((?>[^()]+)|(?R))*\)/i", function ($m) {
			return 'mb_strpos('.$m[1].') + 1';
		}, $conditions);
		$conditions = preg_replace_callback("/\bstrftime\s*\(((?>[^()]+)|(?R))*\)/i", function ($m) {
			$args = explode(',', $m[1]);
			$args[1] = "strtotime(".$args[1].")";
			return 'strftime('.implode(',', $args).')';
		}, $conditions);
		$idents = array_merge(array('CURRENT_DATE','CURRENT_TIME','CURRENT_TIMESTAMP','SYSDATE','NOW'), $columns, array_filter(array_values($select), function ($v) {return !$this->isExpression($v);}));
		$conditions = preg_replace("/\b(".implode("|", $idents).")\b/i", "\$$1", $conditions);
		$conditions = str_replace(':$', ':', $conditions);
		$conditions = str_replace(
			array('{',     '}',     '[',     ']',     '`',    ';'),
			array('&#123', '&#125', '&#91',   '&#93', '&#96', '&#59'),
			$conditions
		);
		$this->checkSafety($conditions);
		return $conditions;
	}

	/**
	 * Verifies that an php expression is sufficiently secured 
	 * before being evaluated by the eval function
	 *
	 * @access public
	 * @param string $expression The php expression to check
	 * @return void
	 * @throws JsonSQLException
	 */
	public function checkSafety($expression) {
		if (preg_match('/\b(\w+)\s*\(/', $expression, $m)) {
			if (!in_array($m[1], $this->allowed)) {
				// A not allowed function is found
				throw new JsonSQLException("syntax error near : ".$m[1]);
			}
		}
		if (strpos($expression, chr(10))) {
			// newline is forbidden
			throw new JsonSQLException("syntax error");
		}
		if (preg_match('/([`\{\}\[\]\;])/', $expression, $m)) {
			// metacharacters are forbidden
			throw new JsonSQLException("syntax error near : ".$m[1]);
		}
		if (preg_match('/\$\$([^\s]+)/', $expression, $m)) {
			// $$ is forbidden
			throw new JsonSQLException("syntax error near : ".$m[1]);
		}
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
	 * Replaces into an expression, the SQL functions by their PHP equivalents
	 *
	 * @access private
	 * @param string $expr The SQL expression
	 * @return string The new expression with PHP functions.
	 */
	private function replaceSynonyms($expr) {
		return preg_replace_callback(
			'/(\W*)('.implode('|', array_keys($this->synonyms)).'|'.implode('|', array_values($this->synonyms)).')\s*\(/i', 
			function ($matches) {
				$func = strtolower($matches[2]);
				return isset($this->synonyms[$func]) ? $matches[1].$this->synonyms[$func].'(' : $matches[1].$func.'(';
			}, 
			$expr
		);
	}

	protected function parseCreate($sql) {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function parseAlter($sql) {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function parseDropTable($sql) {
		throw new JsonSQLException("JsonSQL internal error");
	}

}

?>
