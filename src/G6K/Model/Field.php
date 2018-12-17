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
 * This class allows the storage and retrieval of the attributes of a field.
 *
 * A field is an element of the page displayed on the browser in which a data is entered or restituted. A field is therefore always linked to a data item.
 *
 * In G6K, a field is always contained in a field set.
 *
 * @author    Jacques Archimède
 *
 */
class Field {

	/**
	 * @var \App\G6K\Model\FieldSet   $fieldset  The FieldSet object that contains this field
	 *
	 * @access  private
	 *
	 */
	private $fieldset = null;

	/**
	 * @var int        $position  The position of this field in the field set
	 *
	 * @access  private
	 *
	 */
	private $position = 0;

	/**
	 * @var bool       $newline Indicates whether the display of this field and its label should start on a new line or not.
	 *
	 * @access  private
	 *
	 */
	private $newline = true;

	/**
	 * @var  int $data The identifier of the data item displayed or fed by this field.
	 *
	 * @access  private
	 *
	 */
	private $data = 0;

	/**
	 * @var string     $label The label of this field.
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var string     $usage  The use of this field: input (user input), output (return to the user)
	 *
	 * @access  private
	 *
	 */
	private $usage = ""; 

	/**
	 * @var string     $prompt  Text to appear in the list box when no item is selected. For data of type 'choice' only.
	 *
	 * @access  private
	 *
	 */
	private $prompt = "";  

	/**
	 * @var bool       $required  Indicates whether field entry is mandatory or not.
	 *
	 * @access  private
	 *
	 */
	private $required = true; 

	/**
	 * @var bool       $visibleRequired Indicates whether field entry is mandatory or not when displayed.
	 *
	 * @access  private
	 *
	 */
	private $visibleRequired = true;  

	/**
	 * @var bool       $colon Indicates whether a colon should be displayed after the label of this field.
	 *
	 * @access  private
	 *
	 */
	private $colon = true;  

	/**
	 * @var bool       $underlabel Indicates whether the field should be displayed below its label and not to its right.
	 *
	 * @access  private
	 *
	 */
	private $underlabel = false;  

	/**
	 * @var bool       $help Indicates whether the description of the data linked to this field should be displayed as help text
	 *
	 * @access  private
	 *
	 */
	private $help = true;  

	/**
	 * @var bool       $emphasize Indicates whether the label of the field should be emphasized.
	 *
	 * @access  private
	 *
	 */
	private $emphasize = false;  

	/**
	 * @var string     $explanation A text explaining to the user how the field value was calculated. 
	 *
	 * @access  private
	 *
	 */
	private $explanation = "";

	/**
	 * @var string  $widget The name of the widget associated with this field, if any.
	 *
	 * @access  private
	 *
	 */
	private $widget = ""; 

	/**
	 * @var bool       $expanded  Indicates that all the elements of a list of choices must be visible, ie radio buttons are displayed instead of a list box if it is a data of type 'choice' or checkboxes if it is a data of type 'multichoice'
	 *
	 * @access  private
	 *
	 */
	private $expanded = true;

	/**
	 * @var \App\G6K\Model\FieldNote $preNote A note associated with this field that should be displayed above the field.
	 *
	 * @access  private
	 *
	 */
	private $preNote = null;

	/**
	 * @var \App\G6K\Model\FieldNote $postNote A note associated with this field that should be displayed below the field.
	 *
	 * @access  private
	 *
	 */
	private $postNote = null;

	/**
	 * @var bool  $displayable Indicates whether this field should be displayed or not.
	 *
	 * @access  private
	 *
	 */
	private $displayable = true;

	/**
	 * Constructor of class Field
	 *
	 * @access  public
	 * @param   \App\G6K\Model\FieldSet   $fieldset  The FieldSet object that contains this field.
	 * @param   int        $position  The position of this field in the field set.
	 * @param   int        $data The ID of the data item displayed or fed by this field.
	 * @param   string     $label The label of this field.
	 * @return  void
	 *
	 */
	public function __construct($fieldset, $position, $data, $label) {
		$this->fieldset = $fieldset;
		$this->position = $position;
		$this->data = $data;
		$this->label = $label;
	}

	/**
	 * Returns the FieldSet object that contains this field
	 *
	 * @access  public
	 * @return  \App\G6K\Model\FieldSet  The FieldSet object
	 *
	 */
	public function getFieldSet() {
		return $this->fieldset;
	}

	/**
	 * Returns the position of this field in the field set.
	 *
	 * @access  public
	 * @return  int The position of this field.
	 *
	 */
	public function getPosition() {
		return $this->position;
	}

	/**
	 * Sets the position of this field in the field set.
	 *
	 * @access  public
	 * @param   int        $position The position of this field.
	 * @return  void
	 *
	 */
	public function setPosition($position) {
		$this->position = $position;
	}

	/**
	 * Returns the newline attribute of this Field object
	 *
	 * If true, the class 'newline' is added to HTML container of the field. A css rule can therefore be used to place this field on a new line.
	 *
	 * @access  public
	 * @return  bool true if the display of this field and its label should start on a new line,false otherwise
	 *
	 */
	public function isNewline() {
		return $this->newline;
	}

	/**
	 * Returns the newline attribute of this Field object
	 *
	 * If true, the class 'newline' is added to HTML container of the field. A css rule can therefore be used to place this field on a new line.
	 *
	 * @access  public
	 * @return  bool true if the display of this field and its label should start on a new line,false otherwise
	 *
	 */
	public function getNewline() {
		return $this->newline;
	}

	/**
	 * Determines whether the display of this field and its label should start on a new line or not.
	 *
	 * If true, the class 'newline' is added to HTML container of the field. A css rule can therefore be used to place this field on a new line.
	 *
	 * @access  public
	 * @param   bool       $newline true if the display of this field and its label should start on a new line,false otherwise
	 * @return  void
	 *
	 */
	public function setNewline($newline) {
		$this->newline = $newline;
	}

	/**
	 * Returns the ID of the data item displayed or fed by this field.
	 *
	 * @access  public
	 * @return  int The ID of the data item.
	 *
	 */
	public function getData() {
		return $this->data;
	}

	/**
	 * Sets the ID of the data item displayed or fed by this field.
	 *
	 * @access  public
	 * @param   int $data The ID of the data item.
	 * @return  void
	 *
	 */
	public function setData($data) {
		$this->data = $data;
	}

	/**
	 * Returns the label of this field. 
	 *
	 * @access  public
	 * @return  string The label of this field
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this field. 
	 *
	 * @access  public
	 * @param   string     $label The label of this field
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the usage of this field. 
	 *
	 * @access  public
	 * @return  string The usage of this field
	 *
	 */
	public function getUsage() {
		return $this->usage;
	}

	/**
	 * Sets the usage of this field. 
	 *
	 * if usage is "input", the user can enter a value in the field that will be assigned to the data related to this field
	 *
	 * if usage is "output", the value of the related data item  is displayed as static field.
	 *
	 * @access  public
	 * @param   string     $usage  The usage of this field
	 * @return  void
	 *
	 */
	public function setUsage($usage) {
		$this->usage = $usage;
	}

	/**
	 * Returns the text to appear in the list box when no item is selected.
	 *
	 * This text applies only to an associated data of type "choice" or "multichoice" whose field is displayed as a list box (expanded = false).
	 *
	 * @access  public
	 * @return  string The text to appear in the list box
	 *
	 */
	public function getPrompt() {
		return $this->prompt;
	}

	/**
	 * Sets the text to appear in the list box when no item is selected.
	 *
	 * This text applies only to an associated data of type "choice" or "multichoice" whose field is displayed as a list box (expanded = false).
	 *
	 * @access  public
	 * @param   string     $prompt  The text to appear in the list box
	 * @return  void
	 *
	 */
	public function setPrompt($prompt) {
		$this->prompt = $prompt;
	}

	/**
	 * Returns the required attribute of this field.
	 *
	 * @access  public
	 * @return  bool true if the field entry is manadatory, false otherwise
	 *
	 */
	public function isRequired() {
		return $this->required;
	}

	/**
	 * Returns the required attribute of this field.
	 *
	 * @access  public
	 * @return  bool true if the field entry is manadatory, false otherwise
	 *
	 */
	public function getRequired() {
		return $this->required;
	}

	/**
	 * Determines whether the field entry is mandatory or not.
	 *
	 * @access  public
	 * @param   bool       $required true if the field entry is manadatory, false otherwise
	 * @return  void
	 *
	 */
	public function setRequired($required) {
		$this->required = $required;
	}

	/**
	 * Returns the required attribute of this field when displayed.
	 *
	 * @access  public
	 * @return  bool true if the field entry is manadatory when displayed, false otherwise
	 *
	 */
	public function isVisibleRequired() {
		return $this->visibleRequired;
	}

	/**
	 * Returns the required attribute of this field when displayed.
	 *
	 * @access  public
	 * @return  bool true if the field entry is manadatory when displayed, false otherwise
	 *
	 */
	public function getVisibleRequired() {
		return $this->visibleRequired;
	}

	/**
	 * Determines whether the field entry is mandatory or not when displayed.
	 *
	 * @access  public
	 * @param   bool $visibleRequired true if the field entry is manadatory when displayed, false otherwise
	 * @return  void
	 *
	 */
	public function setVisibleRequired($visibleRequired) {
		$this->visibleRequired = $visibleRequired;
	}

	/**
	 * Returns the colon attribute of this field.
	 *
	 * @access  public
	 * @return  bool true if a colon should be displayed after the label, false otherwise 
	 *
	 */
	public function hasColon() {
		return $this->colon;
	}

	/**
	 * Returns the colon attribute of this field.
	 *
	 * @access  public
	 * @return  bool true if a colon should be displayed after the label, false otherwise
	 *
	 */
	public function getColon() {
		return $this->colon;
	}

	/**
	 * Determines whether a colon should be displayed after the label of this field.
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
	 * Returns the underlabel attribute of this field.
	 *
	 * If true, the class 'underlabel' is added to HTML container of the field. A css rule can therefore be used to place this field under its label on a new line.
	 *
	 * @access  public
	 * @return  bool true if the field is displayed below its label, false otherwise
	 *
	 */
	public function isUnderlabel() {
		return $this->underlabel;
	}

	/**
	 * Returns the underlabel attribute of this field.
	 *
	 * If true, the class 'underlabel' is added to HTML container of the field. A css rule can therefore be used to place this field below its label on a new line.
	 *
	 * @access  public
	 * @return  bool true if the field is displayed below its label, false otherwise
	 *
	 */
	public function getUnderlabel() {
		return $this->underlabel;
	}

	/**
	 * Determines whether the field should be displayed below its label and not to its right.
	 *
	 * If true, the class 'underlabel' is added to HTML container of the field. A css rule can therefore be used to place this field below its label on a new line.
	 *
	 * @access  public
	 * @param   bool $underlabel true if the field should be displayed below its label, false otherwise
	 * @return  void
	 *
	 */
	public function setUnderlabel($underlabel) {
		$this->underlabel = $underlabel;
	}

	/**
	 * Returns the help attribute of this field.
	 *
	 * If the value is true, the description of the data is displayed in a foldable area below the field, visible after the user clicks on an icon.
	 *
	 * @access  public
	 * @return  bool true if the description of the data will be displayed as help text, false otherwise
	 *
	 */
	public function hasHelp() {
		return $this->help;
	}

	/**
	 * Returns the help attribute of this field.
	 *
	 * If the value is true, the description of the data is displayed in a foldable area below the field, visible after the user clicks on an icon.
	 *
	 * @access  public
	 * @return  bool true if the description of the data will be displayed as help text, false otherwise
	 *
	 */
	public function getHelp() {
		return $this->help;
	}

	/**
	 * Determines whether the description of the data linked to this field should be displayed as help text
	 *
	 * If the value is true, the description of the data is displayed in a foldable area below the field, visible after the user clicks on an icon.
	 *
	 * @access  public
	 * @param   bool $help true if the description of the data will be displayed as help text, false otherwise
	 * @return  void
	 *
	 */
	public function setHelp($help) {
		$this->help = $help;
	}

	/**
	 * Returns the emphasize attribute of this field.
	 *
	 * If true, the class 'emphasized' is added to HTML container of the label. A css rule can therefore be used to emphasize (highlight) the label.
	 *
	 * @access  public
	 * @return  bool true if the label of the field is emphasized, false otherwise
	 *
	 */
	public function isEmphasized() {
		return $this->emphasize;
	}

	/**
	 * Returns the emphasize attribute of this field.
	 *
	 * If true, the class 'emphasized' is added to HTML container of the label. A css rule can therefore be used to emphasize (highlight) the label.
	 *
	 * @access  public
	 * @return  bool true if the label of the field is emphasized, false otherwise
	 *
	 */
	public function getEmphasize() {
		return $this->emphasize;
	}

	/**
	 * Determines whether the label of the field should be emphasized or not.
	 *
	 * If true, the class 'emphasized' is added to HTML container of the label. A css rule can therefore be used to emphasize (highlight) the label.
	 *
	 * @access  public
	 * @param   bool $emphasize true if the label of the field should be emphasized, false otherwise
	 * @return  void
	 *
	 */
	public function setEmphasize($emphasize) {
		$this->emphasize = $emphasize;
	}

	/**
	 * Returns the text explaining to the user how the field value was calculated. 
	 *
	 * @access  public
	 * @return  string The explanatory text
	 *
	 */
	public function getExplanation() {
		return $this->explanation;
	}

	/**
	 * Sets a text explaining to the user how the field value was calculated. 
	 *
	 * @access  public
	 * @param   string $explanation The explanatory text
	 * @return  void
	 *
	 */
	public function setExplanation($explanation) {
		$this->explanation = $explanation;
	}

	/**
	 * Returns the expanded attribute of this field.
	 *
	 * if true, radio buttons are displayed instead of a list box if it is a data of type 'choice' or checkboxes if it is a data of type 'multichoice'
	 *
	 * @access  public
	 * @return  bool the value of expanded
	 *
	 */
	public function isExpanded() {
		return $this->expanded;
	}

	/**
	 * Returns the expanded attribute of this field.
	 *
	 * if true, radio buttons are displayed instead of a list box if it is a data of type 'choice' or checkboxes if it is a data of type 'multichoice'
	 *
	 * @access  public
	 * @return  bool the value of expanded
	 *
	 */
	public function getExpanded() {
		return $this->expanded;
	}

	/**
	 * Detrmines whether all the elements of a list of choices must be visible or not.
	 *
	 * if true, radio buttons are displayed instead of a list box if it is a data of type 'choice' or checkboxes if it is a data of type 'multichoice'
	 *
	 * @access  public
	 * @param   bool       $expanded 
	 * @return  void
	 *
	 */
	public function setExpanded($expanded) {
		$this->expanded = $expanded;
	}

	/**
	 * Returns the name of the widget associated with this field.
	 *
	 * A widget is a small Javascript component to make it easier to enter a field.
	 *
	 * Read the file src/EUREKA/G6KBundle/Resources/config/parameters.yml to see the list of available widgets and their definition.
	 *
	 * @access  public
	 * @return  string The name of the widget.
	 *
	 */
	public function getWidget() {
		return $this->widget;
	}

	/**
	 * Sets the name of the widget associated with this field.
	 *
	 * A widget is a small Javascript component to make it easier to enter a field.
	 *
	 * Read the file src/EUREKA/G6KBundle/Resources/config/parameters.yml to see the list of available widgets and their definition.
	 *
	 * @access  public
	 * @param   string     $widget The name of the widget.
	 * @return  void
	 *
	 */
	public function setWidget($widget) {
		$this->widget = $widget;
	}

	/**
	 * Returns the note associated with this field that is displayed above the field.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\FieldNote The note displayed above this field
	 *
	 */
	public function getPreNote() {
		return $this->preNote;
	}

	/**
	 * Sets the note associated with this field that should be displayed above the field.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\FieldNote $preNote The note that should be displayed above this field
	 * @return  void
	 *
	 */
	public function setPreNote($preNote) {
		$this->preNote = $preNote;
	}

	/**
	 * Returns the note associated with this field that is displayed below the field.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\FieldNote The note displayed below this field
	 *
	 */
	public function getPostNote() {
		return $this->postNote;
	}

	/**
	 * Sets the note associated with this field that should be displayed below the field.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\FieldNote $postNote The note that should be displayed below this field
	 * @return  void
	 *
	 */
	public function setPostNote($postNote) {
		$this->postNote = $postNote;
	}

	/**
	 * Returns the displayable attribute of this Field object 
	 *
	 * @access  public
	 * @return  bool true if this field can be displayed, false otherwise
	 *
	 */
	public function isDisplayable() {
		return $this->displayable;
	}

	/**
	 * Returns the displayable attribute of this Field object 
	 *
	 * @access  public
	 * @return  bool true if this field can be displayed, false otherwise
	 *
	 */
	public function getDisplayable() {
		return $this->displayable;
	}

	/**
	 * Determines whether this field can be displayed or not
	 *
	 * @access  public
	 * @param   bool   $displayable true if this field can be displayed, false otherwise
	 * @return  void
	 *
	 */
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

	/**
	 * Returns the class name of this Field object  
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
