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

use App\G6K\Manager\DatasourcesHelper;
use App\G6K\Model\Database;

/**
 *
 * This class allows the conversion of a SQL database to a json-schema.org compliant JSON database
 *
 * @copyright Jacques Archimède
 *
 */
class SQLToJSONConverter {

	/**
	 * @var array      $parameters The database parameters
	 *
	 * @access  private
	 *
	 */
	private $parameters = array(
		'database_driver' => 'pdo_sqlite',
		'database_host' => null,
		'database_port' => null,
		'database_name' => null,
		'database_user' => null,
		'database_password' => null,
		'database_path' => null
	);

	/**
	 * @var array      $types The SQL datatypes by SQL driver
	 *
	 * @access  private
	 *
	 */
	private $types = array(
		'sqlite' => array(
			'bigint' => 'integer',
			'blob' => 'string',
			'boolean' => 'boolean',
			'char' => 'string',
			'date' => 'date',
			'datetime' => 'datetime',
			'decimal' => 'number',
			'double' => 'number',
			'int' => 'integer',
			'integer' => 'integer',
			'numeric' => 'number',
			'real' => 'number',
			'string' => 'string',
			'text' => 'string',
			'time' => 'time',
			'varchar' => 'string'
		),
		'mysql' => array(
			'tinyint' => 'integer',
			'smallint' => 'integer',
			'mediumint' => 'integer',
			'int' => 'integer',
			'bigint' => 'integer',
			'decimal' => 'number',
			'numeric' => 'number',
			'float' => 'number',
			'double' => 'number',
			'date' => 'date',
			'datetime' => 'datetime',
			'timestamp' => 'datetime',
			'char' => 'string',
			'varchar' => 'string',
			'blob' => 'string',
			'text' => 'string'
		),
		'pgsl' => array(
			'smallint' => 'integer',
			'integer' => 'integer',
			'bigint' => 'integer',
			'decimal' => 'number',
			'numeric' => 'number',
			'real' => 'number',
			'double precision' => 'number',
			'smallserial' => 'integer',
			'serial' => 'integer',
			'bigserial' => 'integer',
			'money' => 'number',
			'character' => 'string',
			'text' => 'string',
			'bytea' => 'string',
			'timestamp' => 'datetime',
			'date' => 'date',
			'time' => 'time',
			'boolean' => 'boolean',
		)
	);

	/**
	 * @var string      $databasesDir The G6K databases directory
	 *
	 * @access  private
	 *
	 */
	private $databasesDir;

	/**
	 * @var \SimpleXMLElement      $datasources The data sources
	 *
	 * @access  private
	 *
	 */
	private $datasources;

	/**
	 * @var int        $maxId The current greatest id of data source
	 *
	 * @access  private
	 *
	 */
	private $maxId = 0;

	/**
	 * Constructor of class SQLToJSONConverter
	 *
	 * @access  public
	 * @param   array $fparameters The database parameters
	 * @param   string $databasesDir The G6K databases directory
	 * @return  void
	 *
	 */
	public function __construct($fparameters, $databasesDir) {
		$this->parameters = array_merge($this->parameters, $fparameters);
		$this->databasesDir = $databasesDir;
		$this->datasources =  new \SimpleXMLElement($this->databasesDir."/DataSources.xml", LIBXML_NOWARNING, true);
	}

	/**
	 * Transfers the schema and data from a data source into an array for conversion to JSON
	 *
	 * @access  public
	 * @param   \SimpleXMLElement $datasource The datasource definition extracted from DataSources.xml
	 * @return  array The result array
	 *
	 */
	public function convert($datasource) {
		$database = $this->getDatabase($datasource);
		$dstables = $datasource->xpath("Table");
		$tables = array();
		$data = array();
		foreach ($dstables as $table) {
			$tablename = (string)$table['name'];
			$tableinfos = $this->tableInfos($database, $tablename);
			$dscolumns = $table->xpath("Column");
			$columns = array();
			$required = array();
			foreach ($dscolumns as $column) {
				$columnname = (string)$column['name'];
				$columninfos  = array();
				foreach ($tableinfos as $info) {
					if ($info['name'] == $columnname) {
						$columninfos = $info;
						break;
					}
				}
				if (preg_match('/^\s*(\w+)\s*\((\d+)\)\s*$/', $columninfos['type'], $m)) {
					$type = $this->types[$database->getType()][strtolower($m[1])];
					$length = (int)$m[2];
				} else {
					$type = $this->types[$database->getType()][strtolower($columninfos['type'])];
					$length = 0;
				}
				$columns[$columnname] = array(
					'type' => $type,
					'title' => '',
					'description' => (string)$column->Description
				);
				$title = (string)$column['label'];
				$extra = array();
				if ($columninfos['pk'] != "0") {
					$extra[] = 'primarykey:' . $columninfos['pk'];
					if ($columnname == 'id') {
						$extra[] = 'autoincrement:'."1"; // Value 1 will be replaced by maxId later
					}
				}
				$extra[] = 'type:' . (string)$column['type'];
				if ((string)$column['type'] == 'choice') {
					if ($column->Choices) {
						if ($column->Choices->Choice) {
							$oneOf = array();
							$valueType = '';
							foreach ($column->Choices->Choice as $choice) {
								$valueType = $this->guessType((string)$choice['value'], $valueType);
							}
							foreach ($column->Choices->Choice as $choice) {
								$value = $this->castValue((string)$choice['value'], $valueType);
								$oneOf[] = array(
									'title' => (string)$choice['label'],
									'enum' => array($value)
								);
							}
							$columns[$columnname]['oneOf'] = $oneOf;
							if ($columninfos['dflt_value'] !== null) {
								$columns[$columnname]['default'] = $this->castValue( $columninfos['dflt_value'], $valueType);
							}
						} elseif ($column->Choices->Source) {
							$extra[] = 'datasource:' . (string)$column->Choices->Source['datasource'];
							$extra[] = 'returnType:' . (string)$column->Choices->Source['returnType'];
							$extra[] = 'valueColumn:' . (string)$column->Choices->Source['valueColumn'];
							$extra[] = 'labelColumn:' . (string)$column->Choices->Source['labelColumn'];
							if ((string)$column->Choices->Source['request'] != '') {
								$extra[] = 'request:' . (string)$column->Choices->Source['request'];
							}
							if ((string)$column->Choices->Source['returnPath'] != '') {
								$extra[] = 'returnPath:' . (string)$column->Choices->Source['returnPath'];
							}
						}
					}
				}
				if (count($extra) > 0) {
					$title .= ' [' . implode(', ', $extra) . ']';
				}
				$columns[$columnname]['title'] = $title;
				if ((string)$column['type'] == 'date') {
					$columns[$columnname]['type'] = 'string';
					$columns[$columnname]['format'] = 'date';
				}
				if ((string)$column['type'] != 'choice' && $columninfos['dflt_value'] !== null) {
					$columns[$columnname]['default'] = $this->castValue($columninfos['dflt_value'], $type);
				}
				if ($length > 0) {
					$columns[$columnname]['maxLength'] = $length;
				}
				if ($columninfos['notnull'] == "1") {
					$required[] = $columnname;
				}
			}
			$data[$tablename] = $this->getData($database, $tablename, $columns, $required);
			if ($this->maxId > 0) {
				$columns['id']['title'] = preg_replace("/autoincrement:\d+/", "autoincrement:" . $this->maxId, $columns['id']['title']);
			}
			$tables[$tablename] = array(
				"type" => "array",
				"title" => (string)$table['label'],
				"description" => (string)$table->Description,
				"items" => array(
					"type" => "object",
					"properties" => $columns,
					"required" => $required
				)
			);
		}
		$schema = array(
			'$schema' => 'http://json-schema.org/draft-04/schema#',
			'type' => 'object',
			'title' =>(string)$datasource['name'],
			'description' => (string)$datasource->Description,
			'properties' => $tables,
			'required' => array_keys($tables)
		);
		return array(
			'schema' => $schema, 
			'data' => $data
		);
	}

	/**
	 * Returns a Database object for the database of a data source
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $datasource The datasource definition extracted from DataSources.xml
	 * @param   bool $withDbName (default: true) if false, the name of the database will not be inserted in the dsn string.
	 * @return  \App\G6K\Model\Database The Database object
	 *
	 */
	protected function getDatabase($datasource, $withDbName = true) {
		$helper = new DatasourcesHelper($this->datasources);
		$dbid = (int)$datasource['database'];
		return $helper->getDatabase($this->parameters, $dbid, $this->databasesDir, $withDbName);
	}

	/**
	 * Returns the information on a table
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Database $database The unified access interface to the database
	 * @param   string $table The name of the table
	 * @return  array|string|bool|null The information on the table
	 *
	 */
	protected function tableInfos(Database $database, $table) {
		switch ($database->getType()) {
			case 'sqlite':
				$tableinfos = $database->query("PRAGMA table_info('".$table."')");
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
			case 'pgsql':
				$tableinfos = $database->query("SELECT ordinal_position as cid, column_name as name, data_type as type, is_nullable, column_default as dflt_value FROM information_schema.columns where table_name = '$table' order by ordinal_position");
				foreach($tableinfos as &$info) {
					$info['notnull'] = $info['is_nullable'] == 'NO' ? 1 : 0;
				}
				break;
			default:
				$tableinfos = null;
		}
		return $tableinfos;
	}

	/**
	 * Returns all the rows of a table of a SQL database
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Database $database The unified access interface to the database
	 * @param   string $table The name of the table
	 * @param   array &$schema The list of columns in the table and their properties
	 * @param   array &$required The list of required columns
	 * @return  array The rows of the table
	 *
	 */
	protected function getData(Database $database, $table, &$schema, &$required) {
		$query = "SELECT * FROM $table";
		$result = $database->query($query);
		$rows = array();
		$this->maxId = 0;
		foreach ($result as $resultrow) {
			$row = array();
			foreach ($resultrow as $column => $value) {
				$type = "";
				$g6ktype = "";
				foreach ($schema as $col => $props) {
					if (strcasecmp($col, $column) == 0) {
						$type = $props['type'];
						$column = $col;
						if (preg_match("/type:([^,\]]+)/", $props['title'], $m)) {
							$g6ktype = $m[1];
						}
						break;
					}
				}
				if ($type == 'integer' && $g6ktype != 'date') {
					if (!is_int($value)) {
						$value = (int)$value;
					}
				} elseif ($type == 'number') {
					if (!is_float($value)) {
						$value = (float)$value;
					}
				} elseif ($type == 'boolean') {
					if (!is_bool($value)) {
						$value = (bool)$value;
					}
				}
				if ($column == 'id' && $type == 'integer') {
					if ($value > $this->maxId) {
						 $this->maxId = $value;
					}
				}
				if ($value !== null || in_array($column, $required)) {
					$row[$column] = $value;
				}
			}
			$rows[] = $row;
		}
		return $rows;
	}

	/**
	 * Guess the type of the value of a choice item
	 *
	 * @access  protected
	 * @param   string $value The value
	 * @param   string $priorType (default: '') The harmonized type of the prior items of the choice
	 * @return  string The type of the value
	 *
	 */
	protected function guessType($value, $priorType = '') {
		if ($priorType == 'string') {
			return 'string';
		}
		if (strcasecmp($value, 'true') == 0 || strcasecmp($value, 'false') == 0) {
			if ($priorType != '' && $priorType != 'boolean') {
				return 'string';
			}
			return 'boolean';
		}
		if (!is_numeric($value)) {
			return 'string';
		}
		if (ctype_digit($value)) {
			if ($priorType != '' && $priorType != 'integer') {
				if ($priorType == 'number') {
					return 'number';
				}
				return 'string';
			}
			return 'integer';
		}
		if ($priorType != '' && $priorType != 'number' && $priorType != 'integer') {
			return 'string';
		}
		return 'number';
	}

	/**
	 * Casts a value according to its type.
	 *
	 * @access  protected
	 * @param   string $value The value to be casted
	 * @param   string $type The type of the value.
	 * @return  string|bool|int|float The casted value
	 *
	 */
	protected function castValue($value, $type) {
		if ($type == 'string' || $type == 'date' || $type == 'datetime' || $type == 'time') {
			return $value;
		}
		if ($type == 'boolean') {
			return $value == 'true' ? true : false;
		}
		if ($type == 'integer') {
			return (int)$value;
		}
		return (float)$value;
	}

}
?>
