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
 * This class allows the storage and retrieval of the attributes of a ChoiceSource object
 *
 * A ChoiceSource object stores the name of the column that contains the value that will be assigned to a Choice object in a choices list. 
 * It also stores the name of the column that contains the label assigned to the Choice object. The same for the id of the Choice object.
 *
 * The contents of these columns are the result of a query on a database from a reference data source.
 *
 * @author    Jacques Archimède
 * @author    Yann Toqué
 *
 */
class ChoiceSource {

	/**
	 * @var \App\G6K\Model\Data $data The Data object that uses this ChoiceSource
	 *
	 * @access  private
	 *
	 */
	private $data = null;

	/**
	 * @var int        $id The ID of this ChoiceSource object
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $idColumn The name of the column that contains the ID that will be assigned to a Choice object in a choices list. 
	 *
	 * @access  private
	 *
	 */
	private $idColumn = "";

	/**
	 * @var string     $valueColumn The name of the column that contains the value that will be assigned to a Choice object in a choices list. 
	 *
	 * @access  private
	 *
	 */
	private $valueColumn = "";

	/**
	 * @var string     $labelColumn The name of the column that contains the label that will be assigned to a Choice object in a choices list. 
	 *
	 * @access  private
	 *
	 */
	private $labelColumn = "";

	/**
	 * @var bool       $caseInsensitive Indicates whether column names are case-insensitive or not.
	 *
	 * @access  private
	 *
	 */
	private $caseInsensitive = true;

	/**
	 * Constructor of class ChoiceSource
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Data $data The Data object that uses this ChoiceSource
	 * @param   int        $id The ID of this ChoiceSource object
	 * @param   string     $valueColumn The name of the column that contains the value that will be assigned to a Choice object in a choices list. 
	 * @param   string     $labelColumn The name of the column that contains the label that will be assigned to a Choice object in a choices list. 
	 * @return  void
	 *
	 */
	public function __construct($data, $id, $valueColumn, $labelColumn) {
		$this->data = $data;
		$this->id = $id;
		$this->setValueColumn($valueColumn);
		$this->setLabelColumn($labelColumn);
	}

	/**
	 * Retrieves the Data object that uses this ChoiceSource
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Data The Data object that uses this ChoiceSource
	 *
	 */
	public function getData() {
		return $this->data;
	}

	/**
	 * Retrieves the ID of this ChoiceSource object
	 *
	 * @access  public
	 * @return  int The ID of this ChoiceSource object
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this ChoiceSource object
	 *
	 * @access  public
	 * @param  	int        $id The ID of this ChoiceSource object
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the caseInsensitive attribute of this ChoiceSource object 
	 *
	 * @access  public
	 * @return  bool the value of caseInsensitive
	 *
	 */
	public function isCaseInsensitive() {
		return $this->caseInsensitive;
	}

	/**
	 * Returns the caseInsensitive attribute of this ChoiceSource object 
	 *
	 * @access  public
	 * @return  bool the value of caseInsensitive 
	 *
	 */
	public function getCaseInsensitive() {
		return $this->caseInsensitive;
	}

	/**
	 * Determines whether columns names are case-insensitive or not.
	 *
	 * @access  public
	 * @param   bool   $caseInsensitive (default: true) Case Insensitive or not  
	 * @return  void
	 *
	 */
	public function setCaseInsensitive($caseInsensitive = true) {
		$this->caseInsensitive = $caseInsensitive;
	}

	/**
	 * Retrieves the name of the column that contains the ID that will be assigned to a Choice object in a choices list. 
	 *
	 * If the column name is case insensitive, it is converted to lowercase.
	 *
	 * @access  public
	 * @return  string The name of the column that contains the ID. 
	 *
	 */
	public function getIdColumn() {
		return $this->caseInsensitive ? strtolower($this->idColumn) : $this->idColumn;
	}

	/**
	 * Sets the name of the column that contains the ID that will be assigned to a Choice object in a choices list. 
	 *
	 * @access  public
	 * @param   string     $idColumn The name of the column that contains the ID. 
	 * @return  void
	 *
	 */
	public function setIdColumn($idColumn) {
		$this->idColumn = $idColumn;
	}

	/**
	 * Retrieves the name of the column that contains the value that will be assigned to a Choice object in a choices list. 
	 *
	 * If the column name is case insensitive, it is converted to lowercase.
	 *
	 * @access  public
	 * @return  string The name of the column that contains the value. 
	 *
	 */
	public function getValueColumn() {
		return $this->caseInsensitive ? strtolower($this->valueColumn) : $this->valueColumn;
	}

	/**
	 * Sets the name of the column that contains the value that will be assigned to a Choice object in a choices list. 
	 *
	 * @access  public
	 * @param   string     $valueColumn The name of the column that contains the value. 
	 * @return  void
	 *
	 */
	public function setValueColumn($valueColumn) {
		$this->valueColumn = $valueColumn;
	}

	/**
	 * Retrieves the name of the column that contains the label that will be assigned to a Choice object in a choices list. 
	 *
	 * If the column name is case insensitive, it is converted to lowercase.
	 *
	 * @access  public
	 * @return  string The name of the column that contains the label 
	 *
	 */
	public function getLabelColumn() {
		return $this->caseInsensitive ? strtolower($this->labelColumn) : $this->labelColumn;
	}

	/**
	 * Sets the name of the column that contains the label that will be assigned to a Choice object in a choices list. 
	 *
	 * @access  public
	 * @param   string     $labelColumn The name of the column that contains the label. 
	 * @return  void
	 *
	 */
	public function setLabelColumn($labelColumn) {
		$this->labelColumn = $labelColumn;
	}
}

?>
