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
abstract class Parser  {

	/**
	 * @var string     SQL_SELECT_KEYWORD
	 */
	const SQL_SELECT_KEYWORD = 'SELECT ';

	/**
	 * @var string     SQL_FROM_KEYWORD
	 */
	const SQL_FROM_KEYWORD = 'FROM ';

	/**
	 * @var string     SQL_WHERE_KEYWORD
	 */
	const SQL_WHERE_KEYWORD = 'WHERE ';

	/**
	 * @var string     SQL_ORDER_BY_KEYWORD
	 */
	const SQL_ORDER_BY_KEYWORD = 'ORDER BY ';

	/**
	 * @var string     SQL_LIMIT_KEYWORD
	 */
	const SQL_LIMIT_KEYWORD = 'LIMIT ';

	/**
	 * @const string   SQL_OFFSET_KEYWORD
	 */
	const SQL_OFFSET_KEYWORD = 'OFFSET ';

	/**
	 * @var string     SQL_UPDATE_KEYWORD
	 */
	const SQL_UPDATE_KEYWORD = 'UPDATE ';

	/**
	 * @var string     SQL_CREATE_KEYWORD
	 */
	const SQL_CREATE_KEYWORD = 'CREATE TABLE ';

	/**
	 * @var string     SQL_DELETE_KEYWORD
	 */
	const SQL_DELETE_KEYWORD = 'DELETE FROM ';

	/**
	 * A pointer on  the JsonSQL owner.
	 *
	 * @var \App\G6K\Manager\Json\JsonSQL The JsonSQL instance
	 * @access protected
	 */
	protected $jsonsql = null;

	/**
	 * A pointer on JSON database engine.
	 *
	 * @var \App\G6K\Manager\Json\JsonSQL\Engine $engine The JsonSQL engine
	 * @access protected
	 */
	protected $engine = null;

	/**
	 * The sql request.
	 *
	 * @var string
	 * @access protected
	 */
	protected $sql = null;

	/**
	 * Constructor of class Parser
	 *
	 * @access  protected
	 * @param   \App\G6K\Manager\Json\JsonSQL $jsonsql The JsonSQL instance
	 * @param   string $sql The sql request
	 * @return  void
	 *
	 */
	protected function __construct(JsonSQL $jsonsql, $sql) {
		$this->jsonsql = $jsonsql;
		$this->sql = $sql;
		$this->engine = $this->jsonsql->getEngine();
	}

	/**
	 * Parser factory.
	 *
	 * @access protected
	 * @static
	 * @param string $sql The sql statement
	 * @return \App\G6K\Manager\Json\JsonSQL\Parser The parsed request
	 * @throws JsonSQLException
	 */
	public static function create(JsonSQL $jsonsql, $sql) {
		$sql = preg_replace("/[\r\n\t]/", " ", $sql); // replace whitespaces by space
		$sql = preg_replace('/(--.*)|(((\/\*)+?[\w\W]+?(\*\/)+))/', '', $sql); // strip comments
		if (preg_match('/^\s*select\s+/i', $sql)) {
			return new DMLParser($jsonsql, $sql);
		} elseif (preg_match('/^\s*insert\s+into/i', $sql)) {
			return new DMLParser($jsonsql, $sql);
		} elseif (preg_match('/^\s*update/i', $sql)) {
			return new DMLParser($jsonsql, $sql);
		} elseif (preg_match('/^\s*delete\s+from\s+/i', $sql)) {
			return new DMLParser($jsonsql, $sql);
		} elseif (preg_match('/^\s*create\s+/i', $sql)) {
			return new DDLParser($jsonsql, $sql);
		} elseif (preg_match('/^\s*alter\s+/i', $sql)) {
			return new DDLParser($jsonsql, $sql);
		} elseif (preg_match('/^\s*truncate\s+/i', $sql)) {
			return new DMLParser($jsonsql, $sql);
		} elseif (preg_match('/^\s*drop\s+/i', $sql)) {
			return new DDLParser($jsonsql, $sql);
		} else {
			throw new JsonSQLException("syntax error near : " . substr($sql, 0, 6));
		}
	}

	/**
	 * Parses the sql statement.
	 *
	 * @access public
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	public function parse() {
		if (preg_match('/^\s*select\s+/i', $this->sql)) {
			return $this->parseSetOperations($this->sql);
		} elseif (preg_match('/^\s*insert\s+into/i', $this->sql)) {
			return $this->parseInsert($this->sql);
		} elseif (preg_match('/^\s*update/i', $this->sql)) {
			return $this->parseUpdate($this->sql);
		} elseif (preg_match('/^\s*delete\s+from\s+/i', $this->sql)) {
			return $this->parseDelete($this->sql);
		} elseif (preg_match('/^\s*create\s+/i', $this->sql)) {
			return $this->parseCreate($this->sql);
		} elseif (preg_match('/^\s*alter\s+/i', $this->sql)) {
			return $this->parseAlter($this->sql);
		} elseif (preg_match('/^\s*truncate\s+/i', $this->sql)) {
			return $this->parseTruncate($this->sql);
		} elseif (preg_match('/^\s*drop\s+/i', $this->sql)) {
			return $this->parseDropTable($this->sql);
		} else {
			throw new JsonSQLException("syntax error near : " . substr($this->sql, 0, 6));
		}
	}

	/**
	 * Parses a sql select request
	 *
	 * @access protected
	 * @param string $sql The select statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	abstract protected function parseSelect($sql);

	/**
	 * Parses a sql compound select request containing set operations
	 *
	 * @access protected
	 * @param string $sql The select statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	abstract protected function parseSetOperations($sql);

	/**
	 * Parses a sql insert into statement
	 *
	 * @access protected
	 * @param string $sql The insert into statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	abstract protected function parseInsert($sql);

	/**
	 * Parses a sql update statement
	 *
	 * @access protected
	 * @param string $sql The update statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	abstract protected function parseUpdate($sql);

	/**
	 * Parses a sql delete from statement
	 *
	 * @access protected
	 * @param string $sql The delete from statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	abstract protected function parseDelete($sql);

	/**
	 * Parses a sql create table statement
	 *
	 * @access protected
	 * @param string $sql The create table statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	abstract protected function parseCreate($sql);

	/**
	 * Parses a sql alter table statement according to this two BNF syntax :
	 *
	 * @access protected
	 * @param string $sql The create alter statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	abstract protected function parseAlter($sql);

	/**
	 * Parses a sql truncate table statement
	 *
	 * @access protected
	 * @param string $sql The truncate table statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	abstract protected function parseTruncate($sql);

	/**
	 * Parses a sql drop table statement
	 *
	 * @access protected
	 * @param string $sql The drop table statement
	 * @return object The parsed request
	 * @throws JsonSQLException
	 */
	abstract protected function parseDropTable($sql);

}

?>
