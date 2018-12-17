<?php

/*
The MIT License (MIT)

Copyright (c) 2018 Jacques Archimède

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

namespace App\G6K\Command;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Filesystem\Filesystem;

/**
 * Copies a data source from another instance of G6K.
 *
 * Only data source with a SQLite database can be copied with this command
 */
class CopyDataSourceCommand extends CommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir, "Datasource Copier");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:datasource:copy';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Copies a data source from another instance of G6K.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to copy a data source from another instance of G6K after a fresh installation.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the data source (datasourcename).")."\n"
			. $this->translator->trans("- the full path of the directory (anotherg6kpath) where the other instance of G6K is installed.")."\n"
			. "\n"
			. $this->translator->trans("CAUTION: Only data source with a SQLite database can be copied with this command.")."\n"
		;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandArguments() {
		return array(
			array(
				'datasourcename',
				InputArgument::REQUIRED,
				$this->translator->trans('The name of the datasource.')
			),
			array(
				'anotherg6kpath',
				InputArgument::REQUIRED,
				$this->translator->trans('The installation directory of the other instance of G6K.')
			)
		);
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		return array();
	}

	/**
	 * Checks the argument of the current command (g6k:datasource:copy).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$this->askArgument($input, $output, 'datasourcename', "Enter the name of the datasource : ");
		$this->askArgument($input, $output, 'anotherg6kpath', "Enter the installation directory of the other instance of G6K : ");
		$output->writeln("");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$datasourcename = $input->getArgument('datasourcename');
		$anotherg6kpath = $input->getArgument('anotherg6kpath');
		if (! file_exists($anotherg6kpath)) {
			$this->error($output, "The directory of the other instance '%s%' doesn't exists", array('%s%' => $anotherg6kpath));
			return 1;
		}
		$this->info($output, "Finding the %name%.xml file from the other instance '%s%' in progress", array('%name%' => 'DataSources', '%s%' => $anotherg6kpath));
		$datasources = $this->findFile($anotherg6kpath, 'DataSources.xml', $input, $output, ['notPath' => '/deployment/']);
		if (empty($datasources)) {
			return 1;
		}
		$datasrc1 = $datasources[0];
		$databasesDir1 = dirname($datasrc1);
		$databasesDir2 = $this->projectDir . DIRECTORY_SEPARATOR . "var" . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'databases';
		$datasrc2 = $databasesDir2 . '/DataSources.xml';
		$dom1 = new \DOMDocument();
		$dom1->preserveWhiteSpace  = false;
		$dom1->formatOutput = true;
		$dom1->load($datasrc1);
		$xpath1 = new \DOMXPath($dom1);
		$datasources = $xpath1->query("//DataSource[@name='" . $datasourcename . "']");
		if ($datasources->length == 0) {
			$this->error($output, "The datasource '%datasourcename%' doesn't exists in '%anotherg6kpath%'", array('%datasourcename%' => $datasourcename, '%anotherg6kpath%' => $anotherg6kpath));
			return 1;
		}
		$datasource1 = $this->getDOMElementItem($datasources, 0);
		if (! in_array($datasource1->getAttribute('type'), ['internal','database'])) {
			$this->error($output, "The datasource '%datasourcename%' has a wrong type, only internal or database types are supported.", array('%datasourcename%' => $datasourcename));
			return 1;
		}
		$dom2 = new \DOMDocument();
		$dom2->preserveWhiteSpace  = false;
		$dom2->formatOutput = true;
		$dom2->load($datasrc2);
		$xpath2 = new \DOMXPath($dom2);
		$datasources = $xpath2->query("//DataSource[@name='" . $datasourcename . "']");
		if ($datasources->length > 0) {
			$this->error($output, "The datasource '%datasourcename%' already exists in '%s%'", array('%datasourcename%' => $datasourcename, '%s%' => $datasrc2));
			return 1;
		}
		$databaseId1 = (int)($datasource1->getAttribute('database'));
		$databases = $xpath1->query("//Database[@id='" . $databaseId1 . "']");
		$database1 = $this->getDOMElementItem($databases, 0);
		if ($database1->getAttribute('type') !== 'sqlite') {
			$this->error($output, "The databses of the datasource '%datasourcename%' has a wrong type, only sqlite is supported.", array('%datasourcename%' => $datasourcename));
			return 1;
		}
		$this->info($output, "Copying the datasource '%datasourcename%' from '%anotherg6kpath%'", array('%datasourcename%' => $datasourcename, '%anotherg6kpath%' => $anotherg6kpath));
		$ids = $xpath2->query("//DataSource/@id");
		$maxDataSourceId = 1;
		foreach($ids as $id) {
			if ((int)($id->nodeValue) > $maxDataSourceId) {
				$maxDataSourceId = (int)($id->nodeValue);
			}
		}
		$ids = $xpath2->query("//Database/@id");
		$maxDatabaseId = 1;
		foreach($ids as $id) {
			if ((int)($id->nodeValue) > $maxDatabaseId) {
				$maxDatabaseId = (int)($id->nodeValue);
			}
		}
		$databaseset2 = $this->getDOMElementItem($dom2->getElementsByTagName("Databases"), 0);
		$datasource2 = $this->castDOMElement($dom2->importNode($datasource1, true));
		$datasource2->setAttribute('id', (string)($maxDataSourceId + 1));
		$datasource2->setAttribute('database', (string)($maxDatabaseId + 1));
		$databaseset2->parentNode->insertBefore($datasource2, $databaseset2);
		$database2 = $this->castDOMElement($dom2->importNode($database1, true));
		$database2->setAttribute('id', (string)($maxDatabaseId + 1));
		$databaseset2->appendChild($database2);
		$dbname1 = $this->resolvePath($database2->getAttribute('name'), $databasesDir1);
		$dbname2 = $this->resolvePath($database2->getAttribute('name'), $databasesDir2);
		$fsystem = new Filesystem();
		try {
			$fsystem->copy($dbname1, $dbname2);
		} catch (\Exception $e) {
			$this->error($output, "Error while copying the database '%database%' in '%databasedir%' : '%message%'", array('%database%' => $dbname1, '%databasedir%' => $databasesDir2, '%message%' => $e->getMessage()));
			return 1;
		}
		try {
			$formatted = preg_replace_callback('/^( +)</m', function($a) { 
				return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
			}, $dom2->saveXML(null, LIBXML_NOEMPTYTAG));
			file_put_contents($databasesDir2."/DataSources.xml", $formatted);
		} catch (\Exception $e) {
			$this->error($output, "Error while saving DataSources.xml in '%databasedir%' : %message%", array('%databasedir%' => $databasesDir2, '%message%' => $e->getMessage()));
			return 1;
		}
		$this->success($output, "The data source '%s%' is successfully copied", array('%s%' => $datasourcename));
		return 0;
	}

}
