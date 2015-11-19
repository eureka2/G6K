<?php

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
	
	public function isConnected() {
		return $this->connected;
	}
	
	public function setConnected($connected) {
		$this->connected = $connected;
	}
	
	public function connect() {
		if (! $this->isConnected()) {
			switch ($this->type) {
				case "mysql":
					$this->link = @mysql_connect($this->host, $this->user, $this->password);
					if ($this->link) {
						if (@mysql_select_db($this->name, $this->link))
							return $this->link;
						else
							throw new \Exception ('Unable to select database. MySQL reported: '.mysql_error());
					} else
						throw new \Exception('Unable to connect to MySQL server. MySQL reported: '.mysql_error());
					break;
				case "mysqli":
					if (strpos($this->host, ':') !== false)
						list($this->host, $this->port) = explode(':', $this->host);
					if (isset($this->port))
						$this->link = new \PDO(sprintf('mysql:host=%s;port=%s;dbname=%s',$this->host, $this->port, $this->name), $this->user, $this->password);
					else
						$this->link = new \PDO(sprintf('mysql:host=%s;dbname=%s',$this->host, $this->name), $this->user, $this->password);
					$this->link->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
					$this->link->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
					break;
				case "pgsql":
					if (strpos($this->host, ':') !== false)
						list($this->host, $this->port) = explode(':', $this->host);
					if (isset($this->port))
						$this->link = new \PDO(sprintf('pgsql:host=%s;port=%s;dbname=%s',$this->host, $this->port, $this->name), $this->user, $this->password);
					else
						$this->link = new \PDO(sprintf('pgsql:host=%s;dbname=%s',$this->host, $this->name), $this->user, $this->password);
					$this->link->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
					$this->link->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
					break;
				case "sqlite":
					$this->link = new \PDO('sqlite:'.dirname(dirname(__FILE__)).'/Resources/data/databases/'.$this->name);
					$this->link->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
					$this->link->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
					break;
			}
			$this->setConnected(true);
		}
		return $this->isConnected();
	}

	public function query($sql, $unbuffered = false) {
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
				$stmt = $this->link->query($sql);
				$query_result = $stmt->fetchAll();
				break;
		}
		return $query_result;
	}

	public function quote($value) {
		$query_result = false;
		switch ($this->type) {
			case "mysql":
				return mysql_real_escape_string($value);
			case "pgsql":
			case "mysqli":
			case "sqlite":
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
				return $this->link->lastInsertId();
		}
		return 0;
	}

}

?>