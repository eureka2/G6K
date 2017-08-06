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
class Engine  {

	/**
	 * Name of the JSON database managed by that engine 
	 *
	 * @var string
	 * @access private
	 */
	private $name = null;

	/**
	 * The committed content of the JSON database managed by that engine 
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
	 * A pointer on the content of the JSON database managed by that engine.
	 * if a transaction is currently active for this instance, point to the non-commited content ($this->backup)
	 * otherwise point to the commited content ($this->json)
	 *
	 * @var object
	 * @access private
	 */
	private $db = null;

	public function __construct() {
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

	public function getDb() {
		return $this->db;
	}

	/**
	 * Open a json database
	 *
	 * @access public
	 * @param string $name the name of json database (without the file extension)
	 * @param boolean $create if true, creates the database if it doesn't exists
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
	 * Create a json database then open it
	 *
	 * @access public
	 * @static
	 * @param string $name the name of json database (without the file extension)
	 * @return object a JsonSQL instance
	 * @throws JsonSQLException
	 */
	public function create($name, $compact) {
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
	public function loadRequestFromCache($sql) {
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
	public function createTable($table, \stdClass $columns, $required, $foreignkeys, $ifnotexists = false) {
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
	 * Renames a table
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $newname new name of the table
	 * @return void
	 * @throws JsonSQLException
	 */
	public function renameTable($table, $newname) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (isset($this->db->schema->properties->{$newname})) {
			throw new JsonSQLException("table '$newname' already exists");
		}
		$this->beginTransaction();
		$this->db->data->{$newname} = $this->db->data->{$table};
		$this->db->schema->properties->{$newname} = $this->db->schema->properties->{$table};
		unset($this->db->data->{$table});
		unset($this->db->schema->properties->{$table});
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Adds a column in a table of the database
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $column the name of the new column
	 * @param object $columnDef column definition 
	 * @param array $required an array with the column name if required
	 * @return void
	 * @throws JsonSQLException
	 */
	public function addColumn($table, $column, \stdClass $columnDef, $required = array()) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (isset($this->db->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' already exists in $table");
		}
		if (in_array($column, $required) && !isset($columnDef->default)) {
			throw new JsonSQLException("column '$column' in $table can't be required if there is no default value");
		}
		$this->beginTransaction();
		$this->db->schema->properties->{$table}->items->properties->$column = $columnDef;
		$this->db->schema->properties->{$table}->items->required = array_merge($this->db->schema->properties->{$table}->items->required, $required);
		$newval = isset($columnDef->default) ? $columnDef->default : null;
		foreach ($this->db->data->{$table} as &$row) {
			$row->$column = $newval;
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Renames a column
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $column actual column name in the table
	 * @param string $newname new name of the column
	 * @return void
	 * @throws JsonSQLException
	 */
	public function renameColumn($table, $column, $newname) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($this->db->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
		if (isset($this->db->schema->properties->{$table}->items->properties->$newname)) {
			throw new JsonSQLException("column '$newname' already exists in $table");
		}
		$this->beginTransaction();
		$this->db->schema->properties->{$table}->items->properties->$newname = $this->db->schema->properties->{$table}->items->properties->$column;
		unset($this->db->schema->properties->{$table}->items->properties->$column);
		if (($requiredpos = array_search($column, $this->db->schema->properties->{$table}->items->required)) !== false) {
			array_splice($this->db->schema->properties->{$table}->items->required, $requiredpos, 1, $newname);
		}
		foreach ($this->db->data->{$table} as &$row) {
			$row->$newname = $row->$column;
			unset($row->$column);
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Drops a column
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $column actual column name to drop in the table
	 * @param bool $ifexists if TRUE, don't throw an error if the table or the column doesn't exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public function dropColumn($table, $column, $ifexists = false) {
		if (!isset($this->db->schema->properties->{$table})) {
			if ($ifexists) {
				return;
			}
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($this->db->schema->properties->{$table}->items->properties->$column)) {
			if ($ifexists) {
				return;
			}
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
		$this->beginTransaction();
		unset($this->db->schema->properties->{$table}->items->properties->$column);
		if (($requiredpos = array_search($column, $this->db->schema->properties->{$table}->items->required)) !== false) {
			array_splice($this->db->schema->properties->{$table}->items->required, $requiredpos, 1);
		}
		foreach ($this->db->data->{$table} as &$row) {
			unset($row->$column);
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Changes the type of a column
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $column actual column name
	 * @param bool $ifexists if TRUE, don't throw an error if the table or the column doesn't exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setColumnType($table, $column, $type, $format = '', $datatype = '') {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($this->db->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
		$columnSchema = &$this->db->schema->properties->{$table}->items->properties->$column;
		if (preg_match('/^(.*)\[([^\]]+)\]$/', $columnSchema->title, $m)) {
			$title = $m[1];
			$props = $this->properties($m[2]);
		} else {
			$title = $columnSchema->title;
			$props = (object)array();
		}
		if ($datatype == '') {
			$datatype = $type;
		}
		if ($type == $columnSchema->type && $datatype == $props->type && ((! isset($columnSchema->format) && $format == '' ) || (isset($columnSchema->format) && $format == $columnSchema->format))) {
			return; // nothing to do
		}
		$this->beginTransaction();
		if (count($this->db->data->{$table}) == 0) {
			$columnSchema->type = $type;
			if ($format != '') {
				$columnSchema->format = $format;
			} elseif (isset($columnSchema->format)) {
				unset($columnSchema->format);
			}
			if (isset($columnSchema->default)) {
				$columnSchema->default = $this->normalizeValue($type, $columnSchema->default); 
			}
		} elseif ($type == 'string' && $format == '') {
			$columnSchema->type = $type;
			if (isset($columnSchema->format)) {
				unset($columnSchema->format);
			}
			foreach ($this->db->data->{$table} as &$row) {
				$row->$column = $this->normalizeValue($type, $row->$column); 
			}
			if (isset($columnSchema->default)) {
				$columnSchema->default = $this->normalizeValue($type, $columnSchema->default); 
			}
		} else {
			switch ($columnSchema->type) {
				case 'string':
					if (isset($columnSchema->format)) {
						switch ($columnSchema->format) {
							case 'date':
								if ($type != 'string') {
									throw new JsonSQLException("can't convert date to $type");
								} elseif ($format == 'time') {
									throw new JsonSQLException("can't convert date to time");
								} elseif ($format != 'date') {
									$columnSchema->format = $format;
									if ($format == 'datetime') {
										foreach ($this->db->data->{$table} as &$row) {
											$row->$column = $row->$column . 'T00:00:00.0Z'; 
										}
									} else {
										unset($columnSchema->format);
									}
								}
								break;
							case 'datetime':
								if ($type != 'string') {
									throw new JsonSQLException("can't convert datetime to $type");
								} elseif ($format == 'date') {
									$columnSchema->format = $format;
									foreach ($this->db->data->{$table} as &$row) {
										$row->$column = substr($row->$column, 0, 10); 
									}
								} elseif ($format == 'time') {
									$columnSchema->format = $format;
									foreach ($this->db->data->{$table} as &$row) {
										$row->$column = substr($row->$column, 11); 
									}
								} elseif ($format != 'datetime') {
									unset($columnSchema->format);
								}
								break;
							case 'time':
								if ($type != 'string' || $format != 'time') {
									if ($format == '') {
										throw new JsonSQLException("can't convert time to $type");
									} else {
										throw new JsonSQLException("can't convert time to $format");
									}
								}
								break;
						}
					} elseif ($type == 'number') {
						foreach ($this->db->data->{$table} as $row) {
							if (! is_numeric($row->$column)) {
								throw new JsonSQLException("can't convert string to $type");
							}
						}
						$columnSchema->type = $type;
						foreach ($this->db->data->{$table} as &$row) {
							$row->$column = (float)$row->$column; 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = (float)$columnSchema->default; 
						}
					} elseif ($type == 'integer') {
						foreach ($this->db->data->{$table} as $row) {
							if (! is_int($row->$column)) {
								throw new JsonSQLException("can't convert string to $type");
							}
						}
						$columnSchema->type = $type;
						foreach ($this->db->data->{$table} as &$row) {
							$row->$column = (int)$row->$column; 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = (int)$columnSchema->default; 
						}
					} elseif ($type == 'boolean') {
						foreach ($this->db->data->{$table} as $row) {
							if (! is_bool($row->$column)) {
								throw new JsonSQLException("can't convert string to $type");
							}
						}
						$columnSchema->type = $type;
						foreach ($this->db->data->{$table} as &$row) {
							$row->$column == boolval($row->$column); 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = boolval($columnSchema->default); 
						}
					} elseif ($type != 'string' || $format != '') { 
						if ($format == '') {
							throw new JsonSQLException("can't convert string to $type");
						} else {
							throw new JsonSQLException("can't convert string to $format");
						}
					}
					break;
				case 'number':
					if ($type == 'integer') {
						$columnSchema->type = $type;
						foreach ($this->db->data->{$table} as &$row) {
							$row->$column = (int)$row->$column; 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = (int)$columnSchema->default; 
						}
					} elseif ($type == 'boolean') {
						$columnSchema->type = $type;
						foreach ($this->db->data->{$table} as &$row) {
							$row->$column == boolval($row->$column); 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = boolval($columnSchema->default); 
						}
					} elseif ($type != 'number') {
						if ($format == '') {
							throw new JsonSQLException("can't convert number to $type");
						} else {
							throw new JsonSQLException("can't convert number to $format");
						}
					}
					break;
				case 'integer':
					if ($type == 'number') {
						$columnSchema->type = $type;
						foreach ($this->db->data->{$table} as &$row) {
							$row->$column = (float)$row->$column; 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = (float)$columnSchema->default; 
						}
					} elseif ($type == 'boolean') {
						$columnSchema->type = $type;
						foreach ($this->db->data->{$table} as &$row) {
							$row->$column == boolval($row->$column); 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = boolval($columnSchema->default); 
						}
					} elseif ($type != 'integer') {
						if ($format == '') {
							throw new JsonSQLException("can't convert integer to $type");
						} else {
							throw new JsonSQLException("can't convert integer to $format");
						}
					}
					break;
				case 'boolean':
					if ($type == 'number' || $type == 'integer') {
						$columnSchema->type = $type;
						foreach ($this->db->data->{$table} as &$row) {
							$row->$column = $row->$column ? 1 : 0; 
						}
						if (isset($columnSchema->default)) {
							$columnSchema->default = $columnSchema->default ? 1 : 0; 
						}
					} elseif ($type != 'boolean') {
						if ($format == '') {
							throw new JsonSQLException("can't convert boolean to $type");
						} else {
							throw new JsonSQLException("can't convert boolean to $format");
						}
					}
					break;
			}
		}
		$props->type = $datatype;
		$extra = array();
		foreach ($props as $prop => $value) {
			$extra[] = $prop . ":" . $value;
		}
		$columnSchema->title = $title;
		if (count($extra) > 0) {
			$columnSchema->title .= ' [' . implode(', ', $extra) . ']';
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Changes whether a column is marked to allow null values or to reject null values
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $column actual column name 
	 * @param bool $allownull if TRUE, the column allow null value
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setNotNull($table, $column, $allownull = false) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($this->db->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
		$required = &$this->db->schema->properties->{$table}->items->required;
		$requiredpos = array_search($column, $required);
		if ($allownull && $requiredpos === false) {
			return; // nothing to do
		}
		if (!$allownull && $requiredpos !== false) {
			return; // nothing to do
		}
		$this->beginTransaction();
		if ($allownull && $requiredpos !== false) {
			array_splice($required, $requiredpos, 1);
		} elseif (! $allownull && $requiredpos === false) {
			array_push($required, $column);
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Set or remove the default value for a column.
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $column actual column name 
	 * @param mixed $default the default value. If FALSE, remove the default
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setDefault($table, $column, $default = false) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($this->db->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
		$columnSchema = &$this->db->schema->properties->{$table}->items->properties->$column;
		if (!isset($columnSchema->default) && $default === false) {
			return; // nothing to do
		}
		$this->beginTransaction();
		if ($default === false) {
			unset($columnSchema->default);
		} else {
			$columnSchema->default = $this->normalizeValue($columnSchema->type, $default); 
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Set or remove primary key for a column.
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $column actual column name 
	 * @param bool $remove if TRUE, remove the primary key
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setPrimaryKey($table, $column, $remove = false) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($this->db->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
		$columnSchema = &$this->db->schema->properties->{$table}->items->properties->$column;
		if (preg_match('/^(.*)\[([^\]]+)\]$/', $columnSchema->title, $m)) {
			$title = $m[1];
			$props = $this->properties($m[2]);
		} else {
			$title = $columnSchema->title;
			$props = (object)array();
		}
		if (isset($props->primarykey) && ! $remove) {
			return; // nothing to do
		}
		if (!isset($props->primarykey) && $remove) {
			return; // nothing to do
		}
		$this->beginTransaction();
		if ($remove) {
			unset($props->primarykey);
		} else {
			$maxkey = 0;
			foreach($this->db->schema->properties->{$table}->items->properties as $col) {
				if (preg_match('/^.*\[([^\]]+)\]$/', $col->title, $m)) {
					$colprops = $this->properties($m[1]);
					if (isset($colprops->primarykey)) {
						if ($colprops->primarykey > $maxkey) {
							$maxkey = $colprops->primarykey;
						}
					}
				}
			}
			$props->primarykey = $maxkey + 1;
		}
		$extra = array();
		foreach ($props as $prop => $value) {
			$extra[] = $prop . ":" . $value;
		}
		$columnSchema->title = $title;
		if (count($extra) > 0) {
			$columnSchema->title .= ' [' . implode(', ', $extra) . ']';
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Set or remove autoincrement for a column.
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $column actual column name 
	 * @param bool $remove if TRUE, remove the primary key
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setAutoincrement($table, $column, $remove = false) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($this->db->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
		$columnSchema = &$this->db->schema->properties->{$table}->items->properties->$column;
		if ($columnSchema->type != 'integer') {
			throw new JsonSQLException("column '$column' in '$table' as type '{$columnSchema->type}', only integer can have the autoincrement property");
		}
		if (preg_match('/^(.*)\[([^\]]+)\]$/', $columnSchema->title, $m)) {
			$title = $m[1];
			$props = $this->properties($m[2]);
		} else {
			$title = $columnSchema->title;
			$props = (object)array();
		}
		if (isset($props->autoincrement) && ! $remove) {
			return; // nothing to do
		}
		if (!isset($props->autoincrement) && $remove) {
			return; // nothing to do
		}
		$this->beginTransaction();
		if ($remove) {
			unset($props->autoincrement);
		} else {
			$maxid = 0;
			foreach ($this->db->data->{$table} as $row) {
				if ($row->$column > $maxid) {
					$maxid = $row->$column;
				}
			}
			$props->autoincrement = $maxid;
		}
		$extra = array();
		foreach ($props as $prop => $value) {
			$extra[] = $prop . ":" . $value;
		}
		$columnSchema->title = $title;
		if (count($extra) > 0) {
			$columnSchema->title .= ' [' . implode(', ', $extra) . ']';
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Set or remove the title of a table.
	 *
	 * @access public
	 * @param string $table table name
	 * @param mixed $title the title content. If FALSE, remove the title
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setTableTitle($table, $title = false) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		$tableSchema = &$this->db->schema->properties->{$table};
		if ((!isset($tableSchema->title) || $tableSchema->title == '') && $title === false) {
			return; // nothing to do
		}
		if (isset($tableSchema->title) && $tableSchema->title == $title) {
			return; // nothing to do
		}
		$this->beginTransaction();
		if ($title === false) {
			$tableSchema->title == '';
		} else {
			$tableSchema->title = $title; 
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Set or remove the description of a table.
	 *
	 * @access public
	 * @param string $table table name
	 * @param mixed $description the description content. If FALSE, remove the description
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setTableDescription($table, $description = false) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		$tableSchema = &$this->db->schema->properties->{$table};
		if ((!isset($tableSchema->description) || $tableSchema->description == '') && $description === false) {
			return; // nothing to do
		}
		if (isset($tableSchema->description) && $tableSchema->description == $description) {
			return; // nothing to do
		}
		$this->beginTransaction();
		if ($description === false) {
			$tableSchema->description == '';
		} else {
			$tableSchema->description = $description; 
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Set or remove the title of a column.
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $column actual column name 
	 * @param mixed $title the title content. If FALSE, remove the title
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setColumnTitle($table, $column, $title = false) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($this->db->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
		$columnSchema = &$this->db->schema->properties->{$table}->items->properties->$column;
		if ((!isset($columnSchema->title) || $columnSchema->title == '') && $title === false) {
			return; // nothing to do
		}
		if (isset($columnSchema->title) && $columnSchema->title == $title) {
			return; // nothing to do
		}
		$this->beginTransaction();
		if ($title === false) {
			$columnSchema->title == '';
		} else {
			$columnSchema->title = $title; 
		}
		$this->schemaModified = true;
		$this->modified = true;
		$this->commit();
	}

	/**
	 * Set or remove the description of a column.
	 *
	 * @access public
	 * @param string $table table name
	 * @param string $column actual column name 
	 * @param mixed $description the description content. If FALSE, remove the description
	 * @return void
	 * @throws JsonSQLException
	 */
	public function setColumnDescription($table, $column, $description = false) {
		if (!isset($this->db->schema->properties->{$table})) {
			throw new JsonSQLException("table '$table' doesn't exists");
		}
		if (!isset($this->db->schema->properties->{$table}->items->properties->$column)) {
			throw new JsonSQLException("column '$column' doesn't exists in $table");
		}
		$columnSchema = &$this->db->schema->properties->{$table}->items->properties->$column;
		if ((!isset($columnSchema->description) || $columnSchema->description == '') && $description === false) {
			return; // nothing to do
		}
		if (isset($columnSchema->description) && $columnSchema->description == $description) {
			return; // nothing to do
		}
		$this->beginTransaction();
		if ($description === false) {
			$columnSchema->description == '';
		} else {
			$columnSchema->description = $description; 
		}
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
	 * Tokenizes a list of comma separated internal properties and returns an object with these properties.
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

}

?>
