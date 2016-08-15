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

namespace EUREKA\G6KBundle\Entity;

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
class JsonSQL  {

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
	 * List of class instances.
	 * there is one instance per database
	 *
	 * @static
	 * @var object
	 * @access private
	 */
 	private static $_instance = array();

	/**
	 * Name of the JSON database managed by that instance 
	 *
	 * @var string
	 * @access private
	 */
	private $name = null;

	/**
	 * The committed content of the JSON database managed by that instance 
	 *
	 * @var object
	 * @access private
	 */
	 private $json = null;

	 /**
	 * Indicates whether to save the json file in a compact form or not
	 *
	 * @static
	 * @var bool
	 * @access private
	 */
	private static $compact = false;

	/**
	 * TRUE if a transaction is currently active, and FALSE if not.
	 *
	 * @var bool
	 * @access private
	 */
	private $transaction = false;

	/**
	 * Content being updated during a transaction 
	 *
	 * @var object
	 * @access private
	 */
	private $backup = null;

	/**
	 * 
	 * TRUE if data has been modified, and FALSE if not.
	 *
	 * @var bool
	 * @access private
	 */
	private $modified = false;

	/**
	 * 
	 * TRUE if the database schema has been modified, and FALSE if not.
	 *
	 * @var bool
	 * @access private
	 */
	private $schemaModified = false;

	/**
	 * 
	 * Stores the ID of the last inserted row.
	 *
	 * @var string 
	 * @access private
	 */
	private $lastInsertId = false;

	/**
	 * A pointer on the content of the JSON database managed by that instance.
	 * if a transaction is currently active for this instance, point to the non-commited content ($this->backup)
	 * otherwise point to the commited content ($this->json)
	 *
	 * @var object
	 * @access private
	 */
	private $db = null;

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
		'bigint' =>'integer',
		'binary' =>'string',
		'blob' =>'string',
		'boolean' =>'boolean',
		'char' =>'string',
		'character' =>'string',
		'date' =>'date',
		'datetime' =>'datetime',
		'decimal' =>'number',
		'double' =>'number',
		'float' =>'number',
		'int' =>'integer',
		'integer' =>'integer',
		'longblob' =>'string',
		'longtext' =>'string',
		'mediumblob' =>'string',
		'mediumtext' =>'string',
		'number' =>'number',
		'numeric' =>'number',
		'real' =>'number',
		'smallint' =>'integer',
		'string' =>'string',
		'text' =>'string',
		'time' =>'time',
		'timestamp' =>'integer',
		'tinytext' =>'string',
		'varbinary' =>'string',
		'varchar' =>'string'
	);

	/**
	 * Represents a connection between PHP and a json database in memory.
	 *
	 * @access private
	 * @param string $name the name of json database (without the file extension)
	 * @throws JsonSQLException
	 */
	private function __construct($name) {
		$this->name = $name;
		if(extension_loaded('apc') && ini_get('apc.enabled')) {
			$this->json = $this->loadJsonFromCache($name);
		} else {
			$this->json = (object)array();
			$db = file_get_contents($name.'.json');
			if ($db === false) {
				throw new JsonSQLException("database '$name' doesn't exists");
			} else {
				$this->json->data = json_decode($db);
			}
			$schema = file_get_contents($name.'.schema.json');
			if ($schema === false) {
				throw new JsonSQLException("database '$name' schema doesn't exists");
			} else {
				$this->json->schema = json_decode($schema);
			}
		}
		$this->db = &$this->json;
		mb_internal_encoding("UTF-8");	
	}

	/**
	 * Class destructor
	 *
	 * commit all changes if a transaction is currently active
	 * @access public
	 */
	public function __destruct() {
		$this->commit();
	}

	/**
	 * Open a json database
	 *
	 * @access public
	 * @static
	 * @see JsonSQL::create()
	 * @param string $name the name of json database (without the file extension)
	 * @param boolean $create if true, creates the database if it doesn't exists
	 * @return object a JsonSQL instance
	 */
	public static function open($name, $create = false) {
		if (!file_exists($name.'.json') && $create) {
			return self::create($name);
		}
		if(!isset(self::$_instance[$name])) {
			self::$_instance[$name] = new JsonSQL($name);  
		}
		return self::$_instance[$name];
	}

	/**
	 * Create a json database then open it
	 *
	 * @access public
	 * @static
	 * @param string $name the name of json database (without the file extension)
	 * @return object a JsonSQL instance
	 * @throws JsonSQLException
	 */
	public static function create($name) {
		$pretty = self::$compact ? 0 : JSON_PRETTY_PRINT;
		if (file_exists($name.'.json')) {
			throw new JsonSQLException("database '$name' already exists");
		}
		if (file_put_contents($name.'.json', json_encode((object)array(), $pretty | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) === false) {
			throw new JsonSQLException("unable to create database '$name'");
		}
		if (file_put_contents($name.'.schema.json', json_encode(array(
			'$schema' => 'http://json-schema.org/draft-04/schema#',
			'type' => 'object',
			'title' => basename($name),
			'description' => basename($name),
			'properties' => (object)null
		), $pretty | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)) === false) {
			throw new JsonSQLException("unable to create database '$name'");
		}
		return self::open($name);
	}

	/**
	 * returns a pointer to the json schema object
	 *
	 * @access public
	 * @return object the json schema object
	 */
	public function schema() {
		return $this->db->schema;
	}

	/**
	 * returns a ArrayIterator on the rows of the table $name
	 *
	 * @access public
	 * @param string $name the table name
	 * @return ArrayIterator the ArrayIterator
	 */
	public function table($name) {
		return new \ArrayIterator($this->db->data->{$name});
	}

	/**
	 * Prepares a statement for execution and returns a statement object
	 *
	 * @access public
	 * @param string $sql a valid SQL statement 
	 * @return object a JsonSQLStatement instance
	 */
	public function prepare($sql) {
		if (extension_loaded('apc') && ini_get('apc.enabled')) {
			$request = $this->loadRequestFromCache($sql);
		} else {
			$request = $this->parse($sql);
		}
		return new JsonSQLStatement($this, $request);
	}

	/**
	 * Executes an SQL statement in a single function call, returning the result set (if any) 
	 * returned by the statement as a JsonSQLStatement object.
	 *
	 * @access public
	 * @param string $sql a valid SQL statement to prepare and execute.
	 * @return object a JsonSQLStatement instance
	 */
	public function query($sql) {
		$statement = $this->prepare($sql);
		if (!$statement->execute()) {
			$statement = false;
		}
		return $statement;
	}

	/**
	 * Executes an SQL statement in a single function call, 
	 * returning the number of rows affected by the statement.
	 *
	 * @access public
	 * @param string $sql a valid SQL statement to prepare and execute.
	 * @return int the number of rows that were modified or deleted by the SQL statement
	 */
	public function exec($sql) {
		$statement = $this->query($sql);
		return $statement->rowCount();
	}

	/**
	 * Quotes a string for use in a query.
	 *
	 * @access public
	 * @param string $string the string to be quoted.
	 * @param int $type provides a PDO data type hint (default : PDO::PARAM_STR).
	 * @return string a quoted string that is safe to pass into an SQL statement
	 */
	public function quote($string, $type = \PDO::PARAM_STR ) {
		if ($type == \PDO::PARAM_STR) {
			$string = str_replace("'", "\\'", $string);
			if (!preg_match("/^'.*'$/", $string)) {
				$string = "'".$string."'";
			}
		} elseif ($type == \PDO::PARAM_INT) {
			$string = "'".$string."'";
		} elseif ($type == \PDO::PARAM_BOOL) {
			$string = "'".$string."'";
		}
		return $string;
	}

	/**
	 * Returns the ID of the last inserted row.
	 *
	 * @access public
	 * @return string a string representing the row ID of the last row that was inserted into the database
	 */
	public function lastInsertId() {
		return $this->lastInsertId;
	}

	/**
	 * Initiates a transaction.
	 *
	 * @access public
	 * @return bool always true
	 */
	public function beginTransaction() {
		if (!$this->transaction) {
			$this->backup = clone $this->json;
			$this->db = &$this->backup;
			$this->transaction = true;
		}
		return true;
	}

	/**
	 * Ends a transaction.
	 *
	 * @access protected
	 * @return void
	 */
	protected function endTransaction() {
		if ($this->transaction) {
			$this->db = &$this->json;
			$this->backup = null;
			$this->transaction = false;
		}
	}

	/**
	 * Commits a transaction.
	 *
	 * @access public
	 * @return bool  always true
	 */
	public function commit() {
		if ($this->transaction) {
			$this->json = clone $this->backup;
			$this->save();
			$this->endTransaction();
		}
		return true;
	}

	/**
	 * Rolls back the current transaction, as initiated by beginTransaction().
	 *
	 * @access public
	 * @return bool  always true
	 */
	public function rollBack() {
		if ($this->transaction) {
			$this->modified = false;
			$this->schemaModified = false;
			$this->endTransaction();
		}
		return true;
	}

	/**
	 * Checks if inside a transaction.
	 *
	 * @access public
	 * @return bool TRUE if a transaction is currently active, and FALSE if not.
	 */
	public function inTransaction() {
		return $this->transaction;
	}

	/**
	 * Loads a json database into memory.
	 * If APCu is enabled and the database is stored in memory then return it.
	 * otherwise, the database is loaded from the filesystem and decoded.
	 *
	 * @access private
	 * @param string $path the name of json database (without the file extension)
	 * @return object the json database (schema and data)
	 * @throws JsonSQLException
	 */
	private function loadJsonFromCache($path) {
		$pathkey = md5($path);
		$mtimekey = $pathkey . "-mtime";
		$mtime = filemtime($path.'.json');
		if ($mtime === false) {
			throw new JsonSQLException("file '$path'.json doesn't exists");
		}
		if (apc_exists($mtimekey)) {
			if ($mtime <= apc_fetch($mtimekey)) {
				return apc_fetch($pathkey);
			}
		} 
		$json = (object)array();
		$db = file_get_contents($path.'.json');
		if ($db === false) {
			throw new JsonSQLException("database '$path' doesn't exists");
		} else {
			$json->data = json_decode($db);
		}
		$schema = file_get_contents($path.'.schema.json');
		if ($schema === false) {
			throw new JsonSQLException("database '$path' schema doesn't exists");
		} else {
			$json->schema = json_decode($schema);
		}
		apc_add($pathkey, $json);
		apc_store ($mtimekey, $mtime);
		return $json;
	}

	/**
	 * Loads a parsed request from memory cache.
	 * If APCu is enabled and the request is stored in memory then return it.
	 * otherwise, the request is parsed.
	 * only select statement are stored into memory cache.
	 *
	 * @access private
	 * @param string $sql the sql statement
	 * @return object the parsed request (select statement only)
	 */
	private function loadRequestFromCache($sql) {
		$sqlkey = md5($sql);
		if (apc_exists($sqlkey)) {
			$request = apc_fetch($sqlkey);
		} else {
			$request = $this->parse($sql);
			if ($request->statement == 'compound select' || $request->statement == 'select') {
				apc_add($sqlkey, $request);
			}
		}
		return $request;
	}

	/**
	 * Parses a sql statement.
	 *
	 * @access protected
	 * @param string $sql the sql statement
	 * @return object the parsed request
	 * @throws JsonSQLException
	 */
	protected function parse($sql) {
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
		$clauses = $this->splitKeywords($sql, array("create", "local", "global", "table", "if\s+not\s+exists", "as\s+select", "with"));
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
				$columnsDef = $this->splitList($m[2]);
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
			$columnsDef = $this->splitList($m[2]);
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
				$primarykeys = array_flip($this->splitList($m[2]));
			} elseif (preg_match('/^unique(\s+key)?\s*\(([^\)]*)\)\s*$/i', $columnDef, $m)) {
				$uniques[] = array_flip($this->splitList($m[2]));
			} elseif (preg_match('/^foreign(\s+key)?\s*\(([^\)]*)\)\s+references\s+(\w+)\s*\(([^\)]*)\)(\s+on\s+.*)?$/i', $columnDef, $m)) {
				$foreignkeys[] = (object)array(
					'columns' => $this->splitList($m[2]),
					'references' => (object)array(
						'table' => $m[3],
						'columns' => $this->splitList($m[4])
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
					$chunks = preg_split("/(constraint|not\s+null|nullable|default|primary\s+key|autoincrement|auto_increment|serial)/i", $m[4] . ' ', -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
					if (count($chunks) % 2 > 0) {
						throw new JsonSQLException("syntax error near : " . $m[4]);
					}
					for ($i = 0; $i < count($chunks); $i += 2) {
						$prop = strtolower(preg_replace('/\s+/', '', $chunks[$i]));
						$val = trim($chunks[$i+1]);
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
					"serial" => false
				), $props);
				if ($props['primarykey']) {
					$primarykeys[$column] = 0;
				}
				if ($props['autoincrement'] || $props['auto_increment'] || $props['serial']) {
					$autoincrement[$column] = 'autoincrement';
				}
				$columns[$column] = (object)array(
					'type' => $type,
					'title' => $column,
					'description' => $column
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
				if ($props['default'] != null) {
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
			if (count($extra) > 0) {
				$props->title .= ' [' . implode(', ', $extra) . ']';
			}
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
			$select = 'select ' . $clauses['asselect'];
			if (extension_loaded('apc') && ini_get('apc.enabled')) {
				$request->select = $this->loadRequestFromCache($select);
			} else {
				$request->select = $this->parse($select);
			}
			$scolumns = array();
			foreach ($request->select->select as $field => $aliasc) {
				if ($field == '*') {
					foreach ($request->select->columns as $column) {
						if (preg_match("/^([^_]+)__([^_]+)$/", $column, $m)) {
							$dbcol = $this->db->schema->properties->{$m[1]}->items->properties->{$m[2]};
							$scolumns[$m[2]] = (object)array(
								'type' => $dbcol->type,
								'title' => $m[2],
								'description' => $m[2]
							);
							if (isset($dbcol->default)) {
								$scolumns[$m[2]]->default = $dbcol->default;
							}
							if (isset($dbcol->format)) {
								$scolumns[$m[2]]->format = $dbcol->format;
							}
							if (isset($dbcol->maxLength)) {
								$scolumns[$m[2]]->maxLength = $dbcol->maxLength;
							}
						}
					}
				} elseif (preg_match("/^([^_]+)__([^_]+)$/", $field, $m)) {
					if (!isset($this->db->schema->properties->{$m[1]}->items->properties->{$m[2]})) {
						throw new JsonSQLException("syntax error near : " . $field);
					}
					$dbcol = $this->db->schema->properties->{$m[1]}->items->properties->{$m[2]};
					$scolumns[$m[2]] = (object)array(
						'type' => $dbcol->type,
						'title' => $m[2],
						'description' => $m[2]
					);
					if (isset($dbcol->default)) {
						$scolumns[$m[2]]->default = $dbcol->default;
					}
					if (isset($dbcol->format)) {
						$scolumns[$m[2]]->format = $dbcol->format;
					}
					if (isset($dbcol->maxLength)) {
						$scolumns[$m[2]]->maxLength = $dbcol->maxLength;
					}
				} else {
					foreach ($request->select->from as $table => $aliast) {
						if (isset($this->db->schema->properties->{$table}->items->properties->{$field})) {
							$dbcol = $this->db->schema->properties->{$table}->items->properties->{$field};
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
		$clauses = $this->splitKeywords($sql, array("select", "distinct", "all", "from", "where", "group\s+by", "having", "order\s+by", "limit", "offset"));
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
		$fromclauses = $this->splitKeywords("from " . $clauses['from'], array("from", "cross\s+join", "inner\s+join", "left\s+(outer\s+)?join", "right\s+(outer\s+)?join", "full\s+(outer\s+)?join", "join"));
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
			'select' => $this->splitList($clauses['select']),
			'distinct' => $distinct,
			'from' => $this->splitList($fromclauses['from']),
			'where' => !isset($clauses['where']) ? "true" : $clauses['where'],
			'groupby' => !isset($clauses['groupby']) ? array() : $this->splitList($clauses['groupby']),
			'having' => !isset($clauses['having']) ? "true" : $clauses['having'],
			'orderby' => !isset($clauses['orderby']) ? array() : $this->splitList($clauses['orderby']),
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
				$joinclauses = $this->splitKeywords("from " . $clause, array("from", "as", "on"));
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
			foreach($this->db->schema->properties->{$from->table}->items->properties as $name => $column) {
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
		$clauses = array();
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
			$req =  $this->parseSelect('select ' . trim($chunks[$i+1]));
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
		$clauses = $this->splitKeywords($sql, array("insert\s+into", "values", "select"));
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
			if (!isset($this->db->schema->properties->{$table})) {
				throw new JsonSQLException("Table '$table' doesn't exists");
			}
			$fields = array();
			foreach($this->db->schema->properties->{$table}->items->properties as $name => $column) {
				$fields[] = $name;
			}
		} elseif (preg_match('/^`?(\w+)`?\s+\(([^\)]+)\)$/', $clauses['insertinto'], $m)) {
			$table = preg_replace(array('/^`/', '/`$/'), array('', ''), $m[1]);
			if (!isset($this->db->schema->properties->{$table})) {
				throw new JsonSQLException("Table '$table' doesn't exists");
			}
			$fields = $this->splitList($m[2]);
			foreach($fields as $field) {
				if (!isset($this->db->schema->properties->{$table}->items->properties->{$field})) {
					throw new JsonSQLException("Column '$field' doesn't exists");
				}
			}
		} else {
			throw new JsonSQLException("syntax error near : " . $clauses['insertinto']);
		}
		$request = (object)array('statement' => 'insert', 'into' => $table);
		$request->columns = array();
		foreach($this->db->schema->properties->{$table}->items->properties as $name => $column) {
			$request->columns[] = $name;
			$request->columns[] = $table . "__" . $name;
		}
		if (isset($clauses['values'])) {
			if (preg_match_all("/\(([^()]|(?R))*\)/", $clauses['values'], $m) == 0) {
				throw new JsonSQLException("syntax error near : " . $clauses['values']);
			}
			$request->rows = array();
			foreach ($m[0] as $list) {
				$values = $this->splitList(substr($list, 1, -1));
				if (count($fields) != count($values)) {
					throw new JsonSQLException("syntax error : number of columns and number of values must be equals");
				}
				$row = array_combine($fields, $values);
				foreach($this->db->schema->properties->{$table}->items->properties as $name => $column) {
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
			$select = 'select ' . $clauses['select'];
			if (extension_loaded('apc') && ini_get('apc.enabled')) {
				$request->select = $this->loadRequestFromCache($select);
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
		$clauses = $this->splitKeywords($sql, array("update", "set", "where"));
		if (!isset($clauses['set'])) {
			throw new JsonSQLException("syntax error : missing set clause");
		}
		$ops = array (
			'statement' => 'update',
			'update' => preg_replace(array('/^`/', '/`$/'), array('', ''), $clauses['update']),
			'set' => $this->splitList($clauses['set']),
			'where' => !isset($clauses['where']) ? "true" : $clauses['where'],
		);
		$request = (object)array_merge(array( 'where' => "true" ), $ops);
		$request->columns = array();
		foreach($this->db->schema->properties->{$request->update}->items->properties as $name => $column) {
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
		foreach($this->db->schema->properties->{$request->update}->items->properties as $name => $column) {
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
		$clauses = $this->splitKeywords($sql, array("delete\s+from", "where"));
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
		foreach($this->db->schema->properties->{$request->from}->items->properties as $name => $column) {
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
			}, $this->splitList($m[1]));
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
			}, $this->splitList($m[2]));
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
	 * Checks if the table already contains a record with the provided keys
	 *
	 * @access protected
	 * @param string $table table name
	 * @param array $keys array of keys
	 * @param int $exclude optionally, don't verify for the row with this index
	 * @return void
	 * @throws JsonSQLException
	 */
	protected function checkDuplicateKeys($table, $keys, $exclude = -1) {
		$index = 0;
		foreach ($this->db->data->{$table} as &$row) {
			if ($index != $exclude) {
				$duplicate = true;
				foreach($keys as $key => $value) {
					if ($row->{$key} != $value) {
						$duplicate = false;
						break;
					}
				}
				if ($duplicate) {
					throw new JsonSQLException("a record with key (" . implode(", ", array_values( $keys)) . ") already exists");
				}
			}
			$index++;
		}
	}

	/**
	 * Appends a row to a table
	 *
	 * @access public
	 * @param string $table table name
	 * @param array $row row to append
	 * @return void
	 * @throws JsonSQLException
	 */
	public function insert($table, $row) {
		$this->beginTransaction();
		$vrow = array();
		$primarykeys = array();
		foreach($this->db->schema->properties->{$table}->items->properties as $name => $column) {
			if (preg_match('/^(.*)\[([^\]]+)\]$/', $column->title, $m)) {
				$title = $m[1].'[';
				$props = $this->properties($m[2]);
			} else {
				$props = (object)array();
			}
			if (isset($props->autoincrement)) {
				if (isset($row[$name]) && strcasecmp($row[$name], 'default') != 0) {
					if ($row[$name] <= $props->autoincrement) {
						throw new JsonSQLException("insert into {$table} : invalid value '{$row[$name]}' for '{$name}'");
					}
					$val = $row[$name];
				} else {
					$val = $props->autoincrement + 1;
				}
				$props->autoincrement = $val;
				if (isset($props->primarykey)) {
					$title .= 'primarykey:'.$props->primarykey.', ';
				}
				$title .= 'autoincrement:'.$props->autoincrement.']';
				$column->title = $title;
				$this->schemaModified = true;
				$this->lastInsertId = $val;
			} elseif (!isset($row[$name])) {
				if (in_array($name, $this->db->schema->properties->{$table}->items->required)) { 
					if (isset($column->default)) {
						$val = $column->default;
					} else {
						throw new JsonSQLException("Column '{$name}' can't be null");
					}
				} else {
					$val = (isset($column->default)) ? $column->default : null;
				}
			} elseif (strcasecmp($row[$name], 'default') == 0) {
				if (isset($column->default)) {
					$val = $column->default;
				} elseif (in_array($name, $this->db->schema->properties->{$table}->items->required)) {
					throw new JsonSQLException("Column '{$name}' has no default && can't be null");
				}
			} else {
				$val = $row[$name];
			}
			$vrow[$name] = $val;
			if (isset($props->primarykey)) {
				$primarykeys[$name] = $val;
			}
		}
		if (count($primarykeys) > 0) {
			$this->checkDuplicateKeys($table, $primarykeys);
		}
		$this->db->data->{$table}[] = (object)$vrow;
		$this->modified = true;
	}

	/**
	 * Deletes a table row
	 *
	 * @access public
	 * @param string $table table name
	 * @param int $index position of the row in the table
	 * @return void
	 */
	public function delete($table, $index) {
		$this->beginTransaction();
		array_splice($this->db->data->{$table}, $index, 1);
		$this->modified = true;
	}

	/**
	 * Replaces a table row by another
	 *
	 * @access public
	 * @param string $table table name
	 * @param int $index position of the row in the table
	 * @param array $row new row
	 * @return void
	 * @throws JsonSQLException
	 */
	public function replace($table, $index, $row) {
		$this->beginTransaction();
		$vrow = array();
		$primarykeys = array();
		foreach($this->db->schema->properties->{$table}->items->properties as $name => $column) {
			if (preg_match('/^(.*)\[([^\]]+)\]$/', $column->title, $m)) {
				$title = $m[1].'[';
				$props = $this->properties($m[2]);
			} else {
				$props = (object)array();
			}
			if (isset($props->autoincrement)) {
				if (isset($row->$name)) {
					if ($row->$name > $props->autoincrement) {
						throw new JsonSQLException("insert into {$table} : invalid value '{$row->$name}' for '{$name}'");
					}
					$val = $row->$name;
				} else {
					throw new JsonSQLException("insert into {$table} : invalid autoincrement value for '{$name}'");
				}
			} elseif (!isset($row->$name)) {
				if (in_array($name, $this->db->schema->properties->{$table}->items->required) && !isset($column->default)) {
					throw new JsonSQLException("'{$name}' can't be null");
				}
				$val = $column->default;
			} else {
				$val = $row->$name;
			}
			$vrow[$name] = $val;
			if (isset($props->primarykey)) {
				$primarykeys[$name] = $val;
			}
		}
		if (count($primarykeys) > 0) {
			$this->checkDuplicateKeys($table, $primarykeys, $index);
		}
		array_splice($this->db->data->{$table}, $index, 1, array($vrow));
		$this->modified = true;
	}

	/**
	 * Creates a table in the database
	 *
	 * @access public
	 * @param string $table table name
	 * @param object $columns columns definition 
	 * @param array $required list of required columns
	 * @param array $foreignkeys list of foreign keys definition
	 * @param bool $ifnotexists if TRUE, don't throw an error if the table already exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public function createTable($table, $columns, $required, $foreignkeys, $ifnotexists = false) {
		if (isset($this->db->schema->properties->{$table})) {
			if (!$ifnotexists) {
				throw new JsonSQLException("table '$table' already exists");
			}
			return;
		}
		foreach($foreignkeys as $foreignkey) {
			foreach($foreignkey->columns as $column) {
				if (!isset($columns->$column)) {
					throw new JsonSQLException("foreign key column '" . $column ."' doesn't exists");
				}
			}
			if (!isset($this->db->schema->properties->{$foreignkey->references->table})) {
				throw new JsonSQLException("foreign key reference table '{$foreignkey->references->table}' doesn't exists");
			}
			foreach($foreignkey->references->columns as $column) {
				if (!isset($this->db->schema->properties->{$foreignkey->references->table}->items->properties->$column)) {
					throw new JsonSQLException("foreign key reference column '$column' doesn't exists");
				}
			}
		}
		$this->beginTransaction();
		$this->db->schema->properties->{$table} = (object)array(
			'type' => 'array',
			'items' => (object)array(
				'type' => 'object',
				'properties' => $columns,
				'required' => $required
			)
		);
		$this->db->data->{$table} = array();
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Deletes all rows from a table
	 *
	 * @access public
	 * @param string $table table name
	 * @return void
	 * @throws JsonSQLException
	 */
	public function truncate($table) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		$this->beginTransaction();
		$this->db->data->{$table} = array();
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Drops a table
	 *
	 * @access public
	 * @param string $table table name
	 * @param bool $ifexists if TRUE, don't throw an error if the table doesn't exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public function dropTable($table, $ifexists = false) {
		if (!isset($this->db->schema->properties->{$table})) {
			if ($ifexists) {
				return;
			}
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		$this->beginTransaction();
		unset($this->db->data->{$table});
		unset($this->db->schema->properties->{$table});
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Saves the current database and/or its schema on the file system
	 *
	 * @access public
	 * @return void
	 * @throws JsonSQLException
	 */
	public function save() {
		if ($this->modified || $this->schemaModified) {
			$pretty = self::$compact ? 0 : JSON_PRETTY_PRINT;
			if ($this->modified) {
				file_put_contents($this->name.".json", json_encode($this->json->data, $pretty | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
			}
			if ($this->schemaModified) {
				file_put_contents($this->name.".schema.json", json_encode($this->json->schema, $pretty | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
			}
			if (extension_loaded('apc') && ini_get('apc.enabled')) {
				$pathkey = md5($this->name);
				$mtimekey = $pathkey . "-mtime";
				$mtime = filemtime($this->name.".json");
				apc_store($pathkey, $this->json);
				apc_store ($mtimekey, $mtime);
			}
		}
		$this->modified = false;
		$this->schemaModified = false;
	}

	/**
	 * Splits a SQL statement into keywords/clauses
	 *
	 * @access private
	 * @param string $stmt SQL statement
	 * @param array $keywords the list of keywords
	 * @return array the list of keywords associated with their clauses.
	 * @throws JsonSQLException
	 */
	private function splitKeywords($stmt, $keywords) {
		$clauses = array();
		$positions = array();
		$chunks = preg_split("/\b(" . implode("|", $keywords) . ")\b/i", $stmt, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY | PREG_SPLIT_OFFSET_CAPTURE);
		if (count($chunks) % 2 > 0) {
			throw new JsonSQLException("syntax error near : " . $stmt);
		}
		for ($i = 0; $i < count($chunks); $i += 2) {
			$keyword = strtolower(preg_replace('/\s+/', '', $chunks[$i][0]));
			$value = trim($chunks[$i+1][0]);
			if (isset($clauses[$keyword])) {
				if (is_array($clauses[$keyword])) {
					array_push($clauses[$keyword], $value);
				} else {
					$clauses[$keyword] = array($clauses[$keyword], $value);
				}
			} else {
				$clauses[$keyword] = $value;
			}
			$positions[$keyword] = $chunks[$i][1];
		}
		$prev = '';
		foreach ($keywords as $i => $keyword) {
			if ($i > 0 && isset($positions[$keyword]) && isset($positions[$keywords[$i -1]]) && $positions[$keyword] < $positions[$keywords[$i -1]]) {
				throw new JsonSQLException("syntax error near : " . $keyword . ' ' . $clauses[$keyword]);
			}
		}
		return $clauses;
	}

	/**
	 * Tokenizes a list of comma separated terms excluding function arguments
	 *
	 * @access private
	 * @param string $list the list of comma separated terms
	 * @return array the array of terms.
	 */
	private function splitList($list) {
		if (!preg_match('/[\(\)]/', $list)) { // no parenthesis
			return array_map(function ($i) { return trim($i); }, str_getcsv($list, ",", "'"));
		}
		$chunks = preg_split("/([,'\(\)])/i", $list, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
		$items = array();
		$i = 0;
		$l = count($chunks);
		$token = "";
		while ($i < $l) {
			$chunk = $chunks[$i];
			switch ($chunk) {
				case "'":
					$token .= $chunk;
					$i++;
					while ($i < $l && $chunks[$i] != "'") {
						$token .= $chunks[$i];
						$i++;
					}
					$token .= "'";
					break;
				case "(":
					$token .= $chunk;
					$i++;
					$depth = 0;
					while ($i < $l) {
						if ($chunks[$i] == ")") {
							if ($depth == 0) {
								break;
							} else {
								$depth--;
							}
						}
						if ($chunks[$i] == "(") {
							$depth++;
						}
						$token .= $chunks[$i];
						$i++;
					}
					$token .= ")";
					break;
				case ",":
					if ($token != '') {
						$items[] = trim($token);
						$token = "";
					}
					break;
				default:
					$token .= $chunk;
			}
			$i++;
		}
		if ($token != '') {
			$items[] = trim($token);
		}
		return $items;
	}

	/**
	 * Tokenizes a list of comma separated internal properties and returns and object with these properties.
	 * Internal properties are stored into the title property of the column definition in the database schema.
	 * Actually, only 'primarykey' and 'autoincrement' are used.
	 *
	 * @access private
	 * @param string $list the list of comma separated properties
	 * @return object the properties object.
	 */
	private function properties($arg) {
		$props = array();
		foreach($this->splitList($arg) as $prop) {
			list($property, $value) = explode(':', $prop);
			$props[$property] = $value;
		}
		return (object)$props;
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

	/**
	 * Class Constructor
	 *
	 * @access public
	 * @param JsonSQL $jsonsql the JsonSQL instance
	 * @param object $request the prepared statement
	 */
	public function __construct($jsonsql, &$request) {
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
		extract($variables);
		$ret = @eval("return " . $conditions . ";");
		if ($ret === false && ($error = error_get_last()) !== null) {
			throw new JsonSQLException($error['type'] == E_PARSE ? "Syntax error" : $error['message'], $error['type']);
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
		while(($row = $this->joins($len)) != null) {
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
			if ($prev != null && $curr != $prev) {
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
					if ($aggregates['max__'.$column] == null || $row->$column > $aggregates['max__'.$column]) {
						$aggregates['max__'.$column] = $row->$column;
					}
					if ($aggregates['min__'.$column] == null || $row->$column < $aggregates['min__'.$column]) {
						$aggregates['min__'.$column] = $row->$column;
					}
					$aggregates['avg__'.$column] = $aggregates['sum__'.$column] / $aggregates['count__'.$column];
				}
			}
		}
		if ($prev != null) {
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
	public function __construct($message, $code = 0, Exception $previous = null) {
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