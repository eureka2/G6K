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

use Symfony\Contracts\Translation\TranslatorInterface;

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
	 * @var array      $datatypes Conversion table for SQL datatypes
	 *
	 * @access  protected
	 *
	 */
	protected $datatypes = array(
		// G6K datatypes to SQL datatypes
		'sqlite' => array(
			'array' => 'TEXT',
			'boolean' => 'BOOLEAN',
			'choice' => 'INTEGER',
			'country' => 'INTEGER',
			'date' => 'DATE',
			'day' => 'INTEGER',
			'department' => 'TEXT',
			'integer' => 'INTEGER',
			'money' => 'REAL',
			'month' => 'INTEGER',
			'multichoice' => 'TEXT',
			'number' => 'REAL',
			'percent' => 'REAL',
			'region' => 'INTEGER',
			'text' => 'TEXT',
			'textarea' => 'TEXT',
			'year' => 'INTEGER'
		),
		'pgsql' => array(
			'array' => 'TEXT',
			'boolean' => 'SMALLINT',
			'choice' => 'SMALLINT',
			'country' => 'SMALLINT',
			'date' => 'DATE',
			'day' => 'SMALLINT',
			'department' => 'VARCHAR(3)',
			'integer' => 'INTEGER',
			'money' => 'REAL',
			'month' => 'SMALLINT',
			'multichoice' => 'TEXT',
			'number' => 'REAL',
			'percent' => 'REAL',
			'region' => 'SMALLINT',
			'text' => 'TEXT',
			'textarea' => 'TEXT',
			'year' => 'SMALLINT'
		),
		'mysql' => array(
			'array' => 'TEXT',
			'boolean' => 'TINYINT(1)',
			'choice' => 'INT',
			'country' => 'INT',
			'date' => 'DATE',
			'day' => 'INT',
			'department' => 'VARCHAR(3)',
			'integer' => 'INT',
			'money' => 'FLOAT',
			'month' => 'INT',
			'multichoice' => 'TEXT',
			'number' => 'FLOAT',
			'percent' => 'FLOAT',
			'region' => 'INT',
			'text' => 'TEXT',
			'textarea' => 'TEXT',
			'year' => 'INT'
		),
		'mysqli' => array(
			'array' => 'TEXT',
			'boolean' => 'TINYINT(1)',
			'choice' => 'INT',
			'country' => 'INT',
			'date' => 'DATE',
			'day' => 'INT',
			'department' => 'VARCHAR(3)',
			'integer' => 'INT',
			'money' => 'FLOAT',
			'month' => 'INT',
			'multichoice' => 'TEXT',
			'number' => 'FLOAT',
			'percent' => 'FLOAT',
			'region' => 'INT',
			'text' => 'TEXT',
			'textarea' => 'TEXT',
			'year' => 'INT'
		),
		'jsonsql' => array(
			'array' => 'array',
			'boolean' => 'boolean',
			'choice' => 'integer',
			'country' => 'integer',
			'date' => 'string',
			'day' => 'integer',
			'department' => 'string',
			'integer' => 'integer',
			'money' => 'number',
			'month' => 'integer',
			'multichoice' => 'object',
			'number' => 'number',
			'percent' => 'number',
			'region' => 'integer',
			'text' => 'string',
			'textarea' => 'string',
			'year' => 'integer'
		),
		// SQL datatypes by SQL driver
		'pdo_sqlite' => array(
			'boolean' => 'BOOLEAN',
			'date' => 'DATE',
			'date-time' => 'DATETIME',
			'integer' => 'INTEGER',
			'number' => 'REAL',
			'string' => 'TEXT',
			'time' => 'TIME'
		),
		'pdo_pgsql' => array(
			'boolean' => 'SMALLINT',
			'date' => 'DATE',
			'date-time' => 'TIMESTAMP',
			'integer' => 'INTEGER',
			'number' => 'REAL',
			'string' => 'TEXT',
			'time' => 'TIME'
		),
		'pdo_mysql' => array(
			'boolean' => 'TINYINT(1)',
			'date' => 'DATE',
			'date-time' => 'DATETIME',
			'integer' => 'INT',
			'number' => 'FLOAT',
			'string' => 'TEXT',
			'time' => 'TIME'
		)
	);

	/**
	 * Constructs a Database object 
	 *
	 * @access  protected
	 * @param   int $dsid The datasource ID
	 * @param   \SimpleXMLElement $datasources DataSources.xml content
	 * @param   string|null $databasesDir The database directory ID
	 * @param   bool $withDbName (default: true) if false, the name of the database will not be inserted in the dsn string.
	 * @return  \App\G6K\Model\Database The Database object
	 *
	 */
	protected function getDatabase($dsid, \SimpleXMLElement $datasources, $databasesDir = null, $withDbName = true) {
		$helper = new DatasourcesHelper($datasources);
		$dss = $datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
		$dbid = (int)$dss[0]['database'];
		$parameters = array(
			'database_user' => $this->getConfigParameter('database_user'),
			'database_password' => $this->getConfigParameter('database_password')
		);
		return $helper->getDatabase($parameters, $dbid, $databasesDir, $withDbName);
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
				$dbname = str_replace('-', '_', $database->getName());
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
	 * @param   \SimpleXMLElement $datasources The DataSources.xml content
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   string $table The table name
	 * @return  array Informations about the columns
	 *
	 */
	protected function infosColumns(\SimpleXMLElement $datasources, Database $database, $table) {
		$infosColumns = array();
		$tableinfos = $this->tableInfos($database, $table);
		$dss = $datasources->xpath("/DataSources/DataSource[(@type='internal' or @type='database') and @database='".$database->getId()."']");
		$datasource = $dss[0];
		foreach($tableinfos as $i => $info) {
			$name = $info['name'];
			$infosColumns[$name]['notnull'] = $info['notnull'];
			$infosColumns[$name]['dflt_value'] = $info['dflt_value'];
			$column = null;
			foreach ($datasource->children() as $child) {
				if ($child->getName() == 'Table' && strcasecmp((string)$child['name'], $table) == 0) {
					foreach ($child->children() as $grandson) {
						if ($grandson->getName() == 'Column' && strcasecmp((string)$grandson['name'], $name) == 0) {
							$column = $grandson;
							break;
						}
					}
					break;
				}
			}
			$infosColumns[$name]['g6k_type'] = ($column !== null) ? (string)$column['type'] : $info['type'];
			$infosColumns[$name]['type'] = $info['type'];
			$infosColumns[$name]['label'] = ($column !== null) ? (string)$column['label'] : $name;
			$infosColumns[$name]['description'] = ($column !== null) ? (string)$column->Description : '';
			if ($infosColumns[$name]['g6k_type'] == 'choice' && $column !== null && $column->Choices) {
				if ($column->Choices->Source) {
					$source = $column->Choices->Source;
					$infosColumns[$name]['choicesource']['datasource'] = (string)$source['datasource'];
					$infosColumns[$name]['choicesource']['returnType'] = (string)$source['returnType'];
					$infosColumns[$name]['choicesource']['request'] = (string)$source['request'];
					$infosColumns[$name]['choicesource']['valueColumn'] = (string)$source['valueColumn'];
					$infosColumns[$name]['choicesource']['labelColumn'] = (string)$source['labelColumn'];
					$infosColumns[$name]['choicesource']['returnPath'] = (string)$source['returnPath'];
					$infosColumns[$name]['choicesource']['separator'] = (string)$source['separator'];
					$infosColumns[$name]['choicesource']['delimiter'] = (string)$source['delimiter'];
					$result = $this->executeSource($source, $datasources, $database->getDatabasesDir());
					$choices = $this->getChoicesFromSource($source, $result);
				} else {
					$choices = array();
					foreach ($column->Choices->Choice as $choice) {
						$choices[(string)$choice['value']] = (string)$choice['label'];
					}
				}
				$infosColumns[$name]['choices'] = $choices;
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
		$labels = array();
		$descriptions = array();
		foreach($infosColumns as $name => $info) {
			if ($name != 'id') {
				$fields[] = $name;
				$types[] = $info['g6k_type'];
				$notnulls[] = $info['notnull'];
				$defaults[] = $info['dflt_value'];
				$labels[] = $info['label'];
				$descriptions[] = $info['description'];
			}
		}
		return array(
			'table-name' => $table,
			'field' => $fields,
			'type' => $types,
			'notnull' => $notnulls,
			'default' => $defaults,
			'label' => $labels,
			'description' => $descriptions,
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
	 * @param   \SimpleXMLElement $datasources The DataSources.xml content
	 * @param   string|null       $databasesDir The database directory
	 * @return  array|string|null The result set of the query
	 *
	 */
	protected function executeSource(\SimpleXMLElement $source, \SimpleXMLElement $datasources, $databasesDir = null) {
		$ds = (string)$source['datasource'];
		if (is_numeric($ds)) {
			$dss = $datasources->xpath("/DataSources/DataSource[@id='".$ds."']");
		} else {
			$dss = $datasources->xpath("/DataSources/DataSource[@name='".$ds."']");
		}
		$datasource = $dss[0];
		switch ((string)$datasource['type']) {
			case 'uri':
				$uri = (string)$datasource['uri'];
				$client = Client::createClient();
				$data = array();
				if ((string)$datasource['method'] == "" || (string)$datasource['method'] == "GET" || (string)$datasource['method'] == "get") {
					$result = $client->get($uri);
				} else {
					$result = $client->post($uri, $data);
				}
				break;
			case 'database':
			case 'internal':
				$databases = $datasources->xpath("/DataSources/Databases/Database[@id='".(string)$datasource['database']."']");
				$database = new Database(null, $databasesDir, (int)$databases[0]['id'], (string)$databases[0]['type'], (string)$databases[0]['name']);
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
	 * @param   array $infosColumns The informations about the columns
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @param   bool $restore (default: false) true if the row is to be restored, false otherwise
	 * @param   bool $fromOtherTable (default: false) true if the row comes from another table
	 * @return  string|bool
	 *
	 */
	protected function insertRowIntoTable($row, $table, $infosColumns, Database $database, TranslatorInterface $translator = null, $restore = false, $fromOtherTable = false) {
		$insertNames = array();
		$insertValues = array();
		foreach($infosColumns as $name => $info) {
			$value = isset($row[$name]) ? $row[$name] : (isset($row[strtolower($name)]) ? $row[strtolower($name)] : ($info['g6k_type'] == 'boolean' ? '0' : null));
			if (($check = $this->checkColumnValue($info, $value, $translator, $fromOtherTable)) !== true) {
				return $check;
			}
			if ($restore || $name != 'id') {
				$insertNames[] = $name;
				if ($value === null || $value == '') {
					$insertValues[] = "NULL";
				} else if ($info['g6k_type'] == 'date') {
					$insertValues[] = $database->quote($fromOtherTable ? $value : DateFunction::parseDate('d/m/Y', substr($value, 0, 10))->format('Y-m-d'));
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
	 * @param   \SimpleXMLElement $datasources The DataSources.xml content
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @param   bool $fromOtherTable (default: false) true if the row comes from another table
	 * @return  bool|string
	 *
	 */
	protected function updateRowInTable($row, $table, $datasources, Database $database, TranslatorInterface $translator = null, $fromOtherTable = false) {
		$infosColumns = $this->infosColumns($datasources, $database, $table);
		$updateFields = array();
		foreach($infosColumns as $name => $info) {
			$value = isset($row[$name]) ? $row[$name] : (isset($row[strtolower($name)]) ? $row[strtolower($name)] : ($info['g6k_type'] == 'boolean' ? '0' : null));
			if (($check = $this->checkColumnValue($info, $value, $translator, $fromOtherTable)) !== true) {
				return $check;
			}
			if ($name != 'id') {
				if ($value === null || $value == '') {
					$updateFields[] = $name . "=NULL";
				} else if ($info['g6k_type'] == 'date') {
					$updateFields[] = $name . "='" . ($fromOtherTable ? $value : DateFunction::parseDate('d/m/Y', substr($value, 0, 10))->format('Y-m-d')) . "'";
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
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
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
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @param   bool $fromOtherTable (default: false) true if the row comes from another table
	 * @return  string|bool An error message or true if no error.
	 *
	 */
	protected function checkColumnValue($info, $value, TranslatorInterface $translator = null, $fromOtherTable = false) {
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
				$ok = true;
				if ($fromOtherTable) {
					if (! preg_match("/^\d{4}-\d{2}-\d{2}$/", $value)) {
						$ok = false;
					}
				} else if (! preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $value)) {
					$ok = false;
				}
				if (! $ok) {
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

	/**
	 * Does the migration of data from a database to another.
	 *
	 * @access  protected
	 * @param   int $dsid The datasource ID
	 * @param   string $dbtype The target database type
	 * @param   \SimpleXMLElement $datasources The origin DataSources.xml content
	 * @param   \SimpleXMLElement $fromDatasources The origin DataSources.xml content
	 * @param   \App\G6K\Model\Database $fromDatabase The origin Database object
	 * @param   string|null $databasesDir The database directory
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @param   callable|null $fprogress a function receiving the row number that's inserted
	 * @return  string|true
	 *
	 */
	protected function migrateDatabase($dsid, $dbtype, \SimpleXMLElement $datasources, \SimpleXMLElement $fromDatasources, Database $fromDatabase, $databasesDir = null, TranslatorInterface $translator = null, $fprogress = null) {
		if (($result = $this->createDatabase($dsid, $dbtype, $datasources, $databasesDir, $translator)) !== true) {
			return $result;
		}
		$dss = $datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
		$datasource = $dss[0];
		$database = $this->getDatabase($dsid, $datasources, $databasesDir);
		foreach ($datasource->children() as $child) {
			if ($child->getName() == 'Table') {
				$table = (string)$child['name'];
				$infosColumns = $this->infosColumns($fromDatasources, $fromDatabase, $table);
				$form = $this->infosColumnsToForm($table, $infosColumns);
				$form['table-label'] = (string)$child['label'];
				$form['table-description'] = strip_tags((string)$child->Description);
				if (($result = $this->createDatabaseTable($form, $database, $translator)) !== true) {
					return $result;
				}
				$fields = implode(", ", $form['field']);
				$rows = $fromDatabase->query(Parser::SQL_SELECT_KEYWORD. $fields . " " . Parser::SQL_FROM_KEYWORD . $table . " order by id");
				$nrows = count($rows);
				foreach ($rows as $rownum => $row) {
					if (($result = $this->insertRowIntoTable($row, $table, $infosColumns, $database, $translator, false, true)) !== true) {
						return $result;
					}
					if ($fprogress !== null) {
						call_user_func($fprogress, $table, $nrows, $rownum + 1);
					}
				}
			}
		}
		if ($database->gettype() == 'jsonsql') {
			$database->getConnection()->commit();
		}
		return true;
	}

	/**
	 * Creates a database 
	 *
	 * @access  protected
	 * @param   int $dsid The datasource ID
	 * @param   string $dbtype The target database type
	 * @param   \SimpleXMLElement $datasources The DataSources.xml content
	 * @param   string|null $databasesDir The database directory
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @return  string|true
	 *
	 */
	protected function createDatabase($dsid, $dbtype, $datasources, $databasesDir = null, TranslatorInterface $translator = null) {
		try {
			if ($dbtype == 'jsonsql' || $dbtype == 'sqlite') {
				$database = $this->getDatabase($dsid, $datasources, $databasesDir);
			} else {
				$database = $this->getDatabase($dsid, $datasources, $databasesDir, false);
			}
		} catch (\Exception $e) {
			if ($translator !== null) {
				return $translator->trans("Can't get database : %error%", array('%error%' => $e->getMessage()));
			} else {
				return sprintf("Can't get database : %s", $e->getMessage());
			}
		}
		switch ($database->getType()) {
			case 'pgsql':
				$dbschema = str_replace('-', '_', $database->getName());
				try {
					$database->exec("CREATE DATABASE " . $dbschema. " encoding 'UTF8'");
					$database->setConnected(false);
					$database->connect();
				} catch (\Exception $e) {
						if ($translator !== null) {
							return $translator->trans("Can't create database %database% : %error%", array('%database%' => $dbschema, '%error%' => $e->getMessage()));
						} else {
							return sprintf("Can't create database %s : %s", $dbschema, $e->getMessage());
						}
				}
				break;
			case 'mysql':
			case 'mysqli':
				$dbschema = str_replace('-', '_', $database->getName());
				try {
					$database->exec("CREATE DATABASE IF NOT EXISTS " . $dbschema . " character set utf8");
					$database->setConnected(false);
					$database->connect();
				} catch (\Exception $e) {
						if ($translator !== null) {
							return $translator->trans("Can't create database %database% : %error%", array('%database%' => $dbschema, '%error%' => $e->getMessage()));
						} else {
							return sprintf("Can't create database %s : %s", $dbschema, $e->getMessage());
						}
				}
				break;
		}
		return true;
	}

	/**
	 * Creates a database table 
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @return  string|true
	 *
	 */
	protected function createDatabaseTable(&$form, Database $database, TranslatorInterface $translator = null) {
		$create = "create table " . $form['table-name'] . " (\n";
		if (!in_array('id', $form['field'])) {
			switch ($database->getType()) {
				case 'jsonsql':
					$create .= "id integer not null primary key autoincrement,\n";
					break;
				case 'sqlite':
					$create .= "id INTEGER not null primary key autoincrement,\n";
					break;
				case 'pgsql':
					$create .= "id serial primary key,\n";
					break;
				case 'mysql':
				case 'mysqli':
					$create .= "id INT not null primary key auto_increment,\n";
					break;
			}
		}
		foreach ($form['field'] as $i => $field) {
			if ($field != '') {
				if ($database->getType() == 'jsonsql') {
					$create .= $field . " " . $form['type'][$i];
				} else {
					$create .= $field . " " . $this->datatypes[$database->getType()][$form['type'][$i]];
				}
				if ($form['notnull'][$i] == 1) {
					$create .= " not null";
				}
				if ($database->getType() =='jsonsql' && $form['label'][$i] != '') {
					$create .= " title " . $database->quote($form['label'][$i]);
				}
				if ($database->getType() =='jsonsql' && $form['description'][$i] != '') {
					$create .= " comment " . $database->quote($form['description'][$i]);
				}
				if ($i < count($form['field']) - 1 ) {
					$create .= ",";
				}
				$create .= "\n";
			}
		}
		$create .= ")";
		try {
			$database->exec($create);
			if ($form['table-label'] != '' && $database->getType() == 'jsonsql') {
				$alter = "alter table " . $form['table-name'] . " modify title  " . $database->quote($form['table-label']);
				$database->exec($alter);
			}
			if ($form['table-description'] != '' && $database->getType() == 'jsonsql') {
				$alter = "alter table " . $form['table-name'] . " modify comment  " . $database->quote($form['table-description']);
				$database->exec($alter);
			}
		} catch (\Exception $e) {
			if ($translator !== null) {
				return $translator->trans("Can't create table %table% : %error%", array('%table%' => $form['table-name'], '%error%' => $e->getMessage()));
			} else {
				return sprintf("Can't create table %s : %s", $form['table-name'], $e->getMessage());
			}
		}
		if (!in_array('id', $form['field'])) {
			array_unshift($form['field'], 'id');
			array_unshift($form['type'], 'integer');
			array_unshift($form['notnull'], 1);
			array_unshift($form['label'], 'id');
			array_unshift($form['description'], 'Identifiant interne');
		}
		return true;
	}

	/**
	 * Drops a table
	 *
	 * @access  protected
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @return  string|true
	 *
	 */
	protected function dropDatabaseTable($table, Database $database, TranslatorInterface $translator = null) {
		try {
			$database->exec("DROP TABLE ".$table);
		} catch (\Exception $e) {
			if ($translator !== null) {
				return $translator ->trans("Can't drop %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
			} else {
				return sprintf("Can't drop %table% : %error%", $table, $e->getMessage());
			}
		}
		return true;
	}

	/**
	 * Edits a table structure
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   \SimpleXMLElement $datasources The DataSources.xml content
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @return  string|true
	 *
	 */
	protected function editTableStructure($form, $table, Database $database, \SimpleXMLElement $datasources, TranslatorInterface $translator = null) {
		$infosColumns = $this->infosColumns($datasources, $database, $table);
		if (strcasecmp($form['table-name'], $table) != 0) {
			$rename = "ALTER TABLE $table RENAME TO {$form['table-name']}";
			try {
				$database->exec($rename);
			} catch (\Exception $e) {
				if ($translator !== null) {
					return $translator->trans("Can't rename table %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
				} else {
					return sprintf("Can't rename table %s : %s", $table, $e->getMessage());
				}
			}
		}
		$col = 0;
		$alterdefsSQLite = array();
		foreach($infosColumns as $name => $info) {
			$alterSQLite = false;
			if (strcasecmp($form['field'][$col], $name) != 0) {
				if ($database->getType() == 'sqlite') {
					$alterSQLite = true;
				} else {
					$rename = "";
					switch ($database->getType()) {
						case 'mysql':
						case 'mysqli':
							$rename = "ALTER TABLE $table CHANGE COLUMN $name {$form['field'][$col]}";
							break;
						case 'jsonsql':
						case 'pgsql':
							$rename = "ALTER TABLE $table RENAME COLUMN $name TO {$form['field'][$col]}";
							break;
					}
					try {
						$database->exec($rename);
					} catch (\Exception $e) {
						if ($translator !== null) {
							return $translator->trans("Can't rename column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
						} else {
							return sprintf("Can't rename column %s of table %s : %s", $name, $table, $e->getMessage());
						}
					}
				}
			}
			if ($form['type'][$col] != $info['g6k_type']) {
				if ($database->getType() == 'sqlite') {
					$alterSQLite = true;
				} else {
					$changetype = "";
					if ($database->getType() == 'jsonsql') {
						$changetype = "ALTER TABLE $table MODIFY COLUMN $name SET TYPE {$form['type'][$col]}";
						try {
							$database->exec($changetype);
						} catch (\Exception $e) {
							if ($translator !== null) {
								return $translator->trans("Can't modify type of column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
							} else {
								return sprintf("Can't modify type of column %s of table %s : %s", $name, $table, $e->getMessage());
							}
						}
					} else {
						$newDBType = $this->datatypes[$database->getType()][$form['type'][$col]];
						if ($info['type'] != $newDBType) {
							switch ($database->getType()) {
								case 'mysql':
								case 'mysqli':
									$changetype = "ALTER TABLE $table MODIFY COLUMN $name $newDBType";
									break;
								case 'pgsql':
									$changetype = "ALTER TABLE $table ALTER COLUMN $name SET DATA TYPE $newDBType";
									break;
							}
							try {
								$database->exec($changetype);
							} catch (\Exception $e) {
								if ($translator !== null) {
									return $translator->trans("Can't modify type of column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
								} else {
									return sprintf("Can't modify type of column %s of table %s : %s", $name, $table, $e->getMessage());
								}
							}
						}
					}
				}
			}
			if ($form['notnull'][$col] != $info['notnull']) {
				if ($database->getType() == 'sqlite') {
					$alterSQLite = true;
				} else {
					$changenullable = "";
					switch ($database->getType()) {
						case 'jsonsql':
							if ($form['notnull'][$col] == 1) {
								$changenullable = "ALTER TABLE $table MODIFY COLUMN $name SET NOT NULL";
							} else {
								$changenullable = "ALTER TABLE $table MODIFY COLUMN $name REMOVE NOT NULL";
							}
							break;
						case 'mysql':
						case 'mysqli':
							$newDBType = $this->datatypes[$database->getType()][$form['type'][$col]];
							$newNullable = $form['notnull'][$col] == 1 ? 'NOT NULL' : 'NULL';
							$changenullable = "ALTER TABLE $table MODIFY COLUMN $name $newDBType $newNullable";
							break;
						case 'pgsql':
							if ($form['notnull'][$col] == 1) {
								$changenullable = "ALTER TABLE $table ALTER COLUMN $name SET NOT NULL";
							} else {
								$changenullable = "ALTER TABLE $table ALTER COLUMN $name DROP NOT NULL";
							}
							break;
					}
					try {
						$database->exec($changenullable);
					} catch (\Exception $e) {
						if ($translator !== null) {
							return $translator->trans("Can't alter 'NOT NULL' property of column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
						} else {
							return sprintf("Can't alter 'NOT NULL' property of column %s of table %s : %s", $name, $table, $e->getMessage());
						}
					}
				}
			}
			if ($alterSQLite) {
				$alterdefs = "CHANGE $name " . $form['field'][$col] . " " . $this->datatypes[$database->getType()][$form['type'][$col]];
				if ($form['field'][$col] == 'id') {
					$alterdefs .= " PRIMARY KEY AUTOINCREMENT"; 
				} elseif ($form['notnull'][$col] == 1) {
					$alterdefs .= " NOT NULL"; 
				}
				$alterdefsSQLite[] = $alterdefs;
			}
			if ($form['label'][$col] != $info['label'] && $database->getType() == 'jsonsql') {
				$changelabel = "ALTER TABLE $table MODIFY COLUMN $name SET TITLE " . $database->quote($form['label'][$col]);
				try {
					$database->exec($changelabel);
				} catch (\Exception $e) {
					if ($translator !== null) {
						return $translator->trans("Can't modify title of column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
					} else {
						return sprintf("Can't modify title of column %s of table %s : %s", $name, $table, $e->getMessage());
					}
				}
			}
			if ($form['description'][$col] != $info['description'] && $database->getType() == 'jsonsql') {
				$changedescription = "ALTER TABLE $table MODIFY COLUMN $name SET COMMENT " . $database->quote($form['description'][$col]);
				try {
					$database->exec($changedescription);
				} catch (\Exception $e) {
					if ($translator !== null) {
						return $translator->trans("Can't modify description of column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
					} else {
						return sprintf("Can't modify description of column %s of table %s : %s", $name, $table, $e->getMessage());
					}
				}
			}
			$col++;
		}
		if (count($alterdefsSQLite) > 0) {
			$this->alterSQLiteTable($table, implode(" ", $alterdefsSQLite), $database);
		}
		$fieldsCount = count($form['field']);
		for ($i = $col; $i < $fieldsCount; $i++) {
			$name = $form['field'][$i];
			if ($name !='') {
				$type = $form['type'][$i];
				$label = $form['label'][$i];
				$description = $form['description'][$i];
				$notnull = isset($form['notnull'][$i]) && $form['notnull'][$i] == 1 ? 'NOT NULL' : '';
				$dbype = $this->datatypes[$database->getType()][$type];
				$addcolumn = "";
				switch ($database->getType()) {
					case 'jsonsql':
						$addcolumn = "ALTER TABLE $table ADD COLUMN $name $type $notnull TITLE " . $database->quote($label) . " COMMENT " . $database->quote($description);
						break;
					case 'sqlite':
						$addcolumn = "ALTER TABLE $table ADD COLUMN $name $dbype $notnull";
						break;
					case 'mysql':
					case 'mysqli':
						$addcolumn = "ALTER TABLE $table ADD COLUMN $name $dbype $notnull";
						break;
					case 'pgsql':
						$addcolumn = "ALTER TABLE $table ADD COLUMN $name $dbype $notnull";
						break;
				}
				try {
					$database->exec($addcolumn);
				} catch (\Exception $e) {
					if ($translator !== null) {
						return $translator->trans("Can't add the column '%column%' into table '%table%' : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
					} else {
						return sprintf("Can't add the column '%s' into table '%s' : %s", $name, $table, $e->getMessage());
					}
				}
			}
		}
		return true;
	}

	/**
	 * Emulates a 'ALTER TABLE' for columns of a SQLite database.
	 *
	 * ALTER TABLE tbl_name alter_specification [, alter_specification] ...
	 *
	 * alter_specification:
	 *   ADD column_definition
	 * | DROP column_definition
	 * | CHANGE old_col_name column_definition
	 *
	 * column_definition:
	 *   same as for create table statements
	 *
	 * @access  protected
	 * @param   string $table The table name
	 * @param   string $alterdefs Comma separated alter specifications
	 * @param   \App\G6K\Model\Database $database  The Database object
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @return  bool Always true
	 */
	protected function alterSQLiteTable($table, $alterdefs, Database $database, TranslatorInterface $translator = null){
		if ($alterdefs != ''){
			$stmt = $database->prepare("SELECT sql,name,type FROM sqlite_master WHERE tbl_name = :table ORDER BY type DESC");
			$database->bindValue($stmt, ':table', $table);
			$result = $database->execute($stmt);
			if ($result !== false && count($result) > 0) {
				$row = $result[0];
				$tmpname = 't'.time();
				$origsql = trim(preg_replace("/[\s]+/", " ", str_replace(",", ", ", preg_replace("/[\(]/", "( ", $row['sql'], 1))));
				$createtemptableSQL = 'CREATE TEMPORARY '.substr(trim(preg_replace("'" . $table . "'", $tmpname, $origsql, 1)), 6);
				$i = 0;
				$defs = preg_split("/[,]+/", $alterdefs, -1, PREG_SPLIT_NO_EMPTY);
				$prevword = $table;
				$oldcols = preg_split("/[,]+/", substr(trim($createtemptableSQL), strpos(trim($createtemptableSQL), '(') + 1), -1, PREG_SPLIT_NO_EMPTY);
				$newcols = array();
				$oldcolsSize = sizeof($oldcols);
				for($i = 0; $i < $oldcolsSize; $i++){
					$colparts = preg_split("/[\s]+/", $oldcols[$i], -1, PREG_SPLIT_NO_EMPTY);
					$oldcols[$i] = $colparts[0];
					$newcols[$colparts[0]] = $colparts[0];
				}
				$newcolumns = '';
				$oldcolumns = '';
				reset($newcols);
				foreach($newcols as $key => $val) {
					$newcolumns .= ($newcolumns ? ', ' : '') . $val;
					$oldcolumns .= ($oldcolumns ? ', ' : '') . $key;
				}
				$copytotempsql = 'INSERT INTO ' . $tmpname . '(' . $newcolumns . ') SELECT ' . $oldcolumns . ' FROM ' . $table;
				$createtesttableSQL = $createtemptableSQL;
				foreach ($defs as $def) {
					$defparts = preg_split("/[\s]+/", $def, -1, PREG_SPLIT_NO_EMPTY);
					$action = strtolower($defparts[0]);
					$defpartsSize = sizeof($defparts);
					switch($action){
						case 'add':
							if ($defpartsSize <= 2) {
								if ($translator !== null) {
									throw new \Exception($translator->trans('near "%s%": syntax error', ['%s%' => $defparts[0].($defparts[1]?' '.$defparts[1]:'')]));
								} else {
									throw new \Exception(sprintf('near "%s": syntax error', $defparts[0].($defparts[1]?' '.$defparts[1]:'')));
								}
							}
							$createtesttableSQL = substr($createtesttableSQL,0,strlen($createtesttableSQL)-1).',';
							for($i = 1; $i < $defpartsSize; $i++)
								$createtesttableSQL.=' '.$defparts[$i];
							$createtesttableSQL.=')';
							break;
						case 'change':
							if ($defpartsSize <= 3) {
								if ($translator !== null) {
									throw new \Exception($translator->trans('near "%s%": syntax error', ['%s%' => $defparts[0].($defparts[1]?' '.$defparts[1]:'').($defparts[2]?' '.$defparts[2]:'')]));
								} else {
									throw new \Exception(sprintf('near "%s": syntax error', $defparts[0].($defparts[1]?' '.$defparts[1]:'').($defparts[2]?' '.$defparts[2]:'')));
								}
							}
							if($severpos = strpos($createtesttableSQL,' '.$defparts[1].' ')){
								if($newcols[$defparts[1]] != $defparts[1]){
								if ($translator !== null) {
									throw new \Exception($translator->trans('unknown column "%s%": in "%table%"', ['%s%' => $defparts[1], '%table%' => $table]));
								} else {
									throw new \Exception(sprintf('unknown column "%s": in "%s"', $defparts[1], $table));
								}
								}
								$newcols[$defparts[1]] = $defparts[2];
								$nextcommapos = strpos($createtesttableSQL,',',$severpos);
								$insertval = '';
								for ($i = 2; $i < $defpartsSize; $i++) {
									$insertval .= ' ' . $defparts[$i];
								}
								if ($nextcommapos)
									$createtesttableSQL = substr($createtesttableSQL, 0, $severpos) . $insertval.substr($createtesttableSQL, $nextcommapos);
								else
									$createtesttableSQL = substr($createtesttableSQL, 0, $severpos - (strpos($createtesttableSQL, ',') ? 0 : 1)) . $insertval . ')';
							} else {
								if ($translator !== null) {
									throw new \Exception($translator->trans('unknown column "%s%": in "%table%"', ['%s%' => $defparts[1], '%table%' => $table]));
								} else {
									throw new \Exception(sprintf('unknown column "%s": in "%s"', $defparts[1], $table));
								}
							}
							break;
						case 'drop':
							if ($defpartsSize < 2) {
								if ($translator !== null) {
									throw new \Exception($translator->trans('near "%s%": syntax error', ['%s%' => $defparts[0].($defparts[1]?' '.$defparts[1]:'')]));
								} else {
									throw new \Exception(sprintf('near "%s": syntax error', $defparts[0].($defparts[1]?' '.$defparts[1]:'')));
								}
							}
							if ($severpos = strpos($createtesttableSQL, ' ' . $defparts[1] . ' ')) {
								$nextcommapos = strpos($createtesttableSQL, ',', $severpos);
								if ($nextcommapos)
									$createtesttableSQL = substr($createtesttableSQL, 0, $severpos) . substr($createtesttableSQL, $nextcommapos + 1);
								else
									$createtesttableSQL = substr($createtesttableSQL, 0, $severpos - (strpos($createtesttableSQL, ',') ? 0 : 1) - 1) . ')';
								unset($newcols[$defparts[1]]);
							} else {
								if ($translator !== null) {
									throw new \Exception($translator->trans('unknown column "%s%": in "%table%"', ['%s%' => $defparts[1], '%table%' => $table]));
								} else {
									throw new \Exception(sprintf('unknown column "%s": in "%s"', $defparts[1], $table));
								}
							}
							break;
						default:
							if ($translator !== null) {
								throw new \Exception($translator->trans('near "%s%": syntax error', ['%s%' => $prevword]));
							} else {
								throw new \Exception(sprintf('near "%s": syntax error', $prevword));
							}
					}
					$prevword = $defparts[$defpartsSize - 1];
				}
				$createnewtableSQL = 'CREATE ' . substr(trim(preg_replace("'" . $tmpname . "'", $table, $createtesttableSQL, 1)), 17);
				$newcolumns = '';
				$oldcolumns = '';
				reset($newcols);
				foreach($newcols as $key => $val) {
					$newcolumns .= ($newcolumns ? ', ' : '') . $val;
					$oldcolumns .= ($oldcolumns ? ', ' : '') . $key;
				}
				$copytonewsql = 'INSERT INTO ' . $table . '(' . $newcolumns . ') SELECT ' . $oldcolumns . ' FROM ' . $tmpname;
				$database->exec($createtemptableSQL); //create temp table
				$database->exec($copytotempsql); //copy to table
				$this->dropDatabaseTable($table, $database); //drop old table
				$database->exec($createnewtableSQL); //recreate original table
				$database->exec($copytonewsql); //copy back to original table
				$this->dropDatabaseTable($tmpname, $database); //drop temp table
			} else {
				if ($translator !== null) {
					throw new \Exception($translator->trans('no such table: %s%', ['%s%' => $table]));
				} else {
					throw new \Exception(sprintf('no such table: %s', $table));
				}
			}
			return true;
		}
	}

}
