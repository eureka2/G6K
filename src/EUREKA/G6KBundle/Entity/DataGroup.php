<?php

/*
The MIT License (MIT)

Copyright (c) 2015 Jacques Archimède

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

namespace EUREKA\G6KBundle\Entity;

class DataGroup extends DatasetChild {

	private $datas = array();

	public function __construct($simulator, $id, $name) {
		parent::__construct($simulator, $id, $name);
	}

	public function getDatas() {
		return $this->datas;
	}

	public function setDatas($datas) {
		$this->datas = $datas;
	}

	public function addData(Data $data) {
		$this->datas[] = $data;
	}

	public function removeData($index) {
		$this->datas[$index] = null;
	}

	public function getDataById($id) {
		foreach ($this->datas as $data) {
			if ($data->getId() == $id) {
				return $data;
			}
		}
		return null;
	}

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
