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
 * This class allows the storage and retrieval of the attributes of a simulation step.
 *
 * @author    Jacques Archimède
 *
 */
class Step {

	/**
	 * @var \App\G6K\Model\Simulator $simulator The Simulator object to which this step belongs
	 *
	 * @access  private
	 *
	 */
	private $simulator = null;

	/**
	 * @var int        $id The ID of this step 
	 *
	 * @access  private
	 *
	 */
	private $id = 0;

	/**
	 * @var string     $name The name of this step
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var string     $label The label of this step 
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var string     $template The name of the twig template that is used to display the simulation form for this step
	 *
	 * @access  private
	 *
	 */
	private $template = "";

	/**
	 * @var string     $output The output of the result of the execution of the step : 'normal', 'inlinePDF', 'downloadablePDF', 'inlineFilledPDF', 'downloadableFilledPDF', 'html'
	 *
	 * @access  private
	 *
	 */
	private $output = "";

	/**
	 * @var \App\G6K\Model\RichText|null     $description The description of this step 
	 *
	 * @access  private
	 *
	 */
	private $description = null;

	/**
	 * @var bool       $dynamic if true, the simulation engine will use Javascript to give interactivity to the simulation for this step 
	 *
	 * @access  private
	 *
	 */
	private $dynamic = false;

	/**
	 * @var bool       $pdfFooter if true, a footer is added to the PDF outputs 
	 *
	 * @access  private
	 *
	 */
	private $pdfFooter = false;

	/**
	 * @var array      $panels The list of panels of this step.
	 *
	 * @access  private
	 *
	 */
	private $panels = array();

	/**
	 * @var array      $actions The list of action buttons of this step.
	 *
	 * @access  private
	 *
	 */
	private $actions = array();

	/**
	 * @var \App\G6K\Model\Footnotes $footnotes The foot notes container of this step 
	 *
	 * @access  private
	 *
	 */
	private $footnotes = null;

	/**
	 * @var bool  $displayable Indicates whether this step should be displayed or not.
	 *
	 * @access  private
	 *
	 */
	private $displayable = true;

	/**
	 * Constructor of class Step
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator $simulator The Simulator object to which this step belongs   
	 * @param   int        $id The ID of this step 
	 * @param   string     $name The name of this step 
	 * @param   string     $label The label of this step 
	 * @param   string     $template The twig template that is used to display the simulation form for this step
	 * @return  void
	 *
	 */
	public function __construct($simulator, $id, $name, $label, $template) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->name = $name;
		$this->label = $label;
		$this->template = $template;
	}

	/**
	 * Returns the Simulator object to which this step belongs
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Simulator The Simulator object
	 *
	 */
	public function getSimulator() {
		return $this->simulator;
	}

	/**
	 * Returns the ID of this step
	 *
	 * @access  public
	 * @return  int The ID of this step
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this step
	 *
	 * @access  public
	 * @param   int        $id The ID of this step
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the name of this step
	 *
	 * @access  public
	 * @return  string the The name of this step
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this step
	 *
	 * @access  public
	 * @param   string     $name The name of this step
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the name of the twig template that is used to display the simulation form for this step
	 *
	 * @access  public
	 * @return  string The name of the twig template.
	 *
	 */
	public function getTemplate() {
		return $this->template;
	}

	/**
	 * Sets the name of the twig template that is used to display the simulation form for this step
	 *
	 * @access  public
	 * @param   string     $template The name of the twig template.
	 * @return  void
	 *
	 */
	public function setTemplate($template) {
		$this->template = $template;
	}

	/**
	 * Returns the output of the result of the execution of the step 
	 *
	 * The possible values are:
	 * 
	 * - normal: the step is displayed normally.
	 * - inlinePDF: G6K displays a PDF rendering of the generated page.
	 * - downloadablePDF: G6K generates a PDF file of the rendering of the page to be downloaded.
	 * - inlineFilledPDF: G6K fills a PDF Form with data.
	 * - downloadableFilledPDF: G6K fills a PDF Form to be downloaded with data.
	 * - html: Not implemented
	 *
	 * @access  public
	 * @return  string The output of the result
	 *
	 */
	public function getOutput() {
		return $this->output;
	}

	/**
	 * Sets the output of the result of the execution of the step 
	 *
	 * The possible values are:
	 * 
	 * - normal: the step is displayed normally.
	 * - inlinePDF: G6K displays a PDF rendering of the generated page.
	 * - downloadablePDF: G6K generates a PDF file of the rendering of the page to be downloaded.
	 * - inlineFilledPDF: G6K fills a PDF Form with data.
	 * - downloadableFilledPDF: G6K fills a PDF Form to be downloaded with data.
	 * - html: Not implemented
	 *
	 * @access  public
	 * @param   string     $output The output of the result
	 * @return  void
	 *
	 */
	public function setOutput($output) {
		$this->output = $output;
	}

	/**
	 * Returns the label of this step
	 *
	 * @access  public
	 * @return  string The label of this step
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this step
	 *
	 * @access  public
	 * @param   string     $label The label of this step
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the description of this step
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText|null the The description of this step
	 *
	 */
	public function getDescription() {
		return $this->description;
	}

	/**
	 * Sets the description of this step
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText     $description The description of this step
	 * @return  void
	 *
	 */
	public function setDescription($description) {
		$this->description = $description;
	}

	/**
	 * Returns the dynamic attribute of this Step object 
	 *
	 * if true, the simulation engine will use Javascript to give interactivity to the simulation for this step 
	 *
	 * @access  public
	 * @return  bool true if this step is dynamic, false otherwise
	 *
	 */
	public function isDynamic() {
		return $this->dynamic;
	}

	/**
	 * Returns the dynamic attribute of this Step object 
	 *
	 * if true, the simulation engine will use Javascript to give interactivity to the simulation for this step 
	 *
	 * @access  public
	 * @return  bool true if this step is dynamic, false otherwise
	 *
	 */
	public function getDynamic() {
		return $this->dynamic;
	}

	/**
	 * Determines whether this step is dynamic or not
	 *
	 * if true, the simulation engine will use Javascript to give interactivity to the simulation for this step 
	 *
	 * @access  public
	 * @param   bool   $dynamic true if this step is dynamic, false otherwise
	 * @return  void
	 *
	 */
	public function setDynamic($dynamic) {
		$this->dynamic = $dynamic;
	}

	/**
	 * Returns the pdfFooter attribute of this Step object 
	 *
	 * if true, a footer will be added to the PDF outputs 
	 *
	 * @access  public
	 * @return  bool true if a footer will be added, false otherwise
	 *
	 */
	public function hasPdfFooter() {
		return $this->pdfFooter;
	}

	/**
	 * Returns the pdfFooter attribute of this Step object 
	 *
	 * if true, a footer will be added to the PDF outputs 
	 *
	 * @access  public
	 * @return  bool true if a footer will be added, false otherwise
	 *
	 */
	public function getPdfFooter() {
		return $this->pdfFooter;
	}

	/**
	 * Determine whether or not a footer will be added to PDF output
	 *
	 * if true, a footer will be added to the PDF outputs 
	 *
	 * @access  public
	 * @param   bool   $pdfFooter true if a footer will be added, false otherwise
	 * @return  void
	 *
	 */
	public function setPdfFooter($pdfFooter) {
		$this->pdfFooter = $pdfFooter;
	}

	/**
	 * Returns the list of panels of this step.
	 *
	 * @access  public
	 * @return  array The list of panels
	 *
	 */
	public function getPanels() {
		return $this->panels;
	}

	/**
	 * Sets the list of panels of this step.
	 *
	 * @access  public
	 * @param   array      $panels The list of panels
	 * @return  void
	 *
	 */
	public function setPanels($panels) {
		$this->panels = $panels;
	}

	/**
	 * Adds a Panel object to the list of panels of this step.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Panel $panel The Panel object
	 * @return  void
	 *
	 */
	public function addPanel($panel) {
		$this->panels[] = $panel;
	}

	/**
	 * Removes a Panel object from the list of panels of this step.
	 *
	 * @access  public
	 * @param   int $index The index of the Panel object in the list of panels
	 * @return  void
	 *
	 */
	public function removePanel($index) {
		$this->panels[$index] = null;
	}

	/**
	 * Retrieves an Panel object by its ID in the list of panels of this step
	 *
	 * @access  public
	 * @param   int $id The ID of the panel
	 * @return  \App\G6K\Model\Panel|null The Panel object
	 *
	 */
	public function getPanelById($id) {
		foreach ($this->panels as $panel) {
			if ($panel->getId() == $id) {
				return $panel;
			}
		}
		return null;
	}

	/**
	 * Returns the list of action buttons of this step.
	 *
	 * @access  public
	 * @return  array The list of action buttons
	 *
	 */
	public function getActions() {
		return $this->actions;
	}

	/**
	 * Returns the list of action buttons of this step, placed at location given as parameter.
	 *
	 * @access  public
	 * @return  array The list of action buttons
	 *
	 */
	public function getActionsOfShapeAt($shape, $location) {
		return array_filter($this->actions, function (Action $action) use ($shape, $location) {
			return $action->getShape() == $shape && $action->getLocation() == $location;
		});
	}

	/**
	 * Sets the list of action buttons of this step.
	 *
	 * @access  public
	 * @param   array      $actions The list of action buttons
	 * @return  void
	 *
	 */
	public function setActions($actions) {
		$this->actions = $actions;
	}

	/**
	 * Adds an Action object to the list of action buttons of this step.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Action $action The Action object 
	 * @return  void
	 *
	 */
	public function addAction(Action $action) {
		$this->actions[] = $action;
	}

	/**
	 * Removes an Action object from the list of action buttons of this step.
	 *
	 * @access  public
	 * @param   int $index The index of the Action object in the list of action buttons
	 * @return  void
	 *
	 */
	public function removeAction($index) {
		$this->actions[$index] = null;
	}

	/**
	 * Retrieves an Action object by its name in the list of action buttons of this step
	 *
	 * @access  public
	 * @param   string $name The name of the action button
	 * @return  \App\G6K\Model\Action|null The Action object
	 *
	 */
	public function getActionByName($name) {
		foreach ($this->actions as $action) {
			if ($action->getName() == $name) {
				return $action;
			}
		}
		return null;
	}

	/**
	 * Returns the footnotes container of this step 
	 *
	 * @access  public
	 * @return   \App\G6K\Model\Footnotes The footnotes container
	 *
	 */
	public function getFootNotes() {
		return $this->footnotes;
	}

	/**
	 * Sets the footnotes container of this step 
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Footnotes $footnotes The footnotes container
	 * @return  void
	 *
	 */
	public function setFootNotes(FootNotes $footnotes) {
		$this->footnotes = $footnotes;
	}

	/**
	 * Returns the displayable attribute of this Step object 
	 *
	 * @access  public
	 * @return  bool  true if this step can be displayed, false otherwise
	 *
	 */
	public function isDisplayable() {
		return $this->displayable;
	}

	/**
	 * Returns the displayable attribute of this Step object 
	 *
	 * @access  public
	 * @return  bool  true if this step can be displayed, false otherwise
	 *
	 */
	public function getDisplayable() {
		return $this->displayable;
	}

	/**
	 * Determines whether this step can be displayed or not
	 *
	 * @access  public
	 * @param   bool       $displayable true if this step can be displayed, false otherwise
	 * @return  void
	 *
	 */
	public function setDisplayable($displayable) {
		$this->displayable = $displayable;
	}

	/**
	 * Does this step contain at least one input field?
	 *
	 * @access  public
	 * @return  bool true if this step contains at least one field entered by the user, false otherwise
	 *
	 */
	public function hasInputFields() {
		foreach ($this->panels as $panel) {
			if ($panel->hasInputFields()) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Does this step contain at least one required input field?
	 *
	 * @access  public
	 * @return  bool true if this step contains at least one required field entered by the user, false otherwise
	 *
	 */
	public function hasRequiredFields() {
		foreach ($this->panels as $panel) {
			if ($panel->hasRequiredFields()) {
				return true;
			}
		}
		return false;
	}
}

?>
