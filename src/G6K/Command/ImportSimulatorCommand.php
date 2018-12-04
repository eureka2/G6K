<?php

namespace App\G6K\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\Filesystem\Filesystem;

class ImportSimulatorCommand extends Command
{

	/**
	 * @var string
	 */
	private $projectDir;

	/**
	 * The constructor for the 'g6k:simulator:import' command
	 *
	 * @param   string $projectDir The project directory
	 * @access  public
	 */
	public function __construct(string $projectDir) {
		parent::__construct();
		$this->projectDir = $projectDir;
	}

	/**
	 * This function parses the '.env' file to an array of parameters
	 *
	 * @access  private
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  array|false parameters array or false in case of error
	 *
	 */
	private function getParameters(OutputInterface $output) {
		$parameters = array();
		try {
			$dotenv = new Dotenv();
			$dotenv->load($this->projectDir . DIRECTORY_SEPARATOR . '.env');
			$parameters['public_dir'] = $this->getParameterValue('PUBLIC_DIR');
			$parameters['locale'] = $this->getParameterValue('G6K_LOCALE');
			return $parameters;
		} catch (\Exception $e) {
			$output->writeln(sprintf("Unable to get parameters: %s", $e->getMessage()));
			return false;
		}
	}

	/**
	 * Returns the value of a given parameter
	 *
	 * @access  private
	 * @param   string $parameter The parameter
	 * @return  string The value of the parameter
	 *
	 */
	private function getParameterValue($parameter) {
		$value = getenv($parameter);
		$value = str_replace('%kernel.project_dir%', $this->projectDir, $value);
		$value = str_replace('%PUBLIC_DIR%', getenv('PUBLIC_DIR'), $value);
		return $value;
	}

	/**
	 * Retuns the DOMElement at position $index of the DOMNodeList
	 *
	 * @access  private
	 * @param   \DOMNodeList $nodes The DOMNodeList
	 * @param   int $index The position in the DOMNodeList
	 * @return  \DOMElement|null The DOMElement.
	 *
	 */
	private function getDOMElementItem($nodes, $index) {
		$node = $nodes->item($index);
		if ($node && $node->nodeType === XML_ELEMENT_NODE) {
			return $node;
		}
		return null;
	}

	/**
	 * Configures the current command (g6k:simulator:import).
	 *
	 * @access  protected
	 * @return void
	 */
	protected function configure() {
		$this
			// the name of the command (the part after "bin/console")
			->setName('g6k:simulator:import')

			// the short description shown while running "php bin/console list"
			->setDescription('Imports a simulator from an exported xml file.')

			// the full command description shown when running the command with
			// the "--help" option
			->setHelp(
				  "This command allows you to import a simulator and eventually, its stylesheets.\n"
				. "\n"
				. "You must provide:\n"
				. "- the name of the simulator (simulatorname).\n"
				. "- the full path of the directory (simulatorpath) where the XML file of your simulator is located.\n"
				. "and optionaly:\n"
				. "- the full path of the directory (stylesheetpath) where the css file of the stylesheet is located.\n"
				. "\n"
				. "The file names will be composed as follows:\n"
				. "- <simulatorpath>/<simulatorname>.xml for the simulator XML file\n"
				. "- <stylesheetpath>/<simulatorname>.css for the stylesheet file\n"
			)
		;
		$this
			->addArgument('simulatorname', InputArgument::REQUIRED, 'The name of the simulator.')
			->addArgument('simulatorpath', InputArgument::REQUIRED, 'The directory where is located the simulator XML file.')
			->addArgument('stylesheetpath', InputArgument::OPTIONAL , 'The directoty where is located the stylesheet, if any.')
		;
	}

	/**
	 * Executes the current command (g6k:simulator:import).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return int|null null or 0 if everything went fine, or an error code
	 *
	 * @throws LogicException When this abstract method is not implemented
	 *
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		$simupath = $input->getArgument('simulatorpath');
		$simufile = $simupath . DIRECTORY_SEPARATOR . $input->getArgument('simulatorname') . ".xml";
		$csspath = $input->getArgument('stylesheetpath');
		$stylesheet = $csspath ? $csspath . DIRECTORY_SEPARATOR . $input->getArgument('simulatorname') . ".css" : "";
		$output->writeln([
			'Simulator Importer',
			'===================',
			'',
		]);
		if (! file_exists($simufile)) {
			$output->writeln(sprintf("The simulator XML file '%s' doesn't exists", $simufile));
			return 1;
		}
		if (! file_exists($stylesheet)) {
			$output->writeln(sprintf("The stylesheet file '%s' doesn't exists", $stylesheet));
			return 1;
		}
		if (($parameters = $this->getParameters($output)) === false) {
			return 1;
		}
		$output->writeln("Importing the simulator '".$input->getArgument('simulatorname')."' located in '" . $input->getArgument('simulatorpath') . "'");
		$schema = $this->projectDir."/var/doc/Simulator.xsd";
		$simulatorsDir = $this->projectDir . DIRECTORY_SEPARATOR . "var" . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'simulators';
		$assetsDir = $this->projectDir."/".$parameters['public_dir']."/assets";
		$viewsDir = $this->projectDir."/templates";
		$dom = new \DOMDocument();
		$dom->preserveWhiteSpace  = false;
		$dom->formatOutput = true;
		$dom->load($simufile);
		libxml_use_internal_errors(true);
		if (!$dom->schemaValidate($schema)) {
			$errors = libxml_get_errors();
			$mess = "";
			foreach ($errors as $error) {
				$mess .= "Line ".$error->line . '.' .  $error->column . ": " .  $error->message . "\n";
			}
			libxml_clear_errors();
			$output->writeln([
				"XML Validation errors:",
				$mess
			]);
			return 1;
		}
		$fsystem = new Filesystem();
		$xpath = new \DOMXPath($dom);
		$simu = $dom->documentElement->getAttribute('name');
		$view = $dom->documentElement->getAttribute('defaultView');
		if (! $fsystem->exists(array($viewsDir.'/'.$view, $assetsDir.'/'.$view))) {
			$view = 'Demo';
			$dom->documentElement->setAttribute('defaultView', $view);
		}
		$sources = $xpath->query("/Simulator/Sources/Source");
		$len = $sources->length;
		for($i = 0; $i < $len; $i++) {
			$source = $this->getDOMElementItem($sources, $i);
			$datasource = $source->getAttribute('datasource');
			if (is_numeric($datasource)) {
				$source->setAttribute('datasource', $simu);
			}
		}
		$formatted = preg_replace_callback('/^( +)</m', function($a) { 
			return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
		}, $dom->saveXML(null, LIBXML_NOEMPTYTAG));
		$fsystem->dumpFile($simulatorsDir.'/'.$simu.'.xml', $formatted);
		if ($stylesheet != '') {
			if (! $fsystem->exists($assetsDir.'/'.$view.'/css')) {
				$fsystem->mkdir($assetsDir.'/'.$view.'/css');
			}
			$fsystem->copy($stylesheet, $assetsDir.'/'.$view.'/css/'.$simu.'.css', true);
		} else if (! $fsystem->exists($assetsDir.'/'.$view.'/css/'.$simu.'.css')) {
			if ($view == 'Demo') {
				$fsystem->dumpFile($assetsDir.'/'.$view.'/css/'.$simu.'.css', '@import "common.css";'."\n");
			} else {
				if (! $fsystem->exists($assetsDir.'/'.$view.'/css')) {
					$fsystem->mkdir($assetsDir.'/'.$view.'/css');
				}
				$fsystem->copy($assetsDir.'/Demo/css/common.css', $assetsDir.'/'.$view.'/css/'.$simu.'.css');
			}
		}
		$output->writeln(sprintf("The simulator '%s' is successfully imported", $simu));
		return 0;
	}
}
