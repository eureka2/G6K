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

use Symfony\Component\Security\Core\User\UserInterface as CoreUserInterface;

interface UserInterface extends CoreUserInterface
{

	const ROLE_DEFAULT = 'ROLE_USER';
	const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';

	/**
	 * Returns the user unique id.
	 *
	 * @return int
	 */
	public function getId();

	/**
	 * Sets the username.
	 *
	 * @param string $username
	 *
	 */
	public function setUsername(string $username);

	/**
	 * Gets the canonical username in search and sort queries.
	 *
	 * @return string
	 */
	public function getUsernameCanonical();

	/**
	 * Sets the canonical username.
	 *
	 * @param string $usernameCanonical
	 *
	 * @return static
	 */
	public function setUsernameCanonical(string $usernameCanonical);

	/**
	 * @param string|null $salt
	 *
	 * @return static
	 */
	public function setSalt(string $salt);

	/**
	 * Gets email.
	 *
	 * @return string
	 */
	public function getEmail();

	/**
	 * Sets the email.
	 *
	 * @param string $email
	 *
	 * @return static
	 */
	public function setEmail(string $email);

	/**
	 * Gets the canonical email in search and sort queries.
	 *
	 * @return string
	 */
	public function getEmailCanonical();

	/**
	 * Sets the canonical email.
	 *
	 * @param string $emailCanonical
	 *
	 * @return static
	 */
	public function setEmailCanonical(string $emailCanonical);

	/**
	 * Gets the plain password.
	 *
	 * @return string
	 */
	public function getPlainPassword();

	/**
	 * Sets the plain password.
	 *
	 * @param string $password
	 *
	 * @return static
	 */
	public function setPlainPassword(string $password);

	/**
	 * Sets the hashed password.
	 *
	 * @param string $password
	 *
	 * @return static
	 */
	public function setPassword(string $password);

	/**
	 * Tells if the the given user has the super admin role.
	 *
	 * @return bool
	 */
	public function isSuperAdmin();

	/**
	 * @param bool $boolean
	 *
	 * @return static
	 */
	public function setEnabled(?bool $boolean);

	/**
	 * Sets the super admin status.
	 *
	 * @param bool $boolean
	 *
	 * @return static
	 */
	public function setSuperAdmin(?bool $boolean);

	/**
	 * Gets the confirmation token.
	 *
	 * @return string|null
	 */
	public function getConfirmationToken();

	/**
	 * Sets the confirmation token.
	 *
	 * @param string|null $confirmationToken
	 *
	 * @return static
	 */
	public function setConfirmationToken(?string $confirmationToken);

	/**
	 * Gets the timestamp that the user requested a password reset.
	 *
	 * @return null|\DateTimeInterface
	 */
	public function getPasswordRequestedAt();

	/**
	 * Sets the timestamp that the user requested a password reset.
	 *
	 * @param null|\DateTimeInterface $password_requested_at
	 */
	public function setPasswordRequestedAt(?\DateTimeInterface $password_requested_at = null);

	/**
	 * Checks whether the password reset request has expired.
	 *
	 * @param int $ttl Requests older than this many seconds will be considered expired
	 *
	 * @return bool
	 */
	public function isPasswordRequestNonExpired($ttl);

	/**
	 * Gets the last login time.
	 *
	 * @return \DateTimeInterface
	 */
	public function getLastLogin();

	/**
	 * Sets the last login time.
	 *
	 * @param \DateTimeInterface|null $last_login
	 *
	 * @return static
	 */
	public function setLastLogin(?\DateTimeInterface $last_login = null);

	/**
	 * Never use this to check if this user has access to anything!
	 *
	 * Use the AuthorizationChecker, or an implementation of AccessDecisionManager
	 * instead, e.g.
	 *
	 *         $authorizationChecker->isGranted('ROLE_USER');
	 *
	 * @param string $role
	 *
	 * @return bool
	 */
	public function hasRole(string $role);

	/**
	 * Sets the roles of the user.
	 *
	 * This overwrites any previous roles.
	 *
	 * @param array $roles
	 *
	 * @return static
	 */
	public function setRoles(array $roles);

	/**
	 * Adds a role to the user.
	 *
	 * @param string $role
	 *
	 * @return static
	 */
	public function addRole(string $role);

	/**
	 * Removes a role to the user.
	 *
	 * @param string $role
	 *
	 * @return static
	 */
	public function removeRole(string $role);

	public function getEnabled();

	public function isEnabled();

	public function getLocked();

	public function setLocked(?bool $locked);
 
	public function isLocked();
 
	public function isAccountNonLocked();

	public function getExpired();

	public function setExpired(?bool $expired);

	public function isExpired();
	
	public function isAccountNonExpired();

	public function getExpiresAt();

	public function setExpiresAt(?\DateTimeInterface $expires_at);

	public function getCredentialsExpired();

	public function isCredentialsExpired();

	public function isCredentialsNonExpired();

	public function setCredentialsExpired(?bool $credentials_expired);

	public function getCredentialsExpireAt();

	public function setCredentialsExpireAt(?\DateTimeInterface $credentials_expire_at);

	/**
	 * @return string
	 */
	public function __toString();
}
