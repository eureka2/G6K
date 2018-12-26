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

namespace App\G6K\Model;

use App\G6K\Manager\Splitter;
use App\G6K\Manager\Json\JsonSQL;

/**
 *
 * this class provides a unified access interface to SQL databases, whether MySQL, PostgreSQL, SQLite, or JsonSQL
 *
 *
 * @author    Jacques Archimède
 *
 */
class Database {

	/**
	 * @var \App\G6K\Model\Simulator $simulator The Simulator object that uses this database 
	 *
	 * @access  private
	 *
	 */
	private $simulator = null;

	/**
	 * @var string      $databasesDir The "databases" directory, specially for SQLite.
	 *
	 * @access  private
	 *
	 */
	private $databasesDir;

	/**
	 * @var int      $id The database id in DataSources.xml
	 *
	 * @access  private
	 *
	 */
	private $id;

	/**
	 * @var string      $type The database type : mysql, mysqli, pgsql, sqlite or jsonsql.
	 *
	 * @access  private
	 *
	 */
	private $type;

	/**
	 * @var string      $name The database name
	 *
	 * @access  private
	 *
	 */
	private $name;

	/**
	 * @var string      $label The database label
	 *
	 * @access  private
	 *
	 */
	private $label;

	/**
	 * @var string|null      $host The database host or relative path in the case of sqlite
	 *
	 * @access  private
	 *
	 */
	private $host; 

	/**
	 * @var int      $port The database port
	 *
	 * @access  private
	 *
	 */
	private $port;

	/**
	 * @var string|null      $user The identifier of the user who can connect and access the database.
	 *
	 * @access  private
	 *
	 */
	private $user;

	/**
	 * @var string|null      $password The password of the user who can connect and access the database.
	 *
	 * @access  private
	 *
	 */
	private $password;

	/**
	 * @var bool       $connected Indicates whether we are connected to the database or not
	 *
	 * @access  private
	 *
	 */
	private $connected = false;

	/**
	 * @var \PDO|\App\G6K\Manager\Json\JsonSQL $link link to the connection
	 *
	 * @access  private
	 *
	 */
	private $link = null;

	/**
	 * @var array      $myformat MySQL template patterns for Date/Time formatting
	 *
	 * @access  private
	 *
	 */
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

	/**
	 * @var array      $pgformat PostgreSQL template patterns for Date/Time formatting
	 *
	 * @access  private
	 *
	 */
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

	/**
	 * Constructor of class Database
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator|null $simulator The Simulator object that uses this database 
	 * @param   string|null $databasesDir The "databases" directory, specially for SQLite.
	 * @param   int         $id The ID of the database
	 * @param   string      $type The type of the database
	 * @param   string      $name The name of the database
	 * @return  void
	 *
	 */
	public function __construct($simulator, $databasesDir, $id, $type, $name) {
		$this->simulator = $simulator;
		$this->databasesDir = $databasesDir;
		$this->id = $id;
		$this->type = $type;
		$this->name = $name;
	}

	/**
	 * Returns the Simulator object that uses this database
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Simulator The Simulator object 
	 *
	 */
	public function getSimulator() {
		return $this->simulator;
	}

	/**
	 * Returns the database directory
	 *
	 * @access  public
	 * @return  string|null The database directory
	 *
	 */
	public function getDatabasesDir() {
		return $this->databasesDir;
	}

	/**
	 * Returns the ID of this database
	 *
	 * @access  public
	 * @return  int The ID of this database
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this database
	 *
	 * @access  public
	 * @param   int      $id The ID of this database
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the type of this database
	 *
	 * @access  public
	 * @return  string The type of this database
	 *
	 */
	public function getType() {
		return $this->type;
	}

	/**
	 * Sets the type of this database
	 *
	 * @access  public
	 * @param   string      $type The type of this database
	 * @return  void
	 *
	 */
	public function setType($type) {
		$this->type = $type;
	}

	/**
	 * Returns the name of this database
	 *
	 * @access  public
	 * @return  string The name of this database
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this database
	 *
	 * @access  public
	 * @param   string      $name The name of this database
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the label of this database
	 *
	 * @access  public
	 * @return  string The label of this database
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this database
	 *
	 * @access  public
	 * @param   string      $label The label of this database
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the host of this database
	 *
	 * @access  public
	 * @return  string|null The database host or the relative path in the case of sqlite
	 *
	 */
	public function getHost() {
		return $this->host;
	}

	/**
	 * Sets the host of this database
	 *
	 * @access  public
	 * @param   string|null      $host The host of this database or the relative path if sqlite
	 * @return  void
	 *
	 */
	public function setHost($host) {
		$this->host = $host;
	}

	/**
	 * Returns the port number of this database
	 *
	 * @access  public
	 * @return  int The port number of this database
	 *
	 */
	public function getPort() {
		return $this->port;
	}

	/**
	 * Sets the port number of this database
	 *
	 * @access  public
	 * @param   int      $port The port number of this database
	 * @return  void
	 *
	 */
	public function setPort($port) {
		$this->port = $port;
	}

	/**
	 * Returns the identifier of the user with access rights to this database
	 *
	 * @access  public
	 * @return  string|null The identifier of the user
	 *
	 */
	public function getUser() {
		return $this->user;
	}

	/**
	 * Sets the identifier of the user with access rights to this database
	 *
	 * @access  public
	 * @param   string|null      $user The identifier of the user
	 * @return  void
	 *
	 */
	public function setUser($user) {
		$this->user = $user;
	}

	/**
	 * Returns the password of the user with access rights to this database
	 *
	 * @access  public
	 * @return  string|null The password of the user
	 *
	 */
	public function getPassword() {
		return $this->password;
	}

	/**
	 * Sets the password of the user with access rights to this database
	 *
	 * @access  public
	 * @param   string|null     $password The password of the user
	 * @return  void
	 *
	 */
	public function setPassword($password) {
		$this->password = $password;
	}

	/**
	 * Returns the instance representing a connection to this database
	 *
	 * @access  public
	 * @return  \PDO|\App\G6K\Manager\Json\JsonSQL The instance
	 *
	 */
	public function getConnection() {
		return $this->link;
	}

	/**
	 * Returns the connection status to the database
	 *
	 * @access  public
	 * @return  bool true if connected, false otherwise
	 *
	 */
	public function isConnected() {
		return $this->connected;
	}

	/**
	 * Returns the connection status to the database
	 *
	 * @access  public
	 * @return  bool true if connected, false otherwise
	 *
	 */
	public function getConnected() {
		return $this->connected;
	}

	/**
	 * Sets the connection status to the database
	 *
	 * @access  public
	 * @param   bool       $connected true if connected, false otherwise
	 * @return  void
	 *
	 */
	public function setConnected($connected) {
		$this->connected = $connected;
	}

	/**
	 * Composes a DSN (Data Source Name) string, connects to the database and stores an instance representing a connection to a database
	 *
	 * @access  public
	 * @param   bool $withDbName (default: true) if false the database name is not inserted into the dsn string.
	 * @return  bool always true
	 *
	 */
	public function connect($withDbName = true) {
		if (! $this->isConnected()) {
			switch ($this->type) {
				case "mysql":
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
					$this->link = new \PDO('sqlite:'.$this->databasesDir.'/'.$this->name);
					$this->link->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
					$this->link->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
					$this->link->setAttribute(\PDO::ATTR_CASE, \PDO::CASE_LOWER);
					break;
				case "jsonsql":
					$this->link = JsonSQL::open($this->databasesDir.'/'.$this->name, true);
					break;
			}
			$this->setConnected(true);
		}
		return $this->isConnected();
	}

	/**
	 * Executes an SQL statement, returning an array containing all of the result set rows
	 *
	 * @access  public
	 * @param   string $sql The SQL statement to be prepares and executed.
	 * @return  array|string|bool the result array of the query on success or false on failure.
	 *
	 *
	 */
	public function query($sql) {
		$sql = $this->convertSQLFunctions($sql);
		$query_result = false;
		switch ($this->type) {
			case "mysql":
			case "mysqli":
			case "pgsql":
			case "sqlite":
			case "jsonsql":
				$stmt = $this->link->query($sql);
				$query_result = $stmt->fetchAll();
				break;
		}
		return $query_result;
	}

	/**
	 * Prepares a statement for execution and returns a statement object.
	 *
	 * The SQL statement can contain zero or more named (:name) or question mark (?) parameter markers for which real values will be substituted when the statement is executed. 
	 *
	 * @access  public
	 * @param   string  $sql The SQL Statement
	 * @return  \PDOStatement|\App\G6K\Manager\Json\JsonSQL\Statement The statement object
	 *
	 */
	public function prepare($sql) {
		$sql = $this->convertSQLFunctions($sql);
		$stmt = false;
		switch ($this->type) {
			case "mysql":
			case "mysqli":
			case "pgsql":
			case "sqlite":
			case "jsonsql":
				$stmt = $this->link->prepare($sql);
				break;
		}
		return $stmt;
	}

	/**
	 * Binds a parameter to the specified variable name.
	 *
	 * @access  public
	 * @param   \PDOStatement $stmt The statement object returned by the prepare method. 
	 * @param   string|int $parameter Parameter identifier. For a prepared statement using named placeholders, this will be a parameter name of the form :name. For a prepared statement using question mark placeholders, this will be the 1-indexed position of the parameter.
	 * @param   string &$variable  Name of the PHP variable to bind to the SQL statement parameter.
	 * @param   string $type (default: 'text') The type of the parameter
	 * @return  bool true on success or false on failure.
	 *
	 */
	public function bindParam(\PDOStatement $stmt, $parameter, &$variable, $type='text') {
		$result = false;
		switch ($this->type) {
			case "mysql":
			case "mysqli":
			case "pgsql":
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

	/**
	 * Binds a value to a parameter
	 *
	 * Binds a value to a corresponding named or question mark placeholder in the SQL statement that was used to prepare the statement.
	 *
	 * @access  public
	 * @param   \PDOStatement $stmt The statement object returned by the prepare method. 
	 * @param   string|int $parameter The parameter identifier. For a prepared statement using named placeholders, this will be a parameter name of the form :name. For a prepared statement using question mark placeholders, this will be the 1-indexed position of the parameter.
	 * @param   string $value The value to bind to the parameter.
	 * @param   string $type (default: 'text') The type of the parameter 
	 * @return  bool true on success or false on failure.
	 *
	 */
	public function bindValue(\PDOStatement $stmt, $parameter, $value, $type='text') {
		$result = false;
		switch ($this->type) {
			case "mysql":
			case "mysqli":
			case "pgsql":
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

	/**
	 * Executes a prepared statement
	 *
	 * @access  public
	 * @param   \PDOStatement $stmt The statement object returned by the prepare method. 
	 * @return  array|string|bool the result array of the statement on success or false on failure.
	 *
	 */
	public function execute(\PDOStatement $stmt) {
		$query_result = false;
		switch ($this->type) {
			case "mysql":
			case "mysqli":
			case "pgsql":
			case "sqlite":
			case "jsonsql":
				if ($stmt->execute()) {
					$query_result = $stmt->fetchAll();
				}
				break;
		}
		return $query_result;
	}

	/**
	 * Execute an SQL statement and return the number of affected rows
	 *
	 * @access  public
	 * @param   string  $sql The SQL Statement
	 * @return  int|bool the number of rows that were modified or deleted by the SQL statement you issued, 0 if no rows were affected or false on failure
	 * @throws \Exception 
	 *
	 */
	public function exec($sql) {
		$affected = false;
		switch ($this->type) {
			case "mysql":
			case "mysqli":
			case "pgsql":
			case "sqlite":
			case "jsonsql":
				$affected = $this->link->exec($sql);
				if ($affected === false) {
					$err = $this->link->errorInfo();
					if ($err[0] === '00000' || $err[0] === '01000') {
						return 1;
					}
					throw new \Exception(implode(' - ', $err));
				}
				break;
		}
		return $affected;
	}

	/**
	 * Quotes a string for use in a query.
	 *
	 * Places quotes around the input string (if required) and escapes special characters within the input string, using a quoting style appropriate to the underlying driver.
	 *
	 * @access  public
	 * @param   string $value The string to be quoted.
	 * @param   int $type The parameter type.
	 * @return  string The quoted string or false if the driver does not support quoting in this way.
	 *
	 */
	public function quote($value, $type = \PDO::PARAM_STR) {
		switch ($this->type) {
			case "mysql":
			case "mysqli":
			case "pgsql":
			case "sqlite":
			case "jsonsql":
				return $this->link->quote($value, $type);
		}
		return $value;
	}

	/**
	 * Returns the ID of the last inserted row or sequence value
	 *
	 * @access  public
	 * @return  string The ID of the last inserted row
	 *
	 */
	public function lastInsertId() {
		switch ($this->type) {
			case "mysql":
			case "mysqli":
			case "pgsql":
			case "sqlite":
			case "jsonsql":
				return $this->link->lastInsertId();
		}
		return '0';
	}

	/**
	 * Converts internal functions in a SQL statement into appropriate functions to the database driver
	 *
	 * @access  private
	 * @param   string  $sql The SQL Statement to be converted
	 * @return  string The converted SQL statement
	 *
	 */
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
			case "sqlite":
				$sql = preg_replace_callback("/\bconcat\s*\(((?>[^()]+)|(?R))*\)/i", function ($r) {
					$args = Splitter::splitList($r[1]);
					return implode(' || ', array_map(function ($a) {
						return $a == "?" ? $a : "'" . $a . "'"; 
					},  $args));
				}, $sql);
				break;
		}
		return $sql;
	}
}

?>
