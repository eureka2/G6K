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

namespace EUREKA\G6KBundle\Composer;

use Composer\Script\Event;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Yaml\Exception\ParseException;

use EUREKA\G6KBundle\Entity\Database;
use EUREKA\G6KBundle\Entity\JSONToSQLConverter;

class ScriptHandler
{
	public static function installUsers(Event $event) {
		$event->getIO()->write("Installing the users of the administration interface");
		$extras = $event->getComposer()->getPackage()->getExtra();
		$symfonyDir = dirname(dirname(dirname(dirname(__DIR__))));
		$appDir = $symfonyDir . DIRECTORY_SEPARATOR . $extras['symfony-app-dir'];
		$configDir = $appDir . DIRECTORY_SEPARATOR  .'config';
		$databasesDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'Resources' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'databases';
		if (($parameters = self::getParameters($event, $configDir)) === false) {
			return;
		}
		$parameters = (object)$parameters;
		$driver = $parameters->database_driver;
		switch ($driver) {
			case 'pdo_mysql':
				$database = new Database(null, 1, 'mysqli', $parameters->database_name);
				$database->setHost($parameters->database_host);
				if (isset($parameters->database_port)) {
					$database->setPort($parameters->database_port);
				}
				$database->setUser($parameters->database_user);
				if (isset($parameters->database_password)) {
					$database->setPassword($parameters->database_password);
				}
				break;
			case 'pdo_pgsql':
				$database = new Database(null, 1, 'pgsql', $parameters->database_name);
				$database->setHost($parameters->database_host);
				if (isset($parameters->database_port)) {
					$database->setPort($parameters->database_port);
				}
				$database->setUser($parameters->database_user);
				if (isset($parameters->database_password)) {
					$database->setPassword($parameters->database_password);
				}
				break;
			case 'pdo_sqlite':
				$name = basename($parameters->database_path);
				$database = new Database(null, 1, 'sqlite', $name);
				break;
			default:
				$event->getIO()->write(sprintf("Unsupported database driver: %s", $driver));
				return;
		}
		if (($script = file_get_contents($databasesDir . DIRECTORY_SEPARATOR . 'fos_user.sql')) === FALSE) {
			$event->getIO()->write(sprintf("Unable to read  %s", $databasesDir . DIRECTORY_SEPARATOR . 'fos_user.sql'));
			return;
		}
		try {
			$database->connect(false);
			switch($driver) {
				case 'pdo_mysql':
					$database->exec("create database if not exists " . $parameters->database_name . " character set utf8");
					$database->setConnected(false);
					$database->connect();
					break;
				case 'pdo_pgsql':
					$database->exec("create database " . $parameters->database_name . " encoding 'UTF8'");
					$database->setConnected(false);
					$database->connect();
					break;
			}
		} catch (\Exception $e) {
			$event->getIO()->write("Can't connect to database : " . $e->getMessage());
			return;
		}
		$script = preg_split ("/;\n/", $script, -1,  PREG_SPLIT_NO_EMPTY);
		foreach($script as $i => $sql) {
			if (preg_match("/^CREATE TABLE/i", $sql)) {
				switch ($driver) {
					case 'pdo_mysql':
						$sql = preg_replace("/id INTEGER NOT NULL,/i", "id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,", $sql);
						break;
					case 'pdo_pgsql':
						$sql = preg_replace("/id INTEGER NOT NULL,/i", "id SERIAL PRIMARY KEY,", $sql);
						$sql = preg_replace("/\s+DATETIME\s+/i", " TIMESTAMP ", $sql);
						break;
					case 'pdo_sqlite':
						$sql = preg_replace("/id INTEGER NOT NULL,/i", "id INTEGER PRIMARY KEY AUTOINCREMENT,", $sql);
						break;
				}
			}
			try {
				$database->exec($sql);
			} catch (\Exception $e) {
				$event->getIO()->write("Can't execute install users script : " . $e->getMessage());
				break;
			}
		}
		switch ($driver) {
			case 'pdo_mysql':
				$sql = 'alter table fos_user auto_increment = 3';
				break;
			case 'pdo_pgsql':
				$sql = "alter sequence fos_user_id_seq restart with 3";
				break;
			case 'pdo_sqlite':
				$sql = "update sqlite_sequence set seq = 2 where name = 'fos_user'";
				break;
			default:
				return;
		}
		try {
			$database->exec($sql);
		} catch (\Exception $e) {
			$event->getIO()->write("Can't set sequence for table fos_user : " . $e->getMessage());
			break;
		}
	}

	public static function installDemo(Event $event) {
		$event->getIO()->write("Installing the demo database");
		$extras = $event->getComposer()->getPackage()->getExtra();
		$symfonyDir = dirname(dirname(dirname(dirname(__DIR__))));
		$appDir = $symfonyDir . DIRECTORY_SEPARATOR . $extras['symfony-app-dir'];
		$configDir = $appDir . DIRECTORY_SEPARATOR  .'config';
		$databasesDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'Resources' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'databases';
		if (($parameters = self::getParameters($event, $configDir)) === false) {
			return;
		}
		$name = 'demo';
		$schemafile = $databasesDir . DIRECTORY_SEPARATOR . $name . '.schema.json';
		$datafile = $databasesDir . DIRECTORY_SEPARATOR . $name . '.json';
		$converter = new JSONToSQLConverter($parameters);
		$form = $converter->convert($name, $schemafile, $datafile);
		$datasource = self::doCreateDatasource($form);
		$dom = $datasource->ownerDocument;
		$tableid = 1;
		foreach ($form['datasource-tables'] as $tbl) {
			$table = $dom->createElement("Table");
			$table->setAttribute('id', $tableid++);
			$table->setAttribute('name', $tbl['name']);
			$table->setAttribute('label', $tbl['label']);
			$descr = $dom->createElement("Description");
			$descr->appendChild($dom->createCDATASection($tbl['description']));
			$table->appendChild($descr);
			$columnid = 1;
			foreach ($tbl['columns'] as $col) {
				$column = $dom->createElement("Column");
				$column->setAttribute('id', $columnid++);
				$column->setAttribute('name', $col['name']);
				$column->setAttribute('type', $col['type']);
				$column->setAttribute('label', $col['label']);
				$descr = $dom->createElement("Description");
				$descr->appendChild($dom->createCDATASection($col['description']));
				$column->appendChild($descr);
				if (isset($col['choices'])) {
					$choices = $dom->createElement("Choices");
					$choiceid = 1;
					foreach ($col['choices'] as $ch) {
						$choice = $dom->createElement("Choice");
						$choice->setAttribute('id', $choiceid++);
						$choice->setAttribute('value', $ch['value']);
						$choice->setAttribute('label', $ch['label']);
						$choices->appendChild($choice);
					}
					$column->appendChild($choices);
				} elseif (isset($col['source'])) {
					$choices = $dom->createElement("Choices");
					$source = $dom->createElement("Source");
					$source->setAttribute('id', 1);
					$source->setAttribute('datasource', $col['source']['datasource']);
					if (isset($col['source']['request'])) {
						$source->setAttribute('request', $col['source']['request']);
					}
					$source->setAttribute('returnType', $col['source']['returnType']);
					if (isset($col['source']['returnPath'])) {
						$source->setAttribute('returnPath', $col['source']['returnPath']);
					}
					$source->setAttribute('valueColumn', $col['source']['valueColumn']);
					$source->setAttribute('labelColumn', $col['source']['labelColumn']);
					$choices->appendChild($source);
					$column->appendChild($choices);
				}
				$table->appendChild($column);
			}
			$datasource->appendChild($table);
		}
		$xml = $dom->saveXML(null, LIBXML_NOEMPTYTAG);
		$dom = new \DOMDocument();
		$dom->preserveWhiteSpace  = false;
		$dom->formatOutput = true;
		$dom->loadXml($xml);
		$formatted = preg_replace_callback('/^( +)</m', function($a) { 
			return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
		}, $dom->saveXML(null, LIBXML_NOEMPTYTAG));
		file_put_contents($databasesDir."/DataSources.xml", $formatted);
		$parameters = (object)$parameters;
		$simusDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'Resources' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'simulators';
		if (file_exists($simusDir . DIRECTORY_SEPARATOR . 'demo-' . $parameters->locale . '.xml')) {
			rename($simusDir . DIRECTORY_SEPARATOR . 'demo-' . $parameters->locale . '.xml', $simusDir . DIRECTORY_SEPARATOR . 'demo.xml');
		}
		foreach (glob($simusDir . DIRECTORY_SEPARATOR . "demo-*.xml") as $filename) {
			unlink($filename);
		}
	}

	protected static function getParameters(Event $event, $configDir) {
		try {
			$config = Yaml::parse(file_get_contents($configDir . DIRECTORY_SEPARATOR . 'parameters.yml'));
			return $config['parameters'];
			 
		} catch (ParseException $e) {
			$event->getIO()->write(sprintf("Unable to parse parameters.yml: %s", $e->getMessage()));
			return false;
		}
	}

	protected static function doCreateDatasource ($form) {
		$datasources = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><DataSources xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/DataSources.xsd"><Databases></Databases></DataSources>', LIBXML_NOWARNING);
		$dom = dom_import_simplexml($datasources)->ownerDocument;
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
				$dbname = $form['datasource-database-name'];
				if ($dbtype == 'sqlite' && ! preg_match("/\.db$/", $dbname)) {
					$dbname .= '.db';
				}
				$database = $dom->createElement("Database");
				$database->setAttribute('id', $maxId + 1);
				$database->setAttribute('type', $dbtype);
				$database->setAttribute('name', $dbname);
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
		return $datasource;
	}

}

?>