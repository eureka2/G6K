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
use Symfony\Component\Console\Helper\ProgressBar;
use App\G6K\Manager\DatasourcesHelper;

/**
 * Imports a datasource from an exported json file.
 *
 * This command allows to import a data source used by one or more of your simulators.
 */
class ImportDataSourceCommand extends CommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir, "Datasource Importer");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:datasource:import';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Imports a datasource from an exported json file.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to import a data source used by one or more of your simulators.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the data source (datasourcename).")."\n"
			. $this->translator->trans("- the full path of the directory (datasourcepath) where the files of your data source are located.")."\n"
			. "\n"
			. $this->translator->trans("The file names will be composed as follows:")."\n"
			. $this->translator->trans("- <datasourcepath>/<datasourcename>.schema.json for the schema")."\n"
			. $this->translator->trans("- <datasourcepath>/<datasourcename>.json for the data file")."\n"
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
				'datasourcepath',
				InputArgument::OPTIONAL,
				$this->translator->trans('The directory containing the json schema and data of the data source.')
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
	 * Checks the argument of the current command (g6k:datasource:import).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$this->askArgument($input, $output, 'datasourcename', "Enter the name of the datasource : ");
		$this->askArgument($input, $output, 'datasourcepath', "Enter the full path of the directory where the files of your data source are located : ");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$schemafile = str_replace('\\', '/', $input->getArgument('datasourcepath') . '/' . $input->getArgument('datasourcename') . ".schema.json");
		$datafile = str_replace('\\', '/', $input->getArgument('datasourcepath') . '/' . $input->getArgument('datasourcename') . ".json");
		if (! file_exists($schemafile)) {
			$this->error($output, "The schema file '%s%' doesn't exists", array('%s%' => $schemafile));
			return 1;
		}
		if (! file_exists($datafile)) {
			$this->error($output, "The data file '%s%' doesn't exists", array('%s%' => $datafile));
			return 1;
		}
		$this->info($output, "Importing the datasource '%datasourcename%' located in '%datasourcepath%'", array('%datasourcename%' => $input->getArgument('datasourcename'), '%datasourcepath%' => $input->getArgument('datasourcepath')));
		$databasesDir = $this->projectDir . '/var/data/databases';
		if ($this->parameters['database_driver'] == 'pdo_sqlite') {
			$this->parameters['database_path'] = $databasesDir . '/' . $input->getArgument('datasourcename'). ".db";
		} else {
			$this->parameters['name'] = $input->getArgument('datasourcename');
		}
		$datasrc = $databasesDir . '/DataSources.xml';
		$helper = new DatasourcesHelper(new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true));
		$dsid = 0;
		$currentTable = $progressBar = null;
		$isHtml = $this->isHtml();
		$dom = $helper->makeDatasourceDom($schemafile, $datafile, $this->parameters, $databasesDir, $dsid, $this->translator, function($table, $nrows, $rownum) use ($output, $isHtml, &$currentTable, &$progressBar) {
			if ($currentTable != $table) {
				if ($progressBar !== null) {
					$progressBar->finish();
				}
				$output->writeln("");
				$this->info($output, "Importing table %s%", array('%s%' => $table));
				$currentTable = $table;
				if (! $isHtml){
					$progressBar = new ProgressBar($output, $nrows);
					$progressBar->start();
				}
			} elseif (! $isHtml) {
				$progressBar->advance();
			}
		});
		if ($progressBar !== null) {
			$progressBar->finish();
		}
		$datasources = $dom->saveXML(null, LIBXML_NOEMPTYTAG);
		$dom = new \DOMDocument();
		$dom->preserveWhiteSpace  = false;
		$dom->formatOutput = true;
		$dom->loadXml($datasources);
		$formatted = preg_replace_callback('/^( +)</m', function($a) { 
			return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
		}, $dom->saveXML(null, LIBXML_NOEMPTYTAG));
		file_put_contents($databasesDir."/DataSources.xml", $formatted);
		$output->writeln("");
		$this->success($output, "The data source '%s%' is successfully imported", array('%s%' => $input->getArgument('datasourcename')));
		return 0;
	}
}
