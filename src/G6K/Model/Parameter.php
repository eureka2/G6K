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
 * This class allows the storage and retrieval of the attributes of a parameter.
 *
 * A parameter is the way to pass on values of data or constants either to parameterized queries upon a data source or as the parameter of the web service url of a data source.
 * Therefore, a parameter is always associated with a source.
 *
 * @author    Jacques Archimède
 *
 */
class Parameter {

	/**
	 * @var \App\G6K\Model\Source $source The Source object that uses this parameter.
	 *
	 * @access  private
	 *
	 */
	private $source = null;

	/**
	 * @var string     $type The type of this parameter: 'queryString', 'path', 'data', 'columnValue' or 'header'
	 *
	 * @access  private
	 *
	 */
	private $type = "";

	/**
	 * @var string     $origin The origin of this parameter: 'data' or 'constant'
	 *
	 * @access  private
	 *
	 */
	private $origin = "data"; 

	/**
	 * @var string     $name The name of this parameter
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $format  The format in which the parameter must be provided. Useful for a parameter of type date.
	 *
	 * @access  private
	 *
	 */
	private $format = "";

	/**
	 * @var int        $data  The id of the data item associated with this parameter if the origin attribute is equal to 'data'.
	 *
	 * @access  private
	 *
	 */
	private $data = 0;

	/**
	 * @var string     $constant The constant value of this parameter if the origin attribute is equal to 'constant'.
	 *
	 * @access  private
	 *
	 */
	private $constant = "";

	/**
	 * @var bool       $optional  Indicates whether this parameter is optional or not.
	 *
	 * @access  private
	 *
	 */
	private $optional = false;

	/**
	 * Constructor of class Parameter
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Source $source The Source object that uses this parameter.
	 * @param   string     $type The type of this parameter
	 * @return  void
	 *
	 */
	public function __construct($source, $type) {
		$this->source = $source;
		$this->type = $type;
	}

	/**
	 * Returns the Source object that uses this parameter.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Source The Source object 
	 *
	 */
	public function getSource() {
		return $this->source;
	}

	/**
	 * Returns the type of this parameter.
	 *
	 * The possible values are:
	 *
	 * - queryString: The parameter is part of the queryString of the url (if the source is a web service with method "GET")
	 * - path: the parameter is part of the path of the url (if the source is a web service)
	 * - data: the parameter is a POST data (if the source is a web service with method "POST")
	 * - columnValue: the parameter is in the where clause of an SQL query (if the source is an internal or external database).
	 * - header: the parameter is a HTTP header (if the source is a web service).
	 *
	 * @access  public
	 * @return  string The type of this parameter
	 *
	 */
	public function getType() {
		return $this->type;
	}

	/**
	 * Sets the type of this parameter.
	 *
	 * The possible values are:
	 *
	 * - queryString: The parameter is part of the queryString of the url (if the source is a web service with method "GET")
	 * - path: the parameter is part of the path of the url (if the source is a web service)
	 * - data: the parameter is a POST data (if the source is a web service with method "POST")
	 * - columnValue: the parameter is in the where clause of a SQL request (if the source is an internal or external database).
	 * - header: the parameter is a HTTP header (if the source is a web service).
	 *
	 * @access  public
	 * @param   string     $type The type of this parameter
	 * @return  void
	 *
	 */
	public function setType($type) {
		$this->type = $type;
	}

	/**
	 * Returns the origin of this parameter
	 *
	 * The possible values are:
	 *
	 * - data: the content of this parameter is the value of the data item associated with it.
	 * - constant: the content of this parameter is a constant value. 
	 *
	 * @access  public
	 * @return  string The origin of this parameter
	 *
	 */
	public function getOrigin() {
		return $this->origin;
	}

	/**
	 * Sets the origin of this parameter
	 *
	 * The possible values are:
	 *
	 * - data: the content of this parameter is the value of the data item associated with it.
	 * - constant: the content of this parameter is a constant value. 
	 *
	 * @access  public
	 * @param   string     $origin The origin of this parameter
	 * @return  void
	 *
	 */
	public function setOrigin($origin) {
		if ($origin != '') {
			$this->origin = $origin;
		}
	}

	/**
	 * Returns the name of this parameter
	 *
	 * @access  public
	 * @return  string The name of this parameter
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this parameter
	 *
	 * @access  public
	 * @param   string     $name The name of this parameter
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the format in which the parameter must be provided. Useful only for a parameter of type date.
	 *
	 * @see http://php.net/manual/fr/function.date.php to know the characters used in a format.
	 *
	 * @access  public
	 * @return  string The format in which the parameter must be provided.
	 *
	 */
	public function getFormat() {
		return $this->format;
	}

	/**
	 * Sets the format in which the parameter must be provided. Useful only for a parameter of type date.
	 *
	 * @see http://php.net/manual/fr/function.date.php to know the characters used in a format.
	 *
	 * @access  public
	 * @param   string     $format  The format in which the parameter must be provided.
	 * @return  void
	 *
	 */
	public function setFormat($format) {
		$this->format = $format;
	}

	/**
	 * Returns the id of the data item associated with this parameter. Useful only if origin is equal to 'data'.
	 *
	 * @access  public
	 * @return  int The id of the data item associated with this parameter.
	 *
	 */
	public function getData() {
		return $this->data;
	}

	/**
	 * Sets the id of the data item associated with this parameter. Useful only if origin is equal to 'data'.
	 *
	 * @access  public
	 * @param   int        $data The id of the data item associated with this parameter.
	 * @return  void
	 *
	 */
	public function setData($data) {
		$this->data = $data;
	}

	/**
	 * Returns the constant value of this parameter. Useful only if origin is equal to 'constant'.
	 *
	 * @access  public
	 * @return  string The constant value of this parameter.
	 *
	 */
	public function getConstant() {
		return $this->constant;
	}

	/**
	 * Sets the constant value of this parameter. Useful only if origin is equal to 'constant'.
	 *
	 * @access  public
	 * @param   string     $constant The constant value of this parameter.
	 * @return  void
	 *
	 */
	public function setConstant($constant) {
		$this->constant = $constant;
	}

	/**
	 * Returns the optional attribute of this parameter.
	 *
	 * An optional parameter with no value is not passed to the parameterized query or not inserted in the url.
	 *
	 * @access  public
	 * @return  bool true if this parameter is optional, false otherwise
	 *
	 */
	public function isOptional() {
		return $this->optional;
	}

	/**
	 * Returns the optional attribute of this parameter.
	 *
	 * An optional parameter with no value is not passed to the parameterized query or not inserted in the url.
	 *
	 * @access  public
	 * @return  bool true if this parameter is optional, false otherwise
	 *
	 */
	public function getOptional() {
		return $this->optional;
	}

	/**
	 * Determines whether this parameter is optional or not.
	 *
	 * An optional parameter with no value is not passed to the parameterized query or not inserted in the url.
	 *
	 * @access  public
	 * @param   bool $optional true if this parameter is optional, false otherwise
	 * @return  void
	 *
	 */
	public function setOptional($optional) {
		$this->optional = $optional;
	}
}

?>
