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
 * This class allows the storage and retrieval of the attributes of a action of a business rule.
 *
 * Actions are the functional consequences of condition evaluation. 
 * If a rule condition is met, the corresponding actions are executed.
 *
 * Actions are represented by setting attributes on data item, by displaying warning or error messages or by showing/hiding structural elements of the simulation page.
 *
 * @author    Jacques Archimède
 *
 */
class RuleAction {

	/**
	 * @var int        $id The ID of this action
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $name The name of this action : 'notifyError', 'notifyWarning', 'setAttribute', 'unsetAttribute', 'hideObject' or 'showObject'
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $target The target of this action : 'data', 'datagroup', 'dataset', 'step', 'panel', 'fieldset', 'fieldrow', 'field', 'blockinfo', 'chapter', 'section', 'prenote', 'postnote', 'action', 'footnote', 'choice', 'content', 'min', 'max', 'index' or 'default'
	 *
	 * @access  private
	 *
	 */
	private $target = "";

	/**
	 * @var int     $data The ID of the data item if target is equal to 'data'
	 *
	 * @access  private
	 *
	 */
	private $data = 0;

	/**
	 * @var int     $datagroup The ID of the data group if target is equal to 'datagroup'
	 *
	 * @access  private
	 *
	 */
	private $datagroup = 0; 

	/**
	 * @var string     $step The ID of the step if target is equal to 'step'
	 *
	 * @access  private
	 *
	 */
	private $step = "";

	/**
	 * @var string     $panel The ID of the panel if target is equal to 'panel'
	 *
	 * @access  private
	 *
	 */
	private $panel = "";

	/**
	 * @var string     $fieldset The ID of the field set if target is equal to 'fieldset'
	 *
	 * @access  private
	 *
	 */
	private $fieldset = "";

	/**
	 * @var string     $column The ID of the column if target is equal to 'column'
	 *
	 * @access  private
	 *
	 */
	private $column = "";

	/**
	 * @var string     $fieldrow The ID of the fieldrow if target is equal to 'fieldrow'
	 *
	 * @access  private
	 *
	 */
	private $fieldrow = "";

	/**
	 * @var string     $field The position of the field if target is equal to 'field'
	 *
	 * @access  private
	 *
	 */
	private $field = "";

	/**
	 * @var string     $blockinfo The ID of the blockinfo if target is equal to 'blockinfo'
	 *
	 * @access  private
	 *
	 */
	private $blockinfo = "";

	/**
	 * @var string     $chapter The ID of the chapter if target is equal to 'chapter'
	 *
	 * @access  private
	 *
	 */
	private $chapter = "";

	/**
	 * @var string     $section The ID of the section if target is equal to 'section'
	 *
	 * @access  private
	 *
	 */
	private $section = "";

	/**
	 * @var string     $prenote The position of the field if target is equal to 'prenote'
	 *
	 * @access  private
	 *
	 */
	private $prenote = "";

	/**
	 * @var string     $postnote The position of the field if target is equal to 'postnote'
	 *
	 * @access  private
	 *
	 */
	private $postnote = "";

	/**
	 * @var string     $action The name of the action button if target is equal to 'action'
	 *
	 * @access  private
	 *
	 */
	private $action = "";

	/**
	 * @var string     $footnote The ID of the footnote if target is equal to 'footnote'
	 *
	 * @access  private
	 *
	 */
	private $footnote = "";

	/**
	 * @var string     $choice The ID of the choice if target is equal to 'choice'
	 *
	 * @access  private
	 *
	 */
	private $choice = "";

	/**
	 * @var string     $value This is either the message to be displayed if name is equal to 'notifyWarning' or 'notifyError', or the value to be set if the name is equal to 'setAttribute'
	 *
	 * @access  private
	 *
	 */
	private $value = "";

	/**
	 * Constructor of class RuleAction
	 *
	 * @access  public
	 * @param   int        $id The ID of this action
	 * @param   string     $name The name of this action
	 * @return  void
	 *
	 */
	public function __construct($id, $name) {
		$this->id = $id;
		$this->name = $name;
	}

	/**
	 * Returns the ID of this action
	 *
	 * @access  public
	 * @return  int the The ID of this action
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Returns the name of this action
	 *
	 * The possible values are:
	 *
	 * - notifyError: allows to define an error message associated with a data, a data group or all the data
	 * - notifyWarning: allows to a warning message associated with a data item, data group, or all data. Unlike the error message, the warning message does not block the progress of the simulation
	 * - hideObject: allows to hide an element of the simulation form
	 * - showObject: allows you to show (display) an element of the simulation form
	 * - setAttribute: allows to assign a value or the result of the evaluation of an expression to the content of a data item or to its default value, its minimum or maximum value, or to define the field of a data source feeding the data.
	 * - unsetAttribute: deletes the contents of a data item. The data becomes "not filled".
	 *
	 * @access  public
	 * @return  string the value The name of this action
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this action
	 *
	 * The possible values are:
	 *
	 * - notifyError: allows to define an error message associated with a data, a data group or all the data
	 * - notifyWarning: allows to a warning message associated with a data item, data group, or all data. Unlike the error message, the warning message does not block the progress of the simulation
	 * - hideObject: allows to hide an element of the simulation form
	 * - showObject: allows you to show (display) an element of the simulation form
	 * - setAttribute: allows to assign a value or the result of the evaluation of an expression to the content of a data item or to its default value, its minimum or maximum value, or to define the field of a data source feeding the data.
	 * - unsetAttribute: deletes the contents of a data item. The data becomes "not filled".
	 *
	 * @access  public
	 * @param   string     $name The name of this action
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the target of this action
	 *
	 * The possible values are: 'data', 'datagroup', 'dataset', 'step', 'panel', 'fieldset', 'fieldrow', 'field', 'blockinfo', 'chapter', 'section', 'prenote', 'postnote', 'action', 'footnote', 'choice', 'content', 'min', 'max', 'index' or 'default'
	 *
	 * @access  public
	 * @return  string the The target of this action
	 *
	 */
	public function getTarget() {
		return $this->target;
	}

	/**
	 * Sets the target of this action
	 *
	 * The possible values are: 'data', 'datagroup', 'dataset', 'step', 'panel', 'fieldset', 'fieldrow', 'field', 'blockinfo', 'chapter', 'section', 'prenote', 'postnote', 'action', 'footnote', 'choice', 'content', 'min', 'max', 'index' or 'default'
	 *
	 * @access  public
	 * @param   string     $target The target of this action
	 * @return  void
	 *
	 */
	public function setTarget($target) {
		$this->target = $target;
	}

	/**
	 * Returns the ID of the target data item of this action
	 *
	 * Available if target is equal to 'data'
	 *
	 * @access  public
	 * @return  int the The ID of the target data item
	 *
	 */
	public function getData() {
		return $this->data;
	}

	/**
	 * Sets the ID of the target data item of this action
	 *
	 * @access  public
	 * @param   int     $data The ID of the target data item
	 * @return  void
	 *
	 */
	public function setData($data) {
		$this->data = $data;
	}

	/**
	 * Returns the ID of the target data group of this action
	 *
	 * Available if target is equal to 'datagroup'
	 *
	 * @access  public
	 * @return  int The ID of the target data group
	 *
	 */
	public function getDatagroup() {
		return $this->datagroup;
	}

	/**
	 * Sets the ID of the target data group of this action
	 *
	 * @access  public
	 * @param   int     $datagroup The ID of the target data group
	 * @return  void
	 *
	 */
	public function setDatagroup($datagroup) {
		$this->datagroup = $datagroup;
	}

	/**
	 * Returns the ID of the target step of this action
	 *
	 * Available if target is equal to 'step'
	 *
	 * @access  public
	 * @return  string The ID of the target step
	 *
	 */
	public function getStep() {
		return $this->step;
	}

	/**
	 * Sets the ID of the target step of this action
	 *
	 * @access  public
	 * @param   string     $step The ID of the target step
	 * @return  void
	 *
	 */
	public function setStep($step) {
		$this->step = $step;
	}

	/**
	 * Returns the ID of the target panel of this action
	 *
	 * Available if target is equal to 'panel'
	 *
	 * @access  public
	 * @return  string The ID of the target panel
	 *
	 */
	public function getPanel() {
		return $this->panel;
	}

	/**
	 * Sets the ID of the target panel of this action
	 *
	 * @access  public
	 * @param   string     $panel The ID of the target panel
	 * @return  void
	 *
	 */
	public function setPanel($panel) {
		$this->panel = $panel;
	}

	/**
	 * Returns the ID of the target field set of this action
	 *
	 * Available if target is equal to 'fieldset'
	 *
	 * @access  public
	 * @return  string The ID of the target field set
	 *
	 */
	public function getFieldset() {
		return $this->fieldset;
	}

	/**
	 * Sets the ID of the target field set of this action
	 *
	 * @access  public
	 * @param   string     $fieldset The ID of the target field set
	 * @return  void
	 *
	 */
	public function setFieldset($fieldset) {
		$this->fieldset = $fieldset;
	}

	/**
	 * Returns the ID of the target column of this action
	 *
	 * Available if target is equal to 'column'
	 *
	 * @access  public
	 * @return  string The ID of the target column
	 *
	 */
	public function getColumn() {
		return $this->column;
	}

	/**
	 * Sets the ID of the target column of this action
	 *
	 * @access  public
	 * @param   string     $column The ID of the target column
	 * @return  void
	 *
	 */
	public function setColumn($column) {
		$this->column = $column;
	}

	/**
	 * Returns the ID of the target field row of this action
	 *
	 * Available if target is equal to 'fieldrow'
	 *
	 * @access  public
	 * @return  string The ID of the target field row
	 *
	 */
	public function getFieldrow() {
		return $this->fieldrow;
	}

	/**
	 * Sets the ID of the target field row of this action
	 *
	 * @access  public
	 * @param   string     $fieldrow The ID of the target field row
	 * @return  void
	 *
	 */
	public function setFieldrow($fieldrow) {
		$this->fieldrow = $fieldrow;
	}

	/**
	 * Returns the position of the target field of this action
	 *
	 * Available if target is equal to 'field'
	 *
	 * @access  public
	 * @return  string The poistion of the target field
	 *
	 */
	public function getField() {
		return $this->field;
	}

	/**
	 * Sets the position of the target field of this action
	 *
	 * @access  public
	 * @param   string     $field The position of the target field
	 * @return  void
	 *
	 */
	public function setField($field) {
		$this->field = $field;
	}

	/**
	 * Returns the ID of the target block of info of this action
	 *
	 * Available if target is equal to 'blockinfo'
	 *
	 * @access  public
	 * @return  string The ID of the target block of info
	 *
	 */
	public function getBlockinfo() {
		return $this->blockinfo;
	}

	/**
	 * Sets the ID of the target block of info of this action
	 *
	 * @access  public
	 * @param   string     $blockinfo The ID of the target block of info
	 * @return  void
	 *
	 */
	public function setBlockinfo($blockinfo) {
		$this->blockinfo = $blockinfo;
	}

	/**
	 * Returns the ID of the target chapter of this action
	 *
	 * Available if target is equal to 'chapter'
	 *
	 * @access  public
	 * @return  string The ID of the target chapter
	 *
	 */
	public function getChapter() {
		return $this->chapter;
	}

	/**
	 * Sets the ID of the target chapter of this action
	 *
	 * @access  public
	 * @param   string     $chapter The ID of the target chapter
	 * @return  void
	 *
	 */
	public function setChapter($chapter) {
		$this->chapter = $chapter;
	}

	/**
	 * Returns the ID of the target section of this action
	 *
	 * Available if target is equal to 'section'
	 *
	 * @access  public
	 * @return  string The ID of the target section
	 *
	 */
	public function getSection() {
		return $this->section;
	}

	/**
	 * Sets the ID of the target section of this action
	 *
	 * @access  public
	 * @param   string     $section The ID of the target section
	 * @return  void
	 *
	 */
	public function setSection($section) {
		$this->section = $section;
	}

	/**
	 * Returns the position of the field to which the target note of this action is attached
	 *
	 * Available if target is equal to 'prenote'
	 *
	 * @access  public
	 * @return  string The position of the field
	 *
	 */
	public function getPrenote() {
		return $this->prenote;
	}

	/**
	 * Sets the position of the field to which the target note of this action is attached
	 *
	 * @access  public
	 * @param   string     $prenote The position of the field
	 * @return  void
	 *
	 */
	public function setPrenote($prenote) {
		$this->prenote = $prenote;
	}

	/**
	 * Returns the position of the field to which the target note of this action is attached
	 *
	 * Available if target is equal to 'postnote'
	 *
	 * @access  public
	 * @return  string The position of the field
	 *
	 */
	public function getPostnote() {
		return $this->postnote;
	}

	/**
	 * Sets the position of the field to which the target note of this action is attached
	 *
	 * @access  public
	 * @param   string     $postnote The position of the field
	 * @return  void
	 *
	 */
	public function setPostnote($postnote) {
		$this->postnote = $postnote;
	}

	/**
	 * Returns the name of the target action button of this action
	 *
	 * Available if target is equal to 'action'
	 *
	 * @access  public
	 * @return  string The name of the target action button
	 *
	 */
	public function getAction() {
		return $this->action;
	}

	/**
	 * Sets the name of the target action button of this action
	 *
	 * @access  public
	 * @param   string     $action The name of the target action button
	 * @return  void
	 *
	 */
	public function setAction($action) {
		$this->action = $action;
	}

	/**
	 * Returns the ID of the target footnote of this action
	 *
	 * Available if target is equal to 'footnote'
	 *
	 * @access  public
	 * @return  string The ID of the target footnote
	 *
	 */
	public function getFootnote() {
		return $this->footnote;
	}

	/**
	 * Sets the ID of the target footnote of this action
	 *
	 * @access  public
	 * @param   string     $footnote The ID of the target footnote
	 * @return  void
	 *
	 */
	public function setFootnote($footnote) {
		$this->footnote = $footnote;
	}

	/**
	 * Returns the ID of the target choice of this action
	 *
	 * Available if target is equal to 'choice'
	 *
	 * @access  public
	 * @return  string The ID of the target choice
	 *
	 */
	public function getChoice() {
		return $this->choice;
	}

	/**
	 * Sets the ID of the target choice of this action
	 *
	 * @access  public
	 * @param   string     $choice The ID of the target choice
	 * @return  void
	 *
	 */
	public function setChoice($choice) {
		$this->choice = $choice;
	}

	/**
	 * Returns the target ID of this action
	 *
	 * @access  public
	 * @return  string The target ID
	 *
	 */
	public function getTargetId() {
		switch ($this->target) {
			case 'field':
				return $this->getField();
			case 'prenote':
				return $this->getPrenote();
			case 'postnote':
				return $this->getPostnote();
			case 'column':
				return $this->getColumn();
			case 'fieldrow':
				return $this->getFieldrow();
			case 'fieldset':
				return $this->getFieldset();
			case 'section':
				return $this->getSection();
			case 'chapter':
				return $this->getChapter();
			case 'blockinfo':
				return $this->getBlockinfo();
			case 'step':
				return $this->getStep();
			case 'footnote':
				return $this->getFootnote();
			case 'action':
				return $this->getAction();
			case 'choice':
				return $this->getChoice();
		}
		return '0';
	}	

	/**
	 * Returns the value or message of this action
	 *
	 * Available if name is equal to 'notifyWarning', 'notifyError' or 'setAttribute'
	 *
	 * @access  public
	 * @return  string The value or message
	 *
	 */
	public function getValue() {
		return $this->value;
	}

	/**
	 * Sets the value or message of this action
	 *
	 * @access  public
	 * @param   string     $value The value or message
	 * @return  void
	 *
	 */
	public function setValue($value) {
		$this->value = $value;
	}

}

?>
