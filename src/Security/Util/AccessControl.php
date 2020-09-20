<?php declare(strict_types=1);

/*
The MIT License (MIT)

Copyright (c) 2020 Jacques Archimède

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

namespace App\Security\Util;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Http\AccessMapInterface;

class AccessControl implements AccessControlInterface 
{

	/**
	 * @var array
	 */
	protected $server;

	/**
	 * @var string
	 */
	protected $baseUrl;

	/**
	 * @var \Symfony\Component\Security\Http\AccessMapInterface
	 */
	protected $accessMap;

	/**
	 * @var \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface
	 */
	protected $tokenStorage;

	/**
	 * @var \Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface
	 */
	protected $accessDecisionManager;

	public function __construct(
		AccessMapInterface $accessMap,
		RequestStack $requestStack,
		TokenStorageInterface $tokenStorage,
		AccessDecisionManagerInterface $accessDecisionManager
	)
	{
		$this->accessMap = $accessMap;
		$this->server = $requestStack->getCurrentRequest()->server->all();
		$this->baseUrl = $requestStack->getCurrentRequest()->getBaseUrl();
		$this->tokenStorage = $tokenStorage;
		$this->accessDecisionManager = $accessDecisionManager;
	}

	public function isPathAuthorized(string $path)
	{
		$request = Request::create($this->baseUrl . $path, 'GET', [], [], [], $this->server);
		$token = $this->tokenStorage->getToken();
		[$attributes] = $this->accessMap->getPatterns($request);
		if (null === $attributes) {
			$attributes = ['IS_AUTHENTICATED_ANONYMOUSLY'];
		}
		return $this->accessDecisionManager->decide($token, $attributes, $request);
	}
}
