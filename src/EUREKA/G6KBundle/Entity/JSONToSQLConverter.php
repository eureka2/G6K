<?php

/*
The MIT License (MIT)

Copyright (c) 2015 Jacques Archimède

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

class JSONToSQLConverter {

	private $parameters = array(
		'database_driver' => 'pdo_sqlite',
		'database_host' => null,
		'database_port' => null,
		'database_name' => null,
		'database_user' => null,
		'database_password' => null,
		'database_path' => null
	);

	private $datatypes = array(
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

	private $database;

	public function __construct($fparameters) {
		$this->parameters = array_merge($this->parameters, $fparameters);
	}

	private function get_type($coldef) {
		$driver = $this->parameters['database_driver'];
		if ($coldef->type == 'string') {
			if(isset($coldef->format)) {
				return $this->datatypes[$driver][$coldef->format];
			} elseif(isset($coldef->maxLength)) {
				return "VARCHAR(".$coldef->maxLength.")";
			} else {
				return $this->datatypes[$driver][$coldef->type];
			} 
		}
		$type = $this->datatypes[$driver][$coldef->type];
		if(isset($coldef->maxLength)) {
			$type .= "(".$coldef->maxLength.")";
		}
		return $type;
	}

	private function get_value($type, $value) {
		if ($type == 'string') {
			$value = $this->database->quote($value, \PDO::PARAM_STR);
		} elseif ($type == 'integer') {
			$value = $this->database->quote($value, \PDO::PARAM_INT);
		} elseif ($type == 'boolean') {
			$value = $value ? "'1'" : "'0'";
		}
		return $value;
	}

	private function properties($arg) {
		$props = array();
		$params = array_map(function ($i) { return trim($i); }, str_getcsv($arg, ",", "'"));
		foreach($params as $prop) {
			list($property, $value) = explode(':', $prop);
			$props[$property] = $value;
		}
		return (object)$props;
	}

	public function convert($name, $schemafile, $datafile) {
		$schema = file_get_contents($schemafile);
		if ($schema === false) {
			throw new Exception("JSON schema file '$schemafile' schema doesn't exists");
		} else {
			$schema = json_decode($schema);
		}
		$data = file_get_contents($datafile);
		if ($data === false) {
			throw new Exception("JSON data file '$datafile' data doesn't exists");
		} else {
			$data = json_decode($data);
		}
		$dbtype = '';
		$dbschema = '';
		$dbhost = '';
		$dbport = '';
		$dbuser = '';
		$dbpassword = '';
		switch($this->parameters['database_driver']) {
			case 'pdo_sqlite':
				$dbtype = 'sqlite';
				$dbschema =  $name . ".db";
				$this->database = new Database(null, 1, $dbtype, $dbschema);
				break;
			case 'pdo_mysql':
				$dbtype = 'mysqli';
				$dbschema = $name;
				$this->database = new Database(null, 1, $dbtype, str_replace('-', '_', $dbschema));
				if ($this->parameters['database_host'] != "") {
					$database->setHost($this->parameters['database_host']);
				}
				if ($this->parameters['database_port'] != "") {
					$database->setPort((int)$this->parameters['database_port']);
				}
				if ($this->parameters['database_user'] != "") {
					$database->setUser($this->parameters['database_user']);
				}
				if ($this->parameters['database_password'] != "") {
					$database->setPassword($this->parameters['database_password']);
				}
				$this->database->connect(false);
				$this->database->exec("create database if not exists " . $dbschema . " character set utf8");
				$this->database->setConnected(false);
				break;
			case 'pdo_pgsql':
				$dbtype = 'pgsql';
				$dbschema = $name;
				$this->database = new Database(null, 1, $dbtype, str_replace('-', '_', $dbschema));
				if ($this->parameters['database_host'] != "") {
					$database->setHost($this->parameters['database_host']);
				}
				if ($this->parameters['database_port'] != "") {
					$database->setPort((int)$this->parameters['database_port']);
				}
				if ($this->parameters['database_user'] != "") {
					$database->setUser($this->parameters['database_user']);
				}
				if ($this->parameters['database_password'] != "") {
					$database->setPassword($this->parameters['database_password']);
				}
				$this->database->connect(false);
				$this->database->exec("create database " . $dbschema. " encoding 'UTF8'");
				$this->database->setConnected(false);
				break;
		}
		$this->database->connect();
		$tables = array();
		foreach ($schema->properties as $table => $descr) {
			$columns = array();
			$primarykeys = array();
			$create_table = "create table $table (\n";
			foreach ($descr->items->properties as $col => &$coldef) {
				if (preg_match('/^(.*)\[([^\]]+)\]$/', $coldef->title, $m)) {
					$props = $this->properties($m[2]);
					$coldef->title = trim($m[1]);
				} else {
					$props = (object)array();
				}
				if ($this->parameters['database_driver'] == 'pdo_pgsql' && isset($props->autoincrement)) {
					$type = 'serial';
				} else {
					$type = $this->get_type($coldef);
				}
				$create_table .= "\t" . $col . " " . $type;
				if (in_array($col, $descr->items->required)) {
					$create_table .= " NOT NULL";
				}
				if (isset($props->autoincrement) && isset($props->primarykey)) {
					switch ($this->parameters['database_driver']) {
						case 'pdo_pgsql':
							$create_table .= " PRIMARY KEY";
							break;
						case 'pdo_mysql':
							$create_table .= " PRIMARY KEY AUTO_INCREMENT";
							break;
						default:
							$create_table .= " PRIMARY KEY AUTOINCREMENT";
					}
				} elseif (isset($props->primarykey)) {
					$primarykeys[$props->primarykey - 1] = $col;
				}
				if (isset($coldef->default)) {
					$create_table .= " DEFAULT " . $this->get_value($coldef->type, $coldef->default);
				}
				$create_table .= ",\n";
				$column = array(
					'name' => $col,
					'type' => isset($props->type) ? $props->type: $coldef->type, 
					'label' => $coldef->title,
					'description' => $coldef->description
				);
				if (isset($coldef->oneOf)) {
					$choices = array();
					foreach($coldef->oneOf as $one) {
						$choices[] = array(
							'value' => $one->enum[0],
							'label' => $one->title
						);
					}
					$column['choices'] = $choices;
				} elseif (isset($props->datasource)) {
					$source = array(
						'datasource' => $props->datasource, 
						'returnType' => $props->returnType, 
						'valueColumn' => $props->valueColumn, 
						'labelColumn' => $props->labelColumn
					);
					if (isset($props->request)) {
						$source['request'] = $props->request;
					}
					if (isset($props->returnPath)) {
						$source['returnPath'] = $props->returnPath;
					}
					$column['source'] = $source;
				}
				$columns[] = $column;
			}
			if (count($primarykeys) > 0) {
				ksort($primarykeys);
				$create_table .= "\tPRIMARY KEY (" . implode(", ", $primarykeys) . ")";
			}
			$create_table = preg_replace("/,$/", "", $create_table);
			$create_table .= ")\n";
			$this->database->exec($create_table);
			foreach ($data->$table as $row) {
				$cols = array();
				$values = array();
				foreach ($row as $col => $value) {
					$type = $descr->items->properties->$col->type;
					$cols[] = $col;
					$values[] = $this->get_value($type, $value);
				}
				$arow = (array)$row;
				$insert_row = "insert into $table (";
				$insert_row .= implode(", ", $cols);
				$insert_row .= ") values (" ;
				$insert_row .= implode(", ", $values);
				$insert_row .= ")\n";
				$this->database->exec($insert_row);
			}
			$tables[] = array(
				'name' => $table,
				'label' => $descr->title,
				'description' => $descr->description,
				'columns' => $columns
			);
		}
		if ($this->database->getConnection()->inTransaction ()) {
			$this->database->getConnection()->commit();
		}
		return array(
			'datasource-type' => 'internal',
			'datasource-name' => $schema->title,
			'datasource-description' => $schema->description,
			'datasource-tables' => $tables,
			'datasource-database-type' => $this->database->getType(),
			'datasource-database-name' => $dbschema,
			'datasource-database-label' => $schema->description,
			'datasource-database-host' => $this->database->getHost(),
			'datasource-database-port' => $this->database->getPort(),
			'datasource-database-user' => $this->database->getUser(),
			'datasource-database-password' => $this->database->getPassword()
		);
	}
}

?>