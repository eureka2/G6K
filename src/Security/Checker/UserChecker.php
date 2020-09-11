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
 
namespace App\Security\Checker;

use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use App\Entity\User;
use App\Security\Exception\LockedAccountException;
use App\Security\Exception\DisabledAccountException;
use App\Security\Exception\ExpiredAccountException;
use App\Security\Exception\ExpiredCredentialsException;

/**
 * UserChecker checks the user account flags.
 */
class UserChecker implements UserCheckerInterface
{
	/**
	 * {@inheritdoc}
	 */
	public function checkPreAuth(UserInterface $user)
	{
		if (!$user instanceof User) {
			return;
		}

		if (!$user->isAccountNonLocked()) {
			$ex = new LockedAccountException();
			$ex->setUser($user);
			throw $ex;
		}

		if (!$user->isEnabled()) {
			$ex = new DisabledAccountException();
			$ex->setUser($user);
			throw $ex;
		}

		if (!$user->isAccountNonExpired()) {
			$ex = new ExpiredAccountException();
			$ex->setUser($user);
			throw $ex;
		}
	}

	/**
	 * {@inheritdoc}
	 */
	public function checkPostAuth(UserInterface $user)
	{
		if (!$user instanceof User) {
			return;
		}

		if (!$user->isCredentialsNonExpired()) {
			$ex = new ExpiredCredentialsException();
			$ex->setUser($user);
			throw $ex;
		}
	}
}
