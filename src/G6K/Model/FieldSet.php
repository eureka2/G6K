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
 * This class allows the storage and retrieval of the attributes of a field set.
 *
 * Fieldset makes it possible to group together fields of the same nature (logical or thematic) thus highlighting the structuring of the information.
 *
 * The fields of a field set can be arranged conventionally, one below the other or in a grid in which case they are encapsulated in field rows.
 * They can also be placed one after the other in order to form a sentence.
 *
 * A field set is contained in a panel.
 *
 * @author    Jacques Archimède
 *
 */
class FieldSet {

	/**
	 * @var \App\G6K\Model\Panel $panel  The Panel object that contains this field set
	 *
	 * @access  private
	 *
	 */
	private $panel = null;

	/**
	 * @var int        $id  The ID of this field set.
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var \App\G6K\Model\RichText     $legend The legend of this field set.
	 *
	 * @access  private
	 *
	 */
	private $legend = null;

	/**
	 * @var string     $disposition  The disposition of this field set: classic (default), grid or inline
	 *
	 * @access  private
	 *
	 */
	private $disposition = "classic";

	/**
	 * @var string     $display  The display mode of this field set: inline (default), grouped, accordion or pop-in
	 *
	 * @access  private
	 *
	 */
	private $display = "inline";

	/**
	 * @var string  $popinLink  The text of the link to display the pop-in (if display is "pop-in")
	 *
	 * @access  private
	 *
	 */
	private $popinLink = "";

	/**
	 * @var bool       $displayable Indicates whether this field set should be displayed or not.
	 *
	 * @access  private
	 *
	 */
	private $displayable = true;

	/**
	 * @var bool       $inputFields  Indicates whether this field set contains at least one field entered by the user or not.
	 *
	 * @access  private
	 *
	 */
	private $inputFields = false;

	/**
	 * @var bool       $inputFields  Indicates whether this field set contains at least one required field entered by the user or not.
	 *
	 * @access  private
	 *
	 */
	private $requiredFields = false;

	/**
	 * @var array      $fields The list of fields or field rows contained in this field set.
	 *
	 * @access  private
	 *
	 */
	private $fields = array();

	/**
	 * @var array      $columns The list of columns (header of a grid) in this field set when the disposition is "grid".
	 *
	 * @access  private
	 *
	 */
	private $columns = array();

	/**
	 * Constructor of class FieldSet
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Panel $panel  The Panel object that contains this field set
	 * @param   int        $id  The ID of this field set.
	 * @return  void
	 *
	 */
	public function __construct($panel, $id) {
		$this->panel = $panel;
		$this->id = $id;
	}

	/**
	 * Returns the Panel object that contains this field set
	 *
	 * @access  public
	 * @return   \App\G6K\Model\Panel The Panel object 
	 *
	 */
	public function getPanel() {
		return $this->panel;
	}

	/**
	 * Returns the ID of this field set
	 *
	 * @access  public
	 * @return  int The ID of this field set
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this field set
	 *
	 * @access  public
	 * @param   int        $id  The ID of this field set
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the legend of this field set
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText The legend of this field set
	 *
	 */
	public function getLegend() {
		return $this->legend;
	}

	/**
	 * Sets the legend of this field set
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText     $legend The legend of this field set
	 * @return  void
	 *
	 */
	public function setLegend($legend) {
		$this->legend = $legend;
	}

	/**
	 * Returns the disposition of this field set
	 *
	 * The possible values are :
	 *
	 * - classic: the elements of the form belonging to the field set are arranged in a conventional way, that is, a field preceded by its field label is placed on the line following that of the preceding field
	 * - grid: form elements belonging to the field set are placed in a table
	 * - inline: the elements of the form belonging to the field set are arranged on line to form a sentence
	 *
	 * @access  public
	 * @return  string The disposition of this field set
	 *
	 */
	public function getDisposition() {
		return $this->disposition;
	}

	/**
	 * Sets the disposition of this field set
	 *
	 * The possible values are :
	 *
	 * - classic: the elements of the form belonging to the field set are arranged in a conventional way, that is, a field preceded by its field label is placed on the line following that of the preceding field
	 * - grid: form elements belonging to the field set are placed in a table
	 * - inline: the elements of the form belonging to the field set are arranged on line to form a sentence
	 *
	 * @access  public
	 * @param   string     $disposition  The disposition of this field set
	 * @return  void
	 *
	 */
	public function setDisposition($disposition) {
		$this->disposition = $disposition;
	}

	/**
	 * Returns the display mode of this field set
	 *
	 * The possible values are :
	 *
	 * - inline: the fields of the field set are displayed "online" in the simulation page
	 * - grouped: the fields of the field set are displayed in a group in the simulation page
	 * - accordion: the fields of the field set are displayed in the item of an accordion
	 * - pop-in: the fields of the field set are displayed in a pop-in modal window.
	 *
	 * @access  public
	 * @return  string The display mode
	 *
	 */
	public function getDisplay() {
		return $this->display;
	}

	/**
	 * Sets the display mode of this field set
	 *
	 * The possible values are :
	 *
	 * - inline: the fields of the field set are displayed "inline" in the simulation page
	 * - grouped: the fields of the field set are displayed in a group in the simulation page
	 * - accordion: the fields of the field set are displayed in the item of an accordion
	 * - pop-in: the fields of the field set are displayed in a pop-in modal window.
	 *
	 * @access  public
	 * @param   string     $display  The display mode
	 * @return  void
	 *
	 */
	public function setDisplay($display) {
		$this->display = $display;
	}

	/**
	 * Sets the text of the link to display the pop-in (if display is "pop-in")
	 *
	 * @access  public
	 * @return  string The text of the link
	 *
	 */
	public function getPopinLink() {
		return $this->popinLink;
	}

	/**
	 * Returns the text of the link to display the pop-in (if display is "pop-in")
	 *
	 * @access  public
	 * @param   string     $popinLink The text of the link
	 * @return  void
	 *
	 */
	public function setPopinLink($popinLink) {
		$this->popinLink = $popinLink;
	}

	/**
	 * Returns the displayable attribute of this FieldSet object
	 *
	 * @access  public
	 * @return  bool true if this field set can be displayed, false otherwise
	 *
	 */
	public function isDisplayable() {
		return $this->displayable;
	}

	/**
	 * Returns the displayable attribute of this FieldSet object
	 *
	 * @access  public
	 * @return  bool true if this field set can be displayed, false otherwise
	 *
	 */
	public function getDisplayable() {
		return $this->displayable;
	}

	/**
	 * Determines whether this field set can be displayed or not
	 *
	 * @access  public
	 * @param   bool       $displayable true if this field set can be displayed, false otherwise
	 * @return  void
	 *
	 */
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

	/**
	 * Returns the inputFields attribute of this FieldSet object
	 *
	 * @access  public
	 * @return  bool true if this field set contains at least one field entered by the user, false otherwise
	 *
	 */
	public function hasInputFields() {
		return $this->inputFields;
	}

	/**
	 * Returns the inputFields attribute of this FieldSet object
	 *
	 * @access  public
	 * @return  bool true if this field set contains at least one field entered by the user, false otherwise
	 *
	 */
	public function getInputFields() {
		return $this->inputFields;
	}

	/**
	 * Determines whether this field set contains at least one field entered by the user or not.
	 *
	 * @access  public
	 * @param   bool       $inputFields true if this field set contains at least one field entered by the user, false otherwise
	 * @return  void
	 *
	 */
	public function setInputFields($inputFields) {
		$this->inputFields = $inputFields;
	}

	/**
	 * Returns the requiredFields attribute of this FieldSet object
	 *
	 * @access  public
	 * @return  bool true if this field set contains at least one required field entered by the user, false otherwise
	 *
	 */
	public function hasRequiredFields() {
		return $this->requiredFields;
	}

	/**
	 * Returns the requiredFields attribute of this FieldSet object
	 *
	 * @access  public
	 * @return  bool true if this field set contains at least one required field entered by the user, false otherwise
	 *
	 */
	public function getRequiredFields() {
		return $this->requiredFields;
	}

	/**
	 * Determines whether this field set contains at least one required field entered by the user or not.
	 *
	 * @access  public
	 * @param   bool       $requiredFields true if this field set contains at least one required field entered by the user, false otherwise
	 * @return  void
	 *
	 */
	public function setRequiredFields($requiredFields) {
		$this->requiredFields = $requiredFields;
	}

	/**
	 * Returns the list of fields or field rows of this field set
	 *
	 * @access  public
	 * @return  array The list of fields or field rows
	 *
	 */
	public function getFields() {
		return $this->fields;
	}

	/**
	 * Sets the list of fields or field rows of this field set
	 *
	 * @access  public
	 * @param   array      $fields The list of fields or field rows
	 * @return  void
	 *
	 */
	public function setFields($fields) {
		$this->fields = $fields;
	}

	/**
	 * Adds a Field or FieldRow object in the list of fields of this field set.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Field|\App\G6K\Model\FieldRow $field The Field or FieldRow Object to be added
	 * @return  void
	 *
	 */
	public function addField($field) {
		$this->fields[] = $field;
	}

	/**
	 * Removes a Field or FieldRow object from the list of fields of this field set.
	 *
	 * @access  public
	 * @param   int $index The index of the Field or FieldRow object to be removed 
	 * @return  void
	 *
	 */
	public function removeField($index) {
		$this->fields[$index] = null;
	}

	/**
	 * Retrieves a Field object by its position in the list of fields of this field set.
	 *
	 * @access  public
	 * @param   int $position The position of the field
	 * @return  \App\G6K\Model\Field|null the Field object
	 *
	 */
	public function getFieldByPosition($position) {
		foreach ($this->fields as $field) {
			if ($field instanceof Field && $field->getPosition() == $position) {
				return $field;
			}
		}
		return null;
	}

	/**
	 * Retrieves a FieldRow object by this id.
	 *
	 * @access  public
	 * @param   int $id The field row id
	 * @return  \App\G6K\Model\FieldRow|null The FieldRow object
	 *
	 */
	public function getFieldRowById($id) {
		foreach ($this->fields as $field) {
			if ($field instanceof FieldRow && $field->getId() == $id) {
				return $field;
			}
		}
		return null;
	}

	/**
	 * Returns the list of columns (header of a grid) in this field set when the disposition is "grid"
	 *
	 * @access  public
	 * @return  array The list of columns (Column objects)
	 *
	 */
	public function getColumns() {
		return $this->columns;
	}

	/**
	 * Sets the list of columns (header of a grid) in this field set when the disposition is "grid"
	 *
	 * @access  public
	 * @param   array      $columns The list of columns (Column objects)
	 * @return  void
	 *
	 */
	public function setColumns($columns) {
		$this->columns = $columns;
	}

	/**
	 * Adds a Column object in the list of columns (header of a grid) in this field set.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Column $column The Column object 
	 * @return  void
	 *
	 */
	public function addColumn(Column $column) {
		$this->columns[] = $column;
	}

	/**
	 * Removes a Column object in the list of columns (header of a grid) in this field set.
	 *
	 * @access  public
	 * @param   int $index index of the Column object in the list of columns
	 * @return  void
	 *
	 */
	public function removeColumn($index) {
		$this->columns[$index] = null;
	}

	/**
	 * Retrieves a Column object by this id.
	 *
	 * @access  public
	 * @param   int $id The column id
	 * @return  \App\G6K\Model\Column|null The Column object
	 *
	 */
	public function getColumnById($id) {
		foreach ($this->columns as $column) {
			if ($column->getId() == $id) {
				return $column;
			}
		}
		return null;
	}

	/**
	 * Returns the class name of this FieldSet object  
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
