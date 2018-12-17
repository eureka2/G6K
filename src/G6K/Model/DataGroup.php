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
 * This class allows the storage and retrieval of the attributes of a data group.
 *
 * A data group is a subset of data grouped for any reason.
 *
 * @author    Jacques Archimède
 * @author    Yann Toqué
 *
 */
class DataGroup extends DatasetChild {

	/**
	 * @var array      $datas List of data item of this data group.
	 *
	 * @access  private
	 *
	 */
	private $datas = array();

	/**
	 * Constructor of class DataGroup
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator $simulator The Simulator object that uses this data group 
	 * @param   int $id The ID of this data group
	 * @param   string $name The name of this data group
	 * @return  void
	 *
	 */
	public function __construct($simulator, $id, $name) {
		parent::__construct($simulator, $id, $name);
	}

	/**
	 * Returns the list of data item of this data group.
	 *
	 * @access  public
	 * @return  array The list of data item
	 *
	 */
	public function getDatas() {
		return $this->datas;
	}

	/**
	 * Sets the list of data item of this data group.
	 *
	 * @access  public
	 * @param   array $datas The list of data item
	 * @return  void
	 *
	 */
	public function setDatas($datas) {
		$this->datas = $datas;
	}

	/**
	 * Adds a data to the list of data item of this data group.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Data $data The Data object to add
	 * @return  void
	 *
	 */
	public function addData(Data $data) {
		$this->datas[] = $data;
	}

	/**
	 * Removes a data from the list of data item of this data group.
	 *
	 * @access  public
	 * @param   int $index The index of the data in the list of data item
	 * @return  void
	 *
	 */
	public function removeData($index) {
		$this->datas[$index] = null;
	}

	/**
	 * Retrieves a Data object of this data group by its id.
	 *
	 * @access  public
	 * @param   int $id The data id 
	 * @return  \App\G6K\Model\Data|null The Data object
	 *
	 */
	public function getDataById($id) {
		foreach ($this->datas as $data) {
			if ($data->getId() == $id) {
				return $data;
			}
		}
		return null;
	}

	/**
	 * Retrieves a Data object of this data group by its name.
	 *
	 * @access  public
	 * @param   string $name The data name 
	 * @return  \App\G6K\Model\Data|null The Data object
	 *
	 */
	public function getDataByName($name) {
		foreach ($this->datas as $data) {
			if ($data->getName() == $name) {
				return $data;
			}
		}
		return null;
	}

}

?>
