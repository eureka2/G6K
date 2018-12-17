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
 * This class allows the storage and retrieval of the attributes of a section.
 *
 * The section is a subdivision of a chapter.
 * It is in the sections that the different texts of a block of information are inscribed.
 * The text of a section can be annotated.
 *
 * @author    Jacques Archimède
 *
 */
class Section {

	/**
	 * @var  \App\G6K\Model\Chapter $chapter The Chapter object that contains this section. 
	 *
	 * @access  private
	 *
	 */
	private $chapter = null;

	/**
	 * @var int        $id The Id of this section.
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $name The name of this section.
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $label The label of this section.
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var \App\G6K\Model\RichText|null     $content The textual content of this section
	 *
	 * @access  private
	 *
	 */
	private $content = null;

	/**
	 * @var \App\G6K\Model\RichText|null     $annotations The annotations on the text of this section
	 *
	 * @access  private
	 *
	 */
	private $annotations = null;

	/**
	 * @var bool       $displayable Indicates whether this section set should be displayed or not.
	 *
	 * @access  private
	 *
	 */
	private $displayable = true;

	/**
	 * Constructor of class Section
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Chapter $chapter The Chapter object that contains this section. 
	 * @param   int        $id The Id of this section.
	 * @return  void
	 *
	 */
	public function __construct($chapter, $id) {
		$this->chapter = $chapter;
		$this->id = $id;
	}

	/**
	 * Returns the Chapter object that contains this section. 
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Chapter The Chapter object 
	 *
	 */
	public function getChapter() {
		return $this->chapter;
	}

	/**
	 * Returns the ID of this section
	 *
	 * @access  public
	 * @return  int The ID of this section.
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this section
	 *
	 * @access  public
	 * @param   int        $id The ID of this section.
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the name of this section
	 *
	 * @access  public
	 * @return  string the The name of this section.
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this section
	 *
	 * @access  public
	 * @param   string $name The name of this section.
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the label of this section
	 *
	 * @access  public
	 * @return  string the The label of this section.
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this section
	 *
	 * @access  public
	 * @param   string     $label The label of this section.
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the textual content of this section
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText|null The textual content of this section.
	 *
	 */
	public function getContent() {
		return $this->content;
	}

	/**
	 * Sets the textual content of this section
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText     $content The textual content of this section.
	 * @return  void
	 *
	 */
	public function setContent($content) {
		$this->content = $content;
	}

	/**
	 * Returns the annotations on the text of this section
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText|null The annotations on the text of this section
	 *
	 */
	public function getAnnotations() {
		return $this->annotations;
	}

	/**
	 * Sets the annotations on the text of this section
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText     $annotations The annotations on the text of this section
	 * @return  void
	 *
	 */
	public function setAnnotations($annotations) {
		$this->annotations = $annotations;
	}

	/**
	 * Returns the displayable attribute of this Section object 
	 *
	 * @access  public
	 * @return  bool  true if this section can be displayed, false otherwise
	 *
	 */
	public function isDisplayable() {
		return $this->displayable;
	}

	/**
	 * Returns the displayable attribute of this Section object 
	 *
	 * @access  public
	 * @return  bool  true if this section can be displayed, false otherwise
	 *
	 */
	public function getDisplayable() {
		return $this->displayable;
	}

	/**
	 * Determines whether this section can be displayed or not
	 *
	 * @access  public
	 * @param   bool       $displayable true if this section can be displayed, false otherwise
	 * @return  void
	 *
	 */
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

}

?>
