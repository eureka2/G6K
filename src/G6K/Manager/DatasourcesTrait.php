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
 
namespace App\G6K\Manager;

use Symfony\Component\Translation\TranslatorInterface;

use App\G6K\Model\Database;

use App\G6K\Manager\DatasourcesHelper;
use App\G6K\Manager\DOMClient as Client;
use App\G6K\Manager\ResultFilter;
use App\G6K\Manager\Json\JsonSQL\Parser;
use App\G6K\Manager\ExpressionParser\DateFunction;

/**
 *
 * This class implements common functions needed in G6KBundle controllers.
 *
 * @copyright Jacques Archimède
 *
 */
trait DatasourcesTrait {

	/**
	 * Constructs a Database object 
	 *
	 * @access  protected
	 * @param   int $dsid The datasource ID
	 * @param   bool $withDbName (default: true) if false, the name of the database will not be inserted in the dsn string.
	 * @return  \App\G6K\Model\Database The Database object
	 *
	 */
	protected function getDatabase($dsid, $withDbName = true) {
		$helper = new DatasourcesHelper($this->datasources);
		$datasources = $this->datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
		$dbid = (int)$datasources[0]['database'];
		$parameters = array(
			'database_user' => $this->getConfigParameter('database_user'),
			'database_password' => $this->getConfigParameter('database_password')
		);
		return $helper->getDatabase($parameters, $dbid, $this->databasesDir, $withDbName);
	}

	/**
	 * Connects to the database
	 *
	 * @access  protected
	 * @param   string $dbschema The database name
	 * @param   string $dbtype The database type
	 * @return  void
	 *
	 */
	protected function connectDatabase($dbschema, $dbtype) {
		$this->database = new Database(null, $this->databasesDir, 1, $dbtype, str_replace('-', '_', $dbschema));
		if ($this->parameters['database_host'] !== null && $this->parameters['database_host'] != "") {
			$this->database->setHost($this->parameters['database_host']);
		}
		if ($this->parameters['database_port'] !== null && $this->parameters['database_port'] != "") {
			$this->database->setPort((int)$this->parameters['database_port']);
		}
		if ($this->parameters['database_user'] !== null && $this->parameters['database_user'] != "") {
			$this->database->setUser($this->parameters['database_user']);
		}
		if ($this->parameters['database_password'] !== null && $this->parameters['database_password'] != "") {
			$this->database->setPassword($this->parameters['database_password']);
		}
		$this->database->connect(false);
	}

	/**
	 * Returns the list of tables of a database
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  array|string|bool|null The list of tables
	 *
	 */
	protected function tablesList(Database $database) {
		switch ($database->getType()) {
			case 'jsonsql':
				$tableslist = array();
				foreach($database->getConnection()->schema()->properties as $tbl => $prop) {
					$tableslist[] = array(
						'type' => 'table',
						'name' => $tbl,
						'tbl_name' => $tbl
					);
				}
				break;
			case 'sqlite':
				$tableslist =  $database->query("SELECT * FROM sqlite_master WHERE type='table' AND tbl_name NOT LIKE 'sqlite_%'");
				break;
			case 'pgsql':
				$tableslist = $database->query("SELECT 'table' as type, table_name as name, table_name as tbl_name FROM information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' and table_name != 'fos_user'");
				break;
			case 'mysql':
			case 'mysqli':
				$dbname = str_replace('-', '_', $database->getName());
				$tableslist = $database->query("SELECT 'table' as type, table_name as name, table_name as tbl_name FROM information_schema.tables where table_schema = '$dbname' and table_name != 'fos_user';");
				break;
			default:
				$tableslist = null;
		}
		return $tableslist;
	}

	/**
	 * Returns informations about a table of a database
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   string $table The table name
	 * @return  array|string|bool|null Informations about a table
	 *
	 */
	protected function tableInfos(Database $database, $table) {
		switch ($database->getType()) {
			case 'jsonsql':
				$tableinfos = array();
				$cid = 0;
				foreach($database->getConnection()->schema()->properties->{$table}->items->properties as $name => $column) {
					$notnull = in_array($name, $database->getConnection()->schema()->properties->{$table}->items->required);
					$tableinfos[] = array(
						'cid' => ++$cid,
						'name' => $name,
						'type' => strtoupper($column->type),
						'notnull' => $notnull ? 1 : 0,
						'dflt_value' => isset($column->default) ? $column->default : ''
					);
				}
				break;
			case 'sqlite':
				$tableinfos = $database->query("PRAGMA table_info('".$table."')");
				foreach($tableinfos as &$info) {
					$info['filtertext'] = '';
				}
				break;
			case 'pgsql':
				$tableinfos = $database->query("SELECT ordinal_position as cid, column_name as name, data_type as type, is_nullable, column_default as dflt_value FROM information_schema.columns where table_name = '$table' order by ordinal_position");
				foreach($tableinfos as &$info) {
					$info['notnull'] = $info['is_nullable'] == 'NO' ? 1 : 0;
				}
				break;
			case 'mysql':
			case 'mysqli':
				$dbname = $database->getName();
				$tableinfos = $database->query("SELECT ordinal_position as cid, column_name as name, data_type as type, is_nullable, column_default as dflt_value, column_key FROM information_schema.columns where table_schema = '$dbname' and table_name = '$table' order by ordinal_position");
				foreach($tableinfos as &$info) {
					$info['notnull'] = $info['is_nullable'] == 'NO' ? 1 : 0;
					$info['pk'] = $info['column_key'] == 'PRI' ? 1 : 0;
				}
				break;
			default:
				$tableinfos = null;
		}
		return $tableinfos;
	}

	/**
	 * Returns informations about the columns of a table
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   string $table The table name
	 * @return  array Informations about the columns
	 *
	 */
	protected function infosColumns(Database $database, $table) {
		$infosColumns = array();
		$tableinfos = $this->tableInfos($database, $table);
		foreach($tableinfos as $i => $info) {
			$infosColumns[$info['name']]['notnull'] = $info['notnull'];
			$infosColumns[$info['name']]['dflt_value'] = $info['dflt_value'];
			$datasources = $this->datasources->xpath("/DataSources/DataSource[(@type='internal' or @type='database') and @database='".$database->getId()."']");
			$column = null;
			foreach ($datasources[0]->children() as $child) {
				if ($child->getName() == 'Table' && strcasecmp((string)$child['name'], $table) == 0) {
					foreach ($child->children() as $grandson) {
						if ($grandson->getName() == 'Column' && strcasecmp((string)$grandson['name'], $info['name']) == 0) {
							$column = $grandson;
							break;
						}
					}
					break;
				}
			}
			$infosColumns[$info['name']]['g6k_type'] = ($column !== null) ? (string)$column['type'] : $info['type'];
			$infosColumns[$info['name']]['type'] = $info['type'];
			$infosColumns[$info['name']]['label'] = ($column !== null) ? (string)$column['label'] : $info['name'];
			$infosColumns[$info['name']]['description'] = ($column !== null) ? (string)$column->Description : '';
			if ($infosColumns[$info['name']]['g6k_type'] == 'choice' && $column !== null && $column->Choices) {
				if ($column->Choices->Source) {
					$source = $column->Choices->Source;
					$infosColumns[$info['name']]['choicesource']['datasource'] = (string)$source['datasource'];
					$infosColumns[$info['name']]['choicesource']['returnType'] = (string)$source['returnType'];
					$infosColumns[$info['name']]['choicesource']['request'] = (string)$source['request'];
					$infosColumns[$info['name']]['choicesource']['valueColumn'] = (string)$source['valueColumn'];
					$infosColumns[$info['name']]['choicesource']['labelColumn'] = (string)$source['labelColumn'];
					$infosColumns[$info['name']]['choicesource']['returnPath'] = (string)$source['returnPath'];
					$infosColumns[$info['name']]['choicesource']['separator'] = (string)$source['separator'];
					$infosColumns[$info['name']]['choicesource']['delimiter'] = (string)$source['delimiter'];
					$result = $this->executeSource($source);
					$choices = $this->getChoicesFromSource($source, $result);
				} else {
					$choices = array();
					foreach ($column->Choices->Choice as $choice) {
						$choices[(string)$choice['value']] = (string)$choice['label'];
					}
				}
				$infosColumns[$info['name']]['choices'] = $choices;
			}
		}
		return $infosColumns;
	}

	/**
	 * Constructs a form fields with informations about the columns of a table
	 *
	 * @access  protected
	 * @param   string $table The table name
	 * @param   array $infosColumns Informations about the columns
	 * @return  array
	 *
	 */
	protected function infosColumnsToForm($table, $infosColumns) {
		$fields = array();
		$types = array();
		$notnulls = array();
		$defaults = array();
		foreach($infosColumns as $name => $info) {
			if ($name != 'id') {
				$fields[] = $name;
				$types[] = $info['g6k_type'];
				$notnulls[] = $info['notnull'];
				$defaults[] = $info['dflt_value'];
			}
		}
		return array(
			'table-name' => $table,
			'field' => $fields,
			'type' => $types,
			'notnull' => $notnulls,
			'default' => $defaults,
		);
	}

	/**
	 * Retrieves the choice values of a data in the result list of a query on a data source
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $source The source definition extracted from DataSources.xml
	 * @param   array|null $result The result list of a query
	 * @return  array The choices list
	 *
	 */
	protected function getChoicesFromSource($source, $result) {
		$choices = array();
		if ($result !== null) {
			switch ((string)$source['returnType']) {
				case 'json':
					$valueColumn = (string)$source['valueColumn'];
					if (is_numeric($valueColumn)) {
						$valueColumn = (int)$valueColumn - 1;
					}
					$labelColumn = (string)$source['labelColumn'];
					if (is_numeric($labelColumn)) {
						$labelColumn = (int)$labelColumn - 1;
					}
					foreach ($result as $row) {
						$choices[$row[$valueColumn]] =  $row[$labelColumn];
					}
					break;
				case 'xml':
					$valueColumn = (string)$source['valueColumn'];
					$labelColumn = (string)$source['labelColumn'];
					foreach ($result as $row) {
						if (preg_match("/^@(.+)$", $valueColumn, $m1)) {
							if (preg_match("/^@(.+)$", $labelColumn, $m2)) {
								$choices[(string)$row[$m1[1]]] = (string)$row[$m2[1]];
							} else {
								$choices[(string)$row[$m1[1]]] = $row->$labelColumn;
							}
						} elseif (preg_match("/^@(.+)$", $labelColumn, $m2)) {
							$choices[$row->$valueColumn] = (string)$row[$m2[1]];
						} else {
							$choices[$row->$valueColumn] = $row->$labelColumn;
						}
					}
					break;
				case 'assocArray':
					$valueColumn = strtolower((string)$source['valueColumn']);
					$labelColumn = strtolower((string)$source['labelColumn']);
					foreach ($result as $row) {
						$choices[$row[$valueColumn]] =  $row[$labelColumn];
					}
					break;
				case 'csv':
					$valueColumn = (int)$source['valueColumn'] - 1;
					$labelColumn = (int)$source['labelColumn'] - 1;
					foreach ($result as $row) {
						$choices[$row[$valueColumn]] =  $row[$labelColumn];
					}
					break;
			}
		}
		return $choices;
	}

	/**
	 * Executes the query from a source
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $source The source definition extracted from DataSources.xml
	 * @return  array|string|null The result set of the query
	 *
	 */
	protected function executeSource($source) {
		$ds = (string)$source['datasource'];
		if (is_numeric($ds)) {
			$datasources = $this->datasources->xpath("/DataSources/DataSource[@id='".$ds."']");
		} else {
			$datasources = $this->datasources->xpath("/DataSources/DataSource[@name='".$ds."']");
		}
		switch ((string)$datasources[0]['type']) {
			case 'uri':
				$uri = (string)$datasources[0]['uri'];
				$client = Client::createClient();
				$data = array();
				if ((string)$datasources[0]['method'] == "" || (string)$datasources[0]['method'] == "GET" || (string)$datasources[0]['method'] == "get") {
					$result = $client->get($uri);
				} else {
					$result = $client->post($uri, $data);
				}
				break;
			case 'database':
			case 'internal':
				$databases = $this->datasources->xpath("/DataSources/Databases/Database[@id='".(string)$datasources[0]['database']."']");
				$database = new Database(null, $this->databasesDir, (int)$databases[0]['id'], (string)$databases[0]['type'], (string)$databases[0]['name']);
				if ((string)$databases[0]['host'] != "") {
					$database->setHost((string)$databases[0]['host']);
				}
				if ((string)$databases[0]['port'] != "") {
					$database->setPort((int)$databases[0]['port']);
				}
				if ((string)$databases[0]['user'] != "") {
					$database->setUser((string)$databases[0]['user']);
				}
				if ((string)$databases[0]['password'] != "") {
					$database->setPassword((string)$databases[0]['password']);
				} elseif ((string)$databases[0]['user'] != "") {
					try {
						$host = $this->getConfigParameter('database_host');
						$port = $this->getConfigParameter('database_port');
						$user = $this->getConfigParameter('database_user');
						if ((string)$databases[0]['host'] == $host && (string)$databases[0]['port'] == $port && (string)$databases[0]['user'] == $user) {
							$database->setPassword($this->getConfigParameter('database_password'));
						}
					} catch (\Exception $e) {
					}
				}
				$query = (string)$source['request'];
				$database->connect();
				$result = $database->query($query);
				break;
		}
		return $this->filterResult($result, $source);
	}

	/**
	 * Filters the result set of a query on the source return path
	 *
	 * @access  protected
	 * @param   array|string $result The result set of a query
	 * @param   \SimpleXMLElement $source The source definition extracted from DataSources.xml
	 * @return  array|null The filtered result set
	 *
	 */
	protected function filterResult($result, $source) {
		switch ((string)$source['returnType']) {
			case 'json':
				$json = json_decode($result, true);
				return ResultFilter::filter("json", $json, (string)$source['returnPath']);
			case 'assocArray':
				return $this->filterResultByLines($result, (string)$source['returnPath']);
			case 'xml':
				return ResultFilter::filter("xml", $result, (string)$source['returnPath']);
			case 'csv':
				$result = ResultFilter::filter("csv", $result, "", array(), (string)$source['separator'], (string)$source['delimiter']);
				return $this->filterResultByLines($result, (string)$source['returnPath']);
		}
		return null;
	}

	/**
	 * Filters the result set of a query on the source return path
	 *
	 * @access  protected
	 * @param   array $result The result set of a query
	 * @param   string $filter The filter
	 * @return  array The filtered result set
	 *
	 */
	protected function filterResultByLines($result, $filter) {
		if ($filter == '') {
			return $result;
		}
		$filtered = array();
		$ranges = explode("/", $filter);
		$len = count($result);
		foreach ($ranges as $range) {
			$lines = explode("-", trim($range));
			if (count($lines) == 1) {
				$line = (int)trim($lines[0]) - 1;
				if ($line >= 0 && $line < $len) {
					$filtered[] = $result[$line];
				}
			} elseif (count($lines) == 2) {
				$from = max(0, (int)trim($lines[0]) - 1);
				$to = (int)trim($lines[1]) - 1;
				if ($from <= $to) {
					for ($i = $from; $i <= $to && $i < $len; $i++) {
						$filtered[] = $result[$i];
					}
				}
			}
		}
		return $filtered;
	}

	/**
	 * Inserts a row into a table
	 *
	 * @access  protected
	 * @param   array $row The row to insert
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   \Symfony\Component\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @param   bool $restore (default: false) true if the row is to be restored, false otherwise
	 * @return  string|bool
	 *
	 */
	protected function insertRowIntoTable($row, $table, Database $database, TranslatorInterface $translator = null, $restore = false) {
		$infosColumns = $this->infosColumns($database, $table);
		$insertNames = array();
		$insertValues = array();
		foreach($infosColumns as $name => $info) {
			$value = isset($row[$name]) ? $row[$name] : ($info['g6k_type'] == 'boolean' ? '0' : null);
			if (($check = $this->checkColumnValue($info, $value, $translator)) !== true) {
				return $check;
			}
			if ($restore || $name != 'id') {
				$insertNames[] = $name;
				if ($value === null || $value == '') {
					$insertValues[] = "NULL";
				} else if ($info['g6k_type'] == 'date') {
					$insertValues[] = $database->quote(DateFunction::parseDate('d/m/Y', substr($value, 0, 10))->format('Y-m-d'));
				} else if ($info['g6k_type'] == 'multichoice') {
					$insertValues[] = $database->quote(json_encode($value));
				} else if ( $info['g6k_type'] == 'text' || preg_match("/^(text|char|varchar)/i", $info['type'])) {
					$insertValues[] = $database->quote($value);
				} else  {
					$insertValues[] = str_replace(",", ".", $value);
				}
			}
		}
		$sql = "INSERT INTO ".$table." (".implode(', ', $insertNames).") VALUES (".implode(', ', $insertValues).")";
		try {
			$database->exec($sql);
		} catch (\Exception $e) {
			if ($translator !== null) {
				return $translator->trans("Can't insert into %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
			} else {
				return sprintf("Can't insert into %s : %s", $table, $e->getMessage());
			}
		}
		return true;
	}

	/**
	 * Updates a table row
	 *
	 * @access  protected
	 * @param   array $row The row
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   \Symfony\Component\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @return  bool|string
	 *
	 */
	protected function updateRowInTable($row, $table, Database $database, TranslatorInterface $translator = null) {
		$infosColumns = $this->infosColumns($database, $table);
		$updateFields = array();
		foreach($infosColumns as $name => $info) {
			$value = isset($row[$name]) ? $row[$name] : ($info['g6k_type'] == 'boolean' ? '0' : null);
			if (($check = $this->checkColumnValue($info, $value, $translator)) !== true) {
				return $check;
			}
			if ($name != 'id') {
				if ($value === null || $value == '') {
					$updateFields[] = $name . "=NULL";
				} else if ($info['g6k_type'] == 'date') {
					$updateFields[] = $name . "='" . DateFunction::parseDate('d/m/Y', substr($value, 0, 10))->format('Y-m-d') . "'";
				} else if ($info['g6k_type'] == 'multichoice') {
					$updateFields[] = $name . "='" . $database->quote(json_encode($value)) . "'";
				} else if ( $info['g6k_type'] == 'text' || preg_match("/^(text|char|varchar)/i", $info['type'])) {
					$updateFields[] = $name . "=" . $database->quote($value);
				} else  {
					$value = str_replace(",", ".", $value);
					$updateFields[] = $name . "=" . $value;
				}
			}			
		}
		$sql = Parser::SQL_UPDATE_KEYWORD.$table." SET ".implode(', ', $updateFields)." ".Parser::SQL_WHERE_KEYWORD."id=".$row['id'];
		try {
			$database->exec($sql);
		} catch (\Exception $e) {
			if ($translator !== null) {
				return $translator->trans("Can't update %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
			} else {
				return sprintf("Can't update %s : %s", $table, $e->getMessage());
			}
		}
		return true;
	}

	/**
	 * Deletes a row from a table
	 *
	 * @access  protected
	 * @param   array $row The row
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   \Symfony\Component\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @return  string|true
	 *
	 */
	protected function deleteRowFromTable($row, $table, Database $database, TranslatorInterface $translator = null) {
		try {
			$database->exec(Parser::SQL_DELETE_KEYWORD.$table." WHERE id=".$row['id']);
		} catch (\Exception $e) {
			if ($translator !== null) {
				return $translator->trans("Can't delete from %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
			} else {
				return sprintf("Can't delete from %s : %s", $table, $e->getMessage());
			}
		}
		return true;
	}

	/**
	 * Checks the value of a column
	 *
	 * @access  protected
	 * @param   array $info Informations about the column
	 * @param   string|null $value The value to check
	 * @param   \Symfony\Component\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @return  string|bool An error message or true if no error.
	 *
	 */
	protected function checkColumnValue($info, $value, TranslatorInterface $translator = null) {
		if ($value === null || $value == '') {
			if ($info['notnull'] == 1) {
				if ($translator !== null) {
					return $translator->trans("The field '%field%' is required", array('%field%' => $info['label']));
				} else {
					return sprintf("The field '%s' is required", $info['label']);
				}
			} else {
				return true;
			}
		}
		switch ($info['g6k_type']) {
			case 'date':
				if (! preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $value)) {
					if ($translator !== null) {
						return $translator->trans("The field '%field%' is not a valid date", array('%field%' => $info['label']));
					} else {
						return sprintf("The field '%s' is not a valid date", $info['label']);
					}
				}
				break;
			case 'boolean':
				if ( ! in_array($value, array('0', '1', 'false', 'true'))) {
					if ($translator !== null) {
						return $translator->trans("The field '%field%' is invalid", array('%field%' => $info['label']));
					} else {
						return sprintf("The field '%s' is invalid", $info['label']);
					}
				}
				break;
			case 'number': 
				$value = str_replace(",", ".", $value);
				if (! is_numeric($value)) {
					if ($translator !== null) {
						return $translator->trans("The field '%field%' is not a number", array('%field%' => $info['label']));
					} else {
						return sprintf("The field '%s' is not a number", $info['label']);
					}
				}
				break;
			case 'integer': 
				if (! ctype_digit ( $value )) {
					if ($translator !== null) {
						return $translator->trans("The field '%field%' is not a number", array('%field%' => $info['label']));
					} else {
						return sprintf("The field '%s' is not a number", $info['label']);
					}
				}
				break;
			case 'day': 
				if (! ctype_digit ( $value ) || (int)$value > 31) {
					if ($translator !== null) {
						return $translator->trans("The field '%field%' is invalid", array('%field%' => $info['label']));
					} else {
						return sprintf("The field '%s' is invalid", $info['label']);
					}
				}
				break;
			case 'month': 
				if (! ctype_digit ( $value ) || (int)$value > 12 ) {
					if ($translator !== null) {
						return $translator->trans("The field '%field%' is invalid", array('%field%' => $info['label']));
					} else {
						return sprintf("The field '%s' is invalid", $info['label']);
					}
				}
				break;
			case 'year': 
				if (! ctype_digit ( $value ) || strlen($value) != 4 ) {
					if ($translator !== null) {
						return $translator->trans("The field '%field%' is not a valid year", array('%field%' => $info['label']));
					} else {
						return sprintf("The field '%s' is not a valid year", $info['label']);
					}
				}
				break;
			case 'text': 
			case 'textarea': 
				break;
			case 'money': 
				$value = str_replace(",", ".", $value);
				if (! preg_match("/^\d+(\.\d{1,2})?$/", $value)) {
					if ($translator !== null) {
						return $translator->trans("The field '%field%' is not a valid currency", array('%field%' => $info['label']));
					} else {
						return sprintf("The field '%s' is not a valid currency", $info['label']);
					}
				}
				break;
			case 'choice':
				foreach ($info['choices'] as $val => $label) {
					if ($value == $val) {
						return true;
					}
				}
				if ($translator !== null) {
					return $translator->trans("The field '%field%' is invalid", array('%field%' => $info['label']));
				} else {
					return sprintf("The field '%s' is invalid", $info['label']);
				}
			case 'percent':
				$value = str_replace(",", ".", $value);
				if (! is_numeric($value)) {
					if ($translator !== null) {
						return $translator->trans("The field '%field%' is not numeric", array('%field%' => $info['label']));
					} else {
						return sprintf("The field '%s' is not numeric", $info['label']);
					}
				}
				break;
		}
		return true;
	}
}
