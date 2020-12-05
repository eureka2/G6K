<?php

/*
The MIT License (MIT)

Copyright (c) 2018-2019 Jacques Archimède

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

use App\G6K\Manager\Api\Scripter;
use App\G6K\Manager\Api\JSONApi;

use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Finder\Finder;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

/**
 * Generates JavaScript and markup files for one or all simulators for API usage.
 *
 * This command allows to generate the JavaScript and markup files for one or all simulators for API usage.
 */
class GenerateSimulatorApiCommand extends CommandBase
{

	/**
	 * @var \Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface
	 */
	protected $parameterBag = false;

	/**
	 * @var string
	 */
	protected $publicDir = '';

	/**
	 * @inheritdoc
	 */
	public function __construct(ParameterBagInterface $parameterBag, string $projectDir, string $publicDir) {
		parent::__construct($projectDir, "Generator of files for the simulator API");
		$this->parameterBag = $parameterBag;
		$this->publicDir = $publicDir;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:simulator:api:generate';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Generates JsonApi and JavaScript files for one or all simulators for API usage.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return
			  $this->translator->trans("This command allows to generate the JsonApi and JavaScript files for one or all simulators for API usage.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the name of the simulator (simulatorname).")."\n"
			. $this->translator->trans("and optionally:")."\n"
			. $this->translator->trans("- the output directory (outputdir) of the generated files.")."\n"
			. "\n"
			. $this->translator->trans("To generate the files for all simulators, enter 'all' as simulator name.")."\n"
			. $this->translator->trans("In this case, one or more simulators can be excluded with the --exclude (-x) option.")."\n"
		;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandArguments() {
		return array(
			array(
				'simulatorname',
				InputArgument::REQUIRED,
				$this->translator->trans("The name of the simulator or 'all'.")
			),
			array(
				'outputdir',
				InputArgument::OPTIONAL,
				$this->translator->trans("The output directory of the generated files.")
			)
		);
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		return array(
			array(
				'exclude', 
				'x', 
				InputOption::VALUE_OPTIONAL|InputOption::VALUE_IS_ARRAY, 
				$this->translator->trans("One or more simulators to exclude when <simulatorname> is 'all'."),
			),
			array(
				'json-api', 
				'a', 
				InputOption::VALUE_NONE, 
				$this->translator->trans('Generates JsonApi file only.'),
			)
		);
	}

	/**
	 * Checks the argument of the current command (g6k:simulator:api:generate).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$this->askArgument($input, $output, 'simulatorname', "Enter the name of the simulator : ");
		$output->writeln("");
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$simulatorname = $input->getArgument('simulatorname');
		try {
			$api = $this->parameterBag->get('api');
		} catch (\Exception $e) {
			$api = null;
		}
		if (null === $api || ! is_array($api)) {
			$this->error(
				$output,
				"No simulator can be used via the API"
			);
			return 1;
		}
		if ($simulatorname != 'all' && !in_array($simulatorname, $api)) {
			$this->error(
				$output,
				"The simulator '%simulatorname%' can't be used via the API",
				[ '%simulatorname%' => $simulatorname ]
			);
			return 1;
		}
		$scriptsDirOut = $input->getArgument('outputdir');
		$simulatorsDir = $this->projectDir . '/var/data/simulators';
		$jsonApionly = $input->getOption('json-api') ?? false;
		$exclude = $input->getOption('exclude') ?? [];
		$simulators = [];
		if ($simulatorname == 'all') {
			$finder = new Finder();
			$finder->files()->in($simulatorsDir)->depth('== 0')->name('*.xml');
			foreach ($finder as $file) {
				$name = preg_replace("/.xml$/", "", basename($file->getRelativePathname()));
				if (!in_array($name, $exclude) && in_array($name, $api)) {
					$simulators[] = $name;
				}
			}
		} else {
			$simulators[] = $simulatorname;
		}
		$oneOk = false;
		foreach ($simulators as $simulatorname) {
			if ($this->generate($simulatorname, $simulatorsDir, $jsonApionly, $scriptsDirOut, $input, $output)) {
				$this->success(
					$output,
					"The api files for the simulator '%simulatorname%' are successfully generated",
					[ '%simulatorname%' => $simulatorname ]
				);
				$oneOk = true;
			}
		}
		return $oneOk ? 0 : 1;
	}

	private function generate(string $simulatorname, string $simulatorsDir, bool $jsonApionly, ?string $scriptsDirOut, InputInterface $input, OutputInterface $output) {
		$simufile = $simulatorsDir.'/'.$simulatorname.'.xml';
		if (!file_exists($simufile)) {
			$this->error(
				$output,
				"The simulator XML file '%s%' doesn't exists",
				[ '%s%' => $simufile ]
			);
			return false;
		}
		try {
			if (!$jsonApionly) {
				$this->generateScript($simulatorname, $scriptsDirOut);
			}
			$this->generateJSONAPI($simulatorname, $scriptsDirOut);
			return true;
		} catch (\Exception $e) {
			$this->error(
				$output,
				"The api files for the simulator '%s%' can't be generated, reason : %r%", [
					'%s%' => $simulatorname,
					'%r%' => $e->getMessage()
				]
			);
			return false;
		}
	}

	private function generateScript(string $simulatorname, ?string $scriptsDirOut) {
		$scripter = new Scripter($this->projectDir, $this->publicDir, $scriptsDirOut);
		$scripter->setSimulator($simulatorname);
		$scripter->run();
		$scripter->save();
	}

	private function generateJSONAPI(string $simulatorname, ?string $apiDirOut) {
		$jsonapi = new JSONApi($this->projectDir, $apiDirOut);
		$jsonapi->setSimulator($simulatorname);
		$jsonapi->run();
		$jsonapi->save();
	}

}
