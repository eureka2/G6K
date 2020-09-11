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

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Translation\Translator;
use Symfony\Component\Translation\Loader\XliffFileLoader;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\Console\Exception\LogicException;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Console\Question\ChoiceQuestion;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Console\Input\ArrayInput;

/**
 * Base class for all command of the g6k namespace.
 *
 */
abstract class CommandBase extends Command
{

	/**
	 * @var string
	 */
	protected $name;

	/**
	 * @var string
	 */
	protected $version;

	/**
	 * @var array|false
	 */
	protected $parameters;

	/**
	 * @var string
	 */
	protected $projectDir;

	/**
	 * @var string
	 */
	protected $publicDir;

	/**
	 * @var \Symfony\Component\Translation\Translator
	 */
	protected $translator;

	/**
	 * @var bool
	 */
	protected $initialized = false;

	/**
	 * @var bool
	 */
	protected $html = false;

	/**
	 * The constructor for the command
	 *
	 * @param   string $projectDir The project directory
	 * @param   string $name The command name
	 * @access  public
	 */
	public function __construct(string $projectDir, $name) {
		parent::__construct();
		$this->projectDir = str_replace('\\', '/', $projectDir);
		$this->name = $name;
		$this->doInitialization();
	}

	/**
	 * Realizes the initialization this command
	 *
	 * @access  private
	 * @return  void
	 *
	 */
	private function doInitialization() {
		if (! $this->initialized) {
			$this->projectDir = $this->projectDir ?? str_replace('\\', '/', dirname(dirname(dirname(__DIR__))));
			$this->version = '4.x';
			$this->parameters = $this->getParameters();
			if ($this->parameters !== false) {
				$this->version = $this->parameters['app_version'] ?? '4.x';
				$translations = $this->projectDir . "/translations/commands." . $this->parameters['app_language'] . ".xlf";
				$this->translator = new Translator($this->parameters['app_language']);
				if (file_exists($translations)) {
					$this->translator->addLoader('xliff', new XliffFileLoader());
					$this->translator->addResource('xliff', $translations, $this->parameters['app_language']);
				}
			}
			$this->initialized = true;
		}
	}

	/**
	 * This function parses the '.env' file and returns an array of parameters
	 *
	 * @access  private
	 * @return  array|false parameters array or false in case of error
	 *
	 */
	private function getParameters() {
		$parameters = array();
		try {
			$dotenv = new Dotenv(true);
			$dotenv->load($this->projectDir.'/.env');
			$parameters['app_env'] = $this->getParameterValue('APP_ENV');
			$parameters['app_version'] = $this->getParameterValue('APP_VERSION');
			$parameters['database_driver'] = 'pdo_' . $this->getParameterValue('DB_ENGINE');
			$parameters['database_host'] = $this->getParameterValue('DB_HOST');
			$parameters['database_port'] = $this->getParameterValue('DB_PORT');
			$parameters['database_name'] = $this->getParameterValue('DB_NAME');
			$parameters['database_user'] = $this->getParameterValue('DB_USER');
			$parameters['database_password'] = $this->getParameterValue('DB_PASSWORD');
			$parameters['database_path'] = $this->getParameterValue('DB_PATH');
			$parameters['database_version'] = $this->getParameterValue('DB_VERSION');
			$parameters['app_locale'] = $this->getParameterValue('APP_LOCALE');
			$parameters['app_language'] = $this->getParameterValue('APP_LANGUAGE');
			$parameters['public_dir'] = $this->getParameterValue('PUBLIC_DIR');
			$parameters['upload_directory'] = $this->getParameterValue('APP_UPLOAD_DIRECTORY');
			return $parameters;
		} catch (\Exception $e) {
			return false;
		}
	}

	/**
	 * Returns the value of a parameter
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
	 * Gets a parameter with its name.
	 *
	 * @access  protected
	 * @param   string $parameter The parameter name
	 * @return  string The parameter value
	 *
	 */
	protected function getConfigParameter($parameter) {
		return $this->parameters[$parameter] ?? null;
	}

	/**
	 * Configures the current command.
	 *
	 * @access  protected
	 * @return void
	 */
	protected function configure() {
		$this->doInitialization();
		$this
			// the name of the command (the part after "bin/console")
			->setName($this->getCommandName())

			// the short description shown while running "php bin/console list"
			->setDescription($this->getCommandDescription())

			// the full command description shown when running the command with
			// the "--help" option
			->setHelp($this->getCommandHelp())
		;
		foreach($this->getCommandArguments() as $argument) {
			$default = $argument[3] ?? null;
			$this->addArgument($argument[0], $argument[1], $argument[2], $default);
		}
		foreach($this->getCommandOptions() as $option) {
			$default = $option[4] ?? null;
			$this->addOption($option[0], $option[1], $option[2], $option[3], $default);
		}
		$this->addOption('html', null, InputOption::VALUE_NONE, $this->translator->trans('Display messages in HTML.'));
	}

	/**
	 * initializes the current command.
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 * @throws \Symfony\Component\Console\Exception\LogicException
	 *
	 */
	protected function initialize(InputInterface $input, OutputInterface $output) {
		if ($this->parameters === false) {
			throw new LogicException("<error>Unable to get parameters</error>");
		}
		$this->publicDir = $this->projectDir . '/' . $this->parameters['public_dir'];
		$this->html = $input->getOption('html') ?? false;
		if ($this->html) {
			$output->writeln([
				'<span class="command-header">',
				$this->translator->trans("G6K version %s%", array('%s%' => $this->version)),
				'</span>',
				"\n",
			]);
		} else {
			$output->writeln([
				$this->translator->trans("G6K version %s%", array('%s%' => $this->version)),
				'',
			]);
		}
	}

	/**
	 * Asks an argument if it's not supplied in the command line.
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   string $argumentName The argument name
	 * @param   string $questionText The question text
	 * @return  void
	 *
	 */
	protected function askArgument(InputInterface $input, OutputInterface $output, string $argumentName, string $questionText) {
		$questionHelper = $this->getHelper('question');
		$argument = $input->getArgument($argumentName);
		if (! $argument) {
			$question = new Question($this->translator->trans($questionText));
			$argument = $questionHelper->ask($input, $output, $question);
			if ($argument !== null) {
				$input->setArgument($argumentName, $argument);
			}
			$output->writeln('');
		}
		if (! $this->html) {
			$output->writeln($argumentName . ' : ' . $argument);
		}
	}

	/**
	 * Executes the current command.
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return int|null null or 0 if everything went fine, or an error code
	 *
	 * @throws \Symfony\Component\Console\Exception\LogicException When this abstract method is not implemented
	 *
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		$this->html = $input->getOption('html') ?? false;
		if ($this->html) {
			$output->write('<span class="command-title">');
			$output->write($this->translator->trans($this->name));
			$output->write("</span>\n");
		} else {
			$io = new SymfonyStyle($input, $output);
			$io->title($this->translator->trans($this->name));
		}
		return 1;
	}

	/**
	 * Run an embedded console command.
	 *
	 * @param   array $command The command
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return bool
	 *
	 */
	protected function runEmbeddedCommand($command, InputInterface $input, OutputInterface $output) {
		$embedded = $this->getApplication()->find($command['command']);
		$command['--no-debug'] = $input->getOption('no-debug');
		$command['--no-interaction'] = $input->getOption('no-interaction');
		$command['--html'] = $input->getOption('html');
		$ainput = new ArrayInput($command);
		$returnCode = $embedded->run($ainput, $output);
		return $returnCode == 0;
	}

	/**
	 * Casts a DOMNode to DOMElement
	 *
	 * @access  protected
	 * @param   \DOMNode $node The DOMNodeList
	 * @return  \DOMElement|null The DOMElement.
	 *
	 */
	protected function castDOMElement($node) : ?\DOMElement {
		if ($node && $node->nodeType === XML_ELEMENT_NODE) {
			return $node;
		}
		return null;
	}

	/**
	 * Retuns the DOMElement at position $index of the DOMNodeList
	 *
	 * @access  protected
	 * @param   \DOMNodeList $nodes The DOMNodeList
	 * @param   int $index The position in the DOMNodeList
	 * @return  \DOMElement|null The DOMElement.
	 *
	 */
	protected function getDOMElementItem($nodes, $index) : ?\DOMElement {
		$node = $nodes->item($index);
		if ($node && $node->nodeType === XML_ELEMENT_NODE) {
			return $node;
		}
		return null;
	}

	/**
	 * Converts a relative path of a file to an absolute path
	 *
	 * @param   string $path The relative path name of the file
	 * @param   string $base The base path
	 * @return  string
	 *
	 */
	protected function resolvePath($path, $base) { 
		$path = str_replace(array('\\', '//'), array('/', '/'), $base . "/" . $path);
		$parts = explode('/', $path);
		$newparts = array();
		foreach($parts as $part) {
			if (preg_match("/^\.+$/", $part)) {
				$n = strlen($part);
				for ($i = 1; $i < $n; $i++) {
					array_pop($newparts);
				}
			} elseif ($part != '') {
				$newparts[] = $part;
			}
		}
		return implode('/', $newparts);
	}

	/**
	 * Finds files in the subdirectories of a giving directory
	 *
	 * @param   string $in The start directory of the search
	 * @param   string $name The base name of the searched file
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   array $filters Optional, filters to apply to the search
	 * @return  array The full path of the files or an empty array if none has been found
	 *
	 */
	protected function findFile(string $in, string $name, InputInterface $input, OutputInterface $output, $filters = []) { 
		$files = array();
		$finder = new Finder();
		$finder->files()->in($in)->name($name);
		if (isset($filters['path'])) {
			$finder->path($filters['path']);
		}
		if (isset($filters['notPath'])) {
			$finder->notPath($filters['notPath']);
		}
		$multiple = isset($filters['multiple']) && $filters['multiple'];
		if ($finder->count() == 0) {
			$this->error($output, "Can not find the file %name% in '%in%'", array('%name%' => $name, '%in%' => $in));
		} elseif ($finder->count() > 1) {
			if ($multiple) {
				foreach($finder as $file) {
					$files[] = str_replace('\\', '/', $file->getRealPath());
				}
			} elseif ($input->isInteractive()) {
				$choices = [];
				foreach($finder as $file) {
					$choices[] = $file->getRelativePathname();
				}
				$helper = $this->getHelper('question');
				$question = new ChoiceQuestion(
					$this->translator->trans($this->name) . ": " . $this->translator->trans("Multiple copies of the file %name% were found in '%in%', please choose one :", array('%name%' => $name, '%in%' => $in)),
					$choices,
					0
				);
				$question->setErrorMessage($this->translator->trans('Your choice %s is invalid.'));
				$choice = $helper->ask($input, $output, $question);
				$this->info($output, "You have just selected: '%s%'", array('%s%' => $choice));
				$files[] = $in . '/' . $choice;
			} else {
				$this->error($output, "Multiple copies of the file %name% were found in '%in%'", array('%name%' => $name, '%in%' => $in));
			}
		} else {
			foreach($finder as $file) {
				$files[] = str_replace('\\', '/', $file->getRealPath());
			}
		}
		return $files;
	}

	/**
	 * Finds the assets directory
	 *
	 * @param   string $in The start directory of the search
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  string|int The full path of the directory or an error code (1: not found, 2: multiple found)
	 *
	 */
	protected function findAssetsDirectory(string $in, InputInterface $input, OutputInterface $output) {
		$assetsDir = '';
		$finder = new Finder();
		$finder->files()->in($in)->path('/admin/js')->name('g6k.admin.js');
		if ($finder->count() == 0) {
			return 1;
		}
		if ($finder->count() > 1) {
			if ($input->isInteractive()) {
				$choices = [];
				foreach($finder as $file) {
					$choices[] = dirname(dirname(dirname($file->getRelativePathname())));
				}
				$helper = $this->getHelper('question');
				$question = new ChoiceQuestion(
					$this->translator->trans($this->name) . ": " . $this->translator->trans("Multiple assets directories were found, please choose one :"),
					$choices,
					0
				);
				$question->setErrorMessage($this->translator->trans('Your choice %s is invalid.'));
				$choice = $helper->ask($input, $output, $question);
				$this->info($output, "You have just selected: '%s%'", array('%s%' => $choice));
				$assetsDir = $in . '/' . $choice;
			} else {
				return 2;
			}
		} else {
			foreach($finder as $file) {
				$assetsDir = str_replace('\\', '/', dirname(dirname(dirname($file->getRealPath()))));
				break;
			}
		}
		return $assetsDir;
	}

	/**
	 * Finds the templates directory
	 *
	 * @param   string $in The start directory of the search
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  string|int The full path of the directory or an error code (1: not found, 2: multiple found)
	 *
	 */
	protected function findTemplatesDirectory(string $in, InputInterface $input, OutputInterface $output) {
		$templatesDir = '';
		$finder = new Finder();
		$finder->files()->in($in)->path('/admin/layout')->name('pagelayout.html.twig');
		if ($finder->count() == 0) {
			return 1;
		}
		if ($finder->count() > 1) {
			if ($input->isInteractive()) {
				$choices = [];
				foreach($finder as $file) {
					$choices[] = dirname(dirname(dirname($file->getRelativePathname())));
				}
				$helper = $this->getHelper('question');
				$question = new ChoiceQuestion(
					$this->translator->trans($this->name) . ": " . $this->translator->trans("Multiple templates directories were found, please choose one :"),
					$choices,
					0
				);
				$question->setErrorMessage($this->translator->trans('Your choice %s is invalid.'));
				$choice = $helper->ask($input, $output, $question);
				$this->info($output, "You have just selected: '%s%'", array('%s%' => $choice));
				$templatesDir = $in . '/' . $choice;
			} else {
				return 2;
			}
		} else {
			foreach($finder as $file) {
				$templatesDir = str_replace('\\', '/', dirname(dirname(dirname($file->getRealPath()))));
				break;
			}
		}
		return $templatesDir;
	}

	/**
	 * Finds the pdf forms directory
	 *
	 * @param   string $in The start directory of the search
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  string|int The full path of the directory or an error code (1: not found, 2: multiple found)
	 *
	 */
	protected function findPDFFormsDirectory(string $in, InputInterface $input, OutputInterface $output) {
		$pdfDir = '';
		$finder = new Finder();
		$finder->directories()->in($in)->path('/data/pdfforms');
		if ($finder->count() == 0) {
			return 1;
		}
		if ($finder->count() > 1) {
			if ($input->isInteractive()) {
				$choices = [];
				foreach($finder as $dir) {
					$choices[] = $dir->getRelativePathname();
				}
				$helper = $this->getHelper('question');
				$question = new ChoiceQuestion(
					$this->translator->trans($this->name) . ": " . $this->translator->trans("Multiple pdf forms directories were found, please choose one :"),
					$choices,
					0
				);
				$question->setErrorMessage($this->translator->trans('Your choice %s is invalid.'));
				$choice = $helper->ask($input, $output, $question);
				$this->info($output, "You have just selected: '%s%'", array('%s%' => $choice));
				$pdfDir = $in . '/' . $choice;
			} else {
				return 1;
			}
		} else {
			foreach($finder as $file) {
				$pdfDir = str_replace('\\', '/', $file->getRealPath());
				break;
			}
		}
		return $pdfDir;
	}

	/**
	 * Finds the simulators directory
	 *
	 * @param   string $in The start directory of the search
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  string|int The full path of the directory or an error code (1: not found, 2: multiple found)
	 *
	 */
	protected function findSimulatorsDirectory(string $in, InputInterface $input, OutputInterface $output) {
		$simulatorsDir = '';
		$finder = new Finder();
		$finder->directories()->in($in)->path('/data/simulators')->notPath('/work');
		if ($finder->count() == 0) {
			return 1;
		}
		if ($finder->count() > 1) {
			if ($input->isInteractive()) {
				$choices = [];
				foreach($finder as $dir) {
					$choices[] = $dir->getRelativePathname();
				}
				$helper = $this->getHelper('question');
				$question = new ChoiceQuestion(
					$this->translator->trans($this->name) . ": " . $this->translator->trans("Multiple simulators directories were found, please choose one :"),
					$choices,
					0
				);
				$question->setErrorMessage($this->translator->trans('Your choice %s is invalid.'));
				$choice = $helper->ask($input, $output, $question);
				$this->info($output, "You have just selected: '%s%'", array('%s%' => $choice));
				$simulatorsDir = $in . '/' . $choice;
			} else {
				return 1;
			}
		} else {
			foreach($finder as $file) {
				$simulatorsDir = str_replace('\\', '/', $file->getRealPath());
				break;
			}
		}
		return $simulatorsDir;
	}

	/**
	 * Returns true, if the message are displayed in HTML, false if not. 
	 *
	 * @return  bool
	 *
	 */
	protected function isHtml() {
		return $this->html;
	}

	/**
	 * Displays an message
	 *
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   string $message The message to display
	 * @param   array $parameters Optional, message parameters for translation
	 * @param   string $start The start tag
	 * @param   string $end The end tag
	 * @param   int $verbosity The verbosity option (default: OutputInterface::VERBOSITY_NORMAL), values : VERBOSITY_QUIET, VERBOSITY_NORMAL, VERBOSITY_VERBOSE, VERBOSITY_VERY_VERBOSE, VERBOSITY_DEBUG
	 * @return  void
	 *
	 */
	private function message(OutputInterface $output, string $message, $parameters = [], string $start = 'info', string $end = 'info', int $verbosity = OutputInterface::VERBOSITY_NORMAL) { 
		$output->write([
			"<".$start.">",
			$this->translator->trans($this->name),
			": ",
			$this->translator->trans($message, $parameters),
			"</".$end.">",
			"\n",
		], false, $verbosity);
	}

	/**
	 * Displays an info message
	 *
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   string $message The message to display
	 * @param   array $parameters Optional, message parameters
	 * @return  void
	 *
	 */
	protected function info(OutputInterface $output, string $message, $parameters = []) {
		if ($this->html) {
			$this->message($output, $message, $parameters, 'span class="alert-light"', 'span');
		} else {
			$this->message($output, $message, $parameters, 'info', 'info');
		}
	}

	/**
	 * Displays a warning message
	 *
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   string $message The message to display
	 * @param   array $parameters Optional, message parameters
	 * @return  void
	 *
	 */
	protected function warning(OutputInterface $output, string $message, $parameters = []) {
		if ($this->html) {
			$this->message($output, $message, $parameters, 'span class="alert-warning"', 'span');
		} else {
			$this->message($output, $message, $parameters, 'fg=magenta;bg=black', '');
		}
	}

	/**
	 * Displays a success message
	 *
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   string $message The message to display
	 * @param   array $parameters Optional, message parameters
	 * @return  void
	 *
	 */
	protected function success(OutputInterface $output, string $message, $parameters = []) { 
		if ($this->html) {
			$this->message($output, $message, $parameters, 'span class="alert-success"', 'span');
		} else {
			$this->message($output, $message, $parameters, 'fg=black;bg=green', '');
		}
	}

	/**
	 * Displays a failure message
	 *
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   string $message The message to display
	 * @param   array $parameters Optional, message parameters
	 * @return  void
	 *
	 */
	protected function failure(OutputInterface $output, string $message, $parameters = []) { 
		if ($this->html) {
			$this->message($output, $message, $parameters, 'span class="alert-danger"', 'span');
		} else {
			$this->message($output, $message, $parameters, 'fg=white;bg=red;options=bold', '');
		}
	}

	/**
	 * Displays an fatal error message
	 *
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   string $message The message to display
	 * @param   array $parameters Optional, message parameters
	 * @return  void
	 *
	 */
	protected function fatal(OutputInterface $output, string $message, $parameters = []) { 
		if ($this->html) {
			$this->message($output, $message, $parameters, 'span class="alert-danger text-lg-left"', 'span');
		} else {
			$this->message($output, $message, $parameters, 'fg=white;bg=red', '');
		}
	}

	/**
	 * Displays an error message
	 *
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   string $message The message to display
	 * @param   array $parameters Optional, message parameters
	 * @return  void
	 *
	 */
	protected function error(OutputInterface $output, string $message, $parameters = []) { 
		if ($this->html) {
			$this->message($output, $message, $parameters, 'span class="alert-danger"', 'span');
		} else {
			$this->message($output, $message, $parameters, 'fg=white;bg=red', '');
		}
	}

	/**
	 * Displays a debug message
	 *
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   string $message The message to display
	 * @param   array $parameters Optional, message parameters
	 * @return  void
	 *
	 */
	protected function debug(OutputInterface $output, string $message, $parameters = []) { 
		$this->message($output, $message, $parameters, 'info', 'info', OutputInterface::VERBOSITY_DEBUG);
	}

	/**
	 * Displays a comment
	 *
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @param   string $message The message to display
	 * @param   array $parameters Optional, message parameters
	 * @return  void
	 *
	 */
	protected function comment(OutputInterface $output, string $message, $parameters = []) { 
		$this->message($output, $message, $parameters, 'comment', 'comment', OutputInterface::VERBOSITY_VERY_VERBOSE);
	}

	/**
	 * Returns the name of the current command 
	 *
	 * @return string The name
	 *
	 */
	abstract protected function getCommandName();


	/**
	 * Returns the description of the current command 
	 *
	 * @return string The description
	 *
	 */
	abstract protected function getCommandDescription();


	/**
	 * Returns the help text of the current command 
	 *
	 * @return string The help text
	 *
	 */
	abstract protected function getCommandHelp();


	/**
	 * Returns the arguments of the current command 
	 *
	 * @return array The help text
	 *
	 */
	abstract protected function getCommandArguments();


	/**
	 * Returns the options of the current command 
	 *
	 * @return array The help text
	 *
	 */
	abstract protected function getCommandOptions();

}
