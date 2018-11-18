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
 * This class allows the storage and retrieval of the attributes of a source.
 *
 * In a Source object, is defined a particular access query to a data source for a simulator.
 *
 * @author    Jacques Archimède
 *
 */
class Source {

	/**
	 * @var \App\G6K\Model\Simulator $simulator The Simulator object that uses this source 
	 *
	 * @access  private
	 *
	 */
	private $simulator = null;

	/**
	 * @var int        $id The ID of this source.
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $label The label of this source.
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var string     $datasource The name of the data source accessed by this source
	 *
	 * @access  private
	 *
	 */
	private $datasource = ""; 

	/**
	 * @var string     $request  The SQL Select clause for internal or external database
	 *
	 * @access  private
	 *
	 */
	private $request = "";  

	/**
	 * @var string     $requestType The type of the request ('simple' or 'complex') for internal or external database
	 *
	 * @access  private
	 *
	 */
	private $requestType = "simple"; 

	/**
	 * @var array     $parsed  The associative array containing the tokens of the parsed SQL request.
	 *
	 * @access  private
	 *
	 */
	private $parsed = array(); 

	/**
	 * @var string     $returnType  The type (format) or the result returned by the request: json, xml, html, csv, assocArray or singleValue
	 *
	 * @access  private
	 *
	 */
	private $returnType = ""; 

	/**
	 * @var string      $separator  The character that separates the fields in a query result in csv format
	 *
	 * @access  private
	 *
	 */
	private $separator = ";";  

	/**
	 * @var string     $delimiter The character that delimits the fields in a query result in csv format
	 *
	 * @access  private
	 *
	 */
	private $delimiter = "";  

	/**
	 * @var string     $returnPath  The expression allowing the location of the value looked for in the result of the request
	 *
	 * @access  private
	 *
	 */
	private $returnPath = ""; 

	/**
	 * @var array      $parameters The list of parameters passed to the request of this source.
	 *
	 * @access  private
	 *
	 */
	private $parameters = array();

	/**
	 * Constructor of class Source
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator|null $simulator The Simulator object that uses this source
	 * @param   int        $id The ID of this source
	 * @param   string     $datasource The name of the data source accessed by this source
	 * @param   string     $returnType  The type (format) or the result returned by the request
	 * @return  void
	 *
	 */
	public function __construct($simulator, $id, $datasource, $returnType) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->datasource = $datasource;
		$this->returnType = $returnType;
	}

	/**
	 * Returns the Simulator object that uses this source
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Simulator The Simulator object
	 *
	 */
	public function getSimulator() {
		return $this->simulator;
	}

	/**
	 * Returns the ID of this source.
	 *
	 * @access  public
	 * @return  int The ID of this source
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this source.
	 *
	 * @access  public
	 * @param   int        $id The ID of this source
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the label of this source.
	 *
	 * @access  public
	 * @return  string The label of this source.
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this source.
	 *
	 * @access  public
	 * @param   string     $label The label of this source.
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the name of the data source accessed by this source
	 *
	 * @access  public
	 * @return  string The name of the data source
	 *
	 */
	public function getDatasource() {
		return $this->datasource;
	}

	/**
	 * Sets the name of the data source accessed by this source
	 *
	 * @access  public
	 * @param   string     $datasource The name of the data source 
	 * @return  void
	 *
	 */
	public function setDatasource($datasource) {
		$this->datasource = $datasource;
	}

	/**
	 * Returns the SQL Select clause for internal or external database
	 *
	 * @access  public
	 * @return  string The SQL Select clause
	 *
	 */
	public function getRequest() {
		return $this->request;
	}

	/**
	 * Sets the SQL Select clause for internal or external database
	 *
	 * @access  public
	 * @param   string     $request  The SQL Select clause
	 * @return  void
	 *
	 */
	public function setRequest($request) {
		$this->request = $request;
	}

	/**
	 * Returns the type of the request ('simple' or 'complex')
	 *
	 * A request is simple if it concerns only one table and does not have a nested subquery, otherwise it is complex
	 *
	 * @access  public
	 * @return  string The type of the request
	 *
	 */
	public function getRequestType() {
		return $this->requestType;
	}

	/**
	 * Sets the type of the request ('simple' or 'complex')
	 *
	 * A request is simple if it concerns only one table and does not have a nested subquery, otherwise it is complex
	 *
	 * @access  public
	 * @param   string     $requestType The type of the request
	 * @return  void
	 *
	 */
	public function setRequestType($requestType) {
		$this->requestType = $requestType;
	}

	/**
	 * Returns the associative array, result of the parsing of the simple SQL Request
	 *
	 * The associative array has the following keys :
	 * 'select', 'from', 'where', 'conditions', 'orderby', 'limit', 'offset'
	 *
	 * @access  public
	 * @return  array The result of the parsing of the simple SQL Request
	 *
	 */
	public function getParsed() {
		return $this->parsed;
	}

	/**
	 * Sets the result of the parsing of the simple SQL Request
	 *
	 * Th result of the parsing is an associative array with the following keys :
	 * 'select', 'from', 'where', 'conditions', 'orderby', 'limit', 'offset'
	 *
	 * @access  public
	 * @param   array     $parsed  The result of the parsing of the simple SQL Request
	 * @return  void
	 *
	 */
	public function setParsed($parsed) {
		$this->parsed = $parsed;
	}

	/**
	 * Returns the type (format) or the result returned by the request
	 *
	 * The possible values are:
	 *
	 * - json: Javascript Object Notation
	 * - xml: eXtended Markup Language
	 * - html: Hyper Text Markup Language
	 * - csv: Comma Separated Value
	 * - assocArray: Table of key / value pairs.
	 * - singleValue: Scalar value
	 *
	 * @access  public
	 * @return  string The type (format) or the result returned by the request
	 *
	 */
	public function getReturnType() {
		return $this->returnType;
	}

	/**
	 * Sets the type (format) or the result returned by the request
	 *
	 * The possible values are:
	 *
	 * - json: Javascript Object Notation
	 * - xml: eXtended Markup Language
	 * - html: Hyper Text Markup Language
	 * - csv: Comma Separated Value
	 * - assocArray: Table of key / value pairs.
	 * - singleValue: Scalar value
	 *
	 * @access  public
	 * @param   string     $returnType The type (format) or the result returned by the request
	 * @return  void
	 *
	 */
	public function setReturnType($returnType) {
		$this->returnType = $returnType;
	}

	/**
	 * Returns the character that separates the fields in a query result in csv format
	 *
	 * @access  public
	 * @return  mixed The character that separates the fields
	 *
	 */
	public function getSeparator() {
		return $this->separator;
	}

	/**
	 * Sets the character that separates the fields in a query result in csv format
	 *
	 * @access  public
	 * @param   string      $separator The character that separates the fields
	 * @return  void
	 *
	 */
	public function setSeparator($separator) {
		$this->separator = $separator;
	}

	/**
	 * Returns the character that delimits the fields in a query result in csv format
	 *
	 * @access  public
	 * @return  string The character that delimits the fields
	 *
	 */
	public function getDelimiter() {
		return $this->delimiter;
	}

	/**
	 * Sets the character that delimits the fields in a query result in csv format
	 *
	 * @access  public
	 * @param   string     $delimiter The character that delimits the fields
	 * @return  void
	 *
	 */
	public function setDelimiter($delimiter) {
		$this->delimiter = $delimiter;
	}

	/**
	 * Returns the expression allowing the location of the value looked for in the result returned by the request of this source.
	 *
	 * The form of this expression depends on the format of the result of the query (returnType):
	 * 
	 * - json: JSONPath or XPath expression
	 * - xml: XPath expression
	 * - html: XPath expression
	 * - csv: line number / column number
	 * - assocArray: line number / column name
	 * - singleValue : N/A
	 * 
	 * @see http://goessner.net/articles/JsonPath/ JSONPath - XPath for JSON
	 * @see http://xmlfr.org/w3c/TR/xpath/ Langage XML Path (XPath)
	 * @access  public
	 * @return  string The expression allowing the location of the value
	 *
	 */
	public function getReturnPath() {
		return $this->returnPath;
	}

	/**
	 * Sets the expression allowing the location of the value looked for in the result returned by the request of this source.
	 *
	 * The form of this expression depends on the format of the result of the query (returnType):
	 * 
	 * - json: JSONPath or XPath expression
	 * - xml: XPath expression
	 * - html: XPath expression
	 * - csv: line number / column number
	 * - assocArray: line number / column name
	 * - singleValue : N/A
	 * 
	 * @see http://goessner.net/articles/JsonPath/ JSONPath - XPath for JSON
	 * @see http://xmlfr.org/w3c/TR/xpath/ Langage XML Path (XPath)
	 *
	 * @access  public
	 * @param   string     $returnPath The expression allowing the location of the value
	 * @return  void
	 *
	 */
	public function setReturnPath($returnPath) {
		$this->returnPath = $returnPath;
	}

	/**
	 * Returns the list of parameters passed to the request of this source.
	 *
	 * @access  public
	 * @return  array The list of parameters
	 *
	 */
	public function getParameters() {
		return $this->parameters;
	}

	/**
	 * Sets the list of parameters passed to the request of this source.
	 *
	 * @access  public
	 * @param   array      $parameters The list of parameters
	 * @return  void
	 *
	 */
	public function setParameters($parameters) {
		$this->parameters = $parameters;
	}

	/**
	 * Adds a Parameter object to the list of parameters passed to the request of this source.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Parameter $parameter The Parameter object 
	 * @return  void
	 *
	 */
	public function addParameter(Parameter $parameter) {
		$this->parameters[] = $parameter;
	}

	/**
	 * Removes a Parameter object from the list of parameters passed to the request of this source.
	 *
	 * @access  public
	 * @param   int $index The index of the parameter in the list of parameters
	 * @return  void
	 *
	 */
	public function removeParameter($index) {
		$this->parameters[$index] = null;
	}

	/**
	 * Retrieves a Parameter object by its name in the list of parameters passed to the request of this source.
	 *
	 * @access  public
	 * @param   string $name The name of the parameter 
	 * @return  \App\G6K\Model\Parameter|null The Parameter object
	 *
	 */
	public function getParameterByName($name) {
		foreach ($this->parameters as $parameter) {
			if ($parameter->getName() == $name) {
				return $parameter;
			}
		}
		return null;
	}

}

?>
