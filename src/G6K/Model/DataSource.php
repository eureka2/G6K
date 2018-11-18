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

/**
 *
 * This class allows the storage and retrieval of the attributes of a data source.
 *
 * A data source is where a simulator retrieves reference data to perform the simulation.
 *
 * A data source is an internal database, an external database, or a web service that can be accessed using a parametrized uri.
 *
 * The data sources définition are stored in src/EUREKA/G6KBundle/Resources/data/DataSources.xml
 *
 * @author    Jacques Archimède
 * @author    Yann Toqué
 *
 */
class DataSource {

	/**
	 * @var  \App\G6K\Model\Simulator $simulator The Simulator object that uses this data source
	 *
	 * @access  private
	 *
	 */
	private $simulator = null;

	/**
	 * @var int        $id The ID of this data source
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $name The name of this data source
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $type The name of this data source :  uri (web service), database, internal.
	 *
	 * @access  private
	 *
	 */
	private $type = ""; 

	/**
	 * @var string     $uri  The uri of this data source in case of web service
	 *
	 * @access  private
	 *
	 */
	private $uri = "";

	/**
	 * @var string     $method The HTTP access method (GET ot POST) of this data source in case of web service
	 *
	 * @access  private
	 *
	 */
	private $method = "GET";

	/**
	 * @var int        $database  The ID of the database if the type of this data source is internal or database
	 *
	 * @access  private
	 *
	 */
	private $database = 0;

	/**
	 * @var string     $description The description of this data source
	 *
	 * @access  private
	 *
	 */
	private $description = "";

	/**
	 * @var array      $tables The list of tables in the database if this data source is of internal or external database type
	 *
	 * @access  private
	 *
	 */
	private $tables = array(); 

	/**
	 * @var array      $namespaces The associative array of namespaces if this data source is of the web service type returning responses in xml format
	 *
	 * @access  private
	 *
	 */
	private $namespaces = array(); 

	/**
	 * Constructor of class DataSource
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator $simulator The Simulator object that uses this data source
	 * @param   int        $id The ID of this data source
	 * @param   string     $name The name of this data source
	 * @param   string     $type The type of this data source : uri, internal or database
	 * @return  void
	 *
	 */
	public function __construct($simulator, $id, $name, $type) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->name = $name;
		$this->type = $type;
	}

	/**
	 * Returns the Simulator object that uses this data source
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Simulator The Simulator Object 
	 *
	 */
	public function getSimulator() {
		return $this->simulator;
	}

	/**
	 * Returns the ID of this data source.
	 *
	 * @access  public
	 * @return  int The ID of this data source
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this data source.
	 *
	 * @access  public
	 * @param    int        $id The ID of this data source
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the name of this data source.
	 *
	 * @access  public
	 * @return  string The name of this data source
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this data source.
	 *
	 * @access  public
	 * @param   string     $name The name of this data source
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the type of this data source : uri, database orinternal
	 *
	 * @access  public
	 * @return  string The type of this data source
	 *
	 */
	public function getType() {
		return $this->type;
	}

	/**
	 * Sets the type of this data source : uri, database or internal
	 *
	 * @access  public
	 * @param   string     $type The type of this data source
	 * @return  void
	 *
	 */
	public function setType($type) {
		$this->type = $type;
	}

	/**
	 * Returns the uri of this data source in case of web service.
	 *
	 * @access  public
	 * @return  string The uri of this data source
	 *
	 */
	public function getUri() {
		return $this->uri;
	}

	/**
	 * Sets the uri of this data source in case of web service.
	 *
	 * @access  public
	 * @param   string     $uri  The uri of this data source
	 * @return  void
	 *
	 */
	public function setUri($uri) {
		$this->uri = $uri;
	}

	/**
	 * Returns the HTTP access method of this data source : GET or POST
	 *
	 * @access  public
	 * @return  string The HTTP access method of this data source
	 *
	 */
	public function getMethod() {
		return $this->method;
	}

	/**
	 * Sets the HTTP access method of this data source: GET or POST
	 *
	 * @access  public
	 * @param   string     $method The HTTP access method of this data source
	 * @return  void
	 *
	 */
	public function setMethod($method) {
		if ($method != "") {
			$this->method = $method;
		}
	}

	/**
	 * Returns the ID of the database if the type of this data source is internal or database.
	 *
	 * @access  public
	 * @return  int The ID of the database
	 *
	 */
	public function getDatabase() {
		return $this->database;
	}

	/**
	 * Sets the ID of the database if the type of this data source is internal or database.
	 *
	 * @access  public
	 * @param   int        $database The ID of the database
	 * @return  void
	 *
	 */
	public function setDatabase($database) {
		$this->database = $database;
	}

	/**
	 * Returns the description of this data source.
	 *
	 * @access  public
	 * @return  string The description of this data source
	 *
	 */
	public function getDescription() {
		return $this->description;
	}

	/**
	 * Sets the description of this data source.
	 *
	 * @access  public
	 * @param   string     $description The description of this data source
	 * @return  void
	 *
	 */
	public function setDescription($description) {
		$this->description = $description;
	}

	/**
	 * Returns the associative array of namespaces of this data source.
	 * 
	 * The keys in this array are the namespace prefixes.
	 * The values in this array are the namespace uris.
	 *
	 * @access  public
	 * @return  array The associative array of namespaces
	 *
	 */
	public function getNamespaces() {
		return $this->namespaces;
	}

	/**
	 *Sets the associative array of namespaces of this data source.
	 * 
	 * The keys in this array are the namespace prefixes.
	 * The values in this array are the namespace uris.
	 *
	 * @access  public
	 * @param   array $namespaces The associative array of namespaces
	 * @return  void
	 *
	 */
	public function setNamespaces($namespaces) {
		$this->namespaces = $namespaces;
	}

	/**
	 * Adds a namespace to the associative array of namespaces of this data source.
	 *
	 * @access  public
	 * @param   string $prefix The namespace prefix
	 * @param   string $uri The namespace uri
	 * @return  void
	 *
	 */
	public function addNamespace($prefix, $uri) {
		$this->namespaces[$prefix] = $uri;
	}

	/**
	 * Returns the list of tables in the database of this data source.
	 *
	 * @access  public
	 * @return  array The list of tables
	 *
	 */
	public function getTables() {
		return $this->tables;
	}

	/**
	 * Sets the list of tables in the database of this data source.
	 *
	 * @access  public
	 * @param   array      $tables The list of tables
	 * @return  void
	 *
	 */
	public function setTables($tables) {
		$this->tables = $tables;
	}

	/**
	 * Adds a table to the list of tables in the database of this data source.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Table $table The table to add
	 * @return  void
	 *
	 */
	public function addTable(Table $table) {
		$this->tables[] = $table;
	}

}

?>
