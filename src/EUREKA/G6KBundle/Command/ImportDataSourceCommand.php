<?php

namespace EUREKA\G6KBundle\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Yaml\Exception\ParseException;
use Symfony\Component\Console\Helper\ProgressBar;
use EUREKA\G6KBundle\Manager\DatasourcesHelper;

class ImportDataSourceCommand extends Command
{

	/**
	 * @var string
	 */
	private $projectDir;

	/**
	 * The constructor for the 'g6k:import-datasource' command
	 *
	 * @param   string $rootDir The root directory
	 * @access  public
	 */
	public function __construct(string $rootDir) {
		parent::__construct();
		$this->projectDir = dirname($rootDir);
	}

	/**
	 * This function parses the 'parameters.yml' file and returns an array of parameters
	 *
	 * @access  private
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  array|false parameters array or false in case of error
	 *
	 */
	private function getParameters(OutputInterface $output) {
		try {
			$config = Yaml::parse(file_get_contents($this->projectDir . DIRECTORY_SEPARATOR . 'app' . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . 'parameters.yml'));
			return $config['parameters'];
		} catch (ParseException $e) {
			$output->writeln(sprintf("Unable to parse parameters.yml: %s", $e->getMessage()));
			return false;
		}
	}

	/**
	 * Configures the current command (g6k:import-datasource).
	 *
	 * @access  protected
	 * @return void
	 */
	protected function configure() {
		$this
			// the name of the command (the part after "bin/console")
			->setName('g6k:import-datasource')

			// the short description shown while running "php bin/console list"
			->setDescription('Imports a datasource from an exported json file.')

			// the full command description shown when running the command with
			// the "--help" option
			->setHelp(
				  "This command allows you to import a data source used by one or more of your simulators.\n"
				. "\n"
				. "You must provide:\n"
				. "- the name of the data source (datasourcename).\n"
				. "- the full path of the directory (datasourcepath) where the files of your data source are located.\n"
				. "\n"
				. "The file names will be composed as follows:\n"
				. "- <datasourcepath>/<datasourcename>.schema.json for the schema\n"
				. "- <datasourcepath>/<datasourcename>.json for the data file\n"
			)
		;
		$this
			// configure an argument
			->addArgument('datasourcename', InputArgument::REQUIRED, 'The name of the datasource.')
			->addArgument('datasourcepath', InputArgument::REQUIRED, 'The directoty.')
		;
	}

	/**
	 * Executes the current command (g6k:import-datasource).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return int|null null or 0 if everything went fine, or an error code
	 *
	 * @throws LogicException When this abstract method is not implemented
	 *
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		$schemafile = $input->getArgument('datasourcepath') . DIRECTORY_SEPARATOR . $input->getArgument('datasourcename') . ".schema.json";
		$datafile = $input->getArgument('datasourcepath') . DIRECTORY_SEPARATOR . $input->getArgument('datasourcename') . ".json";
		$output->writeln([
			'Datasource Importer',
			'===================',
			'',
		]);
		if (! file_exists($schemafile)) {
			$output->writeln(sprintf("The schema file '%s' doesn't exists", $schemafile));
			return 1;
		}
		if (! file_exists($datafile)) {
			$output->writeln(sprintf("The data file '%s' doesn't exists", $datafile));
			return 1;
		}
		if (($parameters = $this->getParameters($output)) === false) {
			return 1;
		}
		$output->writeln("Importing the datasource '".$input->getArgument('datasourcename')."' located in '" . $input->getArgument('datasourcepath') . "'");
		$databasesDir = $this->projectDir . "/src/EUREKA/G6KBundle/Resources/data/databases";
		if ($parameters['database_driver'] == 'pdo_sqlite') {
			$parameters['database_path'] = $databasesDir . DIRECTORY_SEPARATOR . $input->getArgument('datasourcename'). ".db";
		} else {
			$parameters['name'] = $input->getArgument('datasourcename');
		}
		$datasrc = $databasesDir . '/DataSources.xml';
		$helper = new DatasourcesHelper(new \SimpleXMLElement($datasrc, LIBXML_NOWARNING, true));
		$dsid = 0;
		$currentTable = $progressBar = null;
		$dom = $helper->makeDatasourceDom($schemafile, $datafile, $parameters, $databasesDir, $dsid, function($table, $nrows, $rownum) use ($output, &$currentTable, &$progressBar) {
			if ($currentTable != $table) {
				if ($progressBar !== null) {
					$progressBar->finish();
				}
				$output->writeln("\nUpdating table " . $table);
				$currentTable = $table;
				$progressBar = new ProgressBar($output, $nrows);
				$progressBar->start();
			} else {
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
		$output->writeln(sprintf("\nThe data source '%s' is successfully imported", $input->getArgument('datasourcename')));
		return 0;
	}
}
