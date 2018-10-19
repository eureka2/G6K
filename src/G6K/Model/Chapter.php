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
 * This class allows the storage and retrieval of the attributes of a chapter
 *
 * @author    Jacques Archimède
 * @author    Yann Toqué
 *
 */
class Chapter {

	/**
	 * @var \App\G6K\Model\BlockInfo $blocinfo BlockInfo object that contains this chapter
	 *
	 * @access  private
	 *
	 */
	private $blocinfo = null;

	/**
	 * @var int        $id The ID of the chapter
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $name The name of the chapter without spaces or special or accented characters
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $label The label of the chapter
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var string     $icon  Absolute or relative URL of an image
	 *
	 * @access  private
	 *
	 */
	private $icon = "";

	/**
	 * @var bool       $collapsible Indicates whether the panel in this chapter can be collapsed / expanded or not.
	 *
	 * @access  private
	 *
	 */
	private $collapsible = false;

	/**
	 * @var array      $sections Array of all sections othis chapter
	 *
	 * @access  private
	 *
	 */
	private $sections = array();

	/**
	 * @var bool       $displayable  Indicates whether this chapter should be displayed or not.
	 *
	 * @access  private
	 *
	 */
	private $displayable = true;

	/**
	 * Constructor of class Chapter
	 *
	 * @access  public
	 * @param   \App\G6K\Model\BlockInfo $blocinfo BlockInfo object that contains this chapter
	 * @param   int        $id The chapter ID
	 * @return  void
	 *
	 */
	public function __construct($blocinfo, $id) {
		$this->blocinfo = $blocinfo;
		$this->id = $id;
	}

	/**
	 * Retrieves the BlockInfo object that contains this chapter
	 *
	 * @access  public
	 * @return  \App\G6K\Model\BlockInfo the BlockInfo object
	 *
	 */
	public function getBlocinfo() {
		return $this->blocinfo;
	}

	/**
	 * Retrieves the ID of this chapter
	 *
	 * @access  public
	 * @return  int the chapter id
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this chapter
	 *
	 * @access  public
	 * @param   int $id Chapter id
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Retrieves the name of this chapter
	 *
	 * @access  public
	 * @return  string the chapter name
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this chapter
	 *
	 * @access  public
	 * @param   string     $name Chapter name without spaces or special or accented characters
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Retrieves the label of this chapter
	 *
	 * @access  public
	 * @return  string the chapter label
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this chapter
	 *
	 * @access  public
	 * @param   string     $label Chapter label
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Retrieves the icon of this chapter
	 *
	 * @access  public
	 * @return  string the value of icon 
	 *
	 */
	public function getIcon() {
		return $this->icon;
	}

	/**
	 * Sets the icon of this chapter
	 *
	 * @access  public
	 * @param   string     $icon  Absolute or relative URL of an image
	 * @return  void
	 *
	 */
	public function setIcon($icon) {
		$this->icon = $icon;
	}

	/**
	 * Retrieves the collapsible attribute of this Chapter object
	 *
	 * @access  public
	 * @return  bool the value of collapsible
	 *
	 */
	public function isCollapsible() {
		return $this->collapsible;
	}

	/**
	 * Retrieves the collapsible attribute of this Chapter object
	 *
	 * @access  public
	 * @return  bool the value of collapsible
	 *
	 */
	public function getCollapsible() {
		return $this->collapsible;
	}

	/**
	 * Determines whether this Chapter can be collapsed /expanded or not
	 *
	 * @access  public
	 * @param   bool       $collapsible true if this chapter can be collapsed /expanded, false otherwise
	 * @return  void
	 *
	 */
	public function setCollapsible($collapsible) {
		$this->collapsible = $collapsible;
	}

	/**
	 * Returns the list of sections contained in this Chapter object
	 *
	 * @access  public
	 * @return  array The list of sections
	 *
	 */
	public function getSections() {
		return $this->sections;
	}

	/**
	 * Sets the list of sections contained in this Chapter object
	 *
	 * @access  public
	 * @param   array      $sections The list of sections
	 * @return  void
	 *
	 */
	public function setSections($sections) {
		$this->sections = $sections;
	}

	/**
	 * Adds a section to the list of sections contained in this Chapter object
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Section $section
	 * @return  void
	 *
	 */
	public function addSection($section) {
		$this->sections[] = $section;
	}

	/**
	 * Removes a section from the list of sections contained in this Chapter object
	 *
	 * @access  public
	 * @param   int $index 
	 * @return  void
	 *
	 */
	public function removeSection($index) {
		$this->sections[$index] = null;
	}

	/**
	 * Retrieves a section by its ID in the sections list of this Chapter object
	 *
	 * @access  public
	 * @param   int $id Section id
	 * @return  \App\G6K\Model\Section|null The section with this ID
	 *
	 */
	public function getSectionById($id) {
		foreach ($this->sections as $section) {
			if ($section->getId() == $id) {
				return $section;
			}
		}
		return null;
	}

	/**
	 * Returns the displayable attribute of this Chapter object 
	 *
	 * @access  public
	 * @return  bool the value of displayable
	 *
	 */
	public function isDisplayable() {
		return $this->displayable;
	}

	/**
	 * Determines whether this Chapter can be displayed or not
	 *
	 * @access  public
	 * @param   bool       $displayable  Chapter displayable or not
	 * @return  void
	 *
	 */
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

}

?>
