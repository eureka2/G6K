<?php

/*
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
	 * A pointer on  the JsonSQL owner.
	 *
	 * @var object
	 * @access protected
	 */
	protected $jsonsql = null;

	/**
	 * A pointer on  JSON database engine.
	 *
	 * @var object
	 * @access protected
	 */
	protected $engine = null;

	/**
	 * the sql request.
	 *
	 * @var string
	 * @access protected
	 */
	protected $sql = null;

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
	 * @param string $sql the sql statement
	 * @return object the parsed request
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
	 * @return object the parsed request
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

}

?>
