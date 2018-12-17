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

namespace App\G6K\Manager\Json;

use App\G6K\Manager\Json\JsonSQL\Parser;
use App\G6K\Manager\Json\JsonSQL\Engine;
use App\G6K\Manager\Json\JsonSQL\Statement;
use App\G6K\Manager\Json\JsonSQL\JsonSQLException;

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
class JsonSQL  {

	/**
	 * List of class instances.
	 * there is one instance per database
	 *
	 * @static
	 * @var array $_instance 
	 * @access private
	 */
 	private static $_instance = array();

	/**
	 * The JsonSQL engine attached to this instance 
	 *
	 * @var \App\G6K\Manager\Json\JsonSQL\Engine
	 * @access private
	 */
	private $engine = null;

	/**
	 * Represents a connection between PHP and a json database in memory.
	 *
	 * @access private
	 * @throws JsonSQLException
	 */
	private function __construct() {
		$this->engine = new Engine($this);
	}

	/**
	 * Open a json database
	 *
	 * @access public
	 * @static
	 * @see JsonSQL::create()
	 * @param string $name The name of json database (without the file extension)
	 * @param boolean $create if true, creates the database if it doesn't exists
	 * @return \App\G6K\Manager\Json\JsonSQL The JsonSQL instance
	 */
	public static function open($name, $create = false) {
		if(!isset(self::$_instance[$name])) {
			self::$_instance[$name] = new JsonSQL();
		}
		$instance = self::$_instance[$name];
		$instance->engine->open($name, $create);
		return $instance;
	}

	/**
	 * Creates a json database then open it
	 *
	 * @access public
	 * @static
	 * @param string $name The name of json database (without the file extension)
	 * @return \App\G6K\Manager\Json\JsonSQL The JsonSQL instance
	 * @throws JsonSQLException
	 */
	public static function create($name) {
		if (file_exists($name.'.json')) {
			throw new JsonSQLException("database '$name' already exists");
		}
		return self::open($name, true);
	}

	/**
	 * Returns the JsonSQL engine attached to this instance 
	 *
	 * @access  public
	 * @return  \App\G6K\Manager\Json\JsonSQL\Engine The JsonSQL engine
	 *
	 */
	public function getEngine() {
		return $this->engine;
	}

	/**
	 * Returns a pointer to the json schema object
	 *
	 * @access public
	 * @return object The json schema object
	 */
	public function schema() {
		return $this->engine->schema();
	}

	/**
	 * Returns a ArrayIterator on the rows of the table $name
	 *
	 * @access public
	 * @param string $name The table name
	 * @return \ArrayIterator The ArrayIterator
	 */
	public function table($name) {
		return $this->engine->table($name);
	}

	/**
	 * Prepares a statement for execution and returns a statement object
	 *
	 * @access public
	 * @param string $sql a valid SQL statement 
	 * @return  \App\G6K\Manager\Json\JsonSQL\Statement a Statement instance
	 */
	public function prepare($sql) {
		if (extension_loaded('apc') && ini_get('apc.enabled')) {
			$request = $this->engine->loadRequestFromCache($sql);
		} else {
			$parser = Parser::create($this, $sql);
			$request = $parser->parse();
		}
		return Statement::create($this, $request);
	}

	/**
	 * Executes an SQL statement in a single function call, returning the result set (if any) 
	 * returned by the statement as a Statement object.
	 *
	 * @access public
	 * @param string $sql a valid SQL statement to prepare and execute.
	 * @return \App\G6K\Manager\Json\JsonSQL\Statement a Statement instance
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
	 * @param string $sql The valid SQL statement to prepare and execute.
	 * @return int The number of rows that were modified or deleted by the SQL statement
	 */
	public function exec($sql) {
		$statement = $this->query($sql);
		return $statement->rowCount();
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
		return $this->engine->quote($string, $type);
	}

	/**
	 * Returns the ID of the last inserted row.
	 *
	 * @access public
	 * @return string a string representing the row ID of the last row that was inserted into the database
	 */
	public function lastInsertId() {
		return $this->engine->lastInsertId();
	}

	/**
	 * Initiates a transaction.
	 *
	 * @access public
	 * @return bool always true
	 */
	public function beginTransaction() {
		return $this->engine->beginTransaction();
	}

	/**
	 * Commits a transaction.
	 *
	 * @access public
	 * @return bool  always true
	 */
	public function commit() {
		return $this->engine->commit();
	}

	/**
	 * Rolls back the current transaction, as initiated by beginTransaction().
	 *
	 * @access public
	 * @return bool  always true
	 */
	public function rollBack() {
		return $this->engine->rollBack();
	}

	/**
	 * Checks if inside a transaction.
	 *
	 * @access public
	 * @return bool true if a transaction is currently active, and false if not.
	 */
	public function inTransaction() {
		return $this->engine->inTransaction();
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
		$this->engine->insert($table, $row);
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
		$this->engine->delete($table, $index);
	}

	/**
	 * Replaces a table row by another
	 *
	 * @access public
	 * @param string $table The table name
	 * @param int $index The position of the row in the table
	 * @param object $row The new row
	 * @return void
	 * @throws JsonSQLException
	 */
	public function replace($table, $index, $row) {
		$this->engine->replace($table, $index, $row);
	}

	/**
	 * Creates a table in the database
	 *
	 * @access public
	 * @param string $table The table name
	 * @param object $columns The columns definition 
	 * @param array $required The list of required columns
	 * @param array $foreignkeys The list of foreign keys definition
	 * @param bool $ifnotexists if true, don't throw an error if the table already exists
	 * @return void
	 * @throws JsonSQLException
	 */
	public function createTable($table, $columns, $required, $foreignkeys, $ifnotexists = false) {
		$this->engine->createTable($table, $columns, $required, $foreignkeys, $ifnotexists);
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
		$this->engine->truncate($table);
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
		$this->engine->dropTable($table, $ifexists);
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
		$this->engine->renameTable($table, $newname);
	}

	/**
	 * Adds a column in a table of the database
	 *
	 * @access public
	 * @param string $table The table name
	 * @param string $column The name of the new column
	 * @param object $columnDef The column definition 
	 * @param array $required an array with the column name if required
	 * @return void
	 * @throws JsonSQLException
	 */
	public function addColumn($table, $column, $columnDef, $required = array()) {
		$this->engine->addColumn($table, $column, $columnDef, $required);
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
		$this->engine->renameColumn($table, $column, $newname);
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
		$this->engine->dropColumn($table, $column, $ifexists);
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
		$this->engine->setColumnType($table, $column, $type, $format, $datatype);
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
		$this->engine->setNotNull($table, $column, $allownull);
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
		$this->engine->setDefault($table, $column, $default);
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
		$this->engine->setPrimaryKey($table, $column, $remove);
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
		$this->engine->setAutoincrement($table, $column, $remove);
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
		$this->engine->setTableTitle($table, $title);
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
		$this->engine->setTableDescription($table, $description);
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
		$this->engine->setColumnTitle($table, $column, $title);
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
		$this->engine->setColumnDescription($table, $column, $description);
	}

	/**
	 * Saves the current database and/or its schema on the file system
	 *
	 * @access public
	 * @return void
	 * @throws JsonSQLException
	 */
	public function save() {
		$this->engine->save();
	}

}

?>
