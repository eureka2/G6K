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

namespace App\Security\Util;

use Doctrine\Common\Annotations\AnnotationReader;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security as SecurityAnnotation;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Yaml\Exception\ParseException;

use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

use App\Security\UserInterface;

class AccessControl {

	protected $acl = [];
	protected $roleHierarchy = [
		'ROLE_ALLOWED_TO_SWITCH' => [],
		'IS_AUTHENTICATED_FULLY' => [],
		'IS_AUTHENTICATED_REMEMBERED' => ['IS_AUTHENTICATED_FULLY'],
		'ROLE_USER' => ['IS_AUTHENTICATED_FULLY', 'IS_AUTHENTICATED_REMEMBERED'],
		'IS_AUTHENTICATED_ANONYMOUSLY' => []
	];
	protected $annotationReader;
	protected $userRoles = ['IS_AUTHENTICATED_ANONYMOUSLY'];

	public function __construct(string $projectDir, ?TokenStorageInterface $tokenStorage)
	{
		$this->annotationReader = new AnnotationReader();
		try {
			$config = Yaml::parseFile($projectDir . '/config/packages/security.yaml');
			$this->loadRoleHierarchyFromConfig($config);
			$this->loadACLFromConfig($config);
		} catch (ParseException $exception) {
			throw new \Exception(sprintf('Unable to parse security.yaml: %s', $exception->getMessage()));
		}
		$user = $tokenStorage->getToken()->getUser();
		if ($user instanceof UserInterface) { // user is connected
			$this->userRoles = $this->getAllUserRoles($user);
		}
	}

	public function isPathAuthorized(string $path) : bool
	{
		foreach($this->acl as $aclpath => $roles) {
			if (preg_match("@" . $aclpath . "@", $path)) {
				$commonRoles = array_intersect($roles, $this->userRoles);
				return !empty($commonRoles);
			}
		}
		return true;
	}

	protected function loadRoleHierarchyFromConfig(array $config) : void
	{
		foreach ($config['security']['role_hierarchy'] as $role => $subroles) {
			if (!is_array($subroles)) {
				$subroles = [$subroles];
			}
			if (isset($this->roleHierarchy[$role])) {
				$this->roleHierarchy[$role] = array_merge($this->roleHierarchy[$role], $subroles);
			} else {
				$this->roleHierarchy[$role] = $subroles;
			}
		}
	}

	protected function loadACLFromConfig(array $config) : void
	{
		foreach ($config['security']['access_control'] as $accessControl) {
			$roles = [];
			if (isset($accessControl['role'])) {
				if (is_array($accessControl['role'])) {
					$roles = array_merge($roles, $accessControl['role']);
				} else {
					$roles[] = $accessControl['role'];
				}
			}
			if (isset($accessControl['roles'])) {
				if (is_array($accessControl['roles'])) {
					$roles = array_merge($roles, $accessControl['roles']);
				} else {
					$roles[] = $accessControl['roles'];
				}
			}
			$this->acl[$accessControl['path']] = array_unique($roles);
		}
	}

	private function addSubRoles(string $role, array &$roles) : void
	{
		if (isset($this->roleHierarchy[$role])) {
			foreach($this->roleHierarchy[$role] as $subrole) {
				if (!in_array($subrole, $roles)) {
					$roles[] = $subrole;
					$this->addSubRoles($subrole, $roles);
				}
			}
		}
	}

	private function getAllUserRoles(UserInterface $user) : array
	{
		$userRoles = [];
		$roles = $user->getRoles();
		foreach ($roles as $role) {
			if (!in_array($role, $userRoles)) {
				$userRoles[] = $role;
				$this->addSubRoles($role, $userRoles);
			}
		}
		return $userRoles;
	}

}
