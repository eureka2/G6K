<?php

/*
The MIT License (MIT)

Copyright (c) 2017-2018 Jacques Archimède

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
 
namespace App\G6K\Manager;

use App\G6K\Model\Database;
use App\G6K\Manager\DatasourcesHelper;
use App\G6K\Manager\Json\JSONToSQLConverter;

/**
 *
 * This class implements common functions needed for data sources management.
 *
 * @copyright Jacques Archimède
 *
 */
class DatasourcesHelper {

	/**
	 * @var \SimpleXMLElement $datasources The data sources of DataSources.xml 
	 *
	 * @access  private
	 *
	 */
	private $datasources;

	/**
	 * Constructor of class DatasourcesHelper
	 *
	 * @access  public
	 * @param   \SimpleXMLElement $datasources The data sources of DataSources.xml 
	 * @return  void
	 *
	 */
	public function __construct($datasources) {
		$this->datasources = $datasources;
	}

	/**
	 * Creates and returns a DOM XML document from json-schema.org compliant JSON data files and schemas
	 *
	 * @access  public
	 * @param   string $schemafile The path of the JSON schema file
	 * @param   string $datafile The path of the JSON data file
	 * @param   array $parameters The database parameters
	 * @param   string $databasesDir The databases directory
	 * @param   int &$id The ID of the data source
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface|null $translator (default: null) true if the row is to be restored, false otherwise
	 * @param   callable|null $fprogress a function receiving the row number that's inserted
	 * @return  \DOMDocument The XML DOM document
	 *
	 */
	public function makeDatasourceDom($schemafile, $datafile, $parameters, $databasesDir, &$id, $translator = null, $fprogress = null) {
		$converter = new JSONToSQLConverter($parameters, $databasesDir);
		$form = $converter->convert(['schemafile' => $schemafile, 'datafile' => $datafile], $translator, $fprogress);
		$datasource = $this->doCreateDatasource($form);
		$id = $datasource->getAttribute('id');
		$dom = $datasource->ownerDocument;
		$tableid = 1;
		foreach ($form['datasource-tables'] as $tbl) {
			$table = $dom->createElement("Table");
			$table->setAttribute('id', (string)$tableid++);
			$table->setAttribute('name', $tbl['name']);
			$table->setAttribute('label', $tbl['label']);
			$descr = $dom->createElement("Description");
			$descr->appendChild($dom->createCDATASection($tbl['description']));
			$table->appendChild($descr);
			$columnid = 1;
			foreach ($tbl['columns'] as $col) {
				$column = $dom->createElement("Column");
				$column->setAttribute('id', (string)$columnid++);
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
						$choice->setAttribute('id', (string)$choiceid++);
						$choice->setAttribute('value', $ch['value']);
						$choice->setAttribute('label', $ch['label']);
						$choices->appendChild($choice);
					}
					$column->appendChild($choices);
				} elseif (isset($col['source'])) {
					$choices = $dom->createElement("Choices");
					$source = $dom->createElement("Source");
					$source->setAttribute('id', '1');
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

	/**
	 * Creates and returns a data source into a DOM element from a form. 
	 *
	 * @access  public
	 * @param   array $form The form fields
	 * @return  \DOMElement The DOM element
	 *
	 */
	public function doCreateDatasource ($form) {
		$dom = dom_import_simplexml($this->datasources)->ownerDocument;
		$xpath = new \DOMXPath($dom);
		$dss = $xpath->query("/DataSources");
		$dbs = $xpath->query("/DataSources/Databases");
		$type = $form['datasource-type'];
		$ds = $this->convertDOMNodeToDOMElement($dss->item(0))->getElementsByTagName('DataSource');
		$len = $ds->length;
		$maxId = 0;
		for($i = 0; $i < $len; $i++) {
			$id = (int)$this->convertDOMNodeToDOMElement($ds->item($i))->getAttribute('id');
			if ($id > $maxId) {
				$maxId = $id;
			}
		}
		$datasource = $dom->createElement("DataSource");
		$datasource->setAttribute('id', (string)($maxId + 1));
		$datasource->setAttribute('type', $type);
		$datasource->setAttribute('name', $form['datasource-name']);
		$descr = $dom->createElement("Description");
		$descr->appendChild($dom->createCDATASection(preg_replace("/(\<br\>)+$/", "", $form['datasource-description'])));
		$datasource->appendChild($descr);
		switch($type) {
			case 'internal':
			case 'database':
				$db = $this->convertDOMNodeToDOMElement($dbs->item(0))->getElementsByTagName('Database');
				$len = $db->length;
				$maxId = 0;
				for($i = 0; $i < $len; $i++) {
					$id = (int)$this->convertDOMNodeToDOMElement($db->item($i))->getAttribute('id');
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
				$database->setAttribute('id', (string)($maxId + 1));
				$database->setAttribute('type', $dbtype);
				$database->setAttribute('name', $dbname);
				$database->setAttribute('label', $form['datasource-database-label']);
				if ($dbtype == 'mysql' || $dbtype == 'mysqli' || $dbtype == 'pgsql') {
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
				$datasource->setAttribute('uri', $form['datasource-uri']);
				$datasource->setAttribute('method', $form['datasource-method']);
				break;
		}
		$dss->item(0)->insertBefore($datasource, $dbs->item(0));
		return $datasource;
	}

	/**
	 * Creates and returns a database interface
	 *
	 * @access  public
	 * @param   array $parameters The database parameters
	 * @param   int $dbid The database id in DataSources.xml
	 * @param   string $databasesDir The databases directory
	 * @param   bool $withDbName (default: true)  if false the database name is not inserted into the dsn string
	 * @return  \App\G6K\Model\Database The Database object of the databae interface.
	 *
	 */
	public function getDatabase($parameters, $dbid, $databasesDir, $withDbName = true) {
		$databases = $this->datasources->xpath("/DataSources/Databases/Database[@id='".$dbid."']");
		$dbtype = (string)$databases[0]['type'];
		$dbname = (string)$databases[0]['name'];
		$database = new Database(null, $databasesDir, $dbid, $dbtype, $dbname);
		if ((string)$databases[0]['label'] != "") {
			$database->setLabel((string)$databases[0]['label']);
		} else {
			$database->setLabel($dbname);
		}
		if ((string)$databases[0]['host'] != "") {
			$database->setHost((string)$databases[0]['host']);
		}
		if ((string)$databases[0]['port'] != "") {
			$database->setPort((int)$databases[0]['port']);
		}
		if ((string)$databases[0]['user'] != "") {
			$database->setUser((string)$databases[0]['user']);
		}
		if ((string)$databases[0]['password'] != "") {
			$database->setPassword((string)$databases[0]['password']);
		} elseif ((string)$databases[0]['user'] != "") {
			try {
				$user = $parameters['database_user'];
				if ((string)$databases[0]['user'] == $user) {
					$database->setPassword($parameters['database_password']);
				}
			} catch (\Exception $e) {
			}
		}
		$database->connect($withDbName);
		return $database;
	}

	/**
	 * Converts a DOMNode to a DOMElement
	 *
	 * @access  public
	 * @param   \DOMNode $node The DOMNode
	 * @return  \DOMElement|null The DOMElement.
	 *
	 */
	public function convertDOMNodeToDOMElement(\DOMNode $node) {
		if ($node && $node->nodeType === XML_ELEMENT_NODE) {
			return $node;
		}
		return null;
	}

}

?>
