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
class DDLParser extends Parser {

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

	/**
	 * Constructor of class DDLParser
	 *
	 * @access  public
	 * @param   \App\G6K\Manager\Json\JsonSQL $jsonsql The JsonSQL instance
	 * @param   string $sql The DDL statement
	 * @return  void
	 *
	 */
	public function __construct(JsonSQL $jsonsql, $sql) {
		parent::__construct($jsonsql, $sql);
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
	 * @param string $sql The create table statement
	 * @return object The parsed request
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
				if (preg_match('/^(\w+)$/', $columnDef, $m)) {
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
							$val = $this->engine->normalizeValue($type, $val);
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
			$select = Parser::SQL_SELECT_KEYWORD . $clauses['asselect'];
			if (extension_loaded('apc') && ini_get('apc.enabled')) {
				$request->select = $this->engine->loadRequestFromCache($select);
			} else {
				$dmlparser = new DMLParser($this->jsonsql, $select);
				$request->select = $dmlparser->parse();
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

	/**
	 * Copy the definitions of columns
	 *
	 * @access  private
	 * @param   string $table The name of the table
	 * @param   string $field The name of the field
	 * @param   array &$scolumns The columns of the table
	 * @return  void
	 *
	 */
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
	 * @param string $sql The create alter statement
	 * @return object The parsed request
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
						$val = $this->engine->normalizeValue($type, $val);
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
	 * Parses a sql drop table statement according to this BNF syntax :
	 *
	 *	DROP TABLE [ IF EXISTS ] table_name { ', ' table_name }
	 *
	 * or eBNF syntax :
	 *
	 *	'DROP TABLE' ( 'IF EXISTS' ) ? table_name ( ', ' table_name ) *
	 *
	 * @access protected
	 * @param string $sql The drop table statement
	 * @return object The parsed request
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
	 * Encode text between quote with base64
	 *
	 * @access private
	 * @param string $text The text to encode
	 * @return string The encoded text.
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
	 * @param string $text The text to decode
	 * @return string The decoded text.
	 */
	private function decodeLiteral($text, $withQuotes = false) {
		return preg_replace_callback("/base64_encoded\:(.*)\:base64_encoded/", function ($m) use ($withQuotes) {
			$decoded = base64_decode($m[1]);
			return $withQuotes ? "'" . $decoded . "'" : $decoded;
		}, $text);
	}

	protected function parseSelect($sql) {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function parseSetOperations($sql) {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function parseInsert($sql) {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function parseUpdate($sql) {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function parseDelete($sql) {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function parseTruncate($sql) {
		throw new JsonSQLException("JsonSQL internal error");
	}

}

?>
