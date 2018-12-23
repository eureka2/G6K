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

namespace App\G6K\Controller;

use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

use App\G6K\Manager\ControllersTrait;
use App\G6K\Manager\DatasourcesHelper;
use App\G6K\Manager\DatasourcesTrait;
use App\G6K\Manager\Json\SQLToJSONConverter;
use App\G6K\Manager\Json\JsonSQL\Parser;
use App\G6K\Manager\ExpressionParser\DateFunction;

/**
 *
 * The DataSourcesAdminController class is the controller that handles all actions of the datasources management interface.
 *
 * These actions are:
 *
 * - Creation of a data source
 * - Modification of a data source
 * - Deletion of a data source
 * - Creation of a data source table
 * - Modification of a data source table structure
 * - Dropping a data source table
 * - Adding a row in a data source table
 * - Updating a row in a data source table
 * - Deletion of a row in a data source table
 * - Restoring a row in a data source table
 * - Import / Export of a data source
 *
 *
 * @author Jacques Archimède
 *
 */
class DataSourcesAdminController extends BaseAdminController {

	use ControllersTrait;
	use DatasourcesTrait;

	/**
	 * @var \SimpleXMLElement      $datasources DataSources.xml content
	 *
	 * @access  private
	 *
	 */
	private $datasources = null;

	/**
	 * @var \Symfony\Component\HttpFoundation\Request      $request The active Request object
	 *
	 * @access  private
	 *
	 */
	private $request;

	/**
	 * @var int      $script  1 if Javascript is enabled, 0 otherwise
	 *
	 * @access  private
	 *
	 */
	private $script;

	/**
	 * @var array      $datatypes Conversion table from G6K datatypes to SQL datatypes
	 *
	 * @access  private
	 *
	 */
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

	/**
	 * Entry point for the route paths begining by /admin/datasources
	 *
	 * These route paths are :
	 *
	 * - /admin/datasources
	 * - /admin/datasources/{dsid}
	 * - /admin/datasources/{dsid}/{table}
	 * - /admin/datasources/{dsid}/{table}/{crud}
	 * 
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request  The request
	 * @param   int|null $dsid (default: null) The datasource ID
	 * @param   string|null $table (default: null) The table name
	 * @param   string|null $crud (default: null) operation to execute on the data source (create-datasource, import-datasource, doimport-datasource, export-datasource, edit-datasource, doedit-datasource, drop-datasource, edit, import, add, update, delete, create, doedit, doimport, drop, restore)
	 * @return  \Symfony\Component\HttpFoundation\Response|\Symfony\Component\HttpFoundation\RedirectResponse
	 *
	 */
	public function indexAction(Request $request, $dsid = null, $table = null, $crud = null) {
		$this->initialize();
		$no_js = $request->query->get('no-js') || 0;
		$this->script = $no_js == 1 ? 0 : 1;
		return $this->runIndex($request, $dsid, $table, $crud);
	}

	/**
	 * Processes the index action
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request  The request
	 * @param   int|null $dsid The datasource ID
	 * @param   string|null $table The table name
	 * @param   string|null $crud (default: null) operation to execute on the data source (create-datasource, import-datasource, doimport-datasource, export-datasource, edit-datasource, doedit-datasource, drop-datasource, edit, import, add, update, delete, create, doedit, doimport, drop, restore)
	 * @return  \Symfony\Component\HttpFoundation\Response|\Symfony\Component\HttpFoundation\RedirectResponse
	 *
	 */
	protected function runIndex(Request $request, $dsid, $table, $crud) {
		$this->request = $request;
		$form = $request->request->all();

		if (file_exists($this->databasesDir."/DataSources.xml")) {
			$this->datasources = new \SimpleXMLElement($this->databasesDir."/DataSources.xml", LIBXML_NOWARNING, true);
		} else {
			$this->datasources = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><DataSources xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/DataSources.xsd"><Databases></Databases></DataSources>', LIBXML_NOWARNING);
		}
		if ($crud !== null) {
			if (! $this->get('security.authorization_checker')->isGranted('ROLE_CONTRIBUTOR')) {
				return $this->errorResponse($form, $this->get('translator')->trans("Access denied!"));
			}
			return $this->dispatch($request, $dsid, $table, $crud, $form);
		} else if (! $this->get('security.authorization_checker')->isGranted('ROLE_CONTRIBUTOR')) {
			throw $this->createAccessDeniedException ($this->get('translator')->trans("Access Denied!"));
		} else {
			return $this->showDatasources($dsid, $table);
		}
	}

	/**
	 * Dispatches the index action to the appropriate processing based on the value of the crud parameter.
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request  The request
	 * @param   int|null $dsid The datasource ID
	 * @param   string|null $table The table name
	 * @param   string|null $crud (default: null) operation to execute on the data source (create-datasource, import-datasource, doimport-datasource, export-datasource, edit-datasource, doedit-datasource, drop-datasource, edit, import, add, update, delete, create, doedit, doimport, drop, restore)
	 * @param   array $form The form fields
	 * @return  \Symfony\Component\HttpFoundation\Response|\Symfony\Component\HttpFoundation\RedirectResponse
	 *
	 */
	protected function dispatch(Request $request, $dsid, $table, $crud, $form) {
		if ($crud == 'create-datasource') {
			return $this->createDatasource ($form);
		} elseif ($crud == 'import-datasource') {
			return $this->showDatasources(0, null, "import");
		} elseif ($crud == 'doimport-datasource') {
			return $this->doImportDatasource($request);
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
					return $this->doImportTable($request, $form, $dsid, $table, $database);
				case 'drop':
					return $this->dropTable ($form, $table, $database);
				case 'restore':
					return $this->restoreTableRow ($form, $table, $database);
				default:
					throw $this->createAccessDeniedException ($this->get('translator')->trans("Access Denied!"));
			}
		}
	}

	/**
	 * Checks if a parameter exists.
	 *
	 * @access  protected
	 * @param   string $parameter The parameter name
	 * @return  bool true if the parameter exists, false if not
	 *
	 */
	protected function hasConfigParameter($parameter) {
		return $this->get('kernel')->getContainer()->hasParameter($parameter);
	}

	/**
	 * Gets a parameter with its name.
	 *
	 * @access  protected
	 * @param   string $parameter The parameter name
	 * @return  string The parameter value
	 *
	 */
	protected function getConfigParameter($parameter) {
		return $this->get('kernel')->getContainer()->getParameter($parameter);
	}

	/**
	 * Shows the data sources management interface.
	 *
	 * @access  protected
	 * @param   int|null $dsid The datasource ID
	 * @param   string|null $table (default: null) The table name
	 * @param   string $action (default: 'show') <parameter description>
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
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
		$pagination = null;
		$dbname = '';
		if ($dsid !== null) {
			if ($dsid == 0) {
				$type = 'jsonsql';
				if ($this->hasConfigParameter('database_driver')) {
					switch ($this->getConfigParameter('database_driver')) {
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
							'host' => $this->hasConfigParameter('database_host') ? $this->getConfigParameter('database_host') : '', 
							'port' => $this->hasConfigParameter('database_port') ? $this->getConfigParameter('database_port') : '',
							'user' => $this->hasConfigParameter('database_user') ? $this->getConfigParameter('database_user') : '', 
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
										$result = $this->executeSource($source);
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
								$request = $this->container->get('request_stack')->getCurrentRequest();
								$where = array();
								foreach($tableinfos as &$infos) {
									if ($infos['name'] != 'id') {
										$filtertext = $request->get($infos['name'] . '-filter', "");
										$infos['filtertext'] = $filtertext;
										if ($filtertext != '') {
											if ($infos['g6k_type'] == 'date') {
												$date = DateFunction::parseDate("j/m/Y", $filtertext);
												$filtertext = $date->format("Y-m-d");
												$where[] = $infos['name'] . " = '" . $filtertext . "'";
											} elseif ($infos['g6k_type'] == 'number' || $infos['g6k_type'] == 'integer' || $infos['g6k_type'] == 'money' || $infos['g6k_type'] == 'percent') {
												$filtertext = str_replace(array(" ", ","), array("", "."), $filtertext);
												if (preg_match("/^(\<|\<\=|\>|\>\=)(.*)$/", $filtertext, $m)) {
													$op = $m[1];
													$filtertext = $m[2];
												} else {
													$op = '=';
												}
												$where[] = $infos['name'] . $op . $filtertext;
											} else {
												$where[] = $infos['name'] . " LIKE '%" . $filtertext . "%'";
											}
										}
									}
								}
								$where = count($where) > 0? " " . Parser::SQL_WHERE_KEYWORD . implode(" AND ", $where) : "";
								$paginator = new \AshleyDawson\SimplePagination\Paginator();
								$paginator->setItemTotalCallback(function () use ($database, $table, $where) {
									$rowCount = $database->query(Parser::SQL_SELECT_KEYWORD . "count(*) as c " . Parser::SQL_FROM_KEYWORD . $table . $where);
									return $rowCount[0]['c'];
								});
								$paginator->setSliceCallback(function ($offset, $length) use ($database, $table, $tableinfos, $where) {
									$tabledatas = $database->query(Parser::SQL_SELECT_KEYWORD . "* " . Parser::SQL_FROM_KEYWORD . $table . $where . " " . Parser::SQL_LIMIT_KEYWORD . $length . " " . Parser::SQL_OFFSET_KEYWORD . $offset);
									foreach($tabledatas as $r => $row) {
										$i = 0;
										foreach ($row as $c => $cell) {
											if ($tableinfos[$i]['g6k_type'] == 'date' && $cell !== null) {
												$date = DateFunction::parseDate('Y-m-d', substr($cell, 0, 10));
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
									return $tabledatas;
								});
								$itemsPerPage = (int)$request->get('itemsPerPage', 25);
								$paginator->setItemsPerPage($itemsPerPage)->setPagesInRange(10);
								$pagination = $paginator->paginate((int)$request->get('page', 1));
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
								$tabledef['label'] = trim($tables[$i]['label']);
								$tabledef['description'] = trim($tables[$i]['description']);
							}
						}
					}
				}
			}
		}
 		$hiddens = array();
		$hiddens['script'] = $this->script;
		$ua = new \Detection\MobileDetect();
		try {
			return $this->render(
				'admin/pages/datasources.html.twig',
				array(
					'ua' => $ua,
					'path' => $this->request->getScheme().'://'.$this->request->getHttpHost(),
					'nav' => 'datasources',
					'datasource' => $datasource,
					'datasources' => $datasources,
					'dsid' => $dsid,
					'dbname' => $dbname,
					'tables' => $tables,
					'table' => $tabledef,
					'tableinfos' => $tableinfos,
					'pagination' => $pagination,
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

	/**
	 * Exports a data source 
	 *
	 * Route path : /admin/datasources/{dsid}/dummy/export-datasource
	 *
	 * Creates a JSON data file and a JSON schema file from the source database. 
	 * Compresses these two files into one for its download.
	 *
	 * @access  protected
	 * @param   int $dsid The datasource ID
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
	protected function doExportDatasource($dsid) {
		$datasources = $this->datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
		$datasource = $datasources[0];
		$driver = $this->getConfigParameter('database_driver');
		$parameters = array(
			'database_driver' => $driver
		);
		if ($driver != 'pdo_sqlite') {
			if ($this->hasConfigParameter('database_host')) {
				$parameters['database_host'] = $this->getConfigParameter('database_host');
			}
			if ($this->hasConfigParameter('database_port')) {
				$parameters['database_port'] = $this->getConfigParameter('database_port');
			}
			if ($this->hasConfigParameter('database_user')) {
				$parameters['database_user'] = $this->getConfigParameter('database_user');
			}
			if ($this->hasConfigParameter('database_password')) {
				$parameters['database_password'] = $this->getConfigParameter('database_password');
			}
		}
		$converter = new SQLToJSONConverter($parameters, $this->databasesDir);
		$result = $converter->convert($datasource);
		// serialize_precision must be set to -1 in the php ini file
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
		$response->headers->set('Content-length', (string)strlen($zipcontent));
		$response->sendHeaders();
		$response->setContent($zipcontent);
		return $response;
	}

	/**
	 * Makes the header for a datasource action report
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @param   string $datasource The name of the datasource
	 * @param   string $dsid The id of the datasource
	 * @param   string $heading The title of the header
	 * @return  string
	 *
	 */
	protected function makeDatasourceReportHeader(Request $request, $datasource, $heading){
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
		$ua = new \Detection\MobileDetect();
		return rtrim($this->renderView(
			'admin/pages/report/datasources-header.html.twig',
			array(
				'ua' => $ua,
				'path' => $request->getScheme().'://'.$request->getHttpHost(),
				'nav' => 'datasources',
				'view' => null,
				'heading' => $heading,
				'datasource' => $datasource,
				'dsid' => '',
				'script' => $script,
				'dataset' => array(),
				'steps' => array(),
				'actions' => array(),
				'rules' => array(),
				'datasources' => array(),
				'views' => array(),
				'widgets' => array(),
				'hiddens' => array()
			)
		));
	}

	/**
	 * Makes the footer for a datasource action report
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @param   string $datasource The name of the datasource
	 * @param   string $dsid The id of the datasource
	 * @return  string
	 *
	 */
	protected function makeDatasourceReportFooter(Request $request, $datasource, $dsid){
		$ua = new \Detection\MobileDetect();
		return $this->renderView(
			'admin/pages/report/datasources-footer.html.twig',
			array(
				'ua' => $ua,
				'path' => $request->getScheme().'://'.$request->getHttpHost(),
				'nav' => 'datasources',
				'datasource' => $datasource,
				'dsid' => $dsid
			)
		);
	}

	/**
	 * Imports a data source from a JSON data file and a JSON schema file
	 *
	 * These files must have been exported from a G6K instance and must conform to the jsonschema.org specification.
	 *
	 * Route path : /admin/datasources/0/dummy/doimport-datasource
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @return  \Symfony\Component\HttpFoundation\StreamedResponse
	 *
	 */
	protected function doImportDatasource(Request $request) {
		$files = $request->files->all();
		$fs = new Filesystem();
		$uploadDir = str_replace("\\", "/", $this->getConfigParameter('g6k_upload_directory'));
		$datasource = '';
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
					$datasource = $file->getClientOriginalName();
					if (preg_match("/^(.+)\.json$/", $datasource, $m)) {
						$datasource = trim($m[1]);
					}
				}
			}
		}
		$translator = $this->get('translator');
		if ($datasource != '' && $schemafile != '' && $datafile != '') {
			$fs->rename($schemafile, $uploadDir . "/" . $datasource . ".schema.json", true);
			$schemafile = $uploadDir . "/" . $datasource . ".schema.json";
			$fs->rename($datafile, $uploadDir . "/" . $datasource . ".json", true);
			$datafile = $uploadDir . "/" . $datasource . ".json";

			$heading = $translator->trans('Importing the datasource « %datasource% »', ['%datasource%' => $datasource]);
			$header = $this->makeDatasourceReportHeader($request, $datasource, $heading);
			$self = $this;
			$response = $this->runStreamedConsoleCommand([
				'command' => 'g6k:datasource:import',
				'datasourcename' => $datasource,
				'datasourcepath' => $uploadDir
			], function() use ($header) {
				print $header;
				flush();
			}, function($ok) use ($self, $request, $translator, $datasource, $schemafile, $datafile, $fs) {
				if ($ok) {
					print '<span class="alert-success">' . $translator->trans("The datasource « %datasource% » is successfully imported.", ['%datasource%' => $datasource]) . "</span>\n";
				} else {
					print '<span class="alert-danger">' . $translator->trans("The datasource « %datasource% » can't be imported.", ['%datasource%' => $datasource]) . "</span>\n";
				}
				$self->datasources = new \SimpleXMLElement($self->databasesDir."/DataSources.xml", LIBXML_NOWARNING, true);
				$dss = $self->datasources->xpath("/DataSources/DataSource[@name='".$datasource."']");
				$dsid = $dss[0]['id'];
				$footer = $self->makeDatasourceReportFooter($request, $datasource, $dsid);
				print $footer . "\n";
				flush();
				try {
					if ($schemafile != '') {
						$fs->remove($schemafile);
					}
					if ($datafile != '') {
						$fs->remove($datafile);
					}
				} catch (IOExceptionInterface $e) {
				}
			});
		} else {
			$datasource = $datasource ?? $translator->trans("Unknown");
			$heading = $translator->trans('Importing the datasource « %datasource% »', ['%datasource%' => $datasource]);
			$header = $this->makeDatasourceReportHeader($request, $datasource, $heading);
			$footer = $this->makeDatasourceReportFooter($request, $datasource, '');
			$response = new StreamedResponse(function() use($header, $footer, $translator) {
				print $header;
				flush();
				print '<span class="alert-danger">' . $translator->trans("The uploaded files of the datasource can't be found.") . "</span>\n";
				print $footer."\n";
				flush();
			});
		}
		return $response;
	}

	/**
	 * Makes the header for a table action report
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @param   int $dsid The id of the datasource
	 * @param   string $table The name of the datasource
	 * @param   string $heading The title of the header
	 * @return  string
	 *
	 */
	protected function makeTableReportHeader(Request $request, $dsid, $table, $heading){
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
		$ua = new \Detection\MobileDetect();
		return rtrim($this->renderView(
			'admin/pages/report/datasources-table-header.html.twig',
			array(
				'ua' => $ua,
				'path' => $request->getScheme().'://'.$request->getHttpHost(),
				'nav' => 'datasources',
				'view' => null,
				'heading' => $heading,
				'dsid' => $dsid,
				'table' => $table,
				'script' => $script,
				'dataset' => array(),
				'steps' => array(),
				'actions' => array(),
				'rules' => array(),
				'datasources' => array(),
				'views' => array(),
				'widgets' => array(),
				'hiddens' => array()
			)
		));
	}

	/**
	 * Makes the footer for a datasource action report
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @param   int $dsid The id of the datasource
	 * @param   string $table The name of the table
	 * @return  string
	 *
	 */
	protected function makeTableReportFooter(Request $request, $dsid, $table){
		$ua = new \Detection\MobileDetect();
		return $this->renderView(
			'admin/pages/report/datasources-table-footer.html.twig',
			array(
				'ua' => $ua,
				'path' => $request->getScheme().'://'.$request->getHttpHost(),
				'nav' => 'datasources',
				'dsid' => $dsid,
				'table' => $table
			)
		);
	}

	/**
	 * Imports a delimited text file into a table of a data source
	 *
	 * Route path : /admin/datasources/{dsid}/{table}/doimport
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request
	 * @param   array $form The form fields
	 * @param   int $dsid The datasource ID
	 * @param   string|null $table The table name
	 * @param   \App\G6K\Model\Database $database The database object
	 * @return  \Symfony\Component\HttpFoundation\StreamedResponse
	 * @throws \Exception
	 *
	 */
	protected function doImportTable(Request $request, $form, $dsid, $table, $database) {
		$files = $request->files->all();
		$uploadDir = str_replace("\\", "/", $this->getConfigParameter('g6k_upload_directory'));
		$csvfile = '';
		$filename = '';
		foreach ($files as $fieldname => $file) {
			if ($file && $file->isValid()) {
				$filePath = $uploadDir . "/" . $this->get('g6k.file_uploader')->upload($file);
				if ($fieldname == 'table-data-file') {
					$csvfile = $filePath;
					$filename = $file->getClientOriginalName();
				}
			}
		}
		$separator = $form["table-data-separator"]; 
		if ($separator == 't') {
			$separator = "\t";
		}
		$delimiter = $form["table-data-delimiter"]; 
		$hasheader = isset($form["table-data-has-header"]) && $form["table-data-has-header"] == "1";
		$fs = new Filesystem();
		$translator = $this->get('translator');
		$heading = $translator->trans('Importing the table « %table% »', ['%table%' => $table]);
		$header = $this->makeTableReportHeader($request, $dsid, $table, $heading);
		$footer = $this->makeTableReportFooter($request, $dsid, $table);
		if ($csvfile != '') {
			if ($filename != '') {
				$fs->rename($csvfile, $uploadDir . "/" . $filename, true);
				$csvfile = $uploadDir . "/" . $filename;
			}
			$dss = $this->datasources->xpath("/DataSources/DataSource[@id='".$dsid."']");
			$datasource = $dss[0]['name'];
			$response = $this->runStreamedConsoleCommand([
				'command' => 'g6k:datasource:table:import',
				'datasourcename' => $datasource,
				'tablename' => $table,
				'filepath' => $csvfile,
				'--separator' => $separator,
				'--delimiter' => $delimiter,
				'--no-header' => !$hasheader
			], function() use ($header) {
				print $header;
				flush();
			}, function($ok) use ($footer, $translator, $table, $csvfile, $fs) {
				if ($ok) {
					print '<span class="alert-success">' . $translator->trans("The table « %table% » is successfully imported.", ['%table%' => $table]) . "</span>\n";
				} else {
					print '<span class="alert-danger">' . $translator->trans("The table « %table% » can't be imported.", ['%table%' => $table]) . "</span>\n";
				}
				print $footer . "\n";
				flush();
				try {
					$fs->remove($csvfile);
				} catch (IOExceptionInterface $e) {
				}
			});
		} else {
			$response = new StreamedResponse(function() use($header, $footer, $translator) {
				print $header;
				flush();
				print '<span class="alert-danger">' . $translator->trans("The uploaded file of the table can't be found.") . "</span>\n";
				print $footer."\n";
				flush();
			});
		}
		return $response;
	}

	/**
	 * Creates a data source
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse
	 *
	 */
	protected function createDatasource($form) {
		$helper = new DatasourcesHelper($this->datasources);
		$datasource = $helper->doCreateDatasource($form);
		$this->saveDatasources($datasource->ownerDocument);
		$type = $form['datasource-type'];
		$dbtype = $form['datasource-database-type'];
		if ($type == 'internal') {
			if (($result = $this->createDB((int)($datasource->getAttribute('id')), $dbtype)) !== true) {
				return $this->errorResponse($form, $result);
			}
		}
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasource', array('dsid' => $datasource->getAttribute('id'))));
	}

	/**
	 * Migrates data from a database to another.
	 *
	 * @access  protected
	 * @param   int $dsid The datasource ID
	 * @param   string $dbtype The target database type
	 * @param   \App\G6K\Model\Database $fromDatabase The origin Database object
	 * @return  string|true
	 *
	 */
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
				$rows = $fromDatabase->query(Parser::SQL_SELECT_KEYWORD. $fields . Parser::SQL_FROM_KEYWORD . $table . " order by id");
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

	/**
	 * Creates a database 
	 *
	 * @access  protected
	 * @param   int $dsid The datasource ID
	 * @param   string $dbtype The target database type
	 * @return  string|true
	 *
	 */
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

	/**
	 * Creates a table 
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  string|true
	 *
	 */
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

	/**
	 * Edits a table structure
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  string|true
	 *
	 */
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
	 * @return  bool Always true
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

	/**
	 * Inserts a row into a table
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @param   bool $restore (default: false) true if the row is to be restored, false otherwise
	 * @return  string|bool
	 *
	 */
	protected function addDBTableRow($form, $table, $database, $restore = false) {
		return $this->insertRowIntoTable($form, $table, $database, $this->get('translator'), $restore);
	}

	/**
	 * Updates a table row
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  bool|string
	 *
	 */
	protected function updateDBTableRow($form, $table, $database) {
		return $this->updateRowInTable($form, $table, $database, $this->get('translator'));
	}

	/**
	 * Deletes a row from a table
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  string|true
	 *
	 */
	protected function deleteDBTableRow($form, $table, $database) {
		return $this->deleteRowFromTable($form, $table, $database, $this->get('translator'));
	}

	/**
	 * Drops a table
	 *
	 * @access  protected
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  string|true
	 *
	 */
	protected function dropDBTable($table, $database) {
		try {
			$database->exec("DROP TABLE ".$table);
		} catch (\Exception $e) {
			return $this->get('translator')->trans("Can't drop %table% : %error%", array('%table%' => $table, '%error%' => $e->getMessage()));
		}
		return true;
	}

	/**
	 * Creates a table
	 *
	 * Route path : /admin/datasources/{dsid}/new/create
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse
	 *
	 */
	protected function createTable($form, $database) {
		$helper = new DatasourcesHelper($this->datasources);
		if (($result = $this->createDBTable($form, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $helper->convertDOMNodeToDOMElement($xpath->query("/DataSources/DataSource[@type='internal' and @database='".$database->getId()."']")->item(0));
		$tables = $datasource->getElementsByTagName('Table');
		$len = $tables->length;
		$maxId = 0;
		for($i = 0; $i < $len; $i++) {
			$id = (int)$helper->convertDOMNodeToDOMElement($tables->item($i))->getAttribute('id');
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

	/**
	 * Saves DataSources.xml from a DOM document
	 *
	 * @access  protected
	 * @param   \DOMDocument $dom The DOM document of DataSources.xml
	 * @return  void
	 *
	 */
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

	/**
	 * Adds a table row
	 *
	 * Route path : /admin/datasources/{dsid}/{table}/add
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
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

	/**
	 * Restores a table row
	 *
	 * Route path : /admin/datasources/{dsid}/{table}/restore
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
	protected function restoreTableRow($form, $table, $database) {
		if (($result = $this->addDBTableRow($form, $table, $database, true)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	/**
	 * Updates a table row
	 *
	 * Route path : /admin/datasources/{dsid}/{table}/update
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
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

	/**
	 * Deletes a table row
	 *
	 * Route path : /admin/datasources/{dsid}/{table}/delete
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
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

	/**
	 * Edits a table structure
	 *
	 * Route path : /admin/datasources/{dsid}/{table}/doedit
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse
	 *
	 */
	protected function doEditTable($form, $table, $database) {
		$helper = new DatasourcesHelper($this->datasources);
		if (($result = $this->editDBTable($form, $table, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $helper->convertDOMNodeToDOMElement($xpath->query("/DataSources/DataSource[(@type='internal' or @type='database') and @database='".$database->getId()."']")->item(0));
		$tables = $datasource->getElementsByTagName('Table');
		$len = $tables->length;
		for($i = 0; $i < $len; $i++) {
			$name = $helper->convertDOMNodeToDOMElement($tables->item($i))->getAttribute('name');
			if ($name == $table) {
				$theTable = $helper->convertDOMNodeToDOMElement($tables->item($i));
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

	/**
	 * Adds columns to a table
	 *
	 * @access  protected
	 * @param   \DOMDocument $dom The DOM document of DataSources.xml
	 * @param   array $form The form fields
	 * @param   \DOMElement &$table The table element in DataSources.xml
	 * @return  void
	 *
	 */
	protected function addColumnsToTable($dom, $form, &$table) {
		foreach ($form['field'] as $i => $field) {
			if ($field != '') {
				$column = $dom->createElement("Column");
				$column->setAttribute('id', (string)($i + 1));
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
						$source->setAttribute('id', '1');
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
							$choice->setAttribute('id', (string)($c + 1));
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

	/**
	 * Drops a table
	 *
	 * Route path : /admin/datasources/{dsid}/{table}/drop
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $table The table name
	 * @param   \App\G6K\Model\Database $database The Database object
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse
	 *
	 */
	protected function dropTable($form, $table, $database) {
		$helper = new DatasourcesHelper($this->datasources);
		if (($result = $this->dropDBTable($table, $database)) !== true) {
			return $this->errorResponse($form, $result);
		}
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $helper->convertDOMNodeToDOMElement($xpath->query("/DataSources/DataSource[(@type='internal' or @type='database') and @database='".$database->getId()."']")->item(0));
		$tables = $datasource->getElementsByTagName('Table');
		$len = $tables->length;
		for($i = 0; $i < $len; $i++) {
			$name = $helper->convertDOMNodeToDOMElement($tables->item($i))->getAttribute('name');
			if ($name == $table) {
				$datasource->removeChild($tables->item($i));
				break;
			}
		}
		$this->saveDatasources($dom);
		return new RedirectResponse($this->generateUrl('eureka_g6k_admin_datasource', array('dsid' => $datasource->getAttribute('id'))));
	}

	/**
	 * Edits a data source
	 *
	 * Route path : /admin/datasources/{dsid}/dummy/doedit-datasource
	 *
	 * @access  protected
	 * @param   int $dsid The datasource ID
	 * @param   array $form The form fields
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse
	 *
	 */
	protected function doEditDatasource($dsid, $form) {
		$helper = new DatasourcesHelper($this->datasources);
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $helper->convertDOMNodeToDOMElement($xpath->query("/DataSources/DataSource[@id='".$dsid."']")->item(0));
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
			$database = $helper->convertDOMNodeToDOMElement($xpath->query("/DataSources/Databases/Database[@id='".$datasource->getAttribute('database')."']")->item(0));
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
					$db = $helper->convertDOMNodeToDOMElement($dbs->item(0))->getElementsByTagName('Database');
					$len = $db->length;
					$maxId = 0;
					for($i = 0; $i < $len; $i++) {
						$id = (int)$helper->convertDOMNodeToDOMElement($db->item($i))->getAttribute('id');
						if ($id > $maxId) {
							$maxId = $id;
						}
					}
					$database = $dom->createElement("Database");
					$database->setAttribute('id', (string)($maxId + 1));
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
					$database = $helper->convertDOMNodeToDOMElement($xpath->query("/DataSources/Databases/Database[@id='".$datasource->getAttribute('database')."']")->item(0));
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
					$databases = $helper->convertDOMNodeToDOMElement($xpath->query("/DataSources/Databases")->item(0));
					$database = $helper->convertDOMNodeToDOMElement($xpath->query("/DataSources/Databases/Database[@id='".$datasource->getAttribute('database')."']")->item(0));
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

	/**
	 * Drops a data source 
	 *
	 * Route path : /admin/datasources/{dsid}/dummy/drop-datasource
	 *
	 * @access  protected
	 * @param   int $dsid The datasource ID
	 * @return  \Symfony\Component\HttpFoundation\RedirectResponse
	 *
	 */
	protected function dropDatasource ($dsid) {
		$helper = new DatasourcesHelper($this->datasources);
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$datasource = $helper->convertDOMNodeToDOMElement($xpath->query("/DataSources/DataSource[@id='".$dsid."']")->item(0));
		$type = $datasource->getAttribute('type');
		if ($type == 'internal' || $type == 'database') {
			$dbs = $xpath->query("/DataSources/Databases");
			$db = $helper->convertDOMNodeToDOMElement($xpath->query("/DataSources/Databases/Database[@id='".$datasource->getAttribute('database')."']")->item(0));
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
