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

namespace EUREKA\G6KBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

use EUREKA\G6KBundle\Entity\Database;

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

class DataSourcesAdminController extends BaseAdminController {
	
	private $log = array();
	private $datasources = array();
	
	private $db_dir;
	
	private $request;
	private $script;
	
	private $datatypes = array(
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
			'array' => 'string',
			'boolean' => 'boolean',
			'choice' => 'integer',
			'country' => 'integer',
			'date' => 'string',
			'day' => 'integer',
			'department' => 'string',
			'integer' => 'integer',
			'money' => 'number',
			'month' => 'integer',
			'multichoice' => 'string',
			'number' => 'number',
			'percent' => 'number',
			'region' => 'integer',
			'text' => 'string',
			'textarea' => 'string',
			'year' => 'integer'
		)
	);

	public function indexAction(Request $request, $dsid = null, $table = null, $crud = null) {
		$this->request = $request;
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$this->script = $no_js == 1 ? 0 : 1;

		$this->db_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/databases";
		if (file_exists($this->db_dir."/DataSources.xml")) {
			$this->datasources = new \SimpleXMLElement($this->db_dir."/DataSources.xml", LIBXML_NOWARNING, true);
		} else {
			$this->datasources = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><DataSources xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/DataSources.xsd"><Databases></Databases></DataSources>', LIBXML_NOWARNING);
		}
		if ($crud !== null) {
			if (! $this->get('security.context')->isGranted('ROLE_CONTRIBUTOR')) {
				return $this->errorResponse($form, "Access denied!");
			}
			if ($crud == 'create-datasource') {
				return $this->createDatasource ($form);
			} elseif ($crud == 'edit-datasource') {
				return $this->showDatasources($dsid, null, "edit");
			} elseif ($crud == 'doedit-datasource') {
				return $this->doEditDatasource ($dsid, $form);
			} elseif ($crud == 'drop-datasource') {
				return $this->dropDatasource ($dsid);
			} else {
				$database = $this->getDatabase($dsid);
				switch ($crud) {
					case 'add':
						return $this->addTableRow ($form, $table, $database);
					case 'update':
						return $this->updateTableRow ($form, $table, $database);
					case 'delete':
						return $this->deleteTableRow ($form, $table, $database);
					case 'create':
						return $this->createTable ($form, $database);
					case 'edit':
						return $this->editTable ($table, $database);
					case 'doedit':
						return $this->doEditTable ($form, $table, $database);
					case 'drop':
						return $this->dropTable ($table, $database);
				}
			}
		} else if (! $this->get('security.context')->isGranted('ROLE_CONTRIBUTOR')) {
			throw $this->AccessDeniedException ($this->get('translator')->trans("Access Denied!"));
		} else {
			return $this->showDatasources($dsid, $table);
		}
	}

	protected function showDatasources($dsid, $table = null, $action = 'show') {
		$dbname = null;
		$datasources = array();
		$dss = $this->datasources->xpath("/DataSources/DataSource");
		foreach ($dss as $ds) {
			$ds_id = (string)$ds['id'];
			$dstype = (string)$ds['type'];
			$dsname = (string)$ds['name'];
			if ($dstype == 'internal' || $dstype == 'database') {
				$dsdatabase = (string)$ds['database'];
				$db = $this->datasources->xpath("/DataSources/Databases/Database[@id='".$dsdatabase."']")[0];
				$id = (string)$db['id'];
				$type = (string)$db['type'];
				$name = (string)$db['name'];
				$label = (string)$db['label'];
				if ($type == 'sqlite') {
					if (preg_match('/^(.*)\.db$/',$name, $matches) && file_exists($this->db_dir.'/'.$name)) {
						$datasources[] = array(
							'id' => $ds_id,
							'type' => $dstype,
							'name' => $dsname,
							'database' => array('id' => $id, 'type' => $type, 'name' => $name, 'label' => $label)
						);
						
					}
				} elseif ($type == 'jsonsql') {
					if (file_exists($this->db_dir.'/'.$name.".schema.json") && file_exists($this->db_dir.'/'.$name.".json")) {
						$datasources[] = array(
							'id' => $ds_id,
							'type' => $dstype,
							'name' => $dsname,
							'database' => array('id' => $id, 'type' => $type, 'name' => $name, 'label' => $label)
						);
					}
				} else {
					$host = (string)$db['host'];
					$port = (string)$db['port'];
					$user = (string)$db['user'];
					$password = (string)$db['password'];
					$datasources[] = array(
						'id' => $ds_id,
						'type' => $dstype,
						'name' => $dsname,
						'database' => array(
							'id' => $id, 'type' => $type, 'name' => $name, 'label' => $label, 
							'host' => $host, 'port' => $port, 'user' => $user, 'password' => $password
						)
					);
				}
			} elseif ($dstype == 'uri') {
				$dsuri = (string)$ds['uri'];
				$datasources[] = array(
					'id' => $ds_id,
					'type' => $dstype,
					'name' => $dsname,
					'uri' => $dsuri
				);
			}
		}
		$datasource = array();
		$tabledef = array();
		$tables = array();
		$tableinfos = array();
		$tabledatas = array();
		$dbname = '';
		if ($dsid !== null) {
			if ($dsid == 0) {
				$type = 'jsonsql';
				if ($this->get('kernel')->getContainer()->hasParameter('database_driver')) {
					switch ($this->get('kernel')->getContainer()->getParameter('database_driver')) {
						case 'pdo_sqlite':
							$type = 'sqlite';
							break;
						case 'pdo_mysql':
							$type = 'mysqli';
							break;
						case 'pdo_pgsql':
							$type = 'pgsql';
							break;
					}
				}
				$datasource = array(
					'action' => 'create',
					'id' => 0,
					'type' => 'internal',
					'name' => 'New Datasource',
					'label' => 'New Datasource',
					'database' => array(
						'id' => 0, 
						'type' => $type, 
						'name' => '', 
						'label' => '', 
						'host' => $this->get('kernel')->getContainer()->hasParameter('database_host') ? $this->get('kernel')->getContainer()->getParameter('database_host') : '', 
						'port' => $this->get('kernel')->getContainer()->hasParameter('database_port') ? $this->get('kernel')->getContainer()->getParameter('database_port') : '',
						'user' => $this->get('kernel')->getContainer()->hasParameter('database_user') ? $this->get('kernel')->getContainer()->getParameter('database_user') : '', 
						'password' => ''
					),
					'uri' => '',
					'description' => '',
				);
			} else {
				$dss = $this->datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
				$datasource = array(
					'action' => $action,
					'id' => (int)$dss[0]['id'],
					'type' => (string)$dss[0]['type'],
					'name' => (string)$dss[0]['name'],
					'label' => (string)$dss[0]['name'],
					'database' => array(
						'id' => (int)$dss[0]['database'], 'type' => '', 'name' => '', 'label' => '', 
						'host' => '', 'port' => 0, 'user' => '', 'password' => ''
					),
					'uri' => (string)$dss[0]['uri'],
					'description' => (string)$dss[0]->Description,
				);
				if ($datasource['type'] == 'internal' || $datasource['type'] == 'database') {
					$database = $this->getDatabase($dsid);
					$dbname = $database->getName();
					$datasource['label'] = $database->getLabel();
					$datasource['database']['id'] = $database->getId();
					$datasource['database']['type'] = $database->getType();
					$datasource['database']['name'] = $database->getName();
					$datasource['database']['label'] = $database->getLabel();
					$datasource['database']['host'] = $database->getHost();
					$datasource['database']['port'] = $database->getPort();
					$datasource['database']['user'] = $database->getUser();
					$datasource['database']['password'] = $database->getPassword();
					if ($datasource['type'] == 'internal' && $table !== null) {
						$tabledef['name'] = $table;
						$tabledef['label'] = $table != 'new' ? $table : 'New Table';
						$tabledef['description'] = '';
						if ($table != 'new') {
							$tableinfos = $this->tableInfos($database, $table);
							foreach($tableinfos as $i => $info) {
								$columns = $this->datasources->xpath("/DataSources/DataSource[@type='internal' and @database='".$database->getId()."']/Table[@name='".$table."']/Column[@name='".$info['name']."']");
								$tableinfos[$i]['g6k_type'] = (count($columns) > 0) ? (string)$columns[0]['type'] : $info['type'];
								$tableinfos[$i]['label'] = (count($columns) > 0) ? (string)$columns[0]['label'] : $info['name'];
								$tableinfos[$i]['description'] = (count($columns) > 0) ? (string)$columns[0]->Description : '';
								if ($tableinfos[$i]['g6k_type'] == 'choice' && count($columns) > 0 && $columns[0]->Choices) {
									$choices = array();
									foreach ($columns[0]->Choices->Choice as $choice) {
										$choices[(string)$choice['value']] = (string)$choice['label'];
									}
									if ($columns[0]->Choices->Source) {
										$source = $columns[0]->Choices->Source;
										$result = $this->processSource($source);
										if ($result !== null) {
											$valueColumn = (string)$source['valueColumn'];
											$labelColumn = (string)$source['labelColumn'];
											foreach ($result as $row) {
												$choices[$row[$valueColumn]] =  $row[$labelColumn];
											}
										}
									}
									$tableinfos[$i]['choices'] = $choices;
								}
							}
							$tabledatas = $database->query("SELECT * FROM ".$table);
							foreach($tabledatas as $r => $row) {
								$i = 0;
								foreach ($row as $c => $cell) {
									if ($tableinfos[$i]['g6k_type'] == 'date' && $cell !== null) {
										$date = $this->parseDate('Y-m-d', $cell);
										$tabledatas[$r][$c] = $date->format('d/m/Y');
									} elseif ($tableinfos[$i]['g6k_type'] == 'money' || $tableinfos[$i]['g6k_type'] == 'percent') {
										$tabledatas[$r][$c] = number_format ( (float) $cell, 2, ",", "" );
									} elseif ($tableinfos[$i]['g6k_type'] == 'number') {
										$tabledatas[$r][$c] = str_replace ( ".", ",", $cell);
									} elseif ($tableinfos[$i]['g6k_type'] == 'choice') {
										$tabledatas[$r][$c] = $tableinfos[$i]['choices'][$cell];
									}
									$i++;
								}
							}
						}
					}
					if ($datasource['type'] == 'internal') {
						$tables = $this->tablesList($database);
						foreach($tables as $i => $tbl) {
							$tbls = $this->datasources->xpath("/DataSources/DataSource[@type='internal' and @database='".$database->getId()."']/Table[@name='".$tbl['name']."']");
							$tables[$i]['label'] = (count($tbls) > 0) ? (string)$tbls[0]['label'] : $tbl['name'];
							$tables[$i]['description'] = (count($tbls) > 0) ? (string)$tbls[0]->Description : '';
							if ($table !== null && $tbl['name'] == $table) {
								$tabledef['label'] = $tables[$i]['label'];
								$tabledef['description'] = $tables[$i]['description'];
							}
						}
					}
				}
			}
		}
 		$hiddens = array();
		$hiddens['script'] = $this->script;
		$silex = new Application();
		$silex->register(new MobileDetectServiceProvider());
		try {
			return $this->render(
				'EUREKAG6KBundle:admin/pages:datasources.html.twig',
				array(
					'ua' => $silex["mobile_detect"],
					'path' => $this->request->getScheme().'://'.$this->request->getHttpHost(),
					'nav' => 'datasources',
					'datasource' => $datasource,
					'datasources' => $datasources,
					'dsid' => $dsid,
					'dbname' => $dbname,
					'tables' => $tables,
					'table' => $tabledef,
					'tableinfos' => $tableinfos,
					'tabledatas' => $tabledatas,
					'hiddens' => $hiddens
				)
			);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}

	protected function processSource($source) {
		$datasources = $this->datasources->xpath("/DataSources/DataSource[@id='".$source['datasource']."']");
		switch ((string)$datasources[0]['type']) {
			case 'uri':
				$uri = (string)$datasources[0]['uri'] . (string)$source['request'];
				$result = file_get_contents($uri);
				break;
			case 'database':
			case 'internal':
				$databases = $this->datasources->xpath("/DataSources/Databases/Database[@id='".(string)$datasources[0]['database']."']");
				$database = new Database(null, (int)$databases[0]['id'], (string)$databases[0]['type'], (string)$databases[0]['name']);
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
				}
				$query = (string)$source['request'];
				$database->connect();
				$result = $database->query($query);
				break;
		}
		switch ((string)$source['returnType']) {
			case 'singleValue':
				return $result;
			case 'json':
				$json = json_decode($result, true);
				$keys = explode("/", (string)$source['returnPath']);
				foreach ($keys as $key) {
					if (ctype_digit($key)) {
						$key = (int)$key;
					}
					if (! isset($json[$key])) {
						break;
					}
					$json = $json[$key];
				}
				return $json;
			case 'assocArray':
				$keys = explode("/", (string)$source['returnPath']);
				foreach ($keys as $key) {
					if (ctype_digit($key)) {
						$key = (int)$key;
					}
					if (! isset($result[$key])) {
						break;
					}
					$result = $result[$key];
				}
				return $result;
			case 'xml':
				$xml = new SimpleXMLElement($result);
				return $xml->xpath((string)$source['returnPath']);
		}
		return null;
	}

	protected function getDatabase($dsid, $withDbName = true) {
		$datasources = $this->datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
		$dbid = (int)$datasources[0]['database'];
		$databases = $this->datasources->xpath("/DataSources/Databases/Database[@id='".$dbid."']");
		$dbtype = (string)$databases[0]['type'];
		$dbname = (string)$databases[0]['name'];
		$database = new Database(null, $dbid, $dbtype, $dbname);
		if ((string)$databases[0]['label'] != "") {
			$database->setLabel((string)$databases[0]['label']);
		} else {
			$database->setLabel($dbname);
		}
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
				$user = $this->get('kernel')->getContainer()->getParameter('database_user');
				if ((string)$databases[0]['user'] == $user) {
					$database->setPassword($this->get('kernel')->getContainer()->getParameter('database_password'));
				}
			} catch (\Exception $e) {
			}
		}
		$database->connect($withDbName);
		return $database;
	}

	protected function checkValue($name, $info, $value) {
		if ($value === null || $value == '') {
			if ($info['notnull'] == 1) { 
				return sprintf("The field '%s' is required", $info['label']);
			} else {
				return true;
			}
		}
		switch ($info['g6k_type']) {
			case 'date':
				if (! preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $value)) {
					return sprintf("The field '%s' is not a valid date", $info['label']);
				}
				break;
			case 'boolean':
				if ( ! in_array($value, array('0', '1', 'false', 'true'))) {
					return sprintf("The field '%s' is invalid", $info['label']);
				}
				break;
			case 'number': 
				$value = str_replace(",", ".", $value);
				if (! is_numeric($value)) {
					return sprintf("The field '%s' is not a number", $info['label']);
				}
				break;
			case 'integer': 
				if (! ctype_digit ( $value )) {
					return sprintf("The field '%s' is not a number", $info['label']);
				}
				break;
			case 'day': 
				if (! ctype_digit ( $value ) || (int)$value > 31) {
					return sprintf("The field '%s' is invalid", $info['label']);
				}
				break;
			case 'month': 
				if (! ctype_digit ( $value ) || (int)$value > 12 ) {
					return sprintf("The field '%s' is invalid", $info['label']);
				}
				break;
			case 'year': 
				if (! ctype_digit ( $value ) || strlen($value) != 4 ) {
					return sprintf("The field '%s' is not a valid year", $info['label']);
				}
				break;
			case 'text': 
			case 'textarea': 
				break;
			case 'money': 
				$value = str_replace(",", ".", $value);
				if (! preg_match("/^\d+(\.\d{1,2})?$/", $value)) {
					return sprintf("The field '%s' is not a valid currency", $info['label']);
				}
				break;
			case 'choice':
				foreach ($info['choices'] as $val => $label) {
					if ($value == $val) {
						return true;
					}
				}
				return sprintf("The field '%s' is invalid", $info['label']);
			case 'percent':
				$value = str_replace(",", ".", $value);
				if (! is_numeric($value)) {
					return sprintf("The field '%s' is not numeric", $info['label']);
				}
				break;
		}
		return true;
	}

	protected function tablesList($database) {
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

	protected function tableInfos($database, $table) {
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

	protected function infosColumns($database, $table) {
		$infosColumns = array();
		$tableinfos = $this->tableInfos($database, $table);
		foreach($tableinfos as $i => $info) {
			$infosColumns[$info['name']]['notnull'] = $info['notnull'];
			$infosColumns[$info['name']]['dflt_value'] = $info['dflt_value'];
			$columns = $this->datasources->xpath("/DataSources/DataSource[@type='internal' and @database='".$database->getId()."']/Table[@name='".$table."']/Column[@name='".$info['name']."']");
			$infosColumns[$info['name']]['g6k_type'] = (count($columns) > 0) ? (string)$columns[0]['type'] : $info['type'];
			$infosColumns[$info['name']]['type'] = $info['type'];
			$infosColumns[$info['name']]['label'] = (count($columns) > 0) ? (string)$columns[0]['label'] : $info['name'];
			if ($infosColumns[$info['name']]['g6k_type'] == 'choice' && count($columns) > 0 && $columns[0]->Choices) {
				$choices = array();
				foreach ($columns[0]->Choices->Choice as $choice) {
					$choices[(string)$choice['value']] = (string)$choice['label'];
				}
				if ($columns[0]->Choices->Source) {
					$source = $columns[0]->Choices->Source;
					$result = $this->processSource($source);
					if ($result !== null) {
						$valueColumn = (string)$source['valueColumn'];
						$labelColumn = (string)$source['labelColumn'];
						foreach ($result as $row) {
							$choices[$row[$valueColumn]] =  $row[$labelColumn];
						}
					}
				}
				$infosColumns[$info['name']]['choices'] = $choices;
			}
		}
		return $infosColumns;
	}

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

	protected function createDatasource ($form) {
		// $response = new Response();
		// $response->setContent(json_encode($form));
		// $response->headers->set('Content-Type', 'application/json');
		// return $response;

		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$dss = $xpath->query("/DataSources");
		$dbs = $xpath->query("/DataSources/Databases");
		$type = $form['datasource-type'];
		$ds = $dss->item(0)->getElementsByTagName('DataSource');
		$len = $ds->length;
		$maxId = 0;
		for($i = 0; $i < $len; $i++) {
			$id = (int)$ds->item($i)->getAttribute('id');
			if ($id > $maxId) {
				$maxId = $id;
			}
		}
		$datasource = $dom->createElement("DataSource");
		$datasource->setAttribute('id', $maxId + 1);
		$datasource->setAttribute('type', $type);
		$datasource->setAttribute('name', $form['datasource-name']);
		$descr = $dom->createElement("Description");
		$descr->appendChild($dom->createCDATASection(preg_replace("/(\<br\>)+$/", "", $form['datasource-description'])));
		$datasource->appendChild($descr);
		switch($type) {
			case 'internal':
			case 'database':
				$db = $dbs->item(0)->getElementsByTagName('Database');
				$len = $db->length;
				$maxId = 0;
				for($i = 0; $i < $len; $i++) {
					$id = (int)$db->item($i)->getAttribute('id');
					if ($id > $maxId) {
						$maxId = $id;
					}
				}
				$dbtype = $form['datasource-database-type'];
				$database = $dom->createElement("Database");
				$database->setAttribute('id', $maxId + 1);
				$database->setAttribute('type', $dbtype);
				$database->setAttribute('name', $form['datasource-database-name']);
				$database->setAttribute('label', $form['datasource-database-label']);
				if ($dbtype == 'mysqli' || $dbtype == 'pgsql') {
					$database->setAttribute('host', $form['datasource-database-host']);
					$database->setAttribute('port', $form['datasource-database-port']);
					$database->setAttribute('user', $form['datasource-database-user']);
					if (isset($form['datasource-database-password'])) {
						$database->setAttribute('password', $form['datasource-database-password']);
					}
				}
				$dbs->item(0)->appendChild($database);
				$datasource->setAttribute('database', $database->getAttribute('id'));
				break;
			case 'uri':
				$datasource->setAttribute('uri', $form['datasource-name']);
				$datasource->setAttribute('method', $form['datasource-method']);
				break;
		}
		$dss->item(0)->insertBefore($datasource, $dbs->item(0));
		$this->saveDatasources($dom);
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasource', array('dsid' => $datasource->getAttribute('id'))));
	}

	protected function migrateDB($dsid, $dbtype, $fromDatabase) {
		$datasource = $this->datasources->xpath("/DataSources/DataSource[@id='".$dsid."']")[0];
		try {
			if ($dbtype == 'jsonsql' || $dbtype == 'sqlite') {
				$database = $this->getDatabase($dsid);
			} else {
				$database = $this->getDatabase($dsid, false);
			}
		} catch (Exception $e) {
			return "Can't get database : " . $e->getMessage();
		}
		switch ($database->getType()) {
			case 'pgsql':
				$dbschema = str_replace('-', '_', $database->getName());
				try {
					$database->exec("CREATE DATABASE " . $dbschema. " encoding 'UTF8'");
					$database->setConnected(false);
					$database->connect();
				} catch (Exception $e) {
					return "Can't create database $dbschema : " . $e->getMessage();
				}
				break;
			case 'mysql':
			case 'mysqli':
				$dbschema = str_replace('-', '_', $database->getName());
				try {
					$database->exec("CREATE DATABASE IF NOT EXISTS " . $dbschema . " character set utf8");
					$database->setConnected(false);
					$database->connect();
				} catch (Exception $e) {
					return "Can't create database $dbschema : " . $e->getMessage();
				}
				break;
		}
		foreach ($datasource->children() as $child) {
			if ($child->getName() == 'Table') {
				$table = (string)$child['name'];
				$infosColumns = $this->infosColumns($fromDatabase, $table);
				$form = $this->infosColumnsToForm($table, $infosColumns);
				if (($result = $this->createDBTable($form, $database)) !== true) {
					return $result;
				}
				$fields = implode(", ", $form['field']);
				$rows = $fromDatabase->query("select ". $fields . " from " . $table . " order by id");
				foreach ($rows as $row) {
					$values = array();
					foreach ($row as $name => $value) {
						$info = $infosColumns[$name];
						if ($value === null || $value == '') {
							$values[] = "NULL";
						} else if ( $info['g6k_type'] == 'text' || $info['g6k_type'] == 'date' || preg_match("/^(text|char|varchar)/i", $info['type'])) {
							$values[] = $database->quote($value);
						} else  {
							$values[] = str_replace(",", ".", $value);
						}
					}
					$insert = "INSERT INTO " . $table . " (" . $fields . ") values (" . implode(", ", $values) . ")";
					try {
						$database->exec($insert);
					} catch (Exception $e) {
						return "Can't insert to $table of database $dbschema : " . $e->getMessage();
					}
				}
			}
		}
		if ($database->gettype() == 'jsonsql') {
			$database->getConnection()->commit();
		}
		return true;
	}

	protected function createDBTable($form, $database) {
		$create = "create table " . $form['table-name'] . " (\n";
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
		foreach ($form['field'] as $i => $field) {
			$create .= $field . " " . $this->datatypes[$database->getType()][$form['type'][$i]];
			if ($form['notnull'][$i] == 1) {
				$create .= " not null";
			}
			if ($i < count($form['field']) - 1 ) {
				$create .= ",";
			}
			$create .= "\n";
		}
		$create .= ")";
		try {
			$database->exec($create);
		} catch (Exception $e) {
			return "Can't create {$form['table-name']} : " . $e->getMessage();
		}
		return true;
	}

	protected function addDBTableRow($form, $table, $database) {
		$infosColumns = $this->infosColumns($database, $table);
		$insertNames = array();
		$insertValues = array();
		foreach($infosColumns as $name => $info) {
			$value = isset($form[$name]) ? $form[$name] : null;
			if (($check = $this->checkValue($name, $info, $value)) !== true) {
				return $check;
			}
			if ($name != 'id') {
				$insertNames[] = $name;
				if ($value === null || $value == '') {
					$insertValues[] = "NULL";
				} else if ($info['g6k_type'] == 'date') {
					$insertValues[] = $this->parseDate('d/m/Y', $value)->format('Y-m-d');
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
		} catch (Exception $e) {
			return "Can't insert to $table : " . $e->getMessage();
		}
		return true;
	}

	protected function updateDBTableRow($form, $table, $database) {
		$infosColumns = $this->infosColumns($database, $table);
		$updateFields = array();
		foreach($infosColumns as $name => $info) {
			$value = isset($form[$name]) ? $form[$name] : null;
			if (($check = $this->checkValue($name, $info, $value)) !== true) {
				return $check;
			}
			if ($name != 'id') {
				if ($value === null || $value == '') {
					$updateFields[] = $name . "=NULL";
				} else if ($info['g6k_type'] == 'date') {
					$updateFields[] = $name . "='" . $this->parseDate('d/m/Y', $value)->format('Y-m-d') . "'";
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
		$sql = "UPDATE ".$table." SET ".implode(', ', $updateFields)." WHERE id=".$form['id'];
		try {
			$database->exec($sql);
		} catch (Exception $e) {
			return "Can't update $table : " . $e->getMessage();
		}
		return true;
	}

	protected function deleteDBTableRow($form, $table, $database) {
		try {
			$database->exec("DELETE FROM ".$table." WHERE id=".$form['id']);
		} catch (Exception $e) {
			return "Can't delete from $table : " . $e->getMessage();
		}
		return true;
	}

	protected function dropDBTable($table, $database) {
		try {
			$database->exec("DROP TABLE ".$table);
		} catch (Exception $e) {
			return "Can't drop $table : " . $e->getMessage();
		}
		return true;
	}

	protected function createTable($form, $database) {
		// print_r($form);
		// $response = new Response();
		// $response->setContent(json_encode($form));
		// $response->headers->set('Content-Type', 'application/json');
		// return $response;
		
		if (($result = $this->createDBTable($form, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $xpath->query("/DataSources/DataSource[@type='internal' and @database='".$database->getId()."']")->item(0);
		$tables = $datasource->getElementsByTagName('Table');
		$len = $tables->length;
		$maxId = 0;
		for($i = 0; $i < $len; $i++) {
			$id = (int)$tables->item($i)->getAttribute('id');
			if ($id > $maxId) {
				$maxId = $id;
			}
		}
		$newTable = $dom->createElement("Table");
		$newTable->setAttribute('id', ''.($maxId + 1));
		$newTable->setAttribute('name', $form['table-name']);
		$newTable->setAttribute('label', $form['table-label']);
		$descr = $dom->createElement("Description");
		$descr->appendChild($dom->createCDATASection(preg_replace("/(\<br\>)+$/", "", $form['table-description'])));
		$newTable->appendChild($descr);
		foreach ($form['field'] as $i => $field) {
			$column = $dom->createElement("Column");
			$column->setAttribute('id', $i + 1);
			$column->setAttribute('name', $field);
			$column->setAttribute('type', $form['type'][$i]);
			$column->setAttribute('label', $form['label'][$i]);
			$descr = $dom->createElement("Description");
			$descr->appendChild($dom->createCDATASection(preg_replace("/(\<br\>)+$/", "", $form['description'][$i])));
			$column->appendChild($descr);
			if ($form['type'][$i] == 'choice' || $form['type'][$i] == 'multichoice') {
				$choices = $dom->createElement("Choices");
				if (isset($form['field-'.$i.'-choicesource-datasource'])) {
					$source = $dom->createElement("Source");
					$source->setAttribute('id', 1);
					$source->setAttribute('datasource', $form['field-'.$i.'-choicesource-datasource']);
					$source->setAttribute('returnType', $form['field-'.$i.'-choicesource-returnType']);
					$source->setAttribute('valueColumn', $form['field-'.$i.'-choicesource-valueColumn']);
					$source->setAttribute('labelColumn', $form['field-'.$i.'-choicesource-labelColumn']);
					if (isset($form['field-'.$i.'-choicesource-request'])) {
						$source->setAttribute('request', $form['field-'.$i.'-choicesource-request']);
					}
					if (isset($form['field-'.$i.'-choicesource-returnPath'])) {
						$source->setAttribute('returnPath', $form['field-'.$i.'-choicesource-returnPath']);
					}
					$choices->appendChild($source);
				} else{
					foreach ($form['field-'.$i.'-choice-value'] as $c => $value) {
						$choice = $dom->createElement("Choice");
						$choice->setAttribute('id', $c + 1);
						$choice->setAttribute('value', $value);
						$choice->setAttribute('label', $form['field-'.$i.'-choice-label'][$c]);
						$choices->appendChild($choice);
					}
				}
				$column->appendChild($choices);
			}
			$newTable->appendChild($column);
		}
		$datasource->appendChild($newTable);
		$this->saveDatasources($dom);
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasource_table', array('dsid' => $datasource->getAttribute('id'), 'table' => $form['table-name'])));
	}

	protected function saveDatasources($dom) {
		$xml = $dom->saveXML(null, LIBXML_NOEMPTYTAG);
		$dom = new \DOMDocument();
		$dom->preserveWhiteSpace  = false;
		$dom->formatOutput = true;
		$dom->loadXml($xml);
		$formatted = preg_replace_callback('/^( +)</m', function($a) { 
			return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
		}, $dom->saveXML(null, LIBXML_NOEMPTYTAG));
		file_put_contents($this->db_dir."/DataSources.xml", $formatted);
	}

	protected function addTableRow($form, $table, $database) {
		if ($form['id'] > 0) {
			return $this->errorResponse($form, "This record already exists.");
		}
		if (($result = $this->addDBTableRow($form, $table, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$form['id'] = $database->lastInsertId($table);
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function updateTableRow($form, $table, $database) {
		if ($form['id'] == 0) {
			return $this->addTableRow ($form, $table, $database);
		}
		if (($result = $this->updateDBTableRow($form, $table, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function deleteTableRow($form, $table, $database) {
		if ($form['id'] == 0) {
			return $this->errorResponse($form, "There's no record with id 0.");
		}
		if (($result = $this->deleteDBTableRow($form, $table, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function editTable($table, $database) {
	}

	protected function doEditTable($form, $table, $database) {
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function dropTable($table, $database) {
		if (($result = $this->dropDBTable($table, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $xpath->query("/DataSources/DataSource[@type='internal' and @database='".$database->getId()."']")->item(0);
		$tables = $datasource->getElementsByTagName('Table');
		$len = $tables->length;
		$maxId = 0;
		for($i = 0; $i < $len; $i++) {
			$name = $tables->item($i)->getAttribute('name');
			if ($name == $table) {
				$datasource->removeChild($tables->item($i));
				break;
			}
		}
		$this->saveDatasources($dom);
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasource', array('dsid' => $datasource->getAttribute('id'))));
	}

	protected function doEditDatasource($dsid, $form) {
		// $response = new Response();
		// $response->setContent(json_encode($form));
		// $response->headers->set('Content-Type', 'application/json');
		// return $response;
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $xpath->query("/DataSources/DataSource[@id='".$dsid."']")->item(0);
		$oldType = $datasource->getAttribute('type');
		$type = $form['datasource-type'];
		$datasource->setAttribute('type', $type);
		$datasource->setAttribute('name', $form['datasource-name']);
		$descr = $dom->createElement("Description");
		$descr->appendChild($dom->createCDATASection(preg_replace("/(\<br\>)+$/", "", $form['datasource-description'])));
		$oldDescr = $datasource->getElementsByTagName('Description');
		if ($oldDescr->length > 0) {
			$datasource->replaceChild ($descr, $oldDescr->item(0));
		} else {
			$children = $datasource->getElementsByTagName('*');
			if ($children->length > 0) {
				$datasource->insertBefore($descr, $children->item(0));
			} else {
				$datasource->appendChild($descr);
			}
		}
		$sameDatabase = true;
		if ($type == 'internal' && $oldType == 'internal') {
			$database = $xpath->query("/DataSources/Databases/Database[@id='".$datasource->getAttribute('database')."']")->item(0);
			if ($database->getAttribute('type') != $form['datasource-database-type']) {
				$sameDatabase = false;
			} else if ($database->getAttribute('name') != $form['datasource-database-name']) {
				$sameDatabase = false;
			} else if ($database->getAttribute('type') == 'mysqli' || $database->getAttribute('type') == 'pgsql') {
				if ($database->setAttribute('host') != $form['datasource-database-host']) {
					$sameDatabase = false;
				} else if ($database->setAttribute('port') != $form['datasource-database-port']) {
					$sameDatabase = false;
				} else if ($database->setAttribute('user') != $form['datasource-database-user']) {
					$sameDatabase = false;
				}
			}
			if (! $sameDatabase) {
				$fromDatabase = $this->getDatabase($dsid);
			}
		}
		switch($type) {
			case 'internal':
			case 'database':
				$dbtype = $form['datasource-database-type'];
				if ($oldType == 'uri') {
					$datasource->removeAttribute ('uri');
					$datasource->removeAttribute ('method');
					$dbs = $xpath->query("/DataSources/Databases");
					$db = $dbs->item(0)->getElementsByTagName('Database');
					$len = $db->length;
					$maxId = 0;
					for($i = 0; $i < $len; $i++) {
						$id = (int)$db->item($i)->getAttribute('id');
						if ($id > $maxId) {
							$maxId = $id;
						}
					}
					$database = $dom->createElement("Database");
					$database->setAttribute('id', $maxId + 1);
					$database->setAttribute('type', $dbtype);
					$database->setAttribute('name', $form['datasource-database-name']);
					$database->setAttribute('label', $form['datasource-database-label']);
					if ($dbtype == 'mysqli' || $dbtype == 'pgsql') {
						$database->setAttribute('host', $form['datasource-database-host']);
						$database->setAttribute('port', $form['datasource-database-port']);
						$database->setAttribute('user', $form['datasource-database-user']);
						if (isset($form['datasource-database-password'])) {
							$database->setAttribute('password', $form['datasource-database-password']);
						}
					}
					$dbs->item(0)->appendChild($database);
					$datasource->setAttribute('database', $database->getAttribute('id'));
				} else {
					$database = $xpath->query("/DataSources/Databases/Database[@id='".$datasource->getAttribute('database')."']")->item(0);
					$oldDbtype = $database->getAttribute('type');
					$database->setAttribute('type', $dbtype);
					$database->setAttribute('name', $form['datasource-database-name']);
					$database->setAttribute('label', $form['datasource-database-label']);
					if ($dbtype == 'mysqli' || $dbtype == 'pgsql') {
						$database->setAttribute('host', $form['datasource-database-host']);
						$database->setAttribute('port', $form['datasource-database-port']);
						$database->setAttribute('user', $form['datasource-database-user']);
						if (isset($form['datasource-database-password'])) {
							$database->setAttribute('password', $form['datasource-database-password']);
						} elseif ($database->hasAttribute('password')) {
							$database->removeAttribute ('password');
						}
					} else {
						if ($oldDbtype == 'mysqli' || $oldDbtype == 'pgsql') {
							$database->removeAttribute ('host');
							$database->removeAttribute ('port');
							$database->removeAttribute ('user');
							if ($database->hasAttribute('password')) {
								$database->removeAttribute ('password');
							}
						}
					}
				}
				break;
			case 'uri':
				$datasource->setAttribute('uri', $form['datasource-name']);
				$datasource->setAttribute('method', $form['datasource-method']);
				if ($oldType != 'uri') {
					$databases = $xpath->query("/DataSources/Databases")->item(0);
					$database = $xpath->query("/DataSources/Databases/Database[@id='".$datasource->getAttribute('database')."']")->item(0);
					$datasource->removeAttribute ('database');
					$databases->removeChild($database);
				}
				break;
		}
		$this->saveDatasources($dom);
		if ($type == 'internal' && $oldType == 'internal' && ! $sameDatabase) {
			$this->datasources = simplexml_import_dom($dom);
			$this->migrateDB($dsid, $dbtype, $fromDatabase);
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasource', array('dsid' => $datasource->getAttribute('id'))));
	}

	protected function dropDatasource ($dsid) {
		// $response = new Response();
		// $response->setContent(json_encode($dsid));
		// $response->headers->set('Content-Type', 'application/json');
		// return $response;

		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $xpath->query("/DataSources/DataSource[@id='".$dsid."']")->item(0);
		$type = $datasource->getAttribute('type');
		$descr = $datasource->getElementsByTagName('Description');
		if ($type == 'internal' || $type == 'database') {
			$dbs = $xpath->query("/DataSources/Databases");
			$database = $xpath->query("/DataSources/Databases/Database[@id='".$datasource->getAttribute('database')."']")->item(0);
			$dbtype = $database->getAttribute('type');
			if ($type == 'internal' && ($dbtype == 'jsonsql' || $dbtype == 'sqlite')) {
				$dbname = $database->getAttribute('name');
				// TODO : faut-il effacer les fichiers bases de données ?
			}
			$dbs->item(0)->removeChild($database);
		}
		$dss = $xpath->query("/DataSources");
		$dss->item(0)->removeChild ($datasource);
		$this->saveDatasources($dom);
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasources'));
	}

}
