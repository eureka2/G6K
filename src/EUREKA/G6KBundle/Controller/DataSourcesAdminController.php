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

	public function indexAction(Request $request, $dbname = null, $table = null, $crud = null)
	{
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;

		$db_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/databases";
		$this->datasources = new \SimpleXMLElement($db_dir."/DataSources.xml", LIBXML_NOWARNING, true);

		if ($crud !== null) {
			if (! $this->get('security.context')->isGranted('ROLE_CONTRIBUTOR')) {
				return $this->errorResponse($form, "Access denied!");
			}
			switch ($crud) {
				case 'add':
					return $this->addTableRow ($form, $dbname, $table);
				case 'update':
					return $this->updateTableRow ($form, $dbname, $table);
				case 'delete':
					return $this->deleteTableRow ($form, $dbname, $table);
				case 'create':
					return $this->createTable ($form, $dbname, $table);
				case 'createdb':
					return $this->createDb ($form, $dbname);
				case 'drop':
					return $this->dropTable ($form, $dbname, $table);
				case 'erase':
					return $this->eraseDB ($form, $dbname);
			}
		} else if (! $this->get('security.context')->isGranted('ROLE_CONTRIBUTOR')) {
			throw $this->AccessDeniedException ($this->get('translator')->trans("Access Denied!"));
		} else {
			$databases = array();
			if (is_dir($db_dir)) {
				$objects = scandir($db_dir);
				foreach ($objects as $object) {
					if(is_file($db_dir.'/'.$object) && preg_match('/^(.*)\.db$/',$object, $matches) && $object != "g6k.db") {
						$labels = $this->datasources->xpath("/DataSources/Databases/Database[@type='sqlite' and @name='".$object."']");
						$label = (count($labels) > 0) ? (string)$labels[0]['label'] : $matches[1];
						$databases[] = array('file' => $matches[1], 'label' => $label);
					}
				}
			}
			
			$tabledef = array();
			$tables = array();
			$tableinfos = array();
			$tabledatas = array();
			if ($dbname !== null) {
				$database = new Database(null, 1, "sqlite", $dbname.".db");
				$database->connect();
				if ($table !== null) {
					$tabledef['name'] = $table;
					$tabledef['label'] = $table;
					$tabledef['description'] = '';
					$tableinfos = $database->query("PRAGMA table_info('".$table."')");
					foreach($tableinfos as $i => $info) {
						$columns = $this->datasources->xpath("/DataSources/DataSource[@type='internal' and @name='".$dbname."']/Table[@name='".$table."']/Column[@name='".$info['name']."']");
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
				$tables = $database->query("SELECT * FROM sqlite_master WHERE type='table' AND tbl_name NOT LIKE 'sqlite_%'");
				foreach($tables as $i => $tbl) {
					$tbls = $this->datasources->xpath("/DataSources/DataSource[@type='internal' and @name='".$dbname."']/Table[@name='".$tbl['name']."']");
					$tables[$i]['label'] = (count($tbls) > 0) ? (string)$tbls[0]['label'] : $tbl['name'];
					$tables[$i]['description'] = (count($tbls) > 0) ? (string)$tbls[0]->Description : '';
					if ($table !== null && $tbl['name'] == $table) {
						$tabledef['label'] = $tables[$i]['label'];
						$tabledef['description'] = $tables[$i]['description'];
					}
				}
			}
	 		$hiddens = array();		
			$hiddens['script'] = $script;
			$silex = new Application();
			$silex->register(new MobileDetectServiceProvider());
			try {
				return $this->render(
					'EUREKAG6KBundle:admin/pages:datasources.html.twig',
					array(
						'ua' => $silex["mobile_detect"],
						'path' => $request->getScheme().'://'.$request->getHttpHost(),
						'nav' => 'datasources',
						'databases' => $databases,
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
	}
	
    protected function processSource($source) 
	{
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
	
	protected function checkValue ($name, $info, $value) {
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

	protected function infosColumns ($dbname, $database, $table) {
		$infosColumns = array();
		$tableinfos = $database->query("PRAGMA table_info('".$table."')");
		foreach($tableinfos as $i => $info) {
			$infosColumns[$info['name']]['notnull'] = $info['notnull'];
			$infosColumns[$info['name']]['dflt_value'] = $info['dflt_value'];
			$columns = $this->datasources->xpath("/DataSources/DataSource[@type='internal' and @name='".$dbname."']/Table[@name='".$table."']/Column[@name='".$info['name']."']");
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

	protected function createDB ($form, $dbname) {
	}

	protected function createTable ($form, $dbname, $table) {
	}

	protected function addTableRow ($form, $dbname, $table) {
		$id = $form['id'];
		if ($id > 0) {
			return $this->errorResponse($form, "This record already exists.");
		}
		$database = new Database(null, 1, "sqlite", $dbname.".db");
		$database->connect();
		$infosColumns = $this->infosColumns($dbname, $database, $table);
		$insertNames = array();
		$insertValues = array();
		foreach($infosColumns as $name => $info) {
			$value = isset($form[$name]) ? $form[$name] : null;
			$check = $this->checkValue($name, $info, $value);
			if ($check !== true) {
				return $this->errorResponse($form, $check);
			}
			if ($name != 'id') {
				$insertNames[] = $name;
				if ($value === null || $value == '') {
					$insertValues[] = "NULL";
				} else if ($info['g6k_type'] == 'date') {
					$insertValues[] = $this->parseDate('d/m/Y', $value)->format('Y-m-d');
				} else if ( $info['type'] == 'TEXT') {
					$insertValues[] = $database->quote($value);
				} else  {
					$insertValues[] = str_replace(",", ".", $value);
				}
			}			
		}
		$sql = "INSERT INTO ".$table." (".implode(', ', $insertNames).") VALUES (".implode(', ', $insertValues).")";
		$database->query($sql);
		$form['id'] = $database->lastInsertId($table);
		// $form['sql'] = $sql;
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function updateTableRow ($form, $dbname, $table) {
		$id = $form['id'];
		if ($id == 0) {
			return $this->addTableRow ($form, $dbname, $table);
		}
		$database = new Database(null, 1, "sqlite", $dbname.".db");
		$database->connect();
		$infosColumns = $this->infosColumns($dbname, $database, $table);
		$updateFields = array();
		foreach($infosColumns as $name => $info) {
			$value = isset($form[$name]) ? $form[$name] : null;
			$check = $this->checkValue($name, $info, $value);
			if ($check !== true) {
				return $this->errorResponse($form, $check);
			}
			if ($name != 'id') {
				if ($value === null || $value == '') {
					$updateFields[] = $name . "=NULL";
				} else if ($info['g6k_type'] == 'date') {
					$updateFields[] = $name . "='" . $this->parseDate('d/m/Y', $value)->format('Y-m-d') . "'";
				} else if ( $info['type'] == 'TEXT') {
					$updateFields[] = $name . "=" . $database->quote($value);
				} else  {
					$value = str_replace(",", ".", $value);
					$updateFields[] = $name . "=" . $value;
				}
			}			
		}
		$sql = "UPDATE ".$table." SET ".implode(', ', $updateFields)." WHERE id=".$id;
		$database->query($sql);
		// $form['sql'] = $sql;
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function deleteTableRow ($form, $dbname, $table) {
		$id = $form['id'];
		if ($id == 0) {
			return $this->errorResponse($form, "There's no record with id 0.");
		}
		$database = new Database(null, 1, "sqlite", $dbname.".db");
		$database->connect();
		$sql = "DELETE FROM ".$table." WHERE id=".$id;
		$database->query($sql);
		// $form['sql'] = $sql;
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function dropTable ($form, $dbname, $table) {
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function eraseDB ($form, $dbname) {
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}
	
}
