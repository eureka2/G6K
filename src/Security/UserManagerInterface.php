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

namespace App\Security;

interface UserManagerInterface {

	/**
	 * Creates an empty user instance.
	 *
	 * @return UserInterface
	 */
	public function createUser();

	/**
	 * Deletes a user.
	 *
	 * @param UserInterface $user
	 */
	public function deleteUser(UserInterface $user);

	/**
	 * Updates a user.
	 *
	 * @param UserInterface $user
	 */
	public function updateUser(UserInterface $user);

	/**
	 * Finds one user by the given criteria.
	 *
	 * @param array $criteria
	 *
	 * @return UserInterface|null
	 */
	public function findUserBy(array $criteria);

	/**
	 * Find a user by its username.
	 *
	 * @param string $username
	 *
	 * @return UserInterface|null
	 */
	public function findUserByUsername($username);

	/**
	 * Finds a user by its email.
	 *
	 * @param string $email
	 *
	 * @return UserInterface|null
	 */
	public function findUserByEmail($email);

	/**
	 * Finds a user by its username or email.
	 *
	 * @param string $usernameOrEmail
	 *
	 * @return UserInterface|null
	 */
	public function findUserByUsernameOrEmail($usernameOrEmail);

	/**
	 * Finds a user by its confirmationToken.
	 *
	 * @param string $token
	 *
	 * @return UserInterface|null
	 */
	public function findUserByConfirmationToken($token);

	/**
	 * Returns a collection with all user instances.
	 *
	 * @return \Traversable
	 */
	public function findUsers();
}
