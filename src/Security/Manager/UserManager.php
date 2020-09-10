<?php declare(strict_types=1);

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

namespace App\Security\Manager;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\User;
use App\Security\Util\SecurityFunction;
use App\Security\UserManagerInterface;
use App\Security\UserInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class UserManager implements UserManagerInterface {

	private $entityManager;
	private $passwordEncoder;

	public function __construct(EntityManagerInterface $entityManager, UserPasswordEncoderInterface $passwordEncoder) {
		$this->entityManager = $entityManager;
		$this->passwordEncoder = $passwordEncoder;
	}

	/**
	 * {@inheritdoc}
	 */
	public function findUserBy(array $criteria) {
		return $this->entityManager->getRepository(User::class)->findOneBy($criteria);
	}

	/**
	 * {@inheritdoc}
	 */
	public function findUsers() {
		$users = $this->entityManager->getRepository(User::class)->findAll();

		return $users;
	}

	/**
	 * {@inheritdoc}
	 */
	public function findUserByEmail($email)
	{
		return $this->findUserBy(array('email_canonical' => SecurityFunction::canonicalize($email)));
	}

	/**
	 * {@inheritdoc}
	 */
	public function findUserByUsername($username)
	{
		return $this->findUserBy(array('username_canonical' => SecurityFunction::canonicalize($username)));
	}

	/**
	 * {@inheritdoc}
	 */
	public function findUserByUsernameOrEmail($usernameOrEmail)
	{
		if (preg_match('/^.+\@\S+\.\S+$/', $usernameOrEmail)) {
			$user = $this->findUserByEmail($usernameOrEmail);
			if (null !== $user) {
				return $user;
			}
		}

		return $this->findUserByUsername($usernameOrEmail);
	}

	/**
	 * {@inheritdoc}
	 */
	public function findUserByConfirmationToken($token)
	{
		return $this->findUserBy(array('confirmation_token' => $token));
	}

	/**
	 * {@inheritdoc}
	 */
	public function createUser(): ?\App\Entity\User
	{
		$user = new User();

		return $user;
	}

	/**
	 * {@inheritdoc}
	 */
	public function deleteUser(UserInterface $user)
	{
		$this->entityManager->remove($user);
		$this->entityManager->flush();
	}

	/**
	 * {@inheritdoc}
	 */
	public function updateUser(UserInterface $user, $andFlush = true) : bool
	{
		try {
			$user->setUsernameCanonical(SecurityFunction::canonicalize($user->getUsername()));
			$user->setEmailCanonical(SecurityFunction::canonicalize($user->getEmail()));
			$plainPassword = $user->getPlainPassword();
			if (!empty($plainPassword)) {
				$password = $this->passwordEncoder->encodePassword($user, $plainPassword);
				$user->setPassword($password);
				$user->eraseCredentials();
			}
			$this->entityManager->persist($user);
			if ($andFlush) {
				$this->entityManager->flush();
			}
			return true;
		} catch (\Exception $e) {
			return false;
		}
	}

}
