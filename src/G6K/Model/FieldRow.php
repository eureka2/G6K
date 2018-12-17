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
 * This class allows the storage and retrieval of the attributes of a field row.
 *
 * A field row contains fields that make up the cells in the row.
 * 
 * The field row is linked to a data group that contains the data associated to the cells of this field row
 *
 * @author    Jacques Archimède
 *
 */
class FieldRow {

	/**
	 * @var \App\G6K\Model\FieldSet   $fieldset  The FieldSet object that contains this field row
	 *
	 * @access  private
	 *
	 */
	private $fieldset = null;

	/**
	 * @var int        $id  The ID of this field row
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $label  The label of this field row
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var bool       $help Indicates whether the description of the data group linked to this field should be displayed as help text
	 *
	 * @access  private
	 *
	 */
	private $help = false;

	/**
	 * @var bool       $colon Indicates whether a colon should be displayed after the label of this field row.
	 *
	 * @access  private
	 *
	 */
	private $colon = true;

	/**
	 * @var bool       $emphasize Indicates whether the label of the field row should be emphasized.
	 *
	 * @access  private
	 *
	 */
	private $emphasize = false;

	/**
	 * @var string     $datagroup The ID of the data group that contains the data associated to the cells of this field row
	 *
	 * @access  private
	 *
	 */
	private $datagroup = "";

	/**
	 * @var array      $fields The list of fields contained in this field row.
	 *
	 * @access  private
	 *
	 */
	private $fields = array();

	/**
	 * Constructor of class FieldRow
	 *
	 * @access  public
	 * @param   \App\G6K\Model\FieldSet   $fieldset  The FieldSet object that contains this field row
	 * @param   int        $id The ID of this field row
	 * @param   string     $label The label of this field row
	 * @return  void
	 *
	 */
	public function __construct($fieldset, $id, $label) {
		$this->fieldset = $fieldset;
		$this->id = $id;
		$this->label = $label;
	}

	/**
	 * Returns the FieldSet object that contains this field row
	 *
	 * @access  public
	 * @return  \App\G6K\Model\FieldSet The FieldSet Object
	 *
	 */
	public function getFieldSet() {
		return $this->fieldset;
	}

	/**
	 * Returns the ID of this field row
	 *
	 * @access  public
	 * @return  int The ID of this field row
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this field row
	 *
	 * @access  public
	 * @param   int        $id The ID of this field row
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the ID of the data group that contains the data associated to the cells of this field row
	 *
	 * @access  public
	 * @return  string The ID of the data group
	 *
	 */
	public function getDataGroup() {
		return $this->datagroup;
	}

	/**
	 * Sets the ID of the data group that contains the data associated to the cells of this field row
	 *
	 * @access  public
	 * @param   string     $datagroup The ID of the data group
	 * @return  void
	 *
	 */
	public function setDataGroup($datagroup) {
		$this->datagroup = $datagroup;
	}

	/**
	 * Returns the label of this field row
	 *
	 * @access  public
	 * @return  string The label of this field row
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this field row
	 *
	 * @access  public
	 * @param   string     $label The label of this field row
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the colon attribute of this field row.
	 *
	 * @access  public
	 * @return  bool true if a colon should be displayed after the label, false otherwise
	 *
	 */
	public function hasColon() {
		return $this->colon;
	}

	/**
	 * Returns the colon attribute of this field row.
	 *
	 * @access  public
	 * @return  bool true if a colon should be displayed after the label, false otherwise
	 *
	 */
	public function getColon() {
		return $this->colon;
	}

	/**
	 * Determines whether a colon should be displayed after the label of this field row.
	 *
	 * @access  public
	 * @param   bool $colon true if a colon should be displayed after the label, false otherwise
	 * @return  void
	 *
	 */
	public function setColon($colon) {
		$this->colon = $colon;
	}

	/**
	 * Returns the help attribute of this field.
	 *
	 * If the value is true, the description of the data group is displayed in a foldable area below the field row, visible after the user clicks on an icon.
	 *
	 * @access  public
	 * @deprecated
	 * @return  bool       $help true if the description of the data group will be displayed as help text, false otherwise
	 *
	 */
	public function hasHelp() {
		return $this->help;
	}

	/**
	 * Returns the help attribute of this field.
	 *
	 * If the value is true, the description of the data group is displayed in a foldable area below the field row, visible after the user clicks on an icon.
	 *
	 * @access  public
	 * @deprecated
	 * @return  bool true if the description of the data group will be displayed as help text, false otherwise
	 *
	 */
	public function getHelp() {
		return $this->help;
	}

	/**
	 * Determines whether the description of the data linked to this field should be displayed as help text
	 *
	 * If the value is true, the description of the data group is displayed in a foldable area below the field row, visible after the user clicks on an icon.
	 *
	 * @access  public
	 * @deprecated
	 * @param   bool       $help true if the description of the data group will be displayed as help text, false otherwise
	 * @return  void
	 *
	 */
	public function setHelp($help) {
		$this->help = $help;
	}

	/**
	 * Returns the emphasize attribute of this field row.
	 *
	 * @access  public
	 * @return  bool true if the label of this field row is emphasized, false otherwise
	 *
	 */
	public function isEmphasized() {
		return $this->emphasize;
	}

	/**
	 * Returns the emphasize attribute of this field row.
	 *
	 * @access  public
	 * @return  bool true if the label of this field row is emphasized, false otherwise
	 *
	 */
	public function getEmphasize() {
		return $this->emphasize;
	}

	/**
	 * Determines whether the label of this field row should be emphasized or not.
	 *
	 * @access  public
	 * @param   bool       $emphasize true if the label of this field row should be emphasized, false otherwise
	 * @return  void
	 *
	 */
	public function setEmphasize($emphasize) {
		$this->emphasize = $emphasize;
	}

	/**
	 * Returns the list of fields contained in this field row.
	 *
	 * @access  public
	 * @return  array The list of fields contained in this field row.
	 *
	 */
	public function getFields() {
		return $this->fields;
	}

	/**
	 * Sets the list of fields contained in this field row.
	 *
	 * @access  public
	 * @param   array      $fields The list of fields contained in this field row.
	 * @return  void
	 *
	 */
	public function setFields($fields) {
		$this->fields = $fields;
	}

	/**
	 * Adds a Field object to the list of fields contained in this field row.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Field $field The Field object
	 * @return  void
	 *
	 */
	public function addField(Field $field) {
		$this->fields[] = $field;
	}

	/**
	 * Removes a Field object from the list of fields contained in this field row.
	 *
	 * @access  public
	 * @param   int $index The index of the field in the list of fields
	 * @return  void
	 *
	 */
	public function removeField($index) {
		$this->fields[$index] = null;
	}

	/**
	 * Retrieves a Field object by its position in the list of fields of this field row.
	 *
	 * @access  public
	 * @param   int $position The position of the field
	 * @return  \App\G6K\Model\Field|null the Field object
	 *
	 */
	public function getFieldByPosition($position) {
		foreach ($this->fields as $field) {
			if ($field->getPosition() == $position) {
				return $field;
			}
		}
		return null;
	}

	/**
	 * Returns the class name of this FieldRow object 
	 *
	 * @access  public
	 * @return  string The class name
	 *
	 */
	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}

}

?>
