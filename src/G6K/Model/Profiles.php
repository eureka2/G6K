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
 * This class allows the storage and retrieval of the attributes of a set of profiles.
 *
 * @author    Jacques Archimède
 *
 */
class Profiles {

	/**
	 * @var \App\G6K\Model\Simulator  $simulator The Simulator object that uses this set of profiles
	 *
	 * @access  private
	 *
	 */
	private $simulator = null;

	/**
	 * @var string     $label The label of this set of profiles.
	 *
	 * @access  private
	 *
	 */
	private $label = "";

	/**
	 * @var array      $profiles The list of profiles contained in this set of profiles. 
	 *
	 * @access  private
	 *
	 */
	private $profiles = array();

	/**
	 * Constructor of class Profiles
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator  $simulator The Simulator object that uses this set of profiles.
	 * @return  void
	 *
	 */
	public function __construct($simulator) {
		$this->simulator = $simulator;
	}

	/**
	 * Returns the Simulator object that uses this set of profiles
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Simulator The Simulator object
	 *
	 */
	public function getSimulator() {
		return $this->simulator;
	}

	/**
	 * Returns the label of this set of profiles.
	 *
	 * @access  public
	 * @return  string The label of this set of profiles.
	 *
	 */
	public function getLabel() {
		return $this->label;
	}

	/**
	 * Sets the label of this set of profiles.
	 *
	 * @access  public
	 * @param   string     $label The label of this set of profiles.
	 * @return  void
	 *
	 */
	public function setLabel($label) {
		$this->label = $label;
	}

	/**
	 * Returns the list of profiles contained in this set of profiles.
	 *
	 * @access  public
	 * @return  array The list of profiles
	 *
	 */
	public function getProfiles() {
		return $this->profiles;
	}

	/**
	 * Sets the list of profiles contained in this set of profiles.
	 *
	 * @access  public
	 * @param   array      $profiles The list of profiles
	 * @return  void
	 *
	 */
	public function setProfiles($profiles) {
		$this->profiles = $profiles;
	}

	/**
	 * Adds a Profile object to the list of profiles contained in this set of profiles.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Profile $profile The Profile object 
	 * @return  void
	 *
	 */
	public function addProfile($profile) {
		$this->profiles[] = $profile;
	}

	/**
	 * Removes a Profile object from the list of profiles contained in this set of profiles.
	 *
	 * @access  public
	 * @param   int $index The index of the Profile object in the list 
	 * @return  void
	 *
	 */
	public function removeProfile($index) {
		$this->profiles[$index] = null;
	}

}

?>
