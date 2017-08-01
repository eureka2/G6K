<?php

/*
The MIT License (MIT)

Copyright (c) 2017 Jacques Archimède

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
 
namespace EUREKA\G6KBundle\Manager;

use EUREKA\G6KBundle\Manager\Json\JSONToSQLConverter;

class DatasourcesHelper {

	private $datasources;

	public function __construct($datasources) {
		$this->datasources = $datasources;
	}

	public function makeDatasourceDom($name, $schemafile, $datafile, $parameters, $databasesDir) {
		$converter = new JSONToSQLConverter($parameters, $databasesDir);
		$form = $converter->convert($name, $schemafile, $datafile);
		$datasource = $this->doCreateDatasource($form);
		$dom = $datasource->ownerDocument;
		$tableid = 1;
		foreach ($form['datasource-tables'] as $tbl) {
			$table = $dom->createElement("Table");
			$table->setAttribute('id', $tableid++);
			$table->setAttribute('name', $tbl['name']);
			$table->setAttribute('label', $tbl['label']);
			$descr = $dom->createElement("Description");
			$descr->appendChild($dom->createCDATASection($tbl['description']));
			$table->appendChild($descr);
			$columnid = 1;
			foreach ($tbl['columns'] as $col) {
				$column = $dom->createElement("Column");
				$column->setAttribute('id', $columnid++);
				$column->setAttribute('name', $col['name']);
				$column->setAttribute('type', $col['type']);
				$column->setAttribute('label', $col['label']);
				$descr = $dom->createElement("Description");
				$descr->appendChild($dom->createCDATASection($col['description']));
				$column->appendChild($descr);
				if (isset($col['choices'])) {
					$choices = $dom->createElement("Choices");
					$choiceid = 1;
					foreach ($col['choices'] as $ch) {
						$choice = $dom->createElement("Choice");
						$choice->setAttribute('id', $choiceid++);
						$choice->setAttribute('value', $ch['value']);
						$choice->setAttribute('label', $ch['label']);
						$choices->appendChild($choice);
					}
					$column->appendChild($choices);
				} elseif (isset($col['source'])) {
					$choices = $dom->createElement("Choices");
					$source = $dom->createElement("Source");
					$source->setAttribute('id', 1);
					$source->setAttribute('datasource', $col['source']['datasource']);
					if (isset($col['source']['request'])) {
						$source->setAttribute('request', $col['source']['request']);
					}
					$source->setAttribute('returnType', $col['source']['returnType']);
					if (isset($col['source']['returnPath'])) {
						$source->setAttribute('returnPath', $col['source']['returnPath']);
					}
					$source->setAttribute('valueColumn', $col['source']['valueColumn']);
					$source->setAttribute('labelColumn', $col['source']['labelColumn']);
					$choices->appendChild($source);
					$column->appendChild($choices);
				}
				$table->appendChild($column);
			}
			$datasource->appendChild($table);
		}
		return $dom;
	}

	public function doCreateDatasource ($form) {
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$dss = $xpath->query("/DataSources");
		$dbs = $xpath->query("/DataSources/Databases");
		$type = $form['datasource-type'];
		$ds = $dss->item(0)->getElementsByTagName('DataSource');
		$len = $ds->length;
		$maxId = 0;
		for($i = 0; $i < $len; $i++) {
			$id = (int)$ds->item($i)->getAttribute('id');
			if ($id > $maxId) {
				$maxId = $id;
			}
		}
		$datasource = $dom->createElement("DataSource");
		$datasource->setAttribute('id', $maxId + 1);
		$datasource->setAttribute('type', $type);
		$datasource->setAttribute('name', $form['datasource-name']);
		$descr = $dom->createElement("Description");
		$descr->appendChild($dom->createCDATASection(preg_replace("/(\<br\>)+$/", "", $form['datasource-description'])));
		$datasource->appendChild($descr);
		switch($type) {
			case 'internal':
			case 'database':
				$db = $dbs->item(0)->getElementsByTagName('Database');
				$len = $db->length;
				$maxId = 0;
				for($i = 0; $i < $len; $i++) {
					$id = (int)$db->item($i)->getAttribute('id');
					if ($id > $maxId) {
						$maxId = $id;
					}
				}
				$dbtype = $form['datasource-database-type'];
				$dbname = $form['datasource-database-name'];
				if ($dbtype == 'sqlite' && ! preg_match("/\.db$/", $dbname)) {
					$dbname .= '.db';
				}
				$database = $dom->createElement("Database");
				$database->setAttribute('id', $maxId + 1);
				$database->setAttribute('type', $dbtype);
				$database->setAttribute('name', $dbname);
				$database->setAttribute('label', $form['datasource-database-label']);
				if ($dbtype == 'mysqli' || $dbtype == 'pgsql') {
					$database->setAttribute('host', $form['datasource-database-host']);
					$database->setAttribute('port', $form['datasource-database-port']);
					$database->setAttribute('user', $form['datasource-database-user']);
					if (isset($form['datasource-database-password'])) {
						$database->setAttribute('password', $form['datasource-database-password']);
					}
				}
				$dbs->item(0)->appendChild($database);
				$datasource->setAttribute('database', $database->getAttribute('id'));
				break;
			case 'uri':
				$datasource->setAttribute('uri', $form['datasource-name']);
				$datasource->setAttribute('method', $form['datasource-method']);
				break;
		}
		$dss->item(0)->insertBefore($datasource, $dbs->item(0));
		return $datasource;
	}

}

?>
