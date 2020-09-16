<?php declare(strict_types=1);

/*
The MIT License (MIT)

Copyright (c) 2015-2018 Jacques Archimède

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
 
namespace App\Security\Authenticator;

use App\Security\UserManagerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Core\Exception\InvalidCsrfTokenException;
use Symfony\Component\Security\Core\Security;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;
use Symfony\Component\Security\Csrf\CsrfToken;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Guard\Authenticator\AbstractFormLoginAuthenticator;
use Symfony\Component\Security\Guard\PasswordAuthenticatedInterface;
use Symfony\Component\Security\Http\Util\TargetPathTrait;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UserAuthenticator extends AbstractFormLoginAuthenticator implements PasswordAuthenticatedInterface
{
	use TargetPathTrait;

	public const LOGIN_ROUTE = 'app_login';
	public const HOME_ROUTE = 'eureka_g6k_index';

	private $userManager;
	private $urlGenerator;
	private $csrfTokenManager;
	private $passwordEncoder;
	private $authorizationChecker;

	public function __construct(UserManagerInterface $userManager, UrlGeneratorInterface $urlGenerator, CsrfTokenManagerInterface $csrfTokenManager, UserPasswordEncoderInterface $passwordEncoder, AuthorizationCheckerInterface $authorizationChecker)
	{
		$this->userManager = $userManager;
		$this->urlGenerator = $urlGenerator;
		$this->csrfTokenManager = $csrfTokenManager;
		$this->passwordEncoder = $passwordEncoder;
		$this->authorizationChecker = $authorizationChecker;
	}

	public function supports(Request $request)
	{
		return self::LOGIN_ROUTE === $request->attributes->get('_route')
			&& $request->isMethod('POST');
	}

	public function getCredentials(Request $request)
	{
		$credentials = [
			'username' => $request->request->get('username'),
			'password' => $request->request->get('password'),
			'csrf_token' => $request->request->get('_csrf_token'),
		];
		$request->getSession()->set(
			Security::LAST_USERNAME,
			$credentials['username']
		);

		return $credentials;
	}

	public function getUser($credentials, UserProviderInterface $userProvider)
	{
		$token = new CsrfToken('authenticate', $credentials['csrf_token']);
		if (!$this->csrfTokenManager->isTokenValid($token)) {
			throw new InvalidCsrfTokenException();
		}

		$user = $userProvider->loadUserByUsername($credentials['username']);

		if (!$user) {
			// fail authentication with a custom error
			throw new CustomUserMessageAuthenticationException('Username could not be found.');
		}

		return $user;
	}

	public function checkCredentials($credentials, UserInterface $user)
	{
		return $this->passwordEncoder->isPasswordValid($user, $credentials['password']);
	}

	/**
	 * Used to upgrade (rehash) the user's password automatically over time.
	 */
	public function getPassword($credentials): ?string
	{
		return $credentials['password'];
	}

	public function onAuthenticationSuccess(Request $request, TokenInterface $token, $providerKey)
	{
		if ($targetPath = $this->getTargetPath($request->getSession(), $providerKey)) {
			$user = $token->getUser();
			if (!$user) {
				throw new CustomUserMessageAuthenticationException('Username could not be found.');
			}
			$user->setLastLogin(new \DateTime());
			$this->userManager->updateUser($user);
			if ($this->authorizationChecker->isGranted('ROLE_CONTRIBUTOR')) {
				return new RedirectResponse($targetPath);
			} else {
				return new RedirectResponse($this->urlGenerator->generate(self::HOME_ROUTE));
			}
		}

		// For example : return new RedirectResponse($this->urlGenerator->generate('some_route'));
		return new RedirectResponse($this->urlGenerator->generate(self::HOME_ROUTE));
		// throw new \Exception('provide a valid redirect inside '.__FILE__);
	}

	protected function getLoginUrl()
	{
		return $this->urlGenerator->generate(self::LOGIN_ROUTE);
	}
}
