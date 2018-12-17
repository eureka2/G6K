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
class Engine  {

	/**
	 * A pointer on the JsonSQL owner.
	 *
	 * @var \App\G6K\Manager\Json\JsonSQL|null The JsonSQL instance
	 * @access private
	 */
	private $jsonsql = null;

	/**
	 * Name of the JSON database managed by that engine 
	 *
	 * @var string|null
	 * @access private
	 */
	private $name = null;

	/**
	 * The committed content of the JSON database managed by that engine 
	 *
	 * @var object|null
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
	 * true if a transaction is currently active, and false if not.
	 *
	 * @var bool
	 * @access private
	 */
	private $transaction = false;

	/**
	 * Content being updated during a transaction 
	 *
	 * @var object|null
	 * @access private
	 */
	private $backup = null;

	/**
	 * 
	 * true if data has been modified, and false if not.
	 *
	 * @var bool
	 * @access private
	 */
	private $modified = false;

	/**
	 * 
	 * true if the database schema has been modified, and false if not.
	 *
	 * @var bool
	 * @access private
	 */
	private $schemaModified = false;

	/**
	 * 
	 * Stores the ID of the last inserted row.
	 *
	 * @var string|false 
	 * @access private
	 */
	private $lastInsertId = false;

	/**
	 * A pointer on the content of the JSON database managed by that engine.
	 * if a transaction is currently active for this instance, point to the non-commited content ($this->backup)
	 * otherwise point to the commited content ($this->json)
	 *
	 * @var object
	 * @access private
	 */
	private $db = null;

	/**
	 * Constructor of class Engine
	 *
	 * @access  public
	 * @param   \App\G6K\Manager\Json\JsonSQL $jsonsql The JsonSQL instance
	 * @return  void
	 *
	 */
	public function __construct(JsonSQL $jsonsql) {
		$this->jsonsql = $jsonsql;
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
	 * Returns the pointer on the content of the JSON database
	 *
	 * @access  public
	 * @return  object The pointer on the content of the JSON database
	 *
	 */
	public function getDb() {
		return $this->db;
	}

	/**
	 * Open a json database
	 *
	 * @access public
	 * @param string $name the name of json database (without the file extension)
	 * @param bool $create if true, creates the database if it doesn't exists
	 */
	public function open($name, $create = false) {
		if (!file_exists($name.'.json') && $create) {
			self::create($name);
		}
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
	 * Creates a json database then open it
	 *
	 * @access public
	 * @static
	 * @param string $name The name of json database (without the file extension)
	 * @param bool $compact if true, the content of the database will be compact
	 * @throws JsonSQLException
	 */
	public function create($name, $compact = false) {
		$pretty = $compact ? 0 : JSON_PRETTY_PRINT;
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
	}

	/**
	 * Returns a pointer to the json schema object
	 *
	 * @access public
	 * @return object The json schema object
	 */
	public function schema() {
		return $this->db->schema;
	}

	/**
	 * returns a ArrayIterator on the rows of the table $name
	 *
	 * @access public
	 * @param string $name The table name
	 * @return \ArrayIterator The ArrayIterator
	 */
	public function table($name) {
		return new \ArrayIterator($this->db->data->{$name});
	}

	/**
	 * Quotes a string for use in a query.
	 *
	 * @access public
	 * @param string $string The string to be quoted.
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
	 * @return string|false  a string representing the row ID of the last row that was inserted into the database
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
	 * Commits any modification
	 *
	 * @access public
	 * @return bool  always true
	 */
	public function notifyModification() {
		$this->modified = true;
		return $this->commit();
	}

	/**
	 * Commits any modification of the schema
	 *
	 * @access public
	 * @return bool  always true
	 */
	public function notifySchemaModification() {
		$this->schemaModified = true;
		return $this->notifyModification();
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
	 * @return bool true if a transaction is currently active, and false if not.
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
	 * @param string $path The name of json database (without the file extension)
	 * @return object The json database (schema and data)
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
	 * @param string $sql The sql statement
	 * @return object The parsed request (select statement only)
	 */
	public function loadRequestFromCache($sql) {
		$sqlkey = md5($sql);
		if (apc_exists($sqlkey)) {
			$request = apc_fetch($sqlkey);
		} else {
			$parser = Parser::create($this->jsonsql, $sql);
			$request = $parser->parse();
			if ($request->statement == 'compound select' || $request->statement == 'select') {
				apc_add($sqlkey, $request);
			}
		}
		return $request;
	}

	/**
	 * Checks if the table already contains a record with the provided keys
	 *
	 * @access protected
	 * @param string $table The table name
	 * @param array $keys The array of keys
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
	 * @param string $table The table name
	 * @param array $row The row to append
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
				foreach($props as $prop => $value) {
					if ($prop != 'autoincrement') {
						$title .= $prop.':'.$value.', ';
					}
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
			if ($val !== null) {
				$vrow[$name] = $val;
			}
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
	 * @param string $table The table name
	 * @param int $index The position of the row in the table
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
	 * @param string $table The table name
	 * @param int $index The position of the row in the table
	 * @param \stdClass $row The new row
	 * @return void
	 * @throws JsonSQLException
	 */
	public function replace($table, $index, \stdClass $row) {
		$this->beginTransaction();
		$vrow = array();
		$primarykeys = array();
		foreach($this->db->schema->properties->{$table}->items->properties as $name => $column) {
			if (preg_match('/^.*\[([^\]]+)\]$/', $column->title, $m)) {
				$props = $this->properties($m[1]);
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
			if ($val !== null) {
				$vrow[$name] = $val;
			}
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
	 * @param string $table The table name
	 * @param \stdClass $columns The columns definition 
	 * @param array $required The list of required columns
	 * @param array $foreignkeys The list of foreign keys definition
	 * @param bool $ifnotexists if true, don't throw an error if the table already exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public function createTable($table, \stdClass $columns, $required, $foreignkeys, $ifnotexists = false) {
		JsonTable::create($this, $table, $columns, $required, $foreignkeys, $ifnotexists);
	}

	/**
	 * Deletes all rows from a table
	 *
	 * @access public
	 * @param string $table The table name
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
	 * @param string $table The table name
	 * @param bool $ifexists if true, don't throw an error if the table doesn't exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public function dropTable($table, $ifexists = false) {
		JsonTable::drop($this, $table, $ifexists);
	}

	/**
	 * Renames a table
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $newname The new name of the table
	 * @return void
	 * @throws JsonSQLException
	 */
	public function renameTable($table, $newname) {
		JsonTable::rename($this, $table, $newname);
	}

	/**
	 * Adds a column in a table of the database
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The name of the new column
	 * @param \stdClass $columnDef The column definition 
	 * @param array $required an array with the column name if required
	 * @return void
	 * @throws JsonSQLException
	 */
	public function addColumn($table, $column, \stdClass $columnDef, $required = array()) {
		JsonColumn::add($this, $table, $column, $columnDef, $required);
	}

	/**
	 * Renames a column
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The actual column name in the table
	 * @param string $newname The new name of the column
	 * @return void
	 * @throws JsonSQLException
	 */
	public function renameColumn($table, $column, $newname) {
		JsonColumn::rename($this, $table, $column, $newname);
	}

	/**
	 * Drops a column
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The actual column name to drop in the table
	 * @param bool $ifexists if true, don't throw an error if the table or the column doesn't exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public function dropColumn($table, $column, $ifexists = false) {
		JsonColumn::drop($this, $table, $column, $ifexists);
	}

	/**
	 * Changes the type of a column
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The actual column name
	 * @param string $type The type of the column
	 * @param string $format The format of the column
	 * @param string $datatype The datatype of the column
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setColumnType($table, $column, $type, $format = '', $datatype = '') {
		JsonColumn::setType($this, $table, $column, $type, $format, $datatype);
	}

	/**
	 * Changes whether a column is marked to allow null values or to reject null values
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param bool $allownull if true, the column allow null value
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setNotNull($table, $column, $allownull = false) {
		JsonColumn::setNotNull($this, $table, $column, $allownull);
	}

	/**
	 * Set or remove the default value for a column.
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param string|bool $default The default value. If false, remove the default
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setDefault($table, $column, $default = false) {
		JsonColumn::setDefault($this, $table, $column, $default);
	}

	/**
	 * Set or remove primary key for a column.
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param bool $remove if true, remove the primary key
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setPrimaryKey($table, $column, $remove = false) {
		JsonColumn::setPrimaryKey($this, $table, $column, $remove);
	}

	/**
	 * Set or remove autoincrement for a column.
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param bool $remove if true, remove the primary key
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setAutoincrement($table, $column, $remove = false) {
		JsonColumn::setAutoincrement($this, $table, $column, $remove);
	}

	/**
	 * Set or remove the title of a table.
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string|bool $title The title content. If false, remove the title
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setTableTitle($table, $title = false) {
		JsonTable::setTitle($this, $table, $title);
	}

	/**
	 * Set or remove the description of a table.
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string|bool $description The description content. If false, remove the description
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setTableDescription($table, $description = false) {
		JsonTable::setDescription($this, $table, $description);
	}

	/**
	 * Set or remove the title of a column.
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param string|bool $title The title content. If false, remove the title
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setColumnTitle($table, $column, $title = false) {
		JsonColumn::setTitle($this, $table, $column, $title);
	}

	/**
	 * Set or remove the description of a column.
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The actual column name 
	 * @param string|bool $description The description content. If false, remove the description
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setColumnDescription($table, $column, $description = false) {
		JsonColumn::setDescription($this, $table, $column, $description);
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
	 *	Converts a string value according to its json data type
	 *
	 * @access public
	 * @param string $type The json data type (string, integer, number or boolean)
	 * @param string $value The value to convert
	 * @return string|float|bool|int|null The converted value
	 */
	public function normalizeValue($type, $value) {
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
	 * Tokenizes a list of comma separated internal properties and returns an object with these properties.
	 * Internal properties are stored into the title property of the column definition in the database schema.
	 * Actually, only 'primarykey' and 'autoincrement' are used.
	 *
	 * @access public
	 * @param string $arg The list of comma separated properties
	 * @return object The properties object.
	 */
	public function properties($arg) {
		$props = array();
		foreach(Splitter::splitList($arg) as $prop) {
			list($property, $value) = explode(':', $prop);
			$props[$property] = $value;
		}
		return (object)$props;
	}

}

?>
