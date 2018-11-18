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
 * This class allows the storage and retrieval of common attributes of a dataset child.
 *
 * A dataset child is either a data or a data group. This class is therefore the base class of the Data class and the DataGroup class.
 *
 * @author    Jacques Archimède
 * @author    Yann Toqué
 *
 */
abstract class DatasetChild {

	/**
	 * @var \App\G6K\Model\Simulator $simulator The Simulator object that uses this dataset child.
	 *
	 * @access  protected
	 *
	 */
	protected $simulator = null;

	/**
	 * @var int        $id The ID of this dataset child.
	 *
	 * @access  protected
	 *
	 */
	protected $id = 0;

	/**
	 * @var string     $name The name of this dataset child.
	 *
	 * @access  protected
	 *
	 */
	protected $name = "";

	/**
	 * @var string     $label The label of this dataset child.
	 *
	 * @access  protected
	 *
	 */
	protected $label = "";

	/**
	 * @var \App\G6K\Model\RichText     $description The description of this dataset child.
	 *
	 * @access  protected
	 *
	 */
	protected $description = null;

	/**
	 * @var bool       $error Indicates whether an error is occurred for this dataset child.
	 *
	 * @access  protected
	 *
	 */
	protected $error = false;

	/**
	 * @var array      $errorMessages  List of error messages. 
	 *
	 * @access  protected
	 *
	 */
	protected $errorMessages = array();

	/**
	 * @var bool       $warning Indicates whether a warning was issued for this dataset child.
	 *
	 * @access  protected
	 *
	 */
	protected $warning = false;

	/**
	 * @var array      $warningMessages List of warning messages. 
	 *
	 * @access  protected
	 *
	 */
	protected $warningMessages = array();

	/**
	 * @var bool       $used Indicates whether this dataset child is being used (displayed) by the current simulation step
	 *
	 * @access  protected
	 *
	 */
	protected $used = false;

	/**
	 * Constructor of class DatasetChild
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator $simulator The Simulator object that uses this dataset child.
	 * @param   int        $id The ID of this dataset child.
	 * @param   string     $name The name of this dataset child.
	 * @return  void
	 *
	 */
	public function __construct($simulator, $id, $name) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->name = $name;
	}

	/**
	 * Returns the Simulator object that uses this dataset child
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Simulator  The Simulator object 
	 *
	 */
	public function getSimulator() {
		return $this->simulator;
	}

	/**
	 * Returns the ID of this dataset child.
	 *
	 * @access  public
	 * @return  int  The ID of this dataset child.
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the ID of this dataset child.
	 *
	 * @access  public
	 * @param   int        $id The ID of this dataset child.
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the name of this dataset child.
	 *
	 * @access  public
	 * @return  string The name of this dataset child.
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this dataset child.
	 *
	 * @access  public
	 * @param   string     $name The name of this dataset child. 
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the label of this dataset child.
	 *
	 * @access  public
	 * @return  string The label of this dataset child.
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this dataset child.
	 *
	 * @access  public
	 * @param   string     $label The label of this dataset child.
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the description of this dataset child.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\RichText The description of this dataset child.
	 *
	 */
	public function getDescription() {
		return $this->description;
	}

	/**
	 * Sets the description of this dataset child.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText     $description The description of this dataset child.
	 * @return  void
	 *
	 */
	public function setDescription($description) {
		$this->description = $description;
	}

	/**
	 * Returns the state of use of this dataset child by the current simulation step
	 *
	 * @access  public
	 * @return  bool true if this dataset child is used (displayed) by the current simulation step, false otherwise
	 *
	 */
	public function isUsed() {
		return $this->used;
	}

	/**
	 * Returns the state of use of this dataset child by the current simulation step
	 *
	 * @access  public
	 * @return  bool true if this dataset child is used (displayed) by the current simulation step, false otherwise
	 *
	 */
	public function getUsed() {
		return $this->used;
	}

	/**
	 * Sets the state of use of this dataset child by the current simulation step
	 *
	 * @access  public
	 * @param   bool       $used  true if this dataset child is used (displayed) by the current simulation step, false otherwise
	 * @return  void
	 *
	 */
	public function setUsed($used) {
		$this->used = $used;
	}

	/**
	 * Returns the error attribute of this dataset child
	 *
	 * @access  public
	 * @return  bool true if an error was occured, false if not
	 *
	 */
	public function isError() {
		return $this->error;
	}

	/**
	 * Returns the error attribute of this dataset child
	 *
	 * @access  public
	 * @return  bool true if an error was occured, false if not
	 *
	 */
	public function getError() {
		return $this->error;
	}

	/**
	 * Determines whether this dataset child has a issued error or not
	 *
	 * @access  public
	 * @param   bool       $error true if this dataset child has a issued error, false otherwise
	 * @return  void
	 *
	 */
	public function setError($error) {
		$this->error = $error;
	}

	/**
	 * Returns the list of error messages.
	 *
	 * @access  public
	 * @return  array The list of error messages
	 *
	 */
	public function getErrorMessages() {
		return $this->errorMessages;
	}

	/**
	 * Sets the list of error messages.
	 *
	 * @access  public
	 * @param   array      $errorMessages The list of error messages
	 * @return  void
	 *
	 */
	public function setErrorMessages($errorMessages) {
		$this->errorMessages = $errorMessages;
	}

	/**
	 * Adds a message to the list of error messages.
	 *
	 * @access  public
	 * @param   string      $errorMessage The message to add
	 * @return  void
	 *
	 */
	public function addErrorMessage($errorMessage) {
		if (! in_array($errorMessage, $this->errorMessages)) {
			$this->errorMessages[] = $errorMessage;
		}
	}

	/**
	 * Removes a message from the list of error messages.
	 *
	 * @access  public
	 * @param   int $index The index of the message in the list of error messages
	 * @return  void
	 *
	 */
	public function removeErrorMessage($index) {
		$this->errorMessages[$index] = null;
	}

	/**
	 * Returns the warning attribute of this dataset child
	 *
	 * @access  public
	 * @return  bool true if an warning was issued, false if not
	 *
	 */
	public function isWarning() {
		return $this->warning;
	}

	/**
	 * Returns the warning attribute of this dataset child
	 *
	 * @access  public
	 * @return  bool true if an warning was issued, false if not
	 *
	 */
	public function getWarning() {
		return $this->warning;
	}

	/**
	 * Determines whether this dataset child has a issued warning or not
	 *
	 * @access  public
	 * @param   bool       $warning true if this dataset child has a issued warning, false otherwise
	 * @return  void
	 *
	 */
	public function setWarning($warning) {
		$this->warning = $warning;
	}

	/**
	 * Returns the list of warning messages.
	 *
	 * @access  public
	 * @return  array The list of warning messages.
	 *
	 */
	public function getWarningMessages() {
		return $this->warningMessages;
	}

	/**
	 * Sets the list of warning messages.
	 *
	 * @access  public
	 * @param   array      $warningMessages The list of warning messages.
	 * @return  void
	 *
	 */
	public function setWarningMessages($warningMessages) {
		$this->warningMessages = $warningMessages;
	}

	/**
	 * Adds a message to the list of warning messages.
	 *
	 * @access  public
	 * @param   string      $warningMessage The message to add.
	 * @return  void
	 *
	 */
	public function addWarningMessage($warningMessage) {
		if (! in_array($warningMessage, $this->warningMessages)) {
			$this->warningMessages[] = $warningMessage;
		}
	}

	/**
	 * Removes a message from the list of warning messages.
	 *
	 * @access  public
	 * @param   int $index The index of the message in the list of warning messages
	 * @return  void
	 *
	 */
	public function removeWarningMessage($index) {
		$this->warningMessages[$index] = null;
	}

	/**
	 * Returns the class name of this dataset child. It's either "Data" or "DataGroup".
	 *
	 * @access  public
	 * @return  string The class name
	 *
	 */
	public function getClass() {
		$classPath = explode('\\', get_class($this));
		return end($classPath);
	}

}

?>
