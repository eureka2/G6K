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
 * This class allows the storage and retrieval of the attributes of a connector
 *
 * A connector is an object that combines conditions in a business rule of a simulator. A connector is a combined condition.
 *
 * There are three types of connectors :
 * 
 * - Connector "all": the result of the evaluation of the combined condition is true if all the conditions inside the connector are evaluated to true. This is the equivalent of Boolean "and".  
 * - Connector "any": the result of the evaluation of the combined condition is true if at least one of the conditions inside the connector is evaluated to true. This is the equivalent of Boolean "or".  
 * - Connector "not": the result of the evaluation of the combined condition is true if none of the conditions inside the connector is evaluated to true. This is the equivalent of Boolean "not".  
 *
 * @author    Jacques Archimède
 * @author    Yann Toqué
 *
 */
class Connector {

	/**
	 * @var \App\G6K\Model\Simulator $simulator The Simulator object that has the business rule that uses this connector
	 *
	 * @access  private
	 *
	 */
	private $simulator = null;

	/**
	 * @var string     $type  The type of connector among "all", "any" or "none"
	 *
	 * @access  private
	 *
	 */
	private $type = ""; 

	/**
	 * @var array      $conditions holds the conditions (Condition objects) or connectors (Connector objects) inside this connector.
	 *
	 * @access  private
	 *
	 */
	private $conditions = array(); 

	/**
	 * Constructor of class Connector
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator $simulator The Simulator object that has the business rule that uses this connector
	 * @param   string     $type  The type of connector among "all", "any" or "none"
	 * @return  void
	 *
	 */
	public function __construct($simulator, $type) {
		$this->simulator = $simulator;
		$this->type = $type;
	}

	/**
	 * Retrieves the Simulator object that has the business rule that uses this connector
	 *
	 * @access  public
	 * @return  \App\G6K\Model\Simulator The Simulator object 
	 *
	 */
	public function getSimulator() {
		return $this->simulator;
	}

	/**
	 * Retrieves the type of this connector.
	 *
	 * @access  public
	 * @return  string The type of this connector
	 *
	 */
	public function getType() {
		return $this->type;
	}

	/**
	 * Sets the type of this connector.
	 *
	 * @access  public
	 * @param   string $type  The type of connector among "all", "any" or "none"
	 * @return  void
	 *
	 */
	public function setType($type) {
		$this->type = $type;
	}

	/**
	 * Retrieves the conditions (Condition objects) or connectors (Connector objects) inside this connector.
	 *
	 * @access  public
	 * @return  array The conditions or connectors inside this connector.
	 *
	 */
	public function getConditions() {
		return $this->conditions;
	}

	/**
	 * Sets the conditions (Condition objects) or connectors (Connector objects) inside this connector.
	 *
	 * @access  public
	 * @param   array $conditions The conditions or connectors inside this connector.
	 * @return  void
	 *
	 */
	public function setConditions($conditions) {
		$this->conditions = $conditions;
	}

	/**
	 * Adds a Condition object or Connector object to the list of objects inside this connector.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Condition|\App\G6K\Model\Connector $condition A Condition object or a Connector object  
	 * @return  void
	 *
	 */
	public function addCondition($condition) {
		$this->conditions[] = $condition;
	}

	/**
	 * Removes the Condition object or Connector object from the list of objects inside this connector at the given position.
	 *
	 * @access  public
	 * @param   int $index The position of the Condition object or the Connector object in the array.
	 * @return  void
	 *
	 */
	public function removeCondition($index) {
		$this->conditions[$index] = null;
	}

	/**
	 * Retrieves the Condition object or Connector object from the list of objects inside this connector at the given position.
	 *
	 * Returns null if there is no object at this position.
	 *
	 * @access  public
	 * @param   int $index The position of the Condition object or the Connector object in the array.
	 * @return  \App\G6K\Model\Condition|\App\G6K\Model\Connector|null The Condition object or Connector object
	 *
	 */
	public function getCondition($index) {
		return $index < count($this->conditions) ? $this->conditions[$index] : null;
	}

}

?>
