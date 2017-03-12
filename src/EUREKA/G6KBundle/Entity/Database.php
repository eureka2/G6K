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

class Database {

	private $simulator = null;
	private $id;
	private $type;
	private $name;
	private $label;
	private $host; // host or relative path if sqlite
	private $port;
	private $user;
	private $password;
	private $connected = false;
	private $link = null;

	private $myformat = array(
		'd' => '%d',
		'f' => '%f',
		'H' => '%H',
		'j' => '%j',
		'J' => '%J',
		'm' => '%m',
		'M' => '%i',
		'S' => '%S',
		'w' => '%w',
		'W' => '%U',
		'Y' => '%Y'
	);

	private $pgformat = array(
		'd' => 'DD',
		'f' => 'SS.SSS',
		'H' => 'HH24',
		'j' => 'DDD',
		'J' => 'J',
		'm' => 'MM',
		'M' => 'MI',
		'S' => 'SS',
		'w' => 'D',
		'W' => 'WW',
		'Y' => 'YYYY'
	);

	public function __construct($simulator, $id, $type, $name) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->type = $type;
		$this->name = $name;
	}
	
	public function getSimulator() {
		return $this->simulator;
	}
	
	public function getId() {
		return $this->id;
	}
	
	public function setId($id) {
		$this->id = $id;
	}
	
	public function getType() {
		return $this->type;
	}
	
	public function setType($type) {
		$this->type = $type;
	}
	
	public function getName() {
		return $this->name;
	}
	
	public function setName($name) {
		$this->name = $name;
	}
	
	public function getLabel() {
		return $this->label;
	}
	
	public function setLabel($label) {
		$this->label = $label;
	}
	
	public function getHost() {
		return $this->host;
	}
	
	public function setHost($host) {
		$this->host = $host;
	}
	
	public function getPort() {
		return $this->port;
	}
	
	public function setPort($port) {
		$this->port = $port;
	}
	
	public function getUser() {
		return $this->user;
	}
	
	public function setUser($user) {
		$this->user = $user;
	}
	
	public function getPassword() {
		return $this->password;
	}
	
	public function setPassword($password) {
		$this->password = $password;
	}
	
	public function getConnection() {
		return $this->link;
	}
	
	public function isConnected() {
		return $this->connected;
	}
	
	public function getConnected() {
		return $this->connected;
	}
	
	public function setConnected($connected) {
		$this->connected = $connected;
	}
	
	public function connect($withDbName = true) {
		if (! $this->isConnected()) {
			switch ($this->type) {
				case "mysql":
					$this->link = @mysql_connect($this->host, $this->user, $this->password);
					if ($withDbName) {
						if ($this->link) {
							if (@mysql_select_db(str_replace('-', '_', $this->name), $this->link)) {
								@mysql_query("SET NAMES UTF8", $this->link);
								return $this->link;
							} else
								throw new \Exception ('Unable to select database. MySQL reported: '.mysql_error());
						} else
							throw new \Exception('Unable to connect to MySQL server. MySQL reported: '.mysql_error());
					}
					break;
				case "mysqli":
					if (strpos($this->host, ':') !== false)
						list($this->host, $this->port) = explode(':', $this->host);
					$dsn = array(
						'host=' . $this->host
					);
					if (isset($this->port)) {
						$dsn[] = 'port=' . $this->port;
					}
					if (isset($this->name) && $withDbName) {
						$dsn[] = 'dbname=' . str_replace('-', '_', $this->name);
					}
					$this->link = new \PDO('mysql:' . implode(';', $dsn), 
						$this->user, 
						$this->password,
						array(\PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8')
					);
					$this->link->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
					$this->link->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
					$this->link->setAttribute(\PDO::ATTR_CASE, \PDO::CASE_LOWER);
					break;
				case "pgsql":
					if (strpos($this->host, ':') !== false)
						list($this->host, $this->port) = explode(':', $this->host);
					$dsn = array(
						'host=' . $this->host
					);
					if (isset($this->port)) {
						$dsn[] = 'port=' . $this->port;
					}
					if (isset($this->name) && $withDbName) {
						$dsn[] = 'dbname=' . str_replace('-', '_', $this->name);
					}
					$this->link = new \PDO('pgsql:' . implode(';', $dsn), $this->user, $this->password);
					$this->link->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
					$this->link->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
					$this->link->setAttribute(\PDO::ATTR_CASE, \PDO::CASE_LOWER);
					break;
				case "sqlite":
					$this->link = new \PDO('sqlite:'.dirname(dirname(__FILE__)).'/Resources/data/databases/'.$this->name);
					$this->link->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
					$this->link->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
					$this->link->setAttribute(\PDO::ATTR_CASE, \PDO::CASE_LOWER);
					break;
				case "jsonsql":
					$this->link = JsonSQL::open(dirname(dirname(__FILE__)).'/Resources/data/databases/'.$this->name, true);
					break;
			}
			$this->setConnected(true);
		}
		return $this->isConnected();
	}

	public function query($sql, $unbuffered = false) {
		$sql = $this->convertSQLFunctions($sql);
		$query_result = false;
		switch ($this->type) {
			case "mysql":
				if ($unbuffered) {
					$stmt = @mysql_unbuffered_query($sql, $this->link);
				} else {
					$stmt = @mysql_query($sql, $this->link);
				}
				if (!$stmt) {
					$query_result = false;
				} else {
					$query_result = array();
					while ($row = @mysql_fetch_assoc($stmt)) {
						$query_result[] = $row;
					}
				}
				break;
			case "pgsql":
			case "mysqli":
			case "sqlite":
			case "jsonsql":
				$stmt = $this->link->query($sql);
				$query_result = $stmt->fetchAll();
				break;
		}
		return $query_result;
	}

	public function prepare($sql) {
		$sql = $this->convertSQLFunctions($sql);
		$stmt = false;
		switch ($this->type) {
			case "mysql":
				throw new \Exception ('prepare is not implemented for this driver');
				break;
			case "pgsql":
			case "mysqli":
			case "sqlite":
			case "jsonsql":
				$stmt = $this->link->prepare($sql);
				break;
		}
		return $stmt;
	}

	public function bindParam($stmt, $parameter, &$variable, $type='text') {
		$result = false;
		switch ($this->type) {
			case "mysql":
				throw new \Exception ('bindParam is not implemented for this driver');
				break;
			case "pgsql":
			case "mysqli":
			case "sqlite":
			case "jsonsql":
				switch ($type) {
					case 'number':
					case 'integer':
					case 'money':
					case 'percent':
					case 'month':
					case 'year':
						$data_type = \PDO::PARAM_INT;
					case 'boolean':
						$data_type = \PDO::PARAM_BOOL;
					default:
						$data_type = \PDO::PARAM_STR;
				}
				$result = $stmt->bindParam($parameter, $variable, $data_type);
				break;
		}
		return $result;
	}

	public function bindValue($stmt, $parameter, $value, $type='text') {
		$result = false;
		switch ($this->type) {
			case "mysql":
				throw new \Exception ('bindValue is not implemented for this driver');
				break;
			case "pgsql":
			case "mysqli":
			case "sqlite":
			case "jsonsql":
				switch ($type) {
					case 'number':
					case 'integer':
					case 'money':
					case 'percent':
					case 'month':
					case 'year':
						$data_type = \PDO::PARAM_INT;
					case 'boolean':
						$data_type = \PDO::PARAM_BOOL;
					default:
						$data_type = \PDO::PARAM_STR;
				}
				$result = $stmt->bindValue($parameter, $value, $data_type);
				break;
		}
		return $result;
	}

	public function execute($stmt) {
		$query_result = false;
		switch ($this->type) {
			case "mysql":
				throw new \Exception ('execute is not implemented for this driver');
				break;
			case "pgsql":
			case "mysqli":
			case "sqlite":
			case "jsonsql":
				if ($stmt->execute()) {
					$query_result = $stmt->fetchAll();
				}
				break;
		}
		return $query_result;
	}

	public function exec($sql) {
		$affected = false;
		switch ($this->type) {
			case "mysql":
				$result = @mysql_query($sql, $this->link);
				if ($result) {
					$affected = mysql_affected_rows($this->link);
				} else if (mysql_errno()) {
					throw new \Exception(mysql_errno().": ".mysql_error());
				} 
				break;
			case "pgsql":
			case "mysqli":
			case "sqlite":
			case "jsonsql":
				$affected = $this->link->exec($sql);
				if ($affected === false) {
					$err = $this->pdo->errorInfo();
					if ($err[0] === '00000' || $err[0] === '01000') {
						return 1;
					}
					throw new \Exception(implode(' - ', $err));
				}
				break;
		}
		return $affected;
	}

	public function quote($value) {
		$query_result = false;
		switch ($this->type) {
			case "mysql":
				return mysql_real_escape_string($value);
			case "pgsql":
			case "mysqli":
			case "sqlite":
			case "jsonsql":
				return $this->link->quote($value);
		}
		return $value;
	}

	public function lastInsertId($tablename) {
		switch ($this->type) {
			case "mysql":
				return mysql_insert_id($this->link);
			case "pgsql":
			case "mysqli":
			case "sqlite":
			case "jsonsql":
				return $this->link->lastInsertId();
		}
		return 0;
	}

	private function convertSQLFunctions($sql) {
		switch ($this->type) {
			case "mysql":
			case "mysqli":
				$myformat = &$this->myformat;
				$sql = preg_replace_callback("/\bstrftime\s*\(((?>[^()]+)|(?R))*\)/i", function ($r) use ($myformat) {
					$args = explode(',', $r[1]);
					$format = trim($args[0]);
					$args[0] = preg_replace_callback("/\%(\w)/", function ($m) use ($myformat) {
						return $myformat[$m[1]];
					}, $format);
					return 'DATE_FORMAT('.trim(implode(', ', array_reverse ($args))).')';
				}, $sql);
				break;
			case "pgsql":
				$pgformat = &$this->pgformat;
				$sql = preg_replace_callback("/\bstrftime\s*\(((?>[^()]+)|(?R))*\)/i", function ($r) use ($pgformat) {
					$args = explode(',', $r[1]);
					$format = trim($args[0]);
					$args[0] = preg_replace_callback("/\%(\w)/", function ($m) use ($pgformat) {
						return $pgformat[$m[1]];
					}, $format);
					return 'to_char('.trim(implode(', ', array_reverse ($args))).')';
				}, $sql);
				break;
		}
		return $sql;
	}
}

?>