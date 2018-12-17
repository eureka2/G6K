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
 * This class allows the storage and retrieval of the attributes of a group of choices
 *
 * The list of choices of a choice group can either be defined by extension, or be the result of a query on a data source.
 *
 * @author    Jacques Archimède
 * @author    Yann Toqué
 *
 */
class ChoiceGroup {

	/**
	 * @var string     $label The label of this group of choices
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var array      $choices The list of all the choices (Choice object) of this group that have been defined by extension
	 *
	 * @access  private
	 *
	 */
	private $choices = array(); 

	/**
	 * @var \App\G6K\Model\ChoiceSource $choiceSource The ChoiceSource object that contains the columns of the result of the query that populate this group of choices.
	 *
	 * @access  private
	 *
	 */
	private $choiceSource = null; 

	/**
	 * Constructor of class ChoiceGroup
	 *
	 * @access  public
	 * @param   string     $label The label of this group of choices
	 * @return  void
	 *
	 */
	public function __construct($label) {
		$this->label = $label;
	}

	/**
	 * Retrieves the label of this group of choices
	 *
	 * @access  public
	 * @return  string     The label of this group of choices
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this group of choices
	 *
	 * @access  public
	 * @param   string     $label The label of this group of choices
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the list of all the choices that have been defined by extension
	 *
	 * @access  public
	 * @return  array The list of all the choices
	 *
	 */
	public function getChoices() {
		return $this->choices;
	}

	/**
	 * Sets the list of all the choices that have been defined by extension
	 *
	 * @access  public
	 * @param   array      $choices The list of all the choices
	 * @return  void
	 *
	 */
	public function setChoices($choices) {
		$this->choices = $choices;
	}

	/**
	 * Adds a Choice object to the list of choices
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Choice $choice The Choice object to add
	 * @return  void
	 *
	 */
	public function addChoice(Choice $choice) {
		$this->choices[] = $choice;
	}

	/**
	 * Retrieves a Choice object by its ID
	 *
	 * @access  public
	 * @param   int $id The ID of the choice 
	 * @return  \App\G6K\Model\Choice|null The Choice object with this ID
	 *
	 */
	public function getChoiceById($id) {
		foreach ($this->choices as $choice) {
			if ($choice->getId() == $id) {
				return $choice;
			}
		}
		return null;
	}

	/**
	 * Retrieves the ChoiceSource object of this group of choices
	 *
	 * The ChoiceSource object contains the columns of the result of the query that populate this group of choices.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\ChoiceSource The ChoiceSource object
	 *
	 */
	public function getChoiceSource() {
		return $this->choiceSource;
	}

	/**
	 * Sets the ChoiceSource object of this group of choices
	 *
	 * The ChoiceSource object contains the columns of the result of the query that populate this group of choices.
	 *
	 * @access  public
	 * @param  \App\G6K\Model\ChoiceSource $choiceSource The ChoiceSource object
	 * @return  void
	 *
	 */
	public function setChoiceSource($choiceSource) {
		$this->choiceSource = $choiceSource;
	}

	/**
	 * Returns the class name of this ChoiceGroup object 
	 *
	 * @access  public
	 * @return  string the class name
	 *
	 */
	public function getClass() {
		$classPath = explode('\\', get_class());
		return end($classPath);
	}

}

?>
