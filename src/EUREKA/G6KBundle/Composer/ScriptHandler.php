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
use EUREKA\G6KBundle\Manager\Json\JSONToSQLConverter;
use EUREKA\G6KBundle\Manager\DatasourcesHelper;

/**
 *
 * The ScriptHandler class installs users who can log in to the G6K administration interface and a demonstration simulator (if desired).
 * It is executed by Composer at the end of the G6K installation. See file composer.json (post-install-cmd)
 *
 * @author Jacques Archimède
 */
class ScriptHandler
{

	/**
	 * Users installation:
	 *
	 * - Creation of the database according to parameters provided in parameters.yml
	 * - Running the 'fos_user.sql' script in the 'src/EUREKA/G6KBundle/Resources/data/databases' directory. This script contains an 'insert' of two users: admin and guest.
	 *
	 * @access  public
	 * @static 
	 * @param   \Composer\Script\Event $event The script event class
	 * @return  void
	 *
	 */
	public static function installUsers(Event $event) {
		$event->getIO()->write("Installing the users of the administration interface");
		$extras = $event->getComposer()->getPackage()->getExtra();
		$installationManager = $event->getComposer()->getInstallationManager();
		$package = $event->getComposer()->getPackage();
		$installPath = $installationManager->getInstallPath($package);
		$symfonyDir = str_replace(DIRECTORY_SEPARATOR . "vendor/" . $package->getPrettyName(), "", $installPath);
		$appDir = $symfonyDir . DIRECTORY_SEPARATOR . $extras['symfony-app-dir'];
		$configDir = $appDir . DIRECTORY_SEPARATOR  .'config';
		$databasesDir = $symfonyDir . DIRECTORY_SEPARATOR . "src" . DIRECTORY_SEPARATOR . "EUREKA" . DIRECTORY_SEPARATOR . "G6KBundle" . DIRECTORY_SEPARATOR . 'Resources' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'databases';
		if (($parameters = self::getParameters($event, $configDir)) === false) {
			return;
		}
		$parameters = (object)$parameters;
		$driver = $parameters->database_driver;
		switch ($driver) {
			case 'pdo_mysql':
				$database = new Database(null, $databasesDir, 1, 'mysqli', $parameters->database_name);
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
				$database = new Database(null, $databasesDir, 1, 'pgsql', $parameters->database_name);
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
				$database = new Database(null, $databasesDir, 1, 'sqlite', $name);
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
		}
	}

	/**
	 * Installation of the demonstration simulator from the files "demo.schema.json" and "demo.json" located in the directory 'src/EUREKA/G6KBundle/Resources/data/databases'.
	 *
	 * @access  public
	 * @static 
	 * @param   \Composer\Script\Event $event The script event class
	 * @return  void
	 *
	 */
	public static function installDemo(Event $event) {
		if (!$event->getIO()->askConfirmation('Would you like to install the demo simulator? [y/N] ', true)) {
			return;
		}
		$event->getIO()->write("Installing the demo simulator");
		$extras = $event->getComposer()->getPackage()->getExtra();
		$installationManager = $event->getComposer()->getInstallationManager();
		$package = $event->getComposer()->getPackage();
		$installPath = $installationManager->getInstallPath($package);
		$symfonyDir = str_replace(DIRECTORY_SEPARATOR . "vendor/" . $package->getPrettyName(), "", $installPath);
		$appDir = $symfonyDir . DIRECTORY_SEPARATOR . $extras['symfony-app-dir'];
		$configDir = $appDir . DIRECTORY_SEPARATOR  .'config';
		$databasesDir = $symfonyDir . DIRECTORY_SEPARATOR . "src" . DIRECTORY_SEPARATOR . "EUREKA" . DIRECTORY_SEPARATOR . "G6KBundle" . DIRECTORY_SEPARATOR . 'Resources' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'databases';
		$simusDir = $symfonyDir . DIRECTORY_SEPARATOR . "src" . DIRECTORY_SEPARATOR . "EUREKA" . DIRECTORY_SEPARATOR . "G6KBundle" . DIRECTORY_SEPARATOR . 'Resources' . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'simulators';
		if (($parameters = self::getParameters($event, $configDir)) === false) {
			return;
		}
		$name = 'demo';
		$schemafile = $databasesDir . DIRECTORY_SEPARATOR . $name . '.schema.json';
		$datafile = $databasesDir . DIRECTORY_SEPARATOR . $name . '.json';
		$datasources = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><DataSources xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/DataSources.xsd"><Databases></Databases></DataSources>', LIBXML_NOWARNING);
		$helper = new DatasourcesHelper($datasources);
		$dsid = 0;
		$dom = $helper->makeDatasourceDom($name, $schemafile, $datafile, $parameters, $databasesDir, $dsid);
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
		if (file_exists($simusDir . DIRECTORY_SEPARATOR . 'demo-' . $parameters->locale . '.xml')) {
			rename($simusDir . DIRECTORY_SEPARATOR . 'demo-' . $parameters->locale . '.xml', $simusDir . DIRECTORY_SEPARATOR . 'demo.xml');
		}
		foreach (glob($simusDir . DIRECTORY_SEPARATOR . "demo-*.xml") as $filename) {
			unlink($filename);
		}
	}

	/**
	 * This function parses the 'parameters.yml' file and returns an array of parameters
	 *
	 * @access  protected
	 * @static 
	 * @param   \Composer\Script\Event $event The script event class
	 * @param   mixed $configDir the absolute path of the 'app/config' directory
	 * @return  array|false parameters array or false in case of error
	 *
	 */
	protected static function getParameters(Event $event, $configDir) {
		try {
			$config = Yaml::parse(file_get_contents($configDir . DIRECTORY_SEPARATOR . 'parameters.yml'));
			return $config['parameters'];
			 
		} catch (ParseException $e) {
			$event->getIO()->write(sprintf("Unable to parse parameters.yml: %s", $e->getMessage()));
			return false;
		}
	}

}

?>
