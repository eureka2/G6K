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
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Dotenv\Dotenv;
use Symfony\Component\Console\Exception\LogicException;
use Symfony\Component\Console\Question\Question;

/**
 * Base class for all command of the g6k namespace.
 *
 */
abstract class CommandBase extends Command
{

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
	 * The constructor for the command
	 *
	 * @param   string $projectDir The project directory
	 * @access  public
	 */
	public function __construct(string $projectDir) {
		parent::__construct();
		$this->projectDir = $projectDir;
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
			$this->projectDir = $this->projectDir ?? dirname(dirname(dirname(__DIR__)));
			$this->version = '4.x';
			$this->parameters = $this->getParameters();
			if ($this->parameters !== false) {
				$this->version = $this->parameters['app_version'] ?? '4.x';
				$translations = $this->projectDir . "/translations/commands." . $this->parameters['locale'] . ".xlf";
				$this->translator = new Translator($this->parameters['locale']);
				if (file_exists($translations)) {
					$this->translator->addLoader('xliff', new XliffFileLoader());
					$this->translator->addResource('xliff', $translations, $this->parameters['locale']);
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
			$dotenv = new Dotenv();
			$dotenv->load($this->projectDir . DIRECTORY_SEPARATOR . '.env');
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
			$parameters['locale'] = $this->getParameterValue('G6K_LOCALE');
			$parameters['public_dir'] = $this->getParameterValue('PUBLIC_DIR');
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
		$this->publicDir = $this->projectDir . DIRECTORY_SEPARATOR . $this->parameters['public_dir'];
		$output->writeln([
			$this->translator->trans("G6K version %s%", array('%s%' => $this->version)),
			'',
		]);
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
		$output->writeln($argumentName . ' : ' . $argument);
	}

	/**
	 * Executes the current command.
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return int|null null or 0 if everything went fine, or an error code
	 *
	 * @throws \Symfony\Component\Console\Exception\LogicException When this abstract method is not implemented
	 * @throws \Symfony\Component\Filesystem\Exception\IOExceptionInterface 
	 *
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		throw new LogicException($this->translator->trans("execute method is not implemented"));
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

}
