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

namespace EUREKA\G6KBundle\Manager\Json\JsonSQL;

use EUREKA\G6KBundle\Manager\Json\JsonSQL;
use EUREKA\G6KBundle\Manager\Splitter;

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
 * @package EUREKA\G6KBundle\Entity
 * @version 1.0
 * @author Jacques Archimède
 */
class Parser  {

	const SQL_SELECT_KEYWORD = 'SELECT ';
	const SQL_FROM_KEYWORD = 'FROM ';
	const SQL_WHERE_KEYWORD = 'WHERE ';
	const SQL_ORDER_BY_KEYWORD = 'ORDER BY ';
	const SQL_LIMIT_KEYWORD = 'LIMIT ';
	const SQL_UPDATE_KEYWORD = 'UPDATE ';
	const SQL_CREATE_KEYWORD = 'CREATE TABLE ';
	const SQL_DELETE_KEYWORD = 'DELETE FROM ';

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
	 * A pointer on  the JsonSQL owner.
	 *
	 * @var object
	 * @access private
	 */
	private $jsonsql = null;

	/**
	 * A pointer on  JSON database engine.
	 *
	 * @var object
	 * @access private
	 */
	private $engine = null;

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
	 * Conversion table of SQL data types in JSON data types
	 *
	 * @var array
	 * @access private
	 */
	private $datatypes = array(
		'array' => 'array',
		'bigint' =>'integer',
		'binary' =>'string',
		'blob' =>'string',
		'boolean' =>'boolean',
		'char' =>'string',
		'character' =>'string',
		'choice' => 'integer',
		'country' => 'integer',
		'date' =>'date',
		'datetime' =>'datetime',
		'day' => 'integer',
		'decimal' =>'number',
		'department' => 'string',
		'double' =>'number',
		'float' =>'number',
		'int' =>'integer',
		'integer' =>'integer',
		'longblob' =>'string',
		'longtext' =>'string',
		'mediumblob' =>'string',
		'mediumtext' =>'string',
		'money' => 'number',
		'month' => 'integer',
		'multichoice' => 'object',
		'number' =>'number',
		'numeric' =>'number',
		'percent' => 'number',
		'real' =>'number',
		'region' => 'integer',
		'smallint' =>'integer',
		'string' =>'string',
		'text' =>'string',
		'textarea' => 'string',
		'time' =>'time',
		'timestamp' =>'integer',
		'tinytext' =>'string',
		'varbinary' =>'string',
		'varchar' =>'string',
		'year' => 'integer'
	);

	public function __construct(JsonSQL $jsonsql) {
		$this->jsonsql = $jsonsql;
		$this->engine = $this->jsonsql->getEngine();
	}

	public function getJsonSQL() {
		return $this->jsonsql;
	}

	/**
	 * Parses a sql statement.
	 *
	 * @access protected
	 * @param string $sql the sql statement
	 * @return object the parsed request
	 * @throws JsonSQLException
	 */
	public function parse($sql) {
		$sql = preg_replace("/[\r\n\t]/", " ", $sql); // replace whitespaces by space
		$sql = preg_replace('/(--.*)|(((\/\*)+?[\w\W]+?(\*\/)+))/', '', $sql); // strip comments
		if (preg_match('/^\s*select\s+/i', $sql)) {
			return $this->parseSetOperations($sql);
		} elseif (preg_match('/^\s*insert\s+into/i', $sql)) {
			return $this->parseInsert($sql);
		} elseif (preg_match('/^\s*update/i', $sql)) {
			return $this->parseUpdate($sql);
		} elseif (preg_match('/^\s*delete\s+from\s+/i', $sql)) {
			return $this->parseDelete($sql);
		} elseif (preg_match('/^\s*create\s+/i', $sql)) {
			return $this->parseCreate($sql);
		} elseif (preg_match('/^\s*alter\s+/i', $sql)) {
			return $this->parseAlter($sql);
		} elseif (preg_match('/^\s*truncate\s+/i', $sql)) {
			return $this->parseTruncate($sql);
		} elseif (preg_match('/^\s*drop\s+/i', $sql)) {
			return $this->parseDropTable($sql);
		} else {
			throw new JsonSQLException("syntax error near : " . substr($sql, 0, 6));
		}
	}

	/**
	 * Parses a sql create table statement according to this two BNF syntax :
	 *
	 *    CREATE [ LOCAL | GLOBAL ] TABLE [ IF NOT EXISTS ] table_name (
	 *    column_name datatype [ CONSTRAINT constraint_name] [ NOT NULL|NULLABLE ] [ DEFAULT default ]  [ PRIMARY KEY ] [ AUTOINCREMENT|AUTO_INCREMENT|SERIAL ]
	 *    { ', ' column_name datatype [ CONSTRAINT constraint_name] [ NOT NULL|NULLABLE ] [ DEFAULT default ]  [ PRIMARY KEY ] [ AUTOINCREMENT|AUTO_INCREMENT|SERIAL ] }
	 *    { ', ' FOREIGN KEY (column_name { ', ' column_name} ) REFERENCES table_name (column_name { ', ' column_name} ) }
	 *    [ ', ' PRIMARY KEY (column_name { ', ' column_name} ) ]
	 *    )
	 *
	 * or
	 * 
	 *	CREATE [ LOCAL | GLOBAL ] TABLE [ IF NOT EXISTS ] table_name
	 *	[ (column_name, { ', ' column_name }) ]
	 *	AS select_statement
	 *	[ WITH [ NO ] DATA ]
	 *
	 * or eBNF syntax :
	 *
	 *    ('CREATE' ( 'LOCAL' | 'GLOBAL' ) ? 'TABLE' ( 'IF NOT EXISTS' ) ? table_name 
	 *    '(' column_name datatype ( 'CONSTRAINT' constraint_name ) ? ( 'NOT NULL' | 'NULLABLE' ) ? ( 'DEFAULT' default ) ? ( 'PRIMARY KEY' ) ? ( 'AUTOINCREMENT' | 'AUTO_INCREMENT' | 'SERIAL' ) ? 
	 *    ( ', ' column_name datatype ( 'CONSTRAINT' constraint_name ) ? ( 'NOT NULL' | 'NULLABLE' ) ? ( 'DEFAULT' default ) ? ( 'PRIMARY KEY' ) ? ( 'AUTOINCREMENT' | 'AUTO_INCREMENT' | 'SERIAL' ) ? ) * 
	 *    ( ', ' 'FOREIGN KEY' '(' column_name ( ', ' column_name ) * ')' 'REFERENCES' table_name '(' column_name ( ', ' column_name ) * ')' ) * 
	 *    ( ', ' 'PRIMARY KEY' '(' column_name ( ', ' column_name ) * ')' ) ? 
	 *    ')' 
	 *    | 'CREATE' ( 'LOCAL' | 'GLOBAL' ) ? 'TABLE' ( 'IF NOT EXISTS' ) ? table_name ( '(' column_name ( ', ' column_name ) * ')' ) ? 'AS' select_statement ( 'WITH' ( 'NO' ) ? 'DATA' ) ? 
	 *    )
	 *
	 * @access protected
	 * @param string $sql the create table statement
	 * @return array the parsed request
	 * @throws JsonSQLException
	 */
	protected function parseCreate($sql) {
		$clauses = Splitter::splitKeywords($sql, array("create", "local", "global", "table", "if\s+not\s+exists", "with", "as\s+select", "with"));
		$ifnotexists = false;
		$withdata = false;
		if (isset($clauses['ifnotexists'])) {
			$clauses['table'] = $clauses['ifnotexists'];
			unset($clauses['ifnotexists']);
			$ifnotexists = true;
		}
		if (isset($clauses['asselect'])) {
			if (preg_match('/^\s*`?(\w+)`?\s+\((.+)\)\s*$/i', $clauses['table'], $m)) {
				$table = preg_replace(array('/^`/', '/`$/'), array('', ''), $m[1]);
				$columnsDef = Splitter::splitList($m[2]);
			} elseif (preg_match('/^\s*`?(\w+)`?\s*$/i', $clauses['table'], $m)) {
				$table = preg_replace(array('/^`/', '/`$/'), array('', ''), $m[1]);
				$columnsDef =array();
			} else {
				throw new JsonSQLException("syntax error near : " . $clauses['table']);
			}
			if (!isset($clauses['with'])) {
				throw new JsonSQLException("syntax error : with data or with no data is mandatory in this context");
			}
			if (strcasecmp($clauses['with'], 'data') == 0) {
				$withdata = true;
			} elseif (preg_match("/^no\s+data$/i", $clauses['with'])) {
				$withdata = false;
			} else {
				throw new JsonSQLException("syntax error near : " . $clauses['with']);
			}
		} elseif (preg_match('/^\s*`?(\w+)`?\s+\((.+)\)\s*$/i', $clauses['table'], $m)) {
			$table = preg_replace(array('/^`/', '/`$/'), array('', ''), $m[1]);
			$columnsDef = Splitter::splitList($m[2]);
		} else {
			throw new JsonSQLException("syntax error near : " . $clauses['table']);
		}
		$columns = array();
		$required = array();
		$autoincrement = array();
		$primarykeys = array();
		$uniques = array();
		$foreignkeys = array();
		foreach($columnsDef as $columnId => $columnDef) {
			if (isset($clauses['asselect'])) {
				if (preg_match('/^\w+$/', $columnDef, $m)) {
					$column =  $m[1];
					$columns[$column] = (object)array(
						'title' => $column,
						'description' => $column
					);
				} else {
					throw new JsonSQLException("syntax error near : " . $columnDef);
				}
			} elseif (preg_match('/^primary(\s+key)?\s*\(([^\)]*)\)\s*$/i', $columnDef, $m)) {
				$primarykeys = array_flip(Splitter::splitList($m[2]));
			} elseif (preg_match('/^unique(\s+key)?\s*\(([^\)]*)\)\s*$/i', $columnDef, $m)) {
				$uniques[] = array_flip(Splitter::splitList($m[2]));
			} elseif (preg_match('/^foreign(\s+key)?\s*\(([^\)]*)\)\s+references\s+(\w+)\s*\(([^\)]*)\)(\s+on\s+.*)?$/i', $columnDef, $m)) {
				$foreignkeys[] = (object)array(
					'columns' => Splitter::splitList($m[2]),
					'references' => (object)array(
						'table' => $m[3],
						'columns' => Splitter::splitList($m[4])
					),
					'on' => trim($m[5])
				);
			} elseif (preg_match('/^(\w+)\s+(\w+)\s*(\([^\)]*\))?\s*(.*)$/', $columnDef, $m)) {
				$column =  $m[1];
				$datatype = strtolower($m[2]);
				if (isset($this->datatypes[$datatype])) {
					$type = $this->datatypes[$datatype];
				} else {
					throw new JsonSQLException("syntax error near : " . $m[2]);
				}
				if (isset($m[3])) {
					$length = (int)trim(substr($m[3], 1, -1));
				} else {
					$length = -1;
				}
				$props = array();
				if ($m[4] != '') {
					$colDef = $this->encodeLiteral($m[4]);
					$chunks = preg_split("/(constraint|not\s+null|nullable|default|primary\s+key|autoincrement|auto_increment|serial|title|comment)/i", $colDef . ' ', -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
					$chunksCount = count($chunks);
					if ($chunksCount % 2 > 0) {
						throw new JsonSQLException("syntax error near : " . $m[4]);
					}
					for ($i = 0; $i < $chunksCount; $i += 2) {
						$prop = strtolower(preg_replace('/\s+/', '', $chunks[$i]));
						$val = trim($this->decodeLiteral($chunks[$i+1]));
						if ($prop == 'default') {
							$val = $this->normalizeValue($type, $val);
						} elseif ($val == '') {
							$val = true;
						}
						$props[$prop] = $val;
					}
				}
				$props = array_merge(array(
					"notnull" => false,
					"default" => null,
					"primarykey" => 0,
					"autoincrement" => false,
					"auto_increment" => false,
					"serial" => false,
					'title' =>  $column,
					'comment' =>  $column
				), $props);
				if ($props['primarykey']) {
					$primarykeys[$column] = 0;
				}
				if ($props['autoincrement'] || $props['auto_increment'] || $props['serial']) {
					$autoincrement[$column] = 'autoincrement';
				}
				$columns[$column] = (object)array(
					'type' => $type,
					'datatype' => $datatype,
					'title' =>  $props['title'],
					'description' =>  $props['comment']
				);
				if ($type == 'date') {
					$columns[$column]->type = 'string';
					$columns[$column]->format = 'date';
				} elseif ($type == 'datetime') {
					$columns[$column]->type = 'string';
					$columns[$column]->format = 'date-time';
				} elseif ($type == 'time') {
					$columns[$column]->type = 'string';
					$columns[$column]->format = 'time';
				} elseif ($type == 'string' && $length >= 0) {
					$columns[$column]->maxLength = $length;
				}
				if ($props['default'] !== null) {
					$columns[$column]->default = $props['default'];
				}
				if ($props['notnull']) {
					$required[] = $column;
				}
			}
		}
		foreach ($columns as $column => &$props) {
			$extra = array();
			if (isset($primarykeys[$column])) {
				$extra[] = "primarykey:" . ($primarykeys[$column] + 1);
			}
			if (isset($autoincrement[$column])) {
				$extra[] = "autoincrement:0";
			}
			$extra[] = "type:".$props->datatype;
			$props->title .= ' [' . implode(', ', $extra) . ']';
		}
		$request = (object)array (
			'statement' => 'create table',
			'ifnotexists' => $ifnotexists,
			'table' => $table,
			'columns' => (object)$columns,
			'withdata' => $withdata,
			'required' => $required,
			'uniques' => $uniques,
			'foreignkeys' => $foreignkeys
		);
		if (isset($clauses['asselect'])) {
			$select = self::SQL_SELECT_KEYWORD . $clauses['asselect'];
			if (extension_loaded('apc') && ini_get('apc.enabled')) {
				$request->select = $this->engine->loadRequestFromCache($select);
			} else {
				$request->select = $this->parse($select);
			}
			$scolumns = array();
			foreach ($request->select->select as $field => $aliasc) {
				if ($field == '*') {
					foreach ($request->select->columns as $column) {
						if (preg_match("/^([^_]+)__([^_]+)$/", $column, $m)) {
							$this->fillTableField($m[1], $m[2], $scolumns);
						}
					}
				} elseif (preg_match("/^([^_]+)__([^_]+)$/", $field, $m)) {
					if (!isset($this->engine->getDb()->schema->properties->{$m[1]}->items->properties->{$m[2]})) {
						throw new JsonSQLException("syntax error near : " . $field);
					}
					$this->fillTableField($m[1], $m[2], $scolumns);
				} else {
					foreach ($request->select->from as $table => $aliast) {
						if (isset($this->engine->getDb()->schema->properties->{$table}->items->properties->{$field})) {
							$this->fillTableField($table, $field, $scolumns);
							break;
						}
					}
				}
			}
			if (count($columns) > 0) {
				if (count($columns) != count($scolumns)) {
					throw new JsonSQLException("syntax error : number of columns and number of select list columns must be equals");
				}
				$request->columns = (object)array_combine(array_keys($columns), array_values($scolumns));
			} else {
				$request->columns = (object)$scolumns;
			}
		}
		return $request;
	}

	private function fillTableField($table, $field, &$scolumns) {
		$dbcol = $this->engine->getDb()->schema->properties->{$table}->items->properties->{$field};
		$scolumns[$field] = (object)array(
			'type' => $dbcol->type,
			'title' => $field,
			'description' => $field
		);
		if (isset($dbcol->default)) {
			$scolumns[$field]->default = $dbcol->default;
		}
		if (isset($dbcol->format)) {
			$scolumns[$field]->format = $dbcol->format;
		}
		if (isset($dbcol->maxLength)) {
			$scolumns[$field]->maxLength = $dbcol->maxLength;
		}
	}

	/**
	 * Parses a sql alter table statement according to this two BNF syntax :
	 *
	 *    ALTER TABLE table_name [ 
	 *      RENAME TO new_table_name | 
	 *      RENAME COLUMN column_name TO new_column_name | 
	 *      DROP [ COLUMN ] [IF EXISTS] column_name | 
	 *      DROP COMMENT | 
	 *      MODIFY COMMENT comment | 
	 *      MODIFY [ COLUMN ] column_name  [ SET TYPE datatype | [ SET | REMOVE ] NOT NULL | [ SET DEFAULT default ] | REMOVE DEFAULT | [ SET | REMOVE ] PRIMARY KEY | [ SET | REMOVE ] [ AUTOINCREMENT|AUTO_INCREMENT|SERIAL ] | [ SET COMMENT comment ] | REMOVE COMMENT ] | [ SET TITLE title ] | REMOVE TITLE ] |
	 *      ADD [ COLUMN ] column_name
	 *        datatype [ NOT NULL|NULLABLE ] [ DEFAULT default ]  [ PRIMARY KEY ] [ AUTOINCREMENT|AUTO_INCREMENT|SERIAL ] [ COMMENT comment ]
	 *    ]
	 *
	 * or eBNF syntax :
	 *
	 *    'ALTER' 'TABLE' table_name (
	 *      'RENAME TO' new_table_name | 
	 *      'RENAME COLUMN' column_name 'TO' new_column_name | 
	 *      'DROP' 'COLUMN' ? 'IF EXISTS' ? column_name |
	 *      'DROP' 'COMMENT' |
	 *      'MODIFY' 'COMMENT' comment |
	 *      'MODIFY' 'COLUMN' ? column_name ( 'SET TYPE' datatype | ( ('SET' | 'REMOVE' ) 'NOT NULL' ) | ( 'SET DEFAULT' default ) | 'REMOVE DEFAULT' | ( 'SET' | 'REMOVE' ) 'PRIMARY KEY' | ( 'SET' | 'REMOVE' ) ('AUTOINCREMENT'|'AUTO_INCREMENT'|'SERIAL') | ( 'SET TITLE' title ) | 'REMOVE TITLE') | 
	 *      'ADD' 'COLUMN' ? column_name
	 *        datatype 'NOT NULL' ? ( 'DEFAULT' default ) ? ( 'PRIMARY KEY' ) ? ( 'AUTOINCREMENT' | 'AUTO_INCREMENT' | 'SERIAL' ) ? ( 'TITLE' title ) ? ( 'COMMENT' comment ) ?
	 *    )
	 *
	 * @access protected
	 * @param string $sql the create alter statement
	 * @return array the parsed request
	 * @throws JsonSQLException
	 */
	protected function parseAlter($sql) {
		$clauses = Splitter::splitKeywords($sql, array("alter\s+table", "rename\s+to", "rename\s+column", "modify", "add", "drop"));
		if (!isset($clauses['altertable'])) {
			throw new JsonSQLException("syntax error near : " . substr($sql, 0, 11));
		}
		$table = $clauses['altertable'];
		$alter = '';
		$newtable = "";
		$comment = "";
		$column = array();
		$required = array();
		$alter;
		if (isset($clauses['renameto'])) {
			$alter = 'rename table';
			$newtable = $clauses['renameto'];
			if (isset($clauses['renamecolumn'])) {
				throw new JsonSQLException("syntax error near : rename column");
			} elseif (isset($clauses['drop'])) {
				throw new JsonSQLException("syntax error near : drop");
			} elseif (isset($clauses['modify'])) {
				throw new JsonSQLException("syntax error near : modify");
			} elseif (isset($clauses['add'])) {
				throw new JsonSQLException("syntax error near : add");
			} 
		} elseif (isset($clauses['renamecolumn'])) {
			$alter = 'rename column';
			if (isset($clauses['drop'])) {
				throw new JsonSQLException("syntax error near : drop");
			} elseif (isset($clauses['modify'])) {
				throw new JsonSQLException("syntax error near : modify");
			} elseif (isset($clauses['add'])) {
				throw new JsonSQLException("syntax error near : add");
			} 
			if (preg_match("/^(\w+)\s+to\s+(\w+)$/i", $clauses['renamecolumn'], $m)) {
				$column = (object)array(
					'name' => $m[1],
					'newname' => $m[2]
				);
			} else {
				throw new JsonSQLException("syntax error near : " . $clauses['renamecolumn']);
			}
		} elseif (isset($clauses['drop'])) {
			$alter = 'drop column';
			if (isset($clauses['modify'])) {
				throw new JsonSQLException("syntax error near : modify");
			} elseif (isset($clauses['add'])) {
				throw new JsonSQLException("syntax error near : add");
			} 
			if (preg_match("/^(column\s+)?(if\s+exists\s+)?(\w+)$/i", $clauses['drop'], $m)) {
				$column = (object)array(
					'name' => $m[3],
					'ifexists' => isset($m[2])
				);
			} elseif ($clauses['drop'] == 'title') {
				$alter = 'drop title';
			} elseif ($clauses['drop'] == 'comment') {
				$alter = 'drop comment';
			} else {
				throw new JsonSQLException("syntax error near : " . $clauses['drop']);
			}
		} elseif (isset($clauses['modify'])) {
			if (isset($clauses['add'])) {
				throw new JsonSQLException("syntax error near : add");
			}
			if (preg_match("/^(column\s+)?(\w+)\s+(.+)$/i", $clauses['modify'], $m)) {
				$alter = 'modify column';
				$columnName= $m[2];
				$subclauses = $m[3];
			} elseif (preg_match("/^title\s(.+)$/i", $clauses['modify'], $m)) {
				$alter = 'modify title';
				$comment= $m[1];
			} elseif (preg_match("/^comment\s(.+)$/i", $clauses['modify'], $m)) {
				$alter = 'modify comment';
				$comment= $m[1];
			} else {
				throw new JsonSQLException("syntax error near : " . $clauses['modify']);
			}
			if ($alter == 'modify column') {
				$subclauses = $this->encodeLiteral($subclauses);
				$subclauses = Splitter::splitKeywords($subclauses, array("set", "remove"));
				if (isset($subclauses['set'])) {
					if (preg_match("/^type\s+(\w+)$/i", $subclauses['set'], $m)) {
						$datatype = strtolower($m[1]);
						if (isset($this->datatypes[$datatype])) {
							$type = $this->datatypes[$datatype];
						} else {
							throw new JsonSQLException("syntax error near : " . $m[1]);
						}
						$column = (object)array(
							'action' => 'set type',
							'name' => $columnName,
							'type' => $type,
							'datatype' => $datatype,
							'format' => ''
						);
						if ($type == 'date') {
							$column->type = 'string';
							$column->format = 'date';
						} elseif ($type == 'datetime') {
							$column->type = 'string';
							$column->format = 'date-time';
						} elseif ($type == 'time') {
							$column->type = 'string';
							$column->format = 'time';
						}
					} elseif (preg_match("/^not\s+null$/i", $subclauses['set'])) {
						$column = (object)array(
							'action' => 'set not null',
							'name' => $columnName
						);
					} elseif (preg_match("/^primary\s+key$/i", $subclauses['set'])) {
						$column = (object)array(
							'action' => 'set primary key',
							'name' => $columnName
						);
					} elseif (preg_match("/^(autoincrement|auto_increment|serial)$/i", $subclauses['set'])) {
						$column = (object)array(
							'action' => 'set autoincrement',
							'name' => $columnName
						);
					} elseif (preg_match("/^default\s+(.+)$/i", $subclauses['set'], $m)) {
						$column = (object)array(
							'action' => 'set default',
							'name' => $columnName,
							'default' => $this->decodeLiteral($m[1])
						);
					} elseif (preg_match("/^title\s+(.+)$/i", $subclauses['set'], $m)) {
						$column = (object)array(
							'action' => 'set title',
							'name' => $columnName,
							'title' => $this->decodeLiteral($m[1])
						);
					} elseif (preg_match("/^comment\s+(.+)$/i", $subclauses['set'], $m)) {
						$column = (object)array(
							'action' => 'set comment',
							'name' => $columnName,
							'comment' => $this->decodeLiteral($m[1])
						);
					}
				} elseif (isset($subclauses['remove'])) {
					if (preg_match("/^not\s+null$/i", $subclauses['remove'])) {
						$column = (object)array(
							'action' => 'remove not null',
							'name' => $columnName
						);
					} elseif (preg_match("/^primary\s+key$/i", $subclauses['remove'])) {
						$column = (object)array(
							'action' => 'remove primary key',
							'name' => $columnName
						);
					} elseif (preg_match("/^(autoincrement|auto_increment|serial)$/i", $subclauses['remove'])) {
						$column = (object)array(
							'action' => 'remove autoincrement',
							'name' => $columnName
						);
					} elseif (preg_match("/^default$/i", $subclauses['remove'])) {
						$column = (object)array(
							'action' => 'remove default',
							'name' => $columnName
						);
					} elseif (preg_match("/^title$/i", $subclauses['remove'])) {
						$column = (object)array(
							'action' => 'remove title',
							'name' => $columnName
						);
					} elseif (preg_match("/^comment$/i", $subclauses['remove'])) {
						$column = (object)array(
							'action' => 'remove comment',
							'name' => $columnName
						);
					}
				}
			}
		} elseif (isset($clauses['add'])) {
			$alter = 'add column';
			if (preg_match("/^(column\s+)?(\w+)\s+(\w+)\s*(.+)?$/i", $clauses['add'], $m)) {
				$columnName= $m[2];
				$datatype = strtolower($m[3]);
				$columnDef = isset($m[4]) ? $m[4] : '';
				if (isset($this->datatypes[$datatype])) {
					$type = $this->datatypes[$datatype];
				} else {
					throw new JsonSQLException("syntax error near : " . $m[3]);
				}
			} else {
				throw new JsonSQLException("syntax error near : " . $clauses['add']);
			}
			$props = array();
			if ($columnDef != '') {
				$columnDef = $this->encodeLiteral($columnDef);
				$chunks = preg_split("/(not\s+null|nullable|default|primary\s+key|autoincrement|auto_increment|serial|title|comment)/i", $columnDef . ' ', -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
				$chunksCount = count($chunks);
				if ($chunksCount % 2 > 0) {
					throw new JsonSQLException("syntax error near : " . $clauses['modify']);
				}
				for ($i = 0; $i < $chunksCount; $i += 2) {
					$prop = strtolower(preg_replace('/\s+/', '', $chunks[$i]));
					$val = trim($this->decodeLiteral($chunks[$i+1]));
					if ($prop == 'default') {
						$val = $this->normalizeValue($type, $val);
					} elseif ($val == '') {
						$val = true;
					}
					$props[$prop] = $val;
				}
			}
			$props = array_merge(array(
				"notnull" => false,
				"default" => null,
				"primarykey" => 0,
				"autoincrement" => false,
				"auto_increment" => false,
				"serial" => false,
				"title" => $columnName,
				"comment" => $columnName
			), $props);
			$columnDef = (object)array(
				'type' => $type,
				'title' => $props['title'],
				'description' => $props['comment']
			);
			$extra = array();
			if ($props['primarykey']) {
				$extra[] = "primarykey:1";
			}
			if ($props['autoincrement'] || $props['auto_increment'] || $props['serial']) {
				$extra[] = "autoincrement:0";
			}
			$extra[] = "type:".$datatype;
			$columnDef->title .= ' [' . implode(', ', $extra) . ']';
			if ($type == 'date') {
				$columnDef->type = 'string';
				$columnDef->format = 'date';
			} elseif ($type == 'datetime') {
				$columnDef->type = 'string';
				$columnDef->format = 'date-time';
			} elseif ($type == 'time') {
				$columnDef->type = 'string';
				$columnDef->format = 'time';
			}
			if ($props['default'] !== null) {
				$columnDef->default = $props['default'];
			}
			if ($props['notnull']) {
				$required[] = $columnName;
			}
			$column = (object)array(
				'name' => $columnName,
				'definition' => $columnDef
			);
		}
		$request = (object)array (
			'statement' => 'alter table',
			'alter' => $alter, 
			'table' => $table,
			'newtable' => $newtable,
			'comment' => $comment,
			'column' => $column,
			'required' => $required
		);
		return $request;
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
	 * @param string $sql the select statement
	 * @return array the parsed request
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
		$fromclauses = Splitter::splitKeywords(self::SQL_FROM_KEYWORD . $clauses['from'], array("from", "cross\s+join", "inner\s+join", "left\s+(outer\s+)?join", "right\s+(outer\s+)?join", "full\s+(outer\s+)?join", "join"));
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
		$ops = array (
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
		$request = (object)array_merge(array( 'select' => array('*'), 'distinct' => false, 'from' => array('json'), 'where' => "true", 'groupby' => array(), 'having' => "true", 'orderby' => array(), 'limit' => array() ), $ops);
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
				$joinclauses = Splitter::splitKeywords(self::SQL_FROM_KEYWORD . $clause, array("from", "as", "on"));
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
	 * @param string $sql the select statement
	 * @return array the parsed request
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
			$req =  $this->parseSelect(self::SQL_SELECT_KEYWORD . trim($chunks[$i+1]));
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
	 * @param string $sql the insert into statement
	 * @return array the parsed request
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
							$row[$name] = $this->normalizeValue($column->type, $row[$name]);
						}
					}
				}
				$request->rows[] = $row;
			}
		} else {
			$select = self::SQL_SELECT_KEYWORD . $clauses['select'];
			if (extension_loaded('apc') && ini_get('apc.enabled')) {
				$request->select = $this->engine->loadRequestFromCache($select);
			} else {
				$request->select = $this->parse($select);
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
	 * @param string $sql the update statement
	 * @return array the parsed request
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
					$setclauses[$name] = $this->normalizeValue($column->type, $setclauses[$name]);
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
	 * @param string $sql the delete from statement
	 * @return array the parsed request
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
	 * @param string $sql the truncate table statement
	 * @return array the parsed request
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
	 * Parses a sql drop table statement according to this BNF syntax :
	 *
	 *	DROP TABLE [ IF EXISTS ] table_name { ', ' table_name }
	 *
	 * or eBNF syntax :
	 *
	 *	'DROP TABLE' ( 'IF EXISTS' ) ? table_name ( ', ' table_name ) *
	 *
	 * @access protected
	 * @param string $sql the drop table statement
	 * @return array the parsed request
	 * @throws JsonSQLException
	 */
	protected function parseDropTable($sql) {
		if (preg_match('/^\s*drop\s+table\s+(if\s+exists\s+)?(.*)$/i', $sql, $m)) {
			$ifexists = $m[1] != '';
			$tables = array_map(function($i) {
				return preg_replace(array('/^`/', '/`$/'), array('', ''), $i);
			}, Splitter::splitList($m[2]));
		} else {
			throw new JsonSQLException("syntax error");
		}
		return (object)array (
			'statement' => 'drop table',
			'tables' => $tables,
			'ifexists' => $ifexists
		);
	}

	/**
	 * Parses and converts a sql expression into a php one
	 *
	 * @access protected
	 * @param string $expression the expression to parse
	 * @param string $columns the columns of the request
	 * @return string the parsed expression
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
	 * @param string $conditions the conditions to parse
	 * @param string $columns the columns of the request
	 * @param array $select the select list of the request
	 * @return string the converted conditions
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
	 * @param string $expression php expression to check
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
		if (preg_match('/[`\{\}\[\]\;]/', $expression, $m)) {
			// metacharacters are forbidden
			throw new JsonSQLException("syntax error near : ".$m[1]);
		}
		if (preg_match('/\$\$([^\s]+)/', $expression, $m)) {
			// $$ is forbidden
			throw new JsonSQLException("syntax error near : ".$m[1]);
		}
	}

	/**
	 *	Converts a string value according to its json data type
	 *
	 * @access protected
	 * @param string $type json data type (string, integer, number or boolean)
	 * @param string $value the value to convert
	 * @return mixed the converted value
	 */
	protected function normalizeValue($type, $value) {
		if ($value == 'null') {
			$value = null;
		} elseif ($type == 'integer') {
			$value = (int)$value;
		} elseif ($type == 'number') {
			$value = (float)$value;
		} elseif ($type == 'boolean') {
			$value = (bool)$value;
		} else {
			$value = preg_replace("/''/", "'", $value);
			$value = preg_replace("/^'/", '', $value);
			$value = preg_replace("/'$/", '', $value);
		}
		return $value;
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
	 * Encode text between quote with base64
	 *
	 * @access private
	 * @param string $text to encode
	 * @return string encoded text.
	 */
	private function encodeLiteral($text) {
		$encoded = "";
		$p = mb_strpos($text, "'", 0, 'UTF-8');
		while ($p !== false ) { // $p = quote ouvrante
			$encoded .= mb_substr($text, 0, $p, 'UTF-8'); // partie non encodée avant la quote
			$text = mb_substr($text, $p + 1, null, 'UTF-8'); // partie après la quote
			$p = mb_strpos($text, "'", 0, 'UTF-8'); // $p = quote fermante
			if ($p !== false ) {
				$toencode = mb_substr($text, 0, $p, 'UTF-8');
				$encoded .= "base64_encoded:" . base64_encode($toencode) . ":base64_encoded";
				$text = mb_substr($text, $p + 1, null, 'UTF-8');
				$p = mb_strpos($text, "'", 0, 'UTF-8');
			} else {
				$text = "'" . $text;
			}
		}
		return $encoded . $text;
	}

	/**
	 * Decode text encoded with base64
	 *
	 * @access private
	 * @param string $text to decode
	 * @return string decoded text.
	 */
	private function decodeLiteral($text, $withQuotes = false) {
		return preg_replace_callback("/base64_encoded\:(.*)\:base64_encoded/", function ($m) use ($withQuotes) {
			$decoded = base64_decode($m[1]);
			return $withQuotes ? "'" . $decoded . "'" : $decoded;
		}, $text);
	}

	/**
	 * Replaces into an expression, the SQL functions by their PHP equivalents
	 *
	 * @access private
	 * @param string $expr the SQL expression
	 * @return string the new expression with PHP functions.
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
}

?>
