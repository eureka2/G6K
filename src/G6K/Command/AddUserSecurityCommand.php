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

use App\Security\Util\SecurityFunction;
use App\Security\UserManagerInterface;

/**
 * Adds an user to the users database.
 *
 */
class AddUserSecurityCommand extends CommandBase {

	const AVAILABLE_ROLES = ["super_admin", "admin", "manager", "contributor", "user"];

	private $userManager;

	/**
	 * @inheritdoc
	 */
	public function __construct(string $projectDir, UserManagerInterface $userManager) {
		parent::__construct($projectDir, "Adds a user to the users database.");
		$this->userManager = $userManager;
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandName() {
		return 'g6k:security:user:add';
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandDescription() {
		return $this->translator->trans('Adds a user to the users database.');
	}

	/**
	 * @inheritdoc
	 */
	protected function getCommandHelp() {
		return 
			  $this->translator->trans("This command allows you add an user to the users database.")."\n"
			. "\n"
			. $this->translator->trans("You must provide:")."\n"
			. $this->translator->trans("- the username of the user.")."\n"
			. $this->translator->trans("- the password of the user.")."\n"
			. $this->translator->trans("- the email of the user.")."\n"
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
				$this->translator->trans('The password of the user.')
			],
			[
				'email',
				InputArgument::REQUIRED,
				$this->translator->trans('The email of the user.')
			],
			[
				'roles',
				InputArgument::IS_ARRAY | InputArgument::OPTIONAL,
				$this->translator->trans('The new roles of the user delimited by spaces.')
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
				$this->translator->trans('Skip the strength validation of the password.'),
			],
			[
				'disable', 
				'd', 
				InputOption::VALUE_NONE, 
				$this->translator->trans('Disable the user.'),
			],
			[
				'lock', 
				'l', 
				InputOption::VALUE_NONE, 
				$this->translator->trans('Lock the user.'),
			]
		];
	}

	/**
	 * Checks the argument of the current command (g6k:security:user:add).
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
			$question = new Question('Please enter a password : ');
			$question->setValidator(function ($password) {
				if (empty($password)) {
					throw new \Exception('The password can not be empty');
				}

				return $password;
			});
			$question->setHidden(true);
			$questions['password'] = $question;
		}
		if (!$input->getArgument('email')) {
			$question = new Question('Please enter an email : ');
			$question->setValidator(function ($email) {
				if (empty($email)) {
					throw new \Exception('The email can not be empty');
				}

				return $email;
			});
			$questions['email'] = $question;
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
		$email = $input->getArgument('email');
		$skipValidation = $input->getOption('skip-strength-validation');

		$user = $this->userManager->createUser();
		$user->setUsername($username);

		if (! $skipValidation && ! SecurityFunction::isPasswordStrong($password)) {
			$this->failure($output, "User '%s%' : password should be at least 8 characters in length and should include at least one upper case letter, one number, and one special character.", ['%s%' => $username]);
			return 1;
		}
		$user->setPlainPassword($password);

		$user->setEmail($email);

		$roles = $input->getArgument('roles');
		foreach($roles as $role) {
			if (! in_array($role, self::AVAILABLE_ROLES)) {
				$this->failure($output, "Unknown role '%s%'", ['%s%' => $role]);
				$this->failure($output, "Available roles are : %s%", ['%s%' => implode (", ", self::AVAILABLE_ROLES)]);
				return 1;
			}
		}
		$roles[] = 'user';
		$roles = array_map(function($role) {
			$urole = strtoupper(trim($role));
			if (! preg_match("/^ROLE_/", $urole)) {
				$urole = "ROLE_" . $urole;
			}
			return $urole;
		}, $roles);
		$roles = array_unique($roles);
		$user->setRoles($roles);

		$user->setEnabled(! $input->getOption('disable'));
		$user->setLocked($input->getOption('lock'));
		$user->setExpired(false);
		$user->setCredentialsExpired(false);

		if (! $this->userManager->updateUser($user)) {
			$this->failure($output, "Can't created user '%s%'", ['%s%' => $username]);
			return 1;
		}

		$this->success($output, "Created user '%s%'", ['%s%' => $username]);
		return 0;
	}

}
