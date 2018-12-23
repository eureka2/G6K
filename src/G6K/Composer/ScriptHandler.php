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

namespace App\G6K\Composer;

use Composer\Script\Event;
use Symfony\Component\Dotenv\Dotenv;

use App\G6K\Model\Database;
use App\G6K\Manager\DatasourcesHelper;

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
	 * Builds environment variables
	 *
	 * @access  public
	 * @static 
	 * @param   \Composer\Script\Event $event The script event class
	 * @return  void
	 *
	 */
	public static function buildDotenv(Event $event) {
		$extras = $event->getComposer()->getPackage()->getExtra();
		$installationManager = $event->getComposer()->getInstallationManager();
		$package = $event->getComposer()->getPackage();
		$version = $package->getPrettyVersion();
		$version = preg_replace("/\s+/", "-", $version);
		putenv('APP_VERSION=' . $version);
		$installPath = $installationManager->getInstallPath($package);
		$symfonyDir = str_replace(DIRECTORY_SEPARATOR . "vendor/" . $package->getPrettyName(), "", $installPath);

		putenv('PUBLIC_DIR=' . ( $extras['public-dir'] ?? 'public'));
		$dotenvdist = new Dotenv();
		$dotenvdist->load($symfonyDir . DIRECTORY_SEPARATOR . '.env.dist');

		if (is_file($symfonyDir . DIRECTORY_SEPARATOR . '.env')) {
			$dotenv = new Dotenv();
			$dotenv->load($symfonyDir . DIRECTORY_SEPARATOR . '.env');
		}
		$event->getIO()->write('<info>Creating the ".env" file</info>');

		// Find the expected params
		$variables = $dotenvdist->parse(file_get_contents($symfonyDir  . DIRECTORY_SEPARATOR . '.env.dist'), '.env.dist');

		$params = self::getEnvironmentVariables($event, $variables);

		self::setEnvironmentVariable($params, 'APP_VERSION', $version);
		self::setEnvironmentVariable($params, 'PUBLIC_DIR', $extras['public-dir'] ?? 'public');
		self::setEnvironmentVariable($params, 'G6K_LOCALE', 'en');
		if (isset($params['DATABASE_URL'])) {
			$url = $params['DATABASE_URL'];
			if (preg_match("#([^:]+)://(.*)$#", $url, $m)) {
				$engine = $m[1];
				$path = $m[2];
				self::setEnvironmentVariable($params, 'DB_ENGINE', $engine);
				if ($engine == 'sqlite') {
					self::setEnvironmentVariable($params, 'DB_VERSION', '3.15');
					self::setEnvironmentVariable($params, 'DB_HOST', '~');
					self::setEnvironmentVariable($params, 'DB_PORT', '~');
					self::setEnvironmentVariable($params, 'DB_NAME', '~');
					self::setEnvironmentVariable($params, 'DB_USER', '~');
					self::setEnvironmentVariable($params, 'DB_PASSWORD', '~');
					self::setEnvironmentVariable($params, 'DB_PATH', substr($path, 1));
				} else if (preg_match("#([^:]+):([^@]+)@([^:]+):([^/]+)/(.*)$#", $path, $m)) {
					self::setEnvironmentVariable($params, 'DB_VERSION', '~');
					self::setEnvironmentVariable($params, 'DB_HOST', $m[3]);
					self::setEnvironmentVariable($params, 'DB_PORT', $m[4]);
					self::setEnvironmentVariable($params, 'DB_NAME', $m[5]);
					self::setEnvironmentVariable($params, 'DB_USER', $m[1]);
					self::setEnvironmentVariable($params, 'DB_PASSWORD', $m[2]);
					self::setEnvironmentVariable($params, 'DB_PATH', '~');
				}
			}
			self::setEnvironmentVariable($params, 'DB_CHARSET', 'UTF8');
			unset($params['DATABASE_URL']);
			putenv('DATABASE_URL');
		}
		$content = "# This file is auto-generated during the composer install\n";
		foreach($params as $variable => $value) {
			$content .= $variable . "=" . $value . "\n";
		}
		file_put_contents($symfonyDir  . DIRECTORY_SEPARATOR . '.env', $content);
	}

	private static function setEnvironmentVariable(array &$variables, $variable, $value) {
		$variables[$variable] = $value;
		putenv($variable . "=" . $value);
	}

	private static function getEnvironmentVariables(Event $event, array $variables) {
		$params = array();
		if (!$event->getIO()->isInteractive()) {
			foreach($variables as $variable => $value) {
				$params[$variable] = getenv($variable);
			}
		} else {
			foreach($variables as $variable => $value) {
				$default = getenv($variable);
				$default = str_replace('%PUBLIC_DIR%', getenv('PUBLIC_DIR'), $default);
				switch ($variable) {
					case 'APP_ENV':
						$value = $event->getIO()->ask(sprintf('<question>%s</question> (<comment>%s</comment>): ', $variable, $default), $default);
						break;
					case 'APP_VERSION':
						$value = $default;
						break;
					case 'DB_ENGINE':
						$value = $event->getIO()->ask(sprintf('<question>%s</question> (<comment>%s</comment>): ', $variable, $default), $default);
						break;
					default:
						$value = $event->getIO()->ask(sprintf('<question>%s</question> (<comment>%s</comment>): ', $variable, $default), $default);
				}
				$params[$variable] = $value;
			}
		}
		return $params;
	}

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
		$installationManager = $event->getComposer()->getInstallationManager();
		$package = $event->getComposer()->getPackage();
		$installPath = $installationManager->getInstallPath($package);
		$symfonyDir = str_replace(DIRECTORY_SEPARATOR . "vendor/" . $package->getPrettyName(), "", $installPath);
		$databasesDir = $symfonyDir . DIRECTORY_SEPARATOR . "var" . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'databases';
		if (($parameters = self::getParameters($event, $symfonyDir)) === false) {
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
				$dbdir = dirname($parameters->database_path);
				$database = new Database(null, $dbdir, 1, 'sqlite', $name);
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
		$installationManager = $event->getComposer()->getInstallationManager();
		$package = $event->getComposer()->getPackage();
		$installPath = $installationManager->getInstallPath($package);
		$symfonyDir = str_replace(DIRECTORY_SEPARATOR . "vendor/" . $package->getPrettyName(), "", $installPath);
		$databasesDir = $symfonyDir . DIRECTORY_SEPARATOR . "var" . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'databases';
		$simusDir = $symfonyDir . DIRECTORY_SEPARATOR . "var" . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'simulators';
		if (($parameters = self::getParameters($event, $symfonyDir)) === false) {
			return;
		}
		$name = 'demo';
		$schemafile = $databasesDir . DIRECTORY_SEPARATOR . $name . '.schema.json';
		$datafile = $databasesDir . DIRECTORY_SEPARATOR . $name . '.json';
		$datasources = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><DataSources xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/DataSources.xsd"><Databases></Databases></DataSources>', LIBXML_NOWARNING);
		$helper = new DatasourcesHelper($datasources);
		$dsid = 0;
		$dom = $helper->makeDatasourceDom($schemafile, $datafile, $parameters, $databasesDir, $dsid);
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
	 * This function parses the '.env' file and returns an array of database parameters
	 *
	 * @access  protected
	 * @static 
	 * @param   \Composer\Script\Event $event The script event class
	 * @param   mixed $symfonyDir the absolute path of the symfony directory
	 * @return  array|false parameters array or false in case of error
	 *
	 */
	protected static function getParameters(Event $event, $symfonyDir) {
		$parameters = array();
		try {
			$dotenv = new Dotenv();
			$dotenv->load($symfonyDir . DIRECTORY_SEPARATOR . '.env');
			$parameters['database_driver'] = 'pdo_' . self::getParameterValue($symfonyDir, 'DB_ENGINE');
			$parameters['database_host'] = self::getParameterValue($symfonyDir, 'DB_HOST');
			$parameters['database_port'] = self::getParameterValue($symfonyDir, 'DB_PORT');
			$parameters['database_name'] = self::getParameterValue($symfonyDir, 'DB_NAME');
			$parameters['database_user'] = self::getParameterValue($symfonyDir, 'DB_USER');
			$parameters['database_password'] = self::getParameterValue($symfonyDir, 'DB_PASSWORD');
			$parameters['database_path'] = self::getParameterValue($symfonyDir, 'DB_PATH');
			$parameters['database_version'] = self::getParameterValue($symfonyDir, 'DB_VERSION');
			$parameters['locale'] = self::getParameterValue($symfonyDir, 'G6K_LOCALE');
			return $parameters;
			 
		} catch (\Exception $e) {
			$event->getIO()->write(sprintf("Unable to get database parameters: %s", $e->getMessage()));
			return false;
		}
	}

	protected static function getParameterValue($symfonyDir, $parameter) {
		$value = getenv($parameter);
		$value = str_replace('%kernel.project_dir%', $symfonyDir, $value);
		$value = str_replace('%PUBLIC_DIR%', getenv('PUBLIC_DIR'), $value);
		return $value;
	}

}

?>
