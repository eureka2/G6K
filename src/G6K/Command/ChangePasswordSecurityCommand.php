<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2020 Jacques Archimède

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
use Symfony\Component\Console\Question\Question;

use App\Security\UserManagerInterface;

use App\Security\Util\SecurityFunction;

/**
 * Changes the password of a user into the users database.
 *
 */
class ChangePasswordSecurityCommand extends CommandBase {

	private $userManager;

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir, UserManagerInterface $userManager) {
		parent::__construct($projectDir, "Changes the password of a user into the users database.");
		$this->userManager = $userManager;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:security:user:password:change';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Changes the password of a user into the users database.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return 
			  $this->translator->trans("This command allows you change the password of a user into the users database.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the username of the user.")."\n"
			. $this->translator->trans("- the new password of the user.")."\n"
		;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandArguments() {
		return [
			[
				'username',
				InputArgument::REQUIRED,
				$this->translator->trans('The username of the user.')
			],
			[
				'password',
				InputArgument::REQUIRED,
				$this->translator->trans('The new password of the user.')
			]
		];
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandOptions() {
		return [
			[
				'skip-strength-validation', 
				's', 
				InputOption::VALUE_NONE, 
				$this->translator->trans('Skip the strength validation of the new password.'),
			]
		];
	}

	/**
	 * Checks the argument of the current command (g6k:security:user:password:change).
	 *
	 * @param   \Symfony\Component\Console\Input\InputInterface $input The input interface
	 * @param   \Symfony\Component\Console\Output\OutputInterface $output The output interface
	 * @return  void
	 *
	 */
	protected function interact(InputInterface $input, OutputInterface $output) {
		$questions = array();
		if (!$input->getArgument('username')) {
			$question = new Question('Please enter an username : ');
			$question->setValidator(function ($username) {
				if (empty($username)) {
					throw new \Exception('The username can not be empty');
				}

				return $username;
			});
			$questions['username'] = $question;
		}
		if (!$input->getArgument('password')) {
			$question = new Question('Please enter the new password : ');
			$question->setValidator(function ($password) {
				if (empty($password)) {
					throw new \Exception('The password can not be empty');
				}

				return $password;
			});
			$question->setHidden(true);
			$questions['password'] = $question;
		}
	   foreach ($questions as $name => $question) {
			$answer = $this->getHelper('question')->ask($input, $output, $question);
			$input->setArgument($name, $answer);
		}
	}

	/**
	 * @inheritdoc
	 */
	protected function execute(InputInterface $input, OutputInterface $output) {
		parent::execute($input, $output);
		$username = $input->getArgument('username');
		$password = $input->getArgument('password');
		$skipValidation = $input->getOption('skip-strength-validation');

		try {
			$user = $this->userManager->findUserByUsername($username);
			if ($user === null) {
				$this->failure($output, "The user '%s%' doesn't exists.", ['%s%' => $username]);
				return 1;
			} else {
				if (! $skipValidation && ! SecurityFunction::isPasswordStrong($password)) {
					$this->failure($output, "User '%s%' : password should be at least 8 characters in length and should include at least one upper case letter, one number, and one special character.", ['%s%' => $username]);
					return 1;
				} else {
					$user->setPlainPassword($password);
					$this->userManager->updateUser($user);
					$this->success($output, "Updated user '%s%' password", ['%s%' => $username]);
					return 0;
				}
			}
		} catch(\Exception $e) {
			$this->failure($output, "The password of the user '%s%' can't be updated. Reason : %r%", ['%s%' => $username, '%r%' => $e->getMessage()]);
			return 1;
		}
	}

}
