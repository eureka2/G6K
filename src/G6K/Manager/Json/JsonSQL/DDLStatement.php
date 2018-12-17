<?php

/*
The MIT License (MIT)

Copyright (c) 2016-2018 Jacques Archimède

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
 *  The class JsonSQLStatement Represents a prepared statement and, 
 *  after the statement is executed, an associated result set.
 */
class DDLStatement extends Statement {

	/**
	 * Class Constructor
	 *
	 * @access public
	 * @param JsonSQL $jsonsql the JsonSQL instance
	 * @param \stdClass $request the prepared statement
	 */
	public function __construct(JsonSQL $jsonsql, \stdClass &$request) {
		parent::__construct($jsonsql, $request);
	}

	/**
	 * Executes a prepared 'create table' statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeCreateTable() {
		$this->engine->createTable($this->request->table, $this->request->columns, $this->request->required, $this->request->foreignkeys, $this->request->ifnotexists);
		if (isset( $this->request->select) && $this->request->withdata) {
			$stmt = Statement::create($this->jsonsql, $this->request->select);
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
				$this->engine->insert($this->request->table, $row);
			});
			$this->rowCount = $stmt->rowCount();
		} else {
			$this->rowCount = 0;
		}
		return true;
	}

	/**
	 * Executes a prepared 'alter table' statement.
	 *
	 * @access protected
	 * @return bool TRUE.
	 */
	protected function executeAlterTable() {
		switch ($this->request->alter) {
			case 'rename table':
				$this->engine->renameTable($this->request->table, $this->request->newtable);
				break;
			case 'rename column':
				$this->engine->renameColumn($this->request->table, $this->request->column->name, $this->request->column->newname);
				break;
			case 'drop column':
				$this->engine->dropColumn($this->request->table, $this->request->column->name, $this->request->column->ifexists);
				break;
			case 'modify title':
				$this->engine->setTableTitle($this->request->table, $this->request->title);
				break;
			case 'drop title':
				$this->engine->setTableTitle($this->request->table, false);
				break;
			case 'modify comment':
				$this->engine->setTableDescription($this->request->table, $this->request->comment);
				break;
			case 'drop comment':
				$this->engine->setTableDescription($this->request->table, false);
				break;
			case 'modify column':
				switch ($this->request->column->action) {
					case 'set type':
						$this->engine->setColumnType($this->request->table, $this->request->column->name, $this->request->column->type, $this->request->column->format, $this->request->column->datatype);
						break;
					case 'set not null':
						$this->engine->setNotNull($this->request->table, $this->request->column->name, false);
						break;
					case 'set primary key':
						$this->engine->setPrimaryKey($this->request->table, $this->request->column->name, false);
						break;
					case 'set autoincrement':
						$this->engine->setAutoincrement($this->request->table, $this->request->column->name, false);
						break;
					case 'set default':
						$this->engine->setDefault($this->request->table, $this->request->column->name, $this->request->column->default);
						break;
					case 'set title':
						$this->engine->setColumnTitle($this->request->table, $this->request->column->name, $this->request->column->title);
						break;
					case 'set comment':
						$this->engine->setColumnDescription($this->request->table, $this->request->column->name, $this->request->column->comment);
						break;
					case 'remove not null':
						$this->engine->setNotNull($this->request->table, $this->request->column->name, true);
						break;
					case 'remove primary key':
						$this->engine->setPrimaryKey($this->request->table, $this->request->column->name, true);
						break;
					case 'remove autoincrement':
						$this->engine->setAutoincrement($this->request->table, $this->request->column->name, true);
						break;
					case 'remove default':
						$this->engine->setDefault($this->request->table, $this->request->column->name, false);
						break;
					case 'remove title':
						$this->engine->setColumnTitle($this->request->table, $this->request->column->name, false);
						break;
					case 'remove comment':
						$this->engine->setColumnDescription($this->request->table, $this->request->column->name, false);
						break;
					default:
						return false;
				}
				break;
			case 'add column':
				$this->engine->addColumn($this->request->table, $this->request->column->name, $this->request->column->definition, $this->request->required);
				break;
			default:
				return false;
		}
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
			$this->engine->dropTable($table, $this->request->ifexists);
		}
		$this->rowCount = 0;
		return true;
	}

	protected function executeCompoundSelect() {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function executeSelect() {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function executeInsert() {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function executeUpdate() {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function executeDelete() {
		throw new JsonSQLException("JsonSQL internal error");
	}

	protected function executeTruncate() {
		throw new JsonSQLException("JsonSQL internal error");
	}

}

?>
