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
 * This class allows the storage and retrieval of the attributes of a panel.
 *
 * A panel is where the informations of a simulation step are displayed.
 *
 * Information can be organized in one or more panels.
 *
 * If there are multiple panels, they are displayed as tabs.
 *
 * The first levels of information in a panel are field sets or blocks of information.
 *
 * @author    Jacques Archimède
 *
 */
class Panel {

	/**
	 * @var \App\G6K\Model\Step $step The Step object that contains this panel.  
	 *
	 * @access  private
	 *
	 */
	private $step = null;

	/**
	 * @var int        $id The id of this panel.
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $name The name of this panel.
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $label The label of this panel.
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var array      $fieldsets The list of field sets (FieldSet objects) or block of informations (BlockInfo objects) contained in this panel
	 *
	 * @access  private
	 *
	 */
	private $fieldsets = array();

	/**
	 * @var bool       $displayable Indicates whether this panel should be displayed or not.
	 *
	 * @access  private
	 *
	 */
	private $displayable = true;

	/**
	 * Constructor of class Panel
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Step $step The Step object that contains this panel.   
	 * @param   int        $id The id of the panel.
	 * @return  void
	 *
	 */
	public function __construct($step, $id) {
		$this->step = $step;
		$this->id = $id;
	}

	/**
	 * Returns the Step object that contains this panel
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Step The Step object
	 *
	 */
	public function getStep() {
		return $this->step;
	}

	/**
	 * Returns the id of this panel
	 *
	 * @access  public
	 * @return  int The id of this panel
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the id of this panel
	 *
	 * @access  public
	 * @param   int        $id The id of this panel
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the name of this panel
	 *
	 * @access  public
	 * @return  string The name of this panel
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this panel
	 *
	 * @access  public
	 * @param   string     $name The name of this panel
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the label of this panel
	 *
	 * @access  public
	 * @return  string The label of this panel
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this panel
	 *
	 * @access  public
	 * @param   string     $label The label of this panel
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the list of field sets (FieldSet objects) or block of informations (BlockInfo objects) contained in this panel.
	 *
	 * @access  public
	 * @return  array The list of FieldSet or BlockInfo objects
	 *
	 */
	public function getFieldSets() {
		return $this->fieldsets;
	}

	/**
	 * Sets the list of field sets (FieldSet objects) or block of informations (BlockInfo objects) contained in this panel.
	 *
	 * @access  public
	 * @param   array $fieldsets The list of FieldSet or BlockInfo objects
	 * @return  void
	 *
	 */
	public function setFieldSets($fieldsets) {
		$this->fieldsets = $fieldsets;
	}

	/**
	 * Adds a Fieldset or BlockInfo object to the list of field sets or block of informations contained in this panel.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\FieldSet|\App\G6K\Model\BlockInfo $fieldset The FieldSet or BlockInfo object
	 * @return  void
	 *
	 */
	public function addFieldSet($fieldset) {
		$this->fieldsets[] = $fieldset;
	}

	/**
	 * Removes a Fieldset or BlockInfo object from the list of field sets or block of informations contained in this panel.
	 *
	 * @access  public
	 * @param   int $index The index of the Fieldset or BlockInfo object in the list
	 * @return  void
	 *
	 */
	public function removeFieldSet($index) {
		$this->fieldsets[$index] = null;
	}

	/**
	 * Retrieves a Fieldset object by its id in the list of field sets contained in this panel.
	 *
	 * @access  public
	 * @param   int $id The id of Fieldset object 
	 * @return  \App\G6K\Model\Fieldset|null The Fieldset object
	 *
	 */
	public function getFieldSetById($id) {
		foreach ($this->fieldsets as $fieldset) {
			if ($fieldset instanceof FieldSet && $fieldset->getId() == $id) {
				return $fieldset;
			}
		}
		return null;
	}

	/**
	 * Retrieves a BlockInfo object by its id in the list of blocks of informations contained in this panel.
	 *
	 * @access  public
	 * @param   int $id The id of the BlockInfo object
	 * @return  \App\G6K\Model\BlockInfo|null The BlockInfo object
	 *
	 */
	public function getBlockInfoById($id) {
		foreach ($this->fieldsets as $fieldset) {
			if ($fieldset instanceof BlockInfo && $fieldset->getId() == $id) {
				return $fieldset;
			}
		}
		return null;
	}

	/**
	 * Retrieves the BlockInfo or the Fieldset object by its id in the list of blocks contained in this panel.
	 *
	 * @access  public
	 * @param   int $id The id of the BlockInfo or the Fieldset object
	 * @return  \App\G6K\Model\BlockInfo|\App\G6K\Model\Fieldset|null The BlockInfo or the Fieldset object
	 *
	 */
	public function getBlockById($id) {
		foreach ($this->fieldsets as $block) {
			if ($block->getId() == $id) {
				return $block;
			}
		}
		return null;
	}

	/**
	 * Returns the displayable attribute of this Panel object 
	 *
	 * @access  public
	 * @return  bool  true if this panel can be displayed, false otherwise
	 *
	 */
	public function isDisplayable() {
		return $this->displayable;
	}

	/**
	 * Returns the displayable attribute of this Panel object 
	 *
	 * @access  public
	 * @return  bool  true if this panel can be displayed, false otherwise
	 *
	 */
	public function getDisplayable() {
		return $this->displayable;
	}

	/**
	 * Determines whether this panel can be displayed or not
	 *
	 * @access  public
	 * @param   bool       $displayable true if this panel can be displayed, false otherwise
	 * @return  void
	 *
	 */
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

	/**
	 * Does this panel contain at least one input field?
	 *
	 * @access  public
	 * @return  bool true if this panel contains at least one field entered by the user, false otherwise
	 *
	 */
	public function hasInputFields() {
		foreach ($this->fieldsets as $fieldset) {
			if ($fieldset instanceof FieldSet && $fieldset->hasInputFields()) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Does this panel contain at least one required input field?
	 *
	 * @access  public
	 * @return  bool true if this panel contains at least one required field entered by the user, false otherwise
	 *
	 */
	public function hasRequiredFields() {
		foreach ($this->fieldsets as $fieldset) {
			if ($fieldset instanceof FieldSet && $fieldset->hasRequiredFields()) {
				return true;
			}
		}
		return false;
	}

}

?>
