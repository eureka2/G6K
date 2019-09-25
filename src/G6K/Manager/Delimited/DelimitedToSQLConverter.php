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

namespace App\G6K\Manager\Delimited;

use App\G6K\Manager\SQLConverterBase;

/**
 * This class allows the conversion of a json-schema.org compliant JSON database and exported from G6K to a SQL database
 *
 * @copyright Jacques Archimède
 *
 */
class DelimitedToSQLConverter extends SQLConverterBase {

	/**
	 * Imports a delimited text file into a table of a data source and returns an array descriptor of the table
	 *
	 * @access  public
	 * @param   array $inputs An associative array containing the schema and data file names
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @param   callable|null $fprogress a function receiving the row number that's inserted
	 * @return  array The array descriptor of the SQL database
	 * @throws \Exception
	 *
	 */
	public function convert($inputs, $translator = null, $fprogress = null) {
		$dsid = $inputs['datasource-id'];
		$table = $inputs['table'];
		$file = $inputs['table-data-file'];
		$separator = $inputs['table-data-separator'] ?? 't';
		if ($separator == 't') {
			$separator = "\t";
		}
		$delimiter = $inputs['table-data-delimiter'] ?? ';';
		$hasheader = isset($inputs["table-data-has-header"]) && $inputs["table-data-has-header"] == "1";
		$database = $this->getDatabase($dsid, $this->datasources, $this->databasesDir);
		$infosColumns = $this->infosColumns($this->datasources, $database, $table);
		$descriptor = $this->infosColumnsToForm($table, $infosColumns);
		if (($handle = fopen($file, 'r')) !== FALSE) {
			$header = $hasheader ? NULL : array_filter(array_keys($infosColumns), function($k) {
				return $k != 'id';
			});
			$rownum = 0;
			$nrows = count(file($file));
			while (($row = fgetcsv($handle, 0, $separator, $delimiter)) !== FALSE) {
				if (!empty($row) && $row[0] !== null) { // hack for csv mac
					$rownum++;
					if(!$header) {
						$header = $row;
						foreach ($header as $name) {
							if (!isset($infosColumns[$name])) {
								$error = $translator === null ?
										sprintf("Unknown column name : %s", $name) :
										$translator->trans("Unknown column name : %name%", ['%name%' => $name]);
								throw new \Exception($error);
							}
						}
					} else {
						$data = array_combine($header, $row);
						$data['id'] = '0';
						if (($result = $this->insertRowIntoTable($data, $table, $infosColumns, $database, $translator)) !== true) {
							throw new \Exception($result);
						}
						if ($fprogress !== null) {
							call_user_func($fprogress, $table, $nrows, $rownum);
						}
					}
				}
			}
			fclose($handle);
		}
		return $descriptor;
	}
}

?>
