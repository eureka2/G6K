<?php

namespace App\G6K\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;

class ImportViewCommand extends Command
{

	/**
	 * @var string
	 */
	private $projectDir;

	public function __construct(string $projectDir) {
		parent::__construct();
		$this->projectDir = $projectDir;
	}

	/**
	 * This function parses the '.env' file and returns an array parameters
	 *
	 * @access  private
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
			$output->writeln(sprintf("Unable to get database parameters: %s", $e->getMessage()));
			return false;
		}
	}

	/**
	 * Returns the value of a given parameter
	 *
	 * @access  private
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
	 * Configures the current command.
	 *
	 * @access  protected
	 * @return void
	 */
	protected function configure() {
		$this
			// the name of the command (the part after "bin/console")
			->setName('g6k:import-view')

			// the short description shown while running "php bin/console list"
			->setDescription('Creates and optionally imports a view from a previously exported view with G6K.')

			// the full command description shown when running the command with
			// the "--help" option
			->setHelp(
				  "This command allows you to create a view  and optionally import the templates and assets from a previously exported view in .zip files with G6K.\n"
				. "\n"
				. "You must provide:\n"
				. "- the name of the view (viewname).\n"
				. "and optionally:\n"
				. "- the full path of the directory (viewpath) where the .zip files are located.\n"
				. "The file names will be composed as follows:\n"
				. "- <viewpath>/<viewname>-templates.zip for the compressed twig templates file\n"
				. "- <viewpath>/<viewname>-assets.zip for the compressed assets file\n"
			)
		;
		$this
			->addArgument('viewname', InputArgument::REQUIRED, 'The name of the view.')
			->addArgument('viewpath', InputArgument::OPTIONAL, 'The directory where are located the view files.')
		;
	}

	/**
	 * Executes the current command.
	 *
	 * @return int|null null or 0 if everything went fine, or an error code
	 *
	 * @throws LogicException When this abstract method is not implemented
	 *
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		$view = $input->getArgument('viewname');
		$viewpath = $input->getArgument('viewpath');
		$templates = $viewpath ? $viewpath . DIRECTORY_SEPARATOR . $view . "-templates.zip" : "";
		$assets = $viewpath ? $viewpath . DIRECTORY_SEPARATOR . $view . "-assets.zip" : "";
		$output->writeln([
			'View Importer',
			'===================',
			'',
		]);
		if ($templates != '' && ! file_exists($templates)) {
			$output->writeln(sprintf("The compressed templates file '%s' doesn't exists", $templates));
			return 1;
		}
		if ($assets != '' && ! file_exists($assets)) {
			$output->writeln(sprintf("The compressed assets file '%s' doesn't exists", $assets));
			return 1;
		}
		if (($parameters = $this->getParameters($output)) === false) {
			return 1;
		}
		if ($viewpath) {
			$output->writeln("Importing the view '".$view."' located in '" . $viewpath . "'");
		} else {
			$output->writeln("Creating the view '".$view."' from the Default view");
		}
		$fsystem = new Filesystem();
		$templatesDir = $this->projectDir . DIRECTORY_SEPARATOR . "templates";
		$assetsDir = $this->projectDir . DIRECTORY_SEPARATOR . $parameters['public_dir']. DIRECTORY_SEPARATOR . "assets";
		$archive = new \ZipArchive();
		if ($templates != '') {
			$archive->open($templates, \ZipArchive::CHECKCONS);
			$extract = array();
			for( $i = 0; $i < $archive->numFiles; $i++ ){
				$info = $archive->statIndex( $i );
				if (preg_match("/\.twig$/", $info['name'])) { // keep only twig files
					array_push($extract, $info['name']);
				}
			}
			$archive->extractTo($templatesDir . DIRECTORY_SEPARATOR . $view, $extract);
			$archive->close();
		} else {
			try {
				$fsystem->mkdir($templatesDir . DIRECTORY_SEPARATOR . $view);
				if ($fsystem->exists($templatesDir . DIRECTORY_SEPARATOR . 'Default')) {
					$fsystem->mirror($templatesDir . DIRECTORY_SEPARATOR . 'Default', $templatesDir . DIRECTORY_SEPARATOR . $view);
				}
			} catch (IOExceptionInterface $e) {
				$output->writeln(sprintf("Error while creating '%s' in '%s' : %s", $view, $templatesDir, $e->getMessage()));
				return 1;
			}
		}
		if ($assets != '') {
			$archive->open($assets, \ZipArchive::CHECKCONS);
			$archive->extractTo($assetsDir . DIRECTORY_SEPARATOR . $view);
			$archive->close();
		} else {
			try {
				$fsystem->mkdir($assetsDir . DIRECTORY_SEPARATOR . $view);
				if ($fsystem->exists($assetsDir . DIRECTORY_SEPARATOR . 'Default')) {
					$fsystem->mirror($assetsDir . DIRECTORY_SEPARATOR . 'Default', $assetsDir . DIRECTORY_SEPARATOR . $view);
				}
			} catch (IOExceptionInterface $e) {
				$output->writeln(sprintf("Error while creating '%s' in '%s' : %s", $view, $assetsDir, $e->getMessage()));
				return 1;
			}
		}
		$output->writeln(sprintf("The view '%s' is successfully created", $view));
		return 0;
	}
}
