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

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

use EUREKA\G6KBundle\Entity\Database;

use EUREKA\G6KBundle\Manager\ControllersHelper;
use EUREKA\G6KBundle\Manager\DatasourcesHelper;
use EUREKA\G6KBundle\Manager\Json\SQLToJSONConverter;
use EUREKA\G6KBundle\Manager\DOMClient as Client;
use EUREKA\G6KBundle\Manager\ResultFilter;

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

class DataSourcesAdminController extends BaseAdminController {

	const SQL_SELECT_KEYWORD = 'SELECT ';
	const SQL_FROM_KEYWORD = 'FROM ';
	const SQL_WHERE_KEYWORD = 'WHERE ';
	const SQL_ORDER_BY_KEYWORD = 'ORDER BY ';
	const SQL_LIMIT_KEYWORD = 'LIMIT ';
	const SQL_UPDATE_KEYWORD = 'UPDATE ';
	const SQL_CREATE_KEYWORD = 'CREATE TABLE ';
	const SQL_DELETE_KEYWORD = 'DELETE FROM ';

	private $datasources = array();
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
		)
	);

	public function indexAction(Request $request, $dsid = null, $table = null, $crud = null) {
		$this->helper = new ControllersHelper($this, $this->container);
		$no_js = $request->query->get('no-js') || 0;
		$this->script = $no_js == 1 ? 0 : 1;
		return $this->runIndex($request, $dsid, $table, $crud);
	}

	protected function runIndex(Request $request, $dsid, $table, $crud) {
		$this->request = $request;
		$form = $request->request->all();

		if (file_exists($this->databasesDir."/DataSources.xml")) {
			$this->datasources = new \SimpleXMLElement($this->databasesDir."/DataSources.xml", LIBXML_NOWARNING, true);
		} else {
			$this->datasources = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><DataSources xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/DataSources.xsd"><Databases></Databases></DataSources>', LIBXML_NOWARNING);
		}
		if ($crud !== null) {
			if (! $this->get('security.context')->isGranted('ROLE_CONTRIBUTOR')) {
				return $this->errorResponse($form, $this->get('translator')->trans("Access denied!"));
			}
			return $this->dispatch($request, $dsid, $table, $crud, $form);
		} else if (! $this->get('security.context')->isGranted('ROLE_CONTRIBUTOR')) {
			throw $this->createAccessDeniedException ($this->get('translator')->trans("Access Denied!"));
		} else {
			return $this->showDatasources($dsid, $table);
		}
	}

	protected function dispatch(Request $request, $dsid, $table, $crud, $form) {
		if ($crud == 'create-datasource') {
			return $this->createDatasource ($form);
		} elseif ($crud == 'import-datasource') {
			return $this->showDatasources(0, null, "import");
		} elseif ($crud == 'doimport-datasource') {
			return $this->doImportDatasource($request->files->all());
		} elseif ($crud == 'export-datasource') {
			return $this->doExportDatasource($dsid);
		} elseif ($crud == 'edit-datasource') {
			return $this->showDatasources($dsid, null, "edit");
		} elseif ($crud == 'doedit-datasource') {
			return $this->doEditDatasource ($dsid, $form);
		} elseif ($crud == 'drop-datasource') {
			return $this->dropDatasource ($dsid);
		} elseif ($crud == 'edit') {
			return $this->showDatasources($dsid, $table, 'edit-table');
		} elseif ($crud == 'import') {
			return $this->showDatasources($dsid, $table, 'import-table');
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
				case 'doedit':
					return $this->doEditTable ($form, $table, $database);
				case 'doimport':
					return $this->doImportTable($form, $dsid, $table, $database, $request->files->all());
				case 'drop':
					return $this->dropTable ($table, $database);
				case 'restore':
					return $this->restoreTableRow ($form, $table, $database);
				default:
					throw $this->createAccessDeniedException ($this->get('translator')->trans("Access Denied!"));
			}
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
				$dbs = $this->datasources->xpath("/DataSources/Databases/Database[@id='".$dsdatabase."']");
				$db = $dbs[0];
				$id = (string)$db['id'];
				$type = (string)$db['type'];
				$name = (string)$db['name'];
				$label = (string)$db['label'];
				if ($type == 'sqlite') {
					if (preg_match('/^(.*)\.db$/',$name, $matches) && file_exists($this->databasesDir.'/'.$name)) {
						$datasources[] = array(
							'id' => $ds_id,
							'type' => $dstype,
							'name' => $dsname,
							'database' => array('id' => $id, 'type' => $type, 'name' => $name, 'label' => $label)
						);
					}
				} elseif ($type == 'jsonsql') {
					if (file_exists($this->databasesDir.'/'.$name.".schema.json") && file_exists($this->databasesDir.'/'.$name.".json")) {
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
				$dsmethod = (string)$ds['method'];
				$datasources[] = array(
					'id' => $ds_id,
					'type' => $dstype,
					'name' => $dsname,
					'uri' => $dsuri,
					'method' => $dsmethod
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
				if ($action == 'import') {
					$datasource = array(
						'action' => 'import',
						'id' => 0,
						'type' => 'internal',
						'name' => $this->get('translator')->trans('Import Datasource'),
						'label' => $this->get('translator')->trans('Import Datasource'),
						'uri' => '',
						'method' => '',
						'description' => '',
					);
				} else {
					$datasource = array(
						'action' => 'create',
						'id' => 0,
						'type' => 'internal',
						'name' => $this->get('translator')->trans('New Datasource'),
						'label' => $this->get('translator')->trans('New Datasource'),
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
						'method' => '',
						'description' => '',
					);
				}
			} else {
				$dss = $this->datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
				$datasource = array(
					'action' => $action == 'edit-table' ? 'show' : $action,
					'id' => (int)$dss[0]['id'],
					'type' => (string)$dss[0]['type'],
					'name' => (string)$dss[0]['name'],
					'label' => (string)$dss[0]['name'],
					'database' => array(
						'id' => (int)$dss[0]['database'], 'type' => '', 'name' => '', 'label' => '', 
						'host' => '', 'port' => 0, 'user' => '', 'password' => ''
					),
					'uri' => (string)$dss[0]['uri'],
					'method' => (string)$dss[0]['method'],
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
					if ($table !== null && $table != 'dummy') {
						$tabledef['action'] = $table != 'new' ? $action : 'create-table';
						$tabledef['name'] = $table;
						$tabledef['label'] = $this->get('translator')->trans('New Table');
						$tabledef['description'] = '';
						if ($table != 'new') {
							$tableinfos = $this->tableInfos($database, $table);
							foreach($tableinfos as $i => $info) {
								$dss = $this->datasources->xpath("/DataSources/DataSource[(@type='internal' or @type='database') and @database='".$database->getId()."']");
								$column = null;
								foreach ($dss[0]->children() as $child) {
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
								$tableinfos[$i]['g6k_type'] = ($column !== null) ? (string)$column['type'] : $info['type'];
								$tableinfos[$i]['label'] = ($column !== null) ? (string)$column['label'] : $info['name'];
								$tableinfos[$i]['description'] = ($column !== null) ? (string)$column->Description : '';
								if ($tableinfos[$i]['g6k_type'] == 'choice' && $column !== null && $column->Choices) {
									if ($column->Choices->Source) {
										$source = $column->Choices->Source;
										$result = $this->processSource($source);
										$choices = $this->getChoicesFromSource($source, $result);
										$tableinfos[$i]['choicesource']['id'] = (int)$source['id'];
										$tableinfos[$i]['choicesource']['datasource'] = (string)$source['datasource'];
										$tableinfos[$i]['choicesource']['request'] = (string)$source['request'];
										$tableinfos[$i]['choicesource']['returnType'] = (string)$source['returnType'];
										$tableinfos[$i]['choicesource']['separator'] = (string)$source['separator'];
										$tableinfos[$i]['choicesource']['delimiter'] = (string)$source['delimiter'];
										$tableinfos[$i]['choicesource']['returnPath'] = (string)$source['returnPath'];
										$tableinfos[$i]['choicesource']['valueColumn'] = (string)$source['valueColumn'];
										$tableinfos[$i]['choicesource']['labelColumn'] = (string)$source['labelColumn'];
									} else {
										$choices = array();
										foreach ($column->Choices->Choice as $choice) {
											$choices[(string)$choice['value']] = (string)$choice['label'];
										}
									}
									$tableinfos[$i]['choices'] = $choices;
								}
							}
							if ($datasource['type'] == 'internal') {
								$tabledatas = $database->query(self::SQL_SELECT_KEYWORD . "*" . self::SQL_FROM_KEYWORD . $table);
								foreach($tabledatas as $r => $row) {
									$i = 0;
									foreach ($row as $c => $cell) {
										if ($tableinfos[$i]['g6k_type'] == 'date' && $cell !== null) {
											$date = $this->helper->parseDate('Y-m-d', substr($cell, 0, 10));
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
					}
					if ($datasource['type'] == 'internal' || $datasource['type'] == 'database') {
						$tables = $this->tablesList($database);
						foreach($tables as $i => $tbl) {
							$dss = $this->datasources->xpath("/DataSources/DataSource[(@type='internal' or @type='database') and @database='".$database->getId()."']");
							$dstable = null;
							foreach ($dss[0]->children() as $child) {
								if ($child->getName() == 'Table' && strcasecmp((string)$child['name'], $tbl['name']) == 0) {
									$dstable = $child;
									break;
								}
							}
						
							$tables[$i]['label'] = ($dstable !== null) ? (string)$dstable['label'] : $tbl['name'];
							$tables[$i]['description'] = ($dstable !== null) ? (string)$dstable->Description : '';
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
					'hiddens' => $hiddens,
					'script' => $this->script,
					'simulator' => null,
					'view' => null
				)
			);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}

	protected function doExportDatasource($dsid) {
		$datasources = $this->datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
		$datasource = $datasources[0];
		$container = $this->get('kernel')->getContainer();
		$driver = $container->getParameter('database_driver');
		$parameters = array(
			'database_driver' => $driver
		);
		if ($driver != 'pdo_sqlite') {
			if ($container->hasParameter('database_host')) {
				$parameters['database_host'] = $container->getParameter('database_host');
			}
			if ($container->hasParameter('database_port')) {
				$parameters['database_port'] = $container->getParameter('database_port');
			}
			if ($container->hasParameter('database_user')) {
				$parameters['database_user'] = $container->getParameter('database_user');
			}
			if ($container->hasParameter('database_password')) {
				$parameters['database_password'] = $container->getParameter('database_password');
			}
		}
		$converter = new SQLToJSONConverter($parameters, $this->databasesDir);
		$result = $converter->convert($datasource);
		$content = array(
			array(
				'name' => (string)$datasource['name'].".schema.json",
				'data' => json_encode($result['schema'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
			), 
			array(
				'name' => (string)$datasource['name'].".json",
				'data' => json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
			)
		);
		$zipcontent = $this->zip($content);
		$response = new Response();
		$response->headers->set('Cache-Control', 'private');
		$response->headers->set('Content-type', 'application/octet-stream');
		$response->headers->set('Content-Disposition', sprintf('attachment; filename="%s"', (string)$datasource['name'] . ".zip"));
		$response->headers->set('Content-length', strlen($zipcontent));
		$response->sendHeaders();
		$response->setContent($zipcontent);
		return $response;
	}

	protected function doImportDatasource($files) {
		$container = $this->get('kernel')->getContainer();
		$uploadDir = str_replace("\\", "/", $container->getParameter('g6k_upload_directory'));
		$name = '';
		$schemafile = '';
		$datafile = '';
		$dsid = 0;
		foreach ($files as $fieldname => $file) {
			if ($file && $file->isValid()) {
				$filePath = $uploadDir . "/" . $this->get('g6k.file_uploader')->upload($file);
				if ($fieldname == 'datasource-schema-file') {
					$schemafile = $filePath;
				} elseif ($fieldname == 'datasource-data-file') {
					$datafile = $filePath;
					$name = $file->getClientOriginalName();
					if (preg_match("/^(.+)\.json$/", $name, $m)) {
						$name = trim($m[1]);
					}
				}
			}
		}
		if ($name != '' && $schemafile != '' && $datafile != '') {
			$driver = $container->getParameter('database_driver');
			$parameters = array(
				'database_driver' => $driver
			);
			if ($driver != 'pdo_sqlite') {
				if ($container->hasParameter('database_host')) {
					$parameters['database_host'] = $container->getParameter('database_host');
				}
				if ($container->hasParameter('database_port')) {
					$parameters['database_port'] = $container->getParameter('database_port');
				}
				if ($container->hasParameter('database_user')) {
					$parameters['database_user'] = $container->getParameter('database_user');
				}
				if ($container->hasParameter('database_password')) {
					$parameters['database_password'] = $container->getParameter('database_password');
				}
			}
			$helper = new DatasourcesHelper($this->datasources);
			$dom = $helper->makeDatasourceDom($name, $schemafile, $datafile, $parameters, $this->databasesDir, $dsid);
			$this->saveDatasources($dom);
		}
		if ($schemafile != '') {
			unlink($schemafile);
		}
		if ($datafile != '') {
			unlink($datafile);
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasource', array('dsid' => $dsid)));
	}

	protected function doImportTable($form, $dsid, $table, $database, $files) {
		$container = $this->get('kernel')->getContainer();
		$uploadDir = str_replace("\\", "/", $container->getParameter('g6k_upload_directory'));
		$csvfile = '';
		foreach ($files as $fieldname => $file) {
			if ($file && $file->isValid()) {
				$filePath = $uploadDir . "/" . $this->get('g6k.file_uploader')->upload($file);
				if ($fieldname == 'table-data-file') {
					$csvfile = $filePath;
				}
			}
		}
		$separator = $form["table-data-separator"]; 
		if ($separator == 't') {
			$separator = "\t";
		}
		$delimiter = $form["table-data-delimiter"]; 
		$hasheader = isset($form["table-data-has-header"]) && $form["table-data-has-header"] == "1";
		if ($csvfile != '') {
			if (($handle = fopen($csvfile, 'r')) !== FALSE) {
				$infosColumns = $this->infosColumns($database, $table);
				$header = $hasheader ? NULL : array_filter(array_keys($infosColumns), function($k) {
					return $k != 'id';
				});
				while (($row = fgetcsv($handle, 0, $separator, $delimiter)) !== FALSE) {
					if (!empty($row) && $row[0] !== null) { // hack for csv mac
						if(!$header) {
							$header = $row;
							foreach ($header as $name) {
								if (!isset($infosColumns[$name])) {
									throw new \Exception("Unkown column name : {$name}");
								}
							}
						} else {
							$data = array_combine($header, $row);
							$data['id'] = '0';
							if (($result = $this->addDBTableRow($data, $table, $database)) !== true) {
								return $this->errorResponse($data, $result);
							}
						}
					}
				}
				fclose($handle);
			}
			unlink($csvfile);
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasource_table', array('dsid' => $dsid, 'table' => $table)));
	}

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

	protected function processSource($source) {
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
						$host = $this->get('kernel')->getContainer()->getParameter('database_host');
						$port = $this->get('kernel')->getContainer()->getParameter('database_port');
						$user = $this->get('kernel')->getContainer()->getParameter('database_user');
						if ((string)$databases[0]['host'] == $host && (string)$databases[0]['port'] == $port && (string)$databases[0]['user'] == $user) {
							$database->setPassword($this->get('kernel')->getContainer()->getParameter('database_password'));
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
				$result = ResultFilter::filter("csv", $result, "", null, (string)$source['separator'], (string)$source['delimiter']);
				return $this->filterResultByLines($result, (string)$source['returnPath']);
		}
		return null;
	}

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

	protected function getDatabase($dsid, $withDbName = true) {
		$helper = new DatasourcesHelper($this->datasources);
		$datasources = $this->datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
		$dbid = (int)$datasources[0]['database'];
		$parameters = array(
			'database_user' => $this->get('kernel')->getContainer()->getParameter('database_user'),
			'database_password' => $this->get('kernel')->getContainer()->getParameter('database_password')
		);
		return $helper->getDatabase($parameters, $dbid, $this->databasesDir, $withDbName);
	}

	protected function checkValue($name, $info, $value) {
		if ($value === null || $value == '') {
			if ($info['notnull'] == 1) { 
				return $this->get('translator')->trans("The field '%field%' is required", array('%field%' => $info['label']));
			} else {
				return true;
			}
		}
		switch ($info['g6k_type']) {
			case 'date':
				if (! preg_match("/^\d{1,2}\/\d{1,2}\/\d{4}$/", $value)) {
					return $this->get('translator')->trans("The field '%field%' is not a valid date", array('%field%' => $info['label']));
				}
				break;
			case 'boolean':
				if ( ! in_array($value, array('0', '1', 'false', 'true'))) {
					return $this->get('translator')->trans("The field '%field%' is invalid", array('%field%' => $info['label']));
				}
				break;
			case 'number': 
				$value = str_replace(",", ".", $value);
				if (! is_numeric($value)) {
					return $this->get('translator')->trans("The field '%field%' is not a number", array('%field%' => $info['label']));
				}
				break;
			case 'integer': 
				if (! ctype_digit ( $value )) {
					return $this->get('translator')->trans("The field '%field%' is not a number", array('%field%' => $info['label']));
				}
				break;
			case 'day': 
				if (! ctype_digit ( $value ) || (int)$value > 31) {
					return $this->get('translator')->trans("The field '%field%' is invalid", array('%field%' => $info['label']));
				}
				break;
			case 'month': 
				if (! ctype_digit ( $value ) || (int)$value > 12 ) {
					return $this->get('translator')->trans("The field '%field%' is invalid", array('%field%' => $info['label']));
				}
				break;
			case 'year': 
				if (! ctype_digit ( $value ) || strlen($value) != 4 ) {
					return $this->get('translator')->trans("The field '%field%' is not a valid year", array('%field%' => $info['label']));
				}
				break;
			case 'text': 
			case 'textarea': 
				break;
			case 'money': 
				$value = str_replace(",", ".", $value);
				if (! preg_match("/^\d+(\.\d{1,2})?$/", $value)) {
					return $this->get('translator')->trans("The field '%field%' is not a valid currency", array('%field%' => $info['label']));
				}
				break;
			case 'choice':
				foreach ($info['choices'] as $val => $label) {
					if ($value == $val) {
						return true;
					}
				}
				return $this->get('translator')->trans("The field '%field%' is invalid", array('%field%' => $info['label']));
			case 'percent':
				$value = str_replace(",", ".", $value);
				if (! is_numeric($value)) {
					return $this->get('translator')->trans("The field '%field%' is not numeric", array('%field%' => $info['label']));
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
				$dbname = $database->getName();
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

	protected function infosColumns($database, $table) {
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
					$result = $this->processSource($source);
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

	protected function createDatasource($form) {
		$helper = new DatasourcesHelper($this->datasources);
		$datasource = $helper->doCreateDatasource($form);
		$this->saveDatasources($datasource->ownerDocument);
		$type = $form['datasource-type'];
		$dbtype = $form['datasource-database-type'];
		if ($type == 'internal') {
			if (($result = $this->createDB($datasource->getAttribute('id'), $dbtype)) !== true) {
				return $this->errorResponse($form, $result);
			}
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasource', array('dsid' => $datasource->getAttribute('id'))));
	}

	protected function migrateDB($dsid, $dbtype, $fromDatabase) {
		if (($result = $this->createDB($dsid, $dbtype)) !== true) {
			return $result;
		}
		$datasources = $this->datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
		$datasource = $datasources[0];
		$database = $this->getDatabase($dsid);
		foreach ($datasource->children() as $child) {
			if ($child->getName() == 'Table') {
				$table = (string)$child['name'];
				$infosColumns = $this->infosColumns($fromDatabase, $table);
				$form = $this->infosColumnsToForm($table, $infosColumns);
				if (($result = $this->createDBTable($form, $database)) !== true) {
					return $result;
				}
				$fields = implode(", ", $form['field']);
				$rows = $fromDatabase->query(self::SQL_SELECT_KEYWORD. $fields . self::SQL_FROM_KEYWORD . $table . " order by id");
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
					} catch (\Exception $e) {
						return $this->get('translator')->trans("Can't insert into %table% of database %database% : %error%", array('%table%' => $table, '%database%' => $dbschema, '%error%' => $e->getMessage()));
					}
				}
			}
		}
		if ($database->gettype() == 'jsonsql') {
			$database->getConnection()->commit();
		}
		return true;
	}

	protected function createDB($dsid, $dbtype) {
		try {
			if ($dbtype == 'jsonsql' || $dbtype == 'sqlite') {
				$database = $this->getDatabase($dsid);
			} else {
				$database = $this->getDatabase($dsid, false);
			}
		} catch (\Exception $e) {
			return $this->get('translator')->trans("Can't get database : %error%", array('%error%' => $e->getMessage()));
		}
		switch ($database->getType()) {
			case 'pgsql':
				$dbschema = str_replace('-', '_', $database->getName());
				try {
					$database->exec("CREATE DATABASE " . $dbschema. " encoding 'UTF8'");
					$database->setConnected(false);
					$database->connect();
				} catch (\Exception $e) {
					return $this->get('translator')->trans("Can't create database %database% : %error%", array('%database%' => $dbschema, '%error%' => $e->getMessage()));
				}
				break;
			case 'mysql':
			case 'mysqli':
				$dbschema = $database->getName();
				try {
					$database->exec("CREATE DATABASE IF NOT EXISTS " . $dbschema . " character set utf8");
					$database->setConnected(false);
					$database->connect();
				} catch (\Exception $e) {
					return $this->get('translator')->trans("Can't create database %database% : %error%", array('%database%' => $dbschema, '%error%' => $e->getMessage()));
				}
				break;
		}
		return true;
	}

	protected function createDBTable(&$form, $database) {
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
			return $this->get('translator')->trans("Can't create table %table% : %error%", array('%table%' => $form['table-name'], '%error%' => $e->getMessage()));
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

	protected function editDBTable($form, $table, $database) {
		$infosColumns = $this->infosColumns($database, $table);
		if (strcasecmp($form['table-name'], $table) != 0) {
			$rename = "ALTER TABLE $table RENAME TO {$form['table-name']}";
			try {
				$database->exec($rename);
			} catch (\Exception $e) {
				return $this->get('translator')->trans("Can't rename table %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
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
						return $this->get('translator')->trans("Can't rename column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
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
							return $this->get('translator')->trans("Can't modify type of column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
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
								return $this->get('translator')->trans("Can't modify type of column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
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
						return $this->get('translator')->trans("Can't alter 'NOT NULL' property of column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
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
					return $this->get('translator')->trans("Can't modify title of column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
				}
			}
			if ($form['description'][$col] != $info['description'] && $database->getType() == 'jsonsql') {
				$changedescription = "ALTER TABLE $table MODIFY COLUMN $name SET COMMENT " . $database->quote($form['description'][$col]);
				try {
					$database->exec($changedescription);
				} catch (\Exception $e) {
					return $this->get('translator')->trans("Can't modify description of column %column% of table %table% : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
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
					return $this->get('translator')->trans("Can't add the column '%column%' into table '%table%' : %error%", array('%column%' => $name, '%table%' => $table, '%error%' => $e->getMessage()));
				}
			}
		}
		return true;
	}

/******************************************************
 *  ALTER TABLE tbl_name alter_specification [, alter_specification] ...
 *
 * alter_specification:
 *   ADD column_definition
 * | DROP column_definition
 * | CHANGE old_col_name column_definition
 *
 * column_definition:
 *   same as for create table statements
 */
	protected function alterSQLiteTable($table, $alterdefs, $database){
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
								throw new \Exception('near "'.$defparts[0].($defparts[1]?' '.$defparts[1]:'').'": syntax error');
							}
							$createtesttableSQL = substr($createtesttableSQL,0,strlen($createtesttableSQL)-1).',';
							for($i = 1; $i < $defpartsSize; $i++)
								$createtesttableSQL.=' '.$defparts[$i];
							$createtesttableSQL.=')';
							break;
						case 'change':
							if ($defpartsSize <= 3) {
								throw new \Exception('near "'.$defparts[0].($defparts[1]?' '.$defparts[1]:'').($defparts[2]?' '.$defparts[2]:'').'": syntax error');
							}
							if($severpos = strpos($createtesttableSQL,' '.$defparts[1].' ')){
								if($newcols[$defparts[1]] != $defparts[1]){
									throw new \Exception('unknown column "'.$defparts[1].'" in "'.$table.'"');
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
								throw new \Exception('unknown column "' . $defparts[1] . '" in "' . $table . '"');
							}
							break;
						case 'drop':
							if ($defpartsSize < 2) {
								throw new \Exception('near "' . $defparts[0] . ($defparts[1] ? ' ' . $defparts[1] : '') . '" : syntax error');
							}
							if ($severpos = strpos($createtesttableSQL, ' ' . $defparts[1] . ' ')) {
								$nextcommapos = strpos($createtesttableSQL, ',', $severpos);
								if ($nextcommapos)
									$createtesttableSQL = substr($createtesttableSQL, 0, $severpos) . substr($createtesttableSQL, $nextcommapos + 1);
								else
									$createtesttableSQL = substr($createtesttableSQL, 0, $severpos - (strpos($createtesttableSQL, ',') ? 0 : 1) - 1) . ')';
								unset($newcols[$defparts[1]]);
							} else {
								throw new \Exception('unknown column "' . $defparts[1] . '" in "' . $table . '"');
							}
							break;
						default:
							throw new \Exception('near "' . $prevword . '": syntax error');
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
				$this->dropDBTable($table, $database); //drop old table
				$database->exec($createnewtableSQL); //recreate original table
				$database->exec($copytonewsql); //copy back to original table
				$this->dropDBTable($tmpname, $database); //drop temp table
			} else {
				throw new \Exception('no such table: '.$table);
			}
			return true;
		}
	}

	protected function addDBTableRow($form, $table, $database, $restore = false) {
		$infosColumns = $this->infosColumns($database, $table);
		$insertNames = array();
		$insertValues = array();
		foreach($infosColumns as $name => $info) {
			$value = isset($form[$name]) ? $form[$name] : ($info['g6k_type'] == 'boolean' ? '0' : null);
			if (($check = $this->checkValue($name, $info, $value)) !== true) {
				return $check;
			}
			if ($restore || $name != 'id') {
				$insertNames[] = $name;
				if ($value === null || $value == '') {
					$insertValues[] = "NULL";
				} else if ($info['g6k_type'] == 'date') {
					$insertValues[] = $database->quote($this->helper->parseDate('d/m/Y', substr($value, 0, 10))->format('Y-m-d'));
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
			return $this->get('translator')->trans("Can't insert into %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
		}
		return true;
	}

	protected function updateDBTableRow($form, $table, $database) {
		$infosColumns = $this->infosColumns($database, $table);
		$updateFields = array();
		foreach($infosColumns as $name => $info) {
			$value = isset($form[$name]) ? $form[$name] : ($info['g6k_type'] == 'boolean' ? '0' : null);
			if (($check = $this->checkValue($name, $info, $value)) !== true) {
				return $check;
			}
			if ($name != 'id') {
				if ($value === null || $value == '') {
					$updateFields[] = $name . "=NULL";
				} else if ($info['g6k_type'] == 'date') {
					$updateFields[] = $name . "='" . $this->helper->parseDate('d/m/Y', substr($value, 0, 10))->format('Y-m-d') . "'";
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
		$sql = self::SQL_UPDATE_KEYWORD.$table." SET ".implode(', ', $updateFields)." ".self::SQL_WHERE_KEYWORD."id=".$form['id'];
		try {
			$database->exec($sql);
		} catch (\Exception $e) {
			return $this->get('translator')->trans("Can't update %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
		}
		return true;
	}

	protected function deleteDBTableRow($form, $table, $database) {
		try {
			$database->exec(self::SQL_DELETE_KEYWORD.$table." WHERE id=".$form['id']);
		} catch (\Exception $e) {
			return $this->get('translator')->trans("Can't delete from %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
		}
		return true;
	}

	protected function dropDBTable($table, $database) {
		try {
			$database->exec("DROP TABLE ".$table);
		} catch (\Exception $e) {
			return $this->get('translator')->trans("Can't drop %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
		}
		return true;
	}

	protected function createTable($form, $database) {
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
		$this->addColumnsToTable($dom, $form, $newTable);
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
		file_put_contents($this->databasesDir."/DataSources.xml", $formatted);
	}

	protected function addTableRow($form, $table, $database) {
		if ($form['id'] > 0) {
			return $this->errorResponse($form, $this->get('translator')->trans("This record already exists."));
		}
		if (($result = $this->addDBTableRow($form, $table, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$form['id'] = $database->lastInsertId();
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function restoreTableRow($form, $table, $database) {
		if (($result = $this->addDBTableRow($form, $table, $database, true)) !== true) {
			return $this->errorResponse($form, $result);
		}
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
			return $this->errorResponse($form, $this->get('translator')->trans("There's no record with id 0."));
		}
		if (($result = $this->deleteDBTableRow($form, $table, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function doEditTable($form, $table, $database) {
		if (($result = $this->editDBTable($form, $table, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $xpath->query("/DataSources/DataSource[(@type='internal' or @type='database') and @database='".$database->getId()."']")->item(0);
		$tables = $datasource->getElementsByTagName('Table');
		$len = $tables->length;
		for($i = 0; $i < $len; $i++) {
			$name = $tables->item($i)->getAttribute('name');
			if ($name == $table) {
				$theTable = $tables->item($i);
				$theTable->setAttribute('name', $form['table-name']);
				$theTable->setAttribute('label', $form['table-label']);
				$descr = $dom->createElement("Description");
				$descr->appendChild($dom->createCDATASection(preg_replace("/(\<br\>)+$/", "", $form['table-description'])));
				$oldDescr = $theTable->getElementsByTagName('Description');
				if ($oldDescr->length > 0) {
					$theTable->replaceChild ($descr, $oldDescr->item(0));
				} else {
					$children = $theTable->getElementsByTagName('*');
					if ($children->length > 0) {
						$theTable->insertBefore($descr, $children->item(0));
					} else {
						$theTable->appendChild($descr);
					}
				}
				$columnsList = $theTable->getElementsByTagName('Column');
				// remove all child of table : see http://php.net/manual/fr/domnode.removechild.php#90292
				$columns = array();
				foreach ($columnsList as $column) {
					$columns[] = $column;
				}
				foreach ($columns as $column) {
					$theTable->removeChild($column);
				}
				$this->addColumnsToTable($dom, $form, $theTable);
				break;
			}
		}
		$this->saveDatasources($dom);
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasource_table', array('dsid' => $datasource->getAttribute('id'), 'table' => $table)));
	}

	protected function addColumnsToTable($dom, $form, &$table) {
		foreach ($form['field'] as $i => $field) {
			if ($field != '') {
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
						if (($form['field-'.$i.'-choicesource-datasource'] == 'internal' || $form['field-'.$i.'-choicesource-datasource'] == 'database')) {
							$source->setAttribute('request', $form['field-'.$i.'-choicesource-request']);
						} else {
							if (isset($form['field-'.$i.'-choicesource-returnPath'])) {
								$source->setAttribute('returnPath', $form['field-'.$i.'-choicesource-returnPath']);
							}
							if ($form['field-'.$i.'-choicesource-returnType'] == 'csv') {
								if (isset($form['field-'.$i.'-choicesource-separator'])) {
									$source->setAttribute('separator', $form['field-'.$i.'-choicesource-separator']);
								}
								if (isset($form['field-'.$i.'-choicesource-delimiter'])) {
									$source->setAttribute('delimiter', $form['field-'.$i.'-choicesource-delimiter']);
								}
							}
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
				$table->appendChild($column);
			}
		}
	}

	protected function dropTable($table, $database) {
		if (($result = $this->dropDBTable($table, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $xpath->query("/DataSources/DataSource[(@type='internal' or @type='database') and @database='".$database->getId()."']")->item(0);
		$tables = $datasource->getElementsByTagName('Table');
		$len = $tables->length;
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
		if (($type == 'internal' && $oldType == 'internal') || ($type == 'database' && $oldType == 'database')) {
			$database = $xpath->query("/DataSources/Databases/Database[@id='".$datasource->getAttribute('database')."']")->item(0);
			if ($database->getAttribute('type') != $form['datasource-database-type']) {
				$sameDatabase = false;
			} else if ($database->getAttribute('name') != $form['datasource-database-name']) {
				$sameDatabase = false;
			} else if ($database->getAttribute('type') == 'mysqli' || $database->getAttribute('type') == 'pgsql') {
				if ($database->getAttribute('host') != $form['datasource-database-host']) {
					$sameDatabase = false;
				} else if ($database->getAttribute('port') != $form['datasource-database-port']) {
					$sameDatabase = false;
				} else if ($database->getAttribute('user') != $form['datasource-database-user']) {
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
				$datasource->setAttribute('uri', $form['datasource-uri']);
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
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $xpath->query("/DataSources/DataSource[@id='".$dsid."']")->item(0);
		$type = $datasource->getAttribute('type');
		if ($type == 'internal' || $type == 'database') {
			$dbs = $xpath->query("/DataSources/Databases");
			$db = $xpath->query("/DataSources/Databases/Database[@id='".$datasource->getAttribute('database')."']")->item(0);
			$dbtype = $db->getAttribute('type');
			if ($type == 'internal') { 
				$dbname = $db->getAttribute('name');
				switch ($dbtype) { 
					case 'jsonsql':
						try {
							$database = $this->databasesDir . '/' . $dbname;
							$fs = new Filesystem();
							$fs->remove($database . ".json");
							$fs->remove($database . ".schema.json");
						} catch (\Exception $e) {
						} catch (IOExceptionInterface $ioe) {
						}
						break;
					case'sqlite':
						try {
							$database = $this->databasesDir . '/' . $dbname;
							$fs = new Filesystem();
							$fs->remove($database );
						} catch (\Exception $e) {
						} catch (IOExceptionInterface $ioe) {
						}
						break;
					case 'pgsql':
					case 'mysqli':
						$database = $this->getDatabase($dsid);
						$tables = $datasource->getElementsByTagName('Table');
						foreach ($tables as $table) {
							$this->dropDBTable($table->getAttribute("name"), $database);
							if (($this->dropDBTable($table->getAttribute("name"), $database)) !== true) {
								// Do something ????
							}
						}
						break;
				}
			}
			$dbs->item(0)->removeChild($db);
		}
		$dss = $xpath->query("/DataSources");
		$dss->item(0)->removeChild ($datasource);
		$this->saveDatasources($dom);
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasources'));
	}

}

?>
