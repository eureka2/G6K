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
 * This class allows the storage and retrieval of the attributes of a web site in which a simulator is ran.
 *
 * @author    Jacques Archimède
 *
 */
class Site {

	/**
	 * @var \App\G6K\Model\Simulator $simulator The Simulator object that uses this web site.
	 *
	 * @access  private
	 *
	 */
	private $simulator = null;

	/**
	 * @var int      $id The id of this Site object.
	 *
	 * @access  private
	 *
	 */
	private $id;

	/**
	 * @var string      $name The name of this web site.
	 *
	 * @access  private
	 *
	 */
	private $name;

	/**
	 * @var string      $home The URL of the home page of this web site.
	 *
	 * @access  private
	 *
	 */
	private $home;

	/**
	 * Constructor of class Site
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator $simulator The Simulator object that uses this web site.
	 * @param   int $id The id of this Site object.
	 * @param   string $name The name of this web site.
	 * @param   string $home The URL of the home page of this web site.
	 * @return  void
	 *
	 */
	public function __construct($simulator, $id, $name, $home) {
		$this->simulator = $simulator;
		$this->id = $id;
		$this->name = $name;
		$this->home = $home;
	}

	/**
	 * Returns the Simulator object that uses this web site.
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Simulator The Simulator object.
	 *
	 */
	public function getSimulator() {
		return $this->simulator;
	}

	/**
	 * Returns the id of this Site object
	 *
	 * @access  public
	 * @return  int The id of this Site object
	 *
	 */
	public function getId() {
		return $this->id;
	}

	/**
	 * Sets the id of this Site object
	 *
	 * @access  public
	 * @param   int $id The id of this Site object
	 * @return  void
	 *
	 */
	public function setId($id) {
		$this->id = $id;
	}

	/**
	 * Returns the name of this web site.
	 *
	 * @access  public
	 * @return  string The name of this web site.
	 *
	 */
	public function getName() {
		return $this->name;
	}

	/**
	 * Sets the name of this web site.
	 *
	 * @access  public
	 * @param   string $name The name of this web site.
	 * @return  void
	 *
	 */
	public function setName($name) {
		$this->name = $name;
	}

	/**
	 * Returns the URL of the home page of this web site.
	 *
	 * @access  public
	 * @return  string The URL of the home page
	 *
	 */
	public function getHome() {
		return $this->home;
	}

	/**
	 * Sets the URL of the home page of this web site.
	 *
	 * @access  public
	 * @param   string $home The URL of the home page
	 * @return  void
	 *
	 */
	public function setHome($home) {
		$this->home = $home;
	}

}

?>
