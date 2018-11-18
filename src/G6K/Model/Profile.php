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
 * This class allows the storage and retrieval of the attributes of a profile.
 *
 * A profile is a set of pre-defined default values assigned to data.
 * When the user selects a profile, the form data associated with the profile are filled with the predefined values.
 *
 * @author    Jacques Archimède
 *
 */
class Profile {

	/**
	 * @var int        $id The id of this profile. 
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $name The name of this profile. 
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $label The label of this profile. 
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var \App\G6K\Model\RichText     $description The description of this profile. 
	 *
	 * @access  private
	 *
	 */
	private $description = null;

	/**
	 * @var array      $datas array The list of data that are pre-filled by this profile.
	 *
	 * @access  private
	 *
	 */
	private $datas = array(); 

	/**
	 * Constructor of class Profile
	 *
	 * @access  public
	 * @param   int        $id The id of this profile.
	 * @param   string     $name The name of this profile.
	 * @return  void
	 *
	 */
	public function __construct($id, $name) {
		$this->id = $id;
		$this->name = $name;
	}

	/**
	 * Returns the id of this profile.
	 *
	 * @access  public
	 * @return  int The id of this profile.
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the id of this profile.
	 *
	 * @access  public
	 * @param   int        $id The id of this profile.
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the name of this profile.
	 *
	 * @access  public
	 * @return  string The name of this profile.
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this profile.
	 *
	 * @access  public
	 * @param   string     $name The name of this profile.
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the label of this profile.
	 *
	 * @access  public
	 * @return  string The label of this profile.
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this profile.
	 *
	 * @access  public
	 * @param   string     $label The label of this profile.
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the description of this profile.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText The description of this profile.
	 *
	 */
	public function getDescription() {
		return $this->description;
	}

	/**
	 * Sets the description of this profile.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText     $description The description of this profile.
	 * @return  void
	 *
	 */
	public function setDescription($description) {
		$this->description = $description;
	}

	/**
	 * Returns the list of data that are pre-filled by this profile.
	 *
	 * The elements of this list are "data ID/default value" pairs.
	 *
	 * @access  public
	 * @return  array The list of data.
	 *
	 */
	public function getDatas() {
		return $this->datas;
	}

	/**
	 * Sets the list of data that are pre-filled by this profile.
	 *
	 * The elements of this list are "data ID/default value" pairs.
	 *
	 * @access  public
	 * @param   array      $datas The list of data.
	 * @return  void
	 *
	 */
	public function setDatas($datas) {
		$this->datas = $datas;
	}

	/**
	 * Adds a "data ID/default value" pair to the list of data that are pre-filled by this profile.
	 *
	 * @access  public
	 * @param   int $id The id of the data item.
	 * @param   string $default (default: "") The default value
	 * @return  void
	 *
	 */
	public function addData($id, $default="") {
		$this->datas[] = array($id, $default);
	}

	/**
	 * Removes a "data ID/default value" pair from the list of data that are pre-filled by this profile.
	 *
	 * @access  public
	 * @param   int $index The index of the pair in the list.
	 * @return  void
	 *
	 */
	public function removeData($index) {
		$this->datas[$index] = null;
	}

}

?>
