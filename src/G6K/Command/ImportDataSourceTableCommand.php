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
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Helper\ProgressBar;
use App\G6K\Manager\Delimited\DelimitedToSQLConverter;

/**
 * Imports a datasource table from an delimited text file.
 *
 * This command allows to import a data source used by one or more of your simulators.
 */
class ImportDataSourceTableCommand extends CommandBase
{

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir) {
		parent::__construct($projectDir, "Datasource Table Importer");
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:datasource:table:import';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Imports a datasource table from an delimited text file.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows you to import a data source table from an delimited text file.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the data source (datasourcename).")."\n"
			. $this->translator->trans("- the name of the table (tablename).")."\n"
			. $this->translator->trans("- the full path (filepath) of the delimited text file.")."\n"
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
				'tablename',
				InputArgument::REQUIRED,
				$this->translator->trans('The name of the table.')
			),
			array(
				'filepath',
				InputArgument::REQUIRED,
				$this->translator->trans('The full path of the delimited text file.')
			)
		);
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		return array(
			array(
				'separator', 
				's', 
				InputOption::VALUE_OPTIONAL, 
				$this->translator->trans("Field separator (default 't' : tabulation for .txt file or ';' for .csv file).")
			),
			array(
				'delimiter', 
				'd', 
				InputOption::VALUE_OPTIONAL, 
				$this->translator->trans('Text field delimiter.'),
				'"'
			),
			array(
				'no-header', 
				null, 
				InputOption::VALUE_NONE, 
				$this->translator->trans('No column header in delimited text file.')
			)
		);
	}

	/**
	 * Checks the argument of the current command (g6k:datasource:table:import).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$this->askArgument($input, $output, 'datasourcename', "Enter the name of the datasource : ");
		$this->askArgument($input, $output, 'tablename', "Enter the name of the table : ");
		$this->askArgument($input, $output, 'filepath', "Enter the full path of the delimited text file : ");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$datasourcename = $input->getArgument('datasourcename');
		$tablename = $input->getArgument('tablename');
		$filepath = str_replace('\\', '/', $input->getArgument('filepath'));
		$separator = $input->getOption('separator') ?? (preg_match("/\.txt$/", $filepath) ? 't' : ';');
		$delimiter = $input->getOption('delimiter');
		$header = $input->getOption('no-header') ? '0' : '1';
		if (! file_exists($filepath)) {
			$this->error($output, "The delimited text file '%s%' doesn't exists", array('%s%' => $filepath));
			return 1;
		}
		$databasesDir = $this->projectDir . '/var/data/databases';
		$datasrc = $databasesDir . '/DataSources.xml';
		$datasources = new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true);
		$dss = $datasources->xpath("/DataSources/DataSource[@name='".$datasourcename."']");
		if ($dss === false || empty($dss)) {
			$this->error($output, "The datasource '%s%' doesn't exists", array('%s%' => $datasourcename));
			return 1;
		}
		$datasource = $dss[0];
		$tables = $datasource->xpath("./Table[@name='".$tablename."']");
		if ($tables === false || empty($tables)) {
			$this->error($output, "The table '%s%' doesn't exists", array('%s%' => $tablename));
			return 1;
		}
		$this->info($output, "Importing the file '%filepath%' into the table '%tablename%'", array('%filepath%' => basename($filepath), '%tablename%' => $tablename));
		$inputs = [
			'datasource-id' => $datasource['id'],
			'table' => $tablename,
			'table-data-file' => $filepath,
			'table-data-separator' => $separator,
			'table-data-delimiter' => $delimiter,
			'table-data-has-header' => $header
		];
		$converter = new DelimitedToSQLConverter($this->parameters, $databasesDir);
		$progressBar = null;
		$isHtml = $this->isHtml();
		try {
			$converter->convert($inputs, $this->translator, function($table, $nrows, $rownum) use ($output, $isHtml, &$progressBar) {
				if (! $isHtml){
					if ($progressBar === null) {
						$progressBar = new ProgressBar($output, $nrows);
						$progressBar->start();
					} else {
						$progressBar->advance();
					}
				}
			});
			if ($progressBar !== null) {
				$progressBar->finish();
			}
		} catch (\Exception $e) {
			$this->error($output, "The table '%table%' can't be imported : %s%", array('%table%' => $tablename, '%s%' => $e->getMessage()));
		}
		$output->writeln("");
		$this->success($output, "The table '%table%' is successfully imported", array('%table%' => $input->getArgument('tablename')));
		return 0;
	}
}
