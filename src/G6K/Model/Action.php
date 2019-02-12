<?php
/*
The MIT License (MIT)

Copyright (c) 2015-2019 Jacques Archimède

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
 * This class allows the stockage and the retrieval of the attributes of an action button for a step
 *
 * @author    Jacques Archimède
 *
 */
class Action {

	/**
	 * @var \App\G6K\Model\Step $step Step that defines this action button 
	 *
	 * @access  private
	 *
	 */
	private $step = null;

	/**
	 * @var string     $name Button name without spaces or special or accented characters
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $label Button label 
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var string     $clazz Button class style eg "Primary" or "Default"
	 *
	 * @access  private
	 *
	 */
	private $clazz = "";

	/**
	 * @var string     $what Button action eg "Submit" or "Reset"
	 *
	 * @access  private
	 *
	 */
	private $what = ""; 

	/**
	 * @var string     $for Button action triggered for : currentStep (only for what=reset) priorStep, nextStep, pdfOutput, htmlOutput, externalPage
	 *
	 *
	 * @access  private
	 *
	 */
	private $for = ""; 

	/**
	 * @var string     $uri url for externalPage 
	 *
	 * @access  private
	 *
	 */
	private $uri = "";  

	/**
	 * @var string     $location location of the button container (top|right|bottom|left)
	 *
	 * @access  private
	 *
	 */
	private $location = "bottom";  

	/**
	 * @var string     $shape shape of action (button|link)
	 *
	 * @access  private
	 *
	 */
	private $shape = "button";  

	/**
	 * @var bool       $displayable Button displayable or not
	 *
	 * @access  private
	 *
	 */
	private $displayable = true;

	/**
	 * Constructor of class Action
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Step $step Step that defines this action button  
	 * @param   string $name Button name without spaces or special or accented characters
	 * @param   string $label Button label 
	 * @return  void
	 *
	 */
	public function __construct($step, $name, $label) {
		$this->step = $step;
		$this->name = $name;
		$this->label = $label;
	}

	/**
	 * Returns the step that defines this action button
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Step step
	 *
	 */
	public function getStep() {
		return $this->step;
	}

	/**
	 * Returns the name of this action button
	 *
	 * @access  public
	 * @return  string the action name
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this action button
	 *
	 * @access  public
	 * @param   string $name  Button name without spaces or special or accented characters
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the label of this action button
	 *
	 * @access  public 
	 * @return  string the value of label
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this action button
	 *
	 * @access  public
	 * @param   string $label Button label 
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the class style of this action button
	 *
	 * @access  public
	 * @return  string the value of class
	 *
	 */
	public function getClass() {
		return $this->clazz;
	}

	/**
	 * Sets the class style of this action button
	 *
	 * @access  public
	 * @param   string     $clazz Button class style eg "Primary" or "Default"
	 * @return  void
	 *
	 */
	public function setClass($clazz) {
		$this->clazz = $clazz;
	}

	/**
	 * Returns the "what to do" of this action button
	 *
	 * @access  public
	 * @return  string the value of what
	 *
	 */
	public function getWhat() {
		return $this->what;
	}

	/**
	 * Sets the "what to do" of this action button
	 *
	 * @access  public
	 * @param   string     $what Button action eg "submit", "reset", "execute"
	 * @return  void
	 *
	 */
	public function setWhat($what) {
		$this->what = $what;
	}

	/**
	 * Returns the "for what" of this action button
	 *
	 * @access  public
	 * @return  string the value of for
	 *
	 */
	public function getFor() {
		return $this->for;
	}

	/**
	 * Sets the "for what" of this action button
	 *
	 * @access  public
	 * @param   string     $for Button action triggered for : currentStep (only for what=reset) priorStep, nextStep, pdfOutput, htmlOutput, externalPage
	 * @return  void
	 *
	 */
	public function setFor($for) {
		$this->for = $for;
	}

	/**
	 * Returns the uri attribute of this action button
	 *
	 * The uri attribute is a step number or the URL of a page.
	 *
	 * @access  public
	 * @return  string the value of uri
	 *
	 */
	public function getUri() {
		return $this->uri;
	}

	/**
	 * Returns the decoded uri attribute of this action button
	 *
	 * The uri attribute is a step number or the URL of a page or a JSON string.
	 *
	 * @access  public
	 * @return  string the value of decoded uri
	 *
	 */
	public function getUriDecoded() {
		return json_decode(str_replace("'", '"', $this->uri));
	}

	/**
	 * Sets the uri attribute of this action button
	 *
	 * The uri attribute is a step number or the URL of a page.
	 *
	 * @access  public
	 * @param   string     $uri url for externalPage
	 * @return  void
	 *
	 */
	public function setUri($uri) {
		$this->uri = $uri;
	}

	/**
	 * Returns the "location" of this action button
	 *
	 * @access  public
	 * @return  string the value of location
	 *
	 */
	public function getLocation() {
		return $this->location;
	}

	/**
	 * Sets the "location" of this action button
	 *
	 * @access  public
	 * @param   string     $location location of the container of this action button
	 * @return  void
	 *
	 */
	public function setLocation($location) {
		$this->location = $location;
	}

	/**
	 * Returns the "shape" of this action button
	 *
	 * @access  public
	 * @return  string the value of shape
	 *
	 */
	public function getShape() {
		return $this->shape;
	}

	/**
	 * Sets the "shape" of this action button
	 *
	 * @access  public
	 * @param   string     $shape shape of this action button
	 * @return  void
	 *
	 */
	public function setShape($shape) {
		$this->shape = $shape;
	}

	/**
	 * Returns the displayable attribute of this action button
	 *
	 * @access  public
	 * @return  bool the value of displayable
	 *
	 */
	public function isDisplayable() {
		return $this->displayable;
	}

	/**
	 * Returns the displayable attribute of this action button
	 *
	 * @access  public
	 * @return  bool the value of displayable
	 *
	 */
	public function getDisplayable() {
		return $this->displayable;
	}

	/**
	 * Determines whether this action button can be displayed or not
	 *
	 * @access  public
	 * @param   bool $displayable Button displayable or not
	 * @return  void
	 *
	 */
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

}

?>
