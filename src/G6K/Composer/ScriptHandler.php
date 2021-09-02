<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2020 Jacques Archimède

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

	const CHARSET = [
		"mysql" => ["ARMSCII8", "ASCII", "BIG5", "BINARY", "CP1250", "CP1251", "CP1256", "CP1257", "CP850", "CP852", "CP866", "CP932", "DEC8", "EUCJPMS", "EUCKR", "GB18030", "GB2312", "GBK", "GEOSTD8", "GREEK", "HEBREW", "HP8", "KEYBCS2", "KOI8R", "KOI8U", "LATIN1", "LATIN2", "LATIN5", "LATIN7", "MACCE", "MACROMAN", "SJIS", "SWE7", "TIS620", "UCS2", "UJIS", "UTF16", "UTF16LE", "UTF32", "UTF8", "UTF8MB4"],
		"pgsql" => ["BIG5", "EUC_CN", "EUC_JP", "EUC_JIS_2004", "EUC_KR", "EUC_TW", "GB18030", "GBK", "ISO_8859_5", "ISO_8859_6", "ISO_8859_7", "ISO_8859_8", "JOHAB", "KOI8R", "KOI8U", "LATIN1", "LATIN2", "LATIN3", "LATIN4", "LATIN5", "LATIN6", "LATIN7", "LATIN8", "LATIN9", "LATIN10", "MULE_INTERNAL", "SJIS", "SHIFT_JIS_2004", "SQL_ASCII", "UHC", "UTF8", "WIN866", "WIN874", "WIN1250", "WIN1251", "WIN1252", "WIN1253", "WIN1254", "WIN1255", "WIN1256", "WIN1257", "WIN1258"]
	];

	const LABEL = [
		"APP_ENV" => "application environment [dev or prod]",
		"APP_DEBUG" => "debug mode [0 or 1]",
		"APP_LOCALE" => "locale [en-GB, en-US, fr-FR, ...]",
		"APP_UPLOAD_DIRECTORY" => "upload directory",
		"APP_VERSION" => "G6K version",
		"APP_SECRET" => "application secret",
		"PDFTK_PATH" => "absolute path of the pdftk executable",
		"MAILER_URL" => "mailer URL",
		"MAIL_FROM" => "email adress to use as sender of all emails",
		"DB_ENGINE" => "database engine [sqlite, mysql or pgsql]",
		"DB_NAME" => "database name",
		"DB_HOST" => "database host [localhost, ...]",
		"DB_PORT" => "database port",
		"DB_USER" => "database user",
		"DB_PASSWORD" => "database password",
		"DB_VERSION" => "database version",
		"DB_PATH" => "database path",
		"DB_CHARSET" => "database character set [UTF8, LATIN1, ...]",
		"HTTP_PROXY" => "HTTP proxy url [http://user:pass@host:port]",
		"HTTPS_PROXY" => "HTTPS proxy url [https://user:pass@host:port]"
	];
	
	private static $locales = null;
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
		$version = preg_replace("/[\(\)]/", " ", $version);
		$version = preg_replace("/\s+/", "-", $version);
		$isdev = $package->isDev();
		putenv('APP_VERSION=' . $version);
		$installPath = $installationManager->getInstallPath($package);
		$symfonyDir = str_replace(DIRECTORY_SEPARATOR . "vendor/" . $package->getPrettyName(), "", $installPath);

		putenv('PUBLIC_DIR=' . ( $extras['public-dir'] ?? 'public'));
		$dotenvdist = new Dotenv(true);
		$dotenvdist->load($symfonyDir . DIRECTORY_SEPARATOR . '.env.dist');

		if (is_file($symfonyDir . DIRECTORY_SEPARATOR . '.env')) {
			$dotenv = new Dotenv(true);
			$dotenv->load($symfonyDir . DIRECTORY_SEPARATOR . '.env');
		}
		$event->getIO()->write('<info>Creating the ".env" file</info>');

		// Find the expected params
		$variables = $dotenvdist->parse(file_get_contents($symfonyDir  . DIRECTORY_SEPARATOR . '.env.dist'), '.env.dist');

		if ($isdev) {
			putenv("APP_ENV=dev");
		}

		$params = self::getEnvironmentVariables($event, $variables);

		self::setEnvironmentVariable($params, 'APP_VERSION', $version);
		self::setEnvironmentVariable($params, 'APP_SECRET', self::generateRandomSecret());
		self::setEnvironmentVariable($params, 'PUBLIC_DIR', $extras['public-dir'] ?? 'public');
		self::setEnvironmentVariable($params, 'APP_LANGUAGE', substr($params['APP_LOCALE'], 0, 2));
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
		self::$locales = array_map(function ($locale) {
			return str_replace("_", "-", $locale);
		}, array_filter(\ResourceBundle::getLocales(''), function($locale) {
			return preg_match("/^\w\w+[-_]\w\w+$/", $locale);
		}));
		$params = array();
		if (!$event->getIO()->isInteractive()) {
			foreach($variables as $variable => $value) {
				$params[$variable] = getenv($variable);
			}
		} else {
			$engine = '';
			foreach($variables as $variable => $value) {
				$default = getenv($variable);
				$default = str_replace('%PUBLIC_DIR%', getenv('PUBLIC_DIR'), $default);
				$question = "Enter the " . (self::LABEL[$variable] ?? $variable);
				switch ($variable) {
					case 'APP_ENV':
						$value = $event->getIO()->askAndValidate(sprintf('<question>%s</question> (<comment>%s</comment>): ', $question, $default), function($rep) {
							if (in_array($rep, ['dev', 'prod'])){
								return $rep;
							} else {
								throw new \Exception("Only dev or prod are allowed !");
							}
						}, null, $default);
						break;
					case 'APP_DEBUG':
						$value = $event->getIO()->askAndValidate(sprintf('<question>%s</question> (<comment>%s</comment>): ', $question, $default), function($rep) {
							if (in_array($rep, ['0', '1'])){
								return $rep;
							} else {
								throw new \Exception("Only 0 or 1 are allowed !");
							}
						}, null, $default);
						break;
					case 'APP_VERSION':
						$value = $default;
						break;
					case 'PDFTK_PATH':
						$value = $event->getIO()->askAndValidate(sprintf('<question>%s</question> (<comment>%s</comment>): ', $question, $default), function($rep) use (&$engine) {
							if ($rep == '' || $rep == '~') {
								return '';
							} elseif (is_executable($rep)) {
								return $rep;
							} else {
								throw new \Exception(sprintf("The executable '%s' doesn't exists", $rep));
							}
						}, null, $default);
						$engine = $value;
						break;
					case 'DB_ENGINE':
						$value = $event->getIO()->askAndValidate(sprintf('<question>%s</question> (<comment>%s</comment>): ', $question, $default), function($rep) use (&$engine) {
							if (in_array($rep, ['sqlite', 'mysql', 'pgsql'])){
								return $rep;
							} else {
								throw new \Exception("Only sqlite, mysql, pgsql  are allowed !");
							}
						}, null, $default);
						$engine = $value;
						break;
					case 'DB_PORT':
						if ($engine == 'sqlite') {
							$value = '~';
						} else {
							$value = $event->getIO()->askAndValidate(sprintf('<question>%s</question> (<comment>%s</comment>): ', $question, $default), function($rep) {
								if (preg_match("/^\d+$/", $rep)){
									return $rep;
								} else {
									throw new \Exception("The database port must be an integer !");
								}
							}, null, $default);
							$value = str_replace('_', '-',$value);
						}
						break;
					case 'DB_NAME':
					case 'DB_HOST':
					case 'DB_USER':
					case 'DB_PASSWORD':
						if ($engine == 'sqlite') {
							$value = '~';
						} else {
							$value = $event->getIO()->ask(sprintf('<question>%s</question> (<comment>%s</comment>): ', $question, $default), $default);
						}
						break;
					case 'DB_PATH':
					case 'DB_VERSION':
						if ($engine == 'mysql' || $engine == 'pgsql') {
							$value = $default;
						} else {
							$value = $event->getIO()->ask(sprintf('<question>%s</question> (<comment>%s</comment>): ', $question, $default), $default);
						}
						break;
					case 'DB_CHARSET':
						if ($engine == 'sqlite') {
							$value = 'UTF8';
						} else {
							$charset = self::CHARSET[$engine];
							$value = $event->getIO()->askAndValidate(sprintf('<question>%s</question> (<comment>%s</comment>): ', $question, $default), function($rep) use ($engine, $charset) {
								if (in_array($rep, $charset)){
									return $rep;
								} else {
									throw new \Exception(sprintf("This character set is not supported by %s !", $engine));
								}
							}, null, $default);
						}
						break;
					case 'APP_LOCALE':
						$value = $event->getIO()->askAndValidate(sprintf('<question>%s</question> (<comment>%s</comment>): ', $question, $default), function($rep) {
							if (in_array($rep, self::$locales)){
								return $rep;
							} else {
								throw new \Exception("Invalide locale!");
							}
						}, null, $default);
						$value = str_replace('_', '-',$value);
						break;
					case 'APP_LANGUAGE':
					case 'APP_SECRET':
						break;
					default:
						$value = $event->getIO()->ask(sprintf('<question>%s</question> (<comment>%s</comment>): ', $question, $default), $default);
				}
				if (preg_match("/\s+/", $value)) {
					$value = '"'.$value.'"';
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
	 * - Running the 'g6k_user.sql' script in the 'src/EUREKA/G6KBundle/Resources/data/databases' directory. This script contains an 'insert' of two users: admin and guest.
	 *
	 * @access  public
	 * @static 
	 * @param   \Composer\Script\Event $event The script event class
	 * @return  void
	 *
	 */
	public static function installUsers(Event $event) {
		$event->getIO()->write("Installing the users of the administration interface");
		$vendorDir = $event->getComposer()->getConfig()->get('vendor-dir');
		$symfonyDir = dirname($vendorDir);
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
		if (($script = file_get_contents($databasesDir . DIRECTORY_SEPARATOR . 'g6k_user.sql')) === FALSE) {
			$event->getIO()->write(sprintf("Unable to read  %s", $databasesDir . DIRECTORY_SEPARATOR . 'g6k_user.sql'));
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
						$sql = preg_replace("/id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,/i", "id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,", $sql);
						$sql = preg_replace("/\s+CLOB\s+/i", " TEXT ", $sql);
						break;
					case 'pdo_pgsql':
						$sql = preg_replace("/id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,/i", "id SERIAL PRIMARY KEY,", $sql);
						$sql = preg_replace("/\s+DATETIME\s+/i", " TIMESTAMP ", $sql);
						$sql = preg_replace("/\s+CLOB\s+/i", " TEXT ", $sql);
						break;
					case 'pdo_sqlite':
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
				$sql = 'alter table user auto_increment = 3';
				break;
			case 'pdo_pgsql':
				$sql = "alter sequence user_id_seq restart with 3";
				break;
			case 'pdo_sqlite':
				$sql = "update sqlite_sequence set seq = 2 where name = 'user'";
				break;
			default:
				return;
		}
		try {
			$database->exec($sql);
		} catch (\Exception $e) {
			$event->getIO()->write("Can't set sequence for table user : " . $e->getMessage());
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
		$vendorDir = $event->getComposer()->getConfig()->get('vendor-dir');
		$symfonyDir = dirname($vendorDir);
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
		if (file_exists($simusDir . DIRECTORY_SEPARATOR . 'demo-' . $parameters->app_language . '.xml')) {
			rename($simusDir . DIRECTORY_SEPARATOR . 'demo-' . $parameters->app_language . '.xml', $simusDir . DIRECTORY_SEPARATOR . 'demo.xml');
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
			$dotenv = new Dotenv(true);
			$dotenv->load($symfonyDir . DIRECTORY_SEPARATOR . '.env');
			$parameters['database_driver'] = 'pdo_' . self::getParameterValue($symfonyDir, 'DB_ENGINE');
			$parameters['database_host'] = self::getParameterValue($symfonyDir, 'DB_HOST');
			$parameters['database_port'] = self::getParameterValue($symfonyDir, 'DB_PORT');
			$parameters['database_name'] = self::getParameterValue($symfonyDir, 'DB_NAME');
			$parameters['database_user'] = self::getParameterValue($symfonyDir, 'DB_USER');
			$parameters['database_password'] = self::getParameterValue($symfonyDir, 'DB_PASSWORD');
			$parameters['database_path'] = self::getParameterValue($symfonyDir, 'DB_PATH');
			$parameters['database_version'] = self::getParameterValue($symfonyDir, 'DB_VERSION');
			$parameters['app_locale'] = self::getParameterValue($symfonyDir, 'APP_LOCALE');
			$parameters['app_language'] = self::getParameterValue($symfonyDir, 'APP_LANGUAGE');
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

	protected static function generateRandomSecret() {
        if (function_exists('openssl_random_pseudo_bytes')) {
            return hash('sha1', openssl_random_pseudo_bytes(23));
        }
        return hash('sha1', uniqid(mt_rand(), true));
    }

}

?>
