<?php

namespace App\G6K\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Yaml\Yaml;

class ImportViewCommand extends Command
{

	/**
	 * @var string
	 */
	private $projectDir;

	/**
	 * The constructor for the 'g6k:view:import' command
	 *
	 * @param   string $projectDir The project directory
	 * @access  public
	 */
	public function __construct(string $projectDir) {
		parent::__construct();
		$this->projectDir = $projectDir;
	}

	/**
	 * This function parses the '.env' file and returns an array of parameters
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
			$parameters['locale'] = $this->getParameterValue('G6K_LOCALE');
			$parameters['app_env'] = $this->getParameterValue('APP_ENV');
			$parameters['public_dir'] = $this->getParameterValue('PUBLIC_DIR');
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
	 * @param   string $parameter The given parameter
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
	 * Configures the current command (g6k:view:import).
	 *
	 * @access  protected
	 * @return void
	 */
	protected function configure() {
		$this
			// the name of the command (the part after "bin/console")
			->setName('g6k:view:import')

			// the short description shown while running "php bin/console list"
			->setDescription('Creates and optionally imports a view from a previously exported view with G6K.')

			// the full command description shown when running the command with
			// the "--help" option
			->setHelp(
				  "This command allows you to create a view  and optionally import the templates and assets from a previously exported view in .zip files with G6K.\n"
				. "\n"
				. "You must provide:\n"
				. "- the name of the view (viewname).\n"
				. "- the full path of the directory (viewpath) where the .zip files are located.\n"
				. "and optionally:\n"
				. "- the url (viewurl) of the website where this view is used.\n"
				. "The file names will be composed as follows:\n"
				. "- <viewpath>/<viewname>-templates.zip for the compressed twig templates file\n"
				. "- <viewpath>/<viewname>-assets.zip for the compressed assets file\n"
			)
		;
		$this
			->addArgument('viewname', InputArgument::REQUIRED, 'The name of the view.')
			->addArgument('viewpath', InputArgument::REQUIRED, 'The directory where are located the view files.')
			->addArgument('viewurl', InputArgument::OPTIONAL, 'The url of the website where this view is used.')
		;
	}

	/**
	 * Executes the current command (g6k:view:import).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return int|null null or 0 if everything went fine, or an error code
	 *
	 * @throws LogicException When this abstract method is not implemented
	 *
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		$view = $input->getArgument('viewname');
		$viewpath = $input->getArgument('viewpath');
		$viewurl = $input->getArgument('viewurl');
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
		if ($viewurl && ! filter_var($viewurl, FILTER_VALIDATE_URL, FILTER_FLAG_HOST_REQUIRED)) {
			$output->writeln(sprintf("The url of the website '%s' isn't valid", $viewurl));
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
			$this->migrate3To4($templatesDir . DIRECTORY_SEPARATOR . $view);
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
				$output->writeln(sprintf("The view '%s' is partially created", $view));
				return 1;
			}
		}
		if ($viewurl) {
			try {
				$configFile = $this->projectDir . DIRECTORY_SEPARATOR . 'config'. DIRECTORY_SEPARATOR . "packages". DIRECTORY_SEPARATOR . "g6k.yml";
				$domain = parse_url ($viewurl, PHP_URL_HOST);
				$domain = preg_replace("/^www\./", "", $domain);
				if ($domain !== null) {
					$config = file_get_contents($configFile);
					$yaml = Yaml::parse($config);
					$updated = false;
					if (! isset( $yaml['parameters']['domainview'][$domain])) {
						$config = preg_replace("/^(    domainview:)/m", "$1\n        ".$domain.": ".$view, $config);
						$updated = true;
					}
					if (! isset($yaml['parameters']['viewpath'][$view])) {
						$config = preg_replace("/^(    viewpath:)/m", "$1\n        ".$view.": ".$viewurl, $config);
						$updated = true;
					}
					if ($updated) {
						file_put_contents($configFile, $config);
					}
				}
			} catch (Exception $e) {
				$output->writeln(sprintf("Error while updating '%s' for '%s' : %s", $configFile, $view, $e->getMessage()));
				$output->writeln(sprintf("The view '%s' is partially created", $view));
				return 1;
			}
		}
		$output->writeln(sprintf("The view '%s' is successfully created", $view));
		return 0;
	}

	/**
	 * Migrates the templates written for Symfony 2 or 3.
	 *
	 * @param   string $dir The templates directory
	 * @return void
	 *
	 */
	private function migrate3To4($dir) {
		$finder = new Finder();
		$finder->files()->in($dir)->name('/\.twig$/');
		foreach ($finder as $file) {
			$path = $file->getRealPath();
			$content = file_get_contents($path);
			$content = preg_replace("/EUREKAG6KBundle:([^:]+):/m", "$1/", $content);
			$content = preg_replace("|asset\('bundles/eurekag6k/|m", "asset('assets/", $content);
			$content = preg_replace("|asset\('assets/base/js/|m", "asset('assets/base/js/libs/", $content);
			$content = preg_replace("|asset\('assets/base/js/libs/g6k\.|m", "asset('assets/base/js/g6k.", $content);
			$content = preg_replace("|asset\('assets/admin/js/|m", "asset('assets/admin/js/libs/", $content);
			$content = preg_replace("|asset\('assets/admin/js/libs/g6k\.|m", "asset('assets/admin/js/g6k.", $content);
			file_put_contents($path, $content);
		}
	}

}