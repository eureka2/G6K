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

namespace App\G6K\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Security\Util\SecurityFunction;

use App\G6K\Manager\ControllersTrait;

/**
 *
 * The UsersAdminController class is the controller that handles all actions of the users management interface.
 *
 * These actions are:
 *
 * - Creation of a user
 * - Modification of a user
 * - Deletion of a user
 * - Restoring a user after its deletion
 *
 * All these actions are requested in Ajax by the Javascript Tabledit component
 *
 * @author Jacques Archimède
 *
 */
class UsersAdminController extends BaseAdminController {

	use ControllersTrait;

	/**
	 * Entry point for the route paths begining by /admin/users
	 *
	 * These route paths are :
	 *
	 * - /admin/users
	 * - /admin/users/{crud}
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string|null $crud (default: null) operation to execute on the user (add, update, delete, restore)
	 * @return  \Symfony\Component\HttpFoundation\Response The response with JSON content
	 *
	 */
	public function index(Request $request, $crud = null)
	{
		$this->initialize();
		return $this->runIndex($request, $crud);
	}

	/**
	 * Dispatches the index action to the appropriate processing based on the value of the crud parameter.
	 *
	 * If the crud parameter contains no value, shows the users management interface.
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string|null $crud (default: null) operation to execute on the user (add, update, delete, restore)
	 * @return  \Symfony\Component\HttpFoundation\Response The response with JSON content
	 */
	protected function runIndex(Request $request, $crud)
	{
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
		
		if ($crud !== null) {
			if (! $this->authorizationChecker->isGranted('ROLE_SUPER_ADMIN')) {
				return $this->errorResponse($form, $this->translator->trans("Access denied!"));
			}
			switch ($crud) {
				case 'add':
					return $this->addUser ($form);
				case 'update':
					return $this->updateUser ($form);
				case 'delete':
					return $this->deleteUser ($form);
				case 'restore':
					return $this->restoreUser ($form);
			}
		} else if (! $this->authorizationChecker->isGranted('ROLE_SUPER_ADMIN')) {
			throw $this->createAccessDeniedException ($this->translator->trans("Access Denied!"));
		} else {
			$users = $this->userManager->findUsers();

			$paginator = new \AshleyDawson\SimplePagination\Paginator();
			$paginator->setItemTotalCallback(function () use ($users) {
				return count($users);
			});
			$paginator->setSliceCallback(function ($offset, $length) use ($users) {
				return array_slice($users, $offset, $length);
			});
			$itemsPerPage = (int)$request->get('itemsPerPage', 25);
			$paginator->setItemsPerPage($itemsPerPage)->setPagesInRange(10);
			$pagination = $paginator->paginate((int)$request->get('page', 1));

		 	$hiddens = array();
			$hiddens['script'] = $script;
			$ua = new \Detection\MobileDetect();
			try {
				return $this->render(
					'admin/pages/users.html.twig',
					array(
						'ua' => $ua,
						'browserengine' => $this->getBrowserEngine($request),
						'path' => $request->getScheme().'://'.$request->getHttpHost(),
						'nav' => 'users',
						'script' => 1,
						'simulator' => "",
						'view' => "",
						'pagination' => $pagination,
						'hiddens' => $hiddens
					)
				);
			} catch (\Exception $e) {
				echo $e->getMessage();
				throw $this->createNotFoundException($this->translator->trans("This template does not exist"));
			}
		}
	}

	/**
	 * Creates a user with the data in the form fields.
	 *
	 * Route path : /admin/users/add
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @return  \Symfony\Component\HttpFoundation\Response The response with JSON content
	 *
	 */
	protected function addUser ($form) {
		return $this->doUpdateUser($form, true);
	}

	/**
	 * Restores a user with the data in the form fields.
	 *
	 * Route path : /admin/users/restore
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @return  \Symfony\Component\HttpFoundation\Response The response with JSON content
	 *
	 */
	protected function restoreUser ($form) {
		return $this->doUpdateUser($form, false, true);
	}

	/**
	 * Updates a user with the data in the form fields.
	 *
	 * Route path : /admin/users/update
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @return  \Symfony\Component\HttpFoundation\Response The response with JSON content
	 *
	 */
	protected function updateUser ($form) {
		$id = $form['id'];
		if ($id == 0) {
			return $this->addUser ($form);
		}
		return $this->doUpdateUser($form);
	}

	/**
	 * Realizes the update of the user database via FOSUserBundle with the data in the form fields.
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   bool $newUser (default: false) true if the user is to be created, false otherwise
	 * @param   bool $restore (default: false) true if the user is to be restored, false otherwise
	 * @return  \Symfony\Component\HttpFoundation\Response The response with JSON content
	 *
	 */
	protected function doUpdateUser($form, $newUser = false, $restore = false) {
		$userName = $form['userName'];
		$email = $form['email'];
		$password = $form['password'];
		$enabled = isset($form['enabled']) ? $form['enabled'] == 1 : false;
		$roles = isset($form['roles']) ? $form['roles'] : array() ;
		if ($userName == "" || strlen($userName)  < 3) {
			return $this->errorResponse($form, $this->translator->trans("The username field is required  (3 car .min)!"));
		}
		if ($email == "") {
			return $this->errorResponse($form, $this->translator->trans("The email field is required!"));
		}
		if (!preg_match("/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/", $email)) {
			return $this->errorResponse($form, $this->translator->trans("Please enter a valid email address."));
		}
		if ($password == "") {
			return $this->errorResponse($form, $this->translator->trans("The password field is required!"));
		}
		if (! $restore && ! $newUser) {
			$user = $this->userManager->findUserBy(array('id' => $form['id']));
			if ($user === null) {
				return $this->errorResponse($form, $this->translator->trans("This user doesn't  exists !"));
			}
			$oldRoles = $user->getRoles();
			if ($userName != $user->getUserName()) {
				$otherUser = $this->userManager->findUserByUsername($userName);
				if ($otherUser !== null) {
					return $this->errorResponse($form, $this->translator->trans("This username already exists !"));
				}
			}
			if ($email != $user->getEmail()) {
				$otherUser = $this->userManager->findUserByEmail($email);
				if ($otherUser !== null) {
					return $this->errorResponse($form, $this->translator->trans("This email already exists !"));
				}
			}
		} else {
			$oldRoles = array();
			$otherUser = $this->userManager->findUserByUsername($userName);
			if ($otherUser !== null) {
				return $this->errorResponse($form, $this->translator->trans("This username already exists !"));
			}
			$otherUser = $this->userManager->findUserByEmail($email);
			if ($otherUser !== null) {
				return $this->errorResponse($form, $this->translator->trans("This email already exists !"));
			}
			$user = $this->userManager->createUser();
		}
		$user->setUsername($userName);
		$user->setEmail($email);
		if ($restore) {
			$user->setPlainPassword('');
			$user->setPassword($password);
		} else if ($newUser || $password != $user->getPassword()) {
			if (! SecurityFunction::isPasswordStrong($password)) {
				return $this->errorResponse($form, $this->translator->trans("security.change_password.error.password_not_strong", [], 'security'));
			}
			$user->setPlainPassword($password);
		}
		$user->setEnabled($enabled);
		foreach ($roles as $role) {
			if (!in_array($role, $oldRoles)) {
				$user->addRole($role);
			}
		}		
		foreach ($oldRoles as $role) {
			if (!in_array($role, $roles)) {
				$user->removeRole($role);
			}
		}		
		$this->userManager->updateUser($user);
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		$form['id'] = $user->getId();
		$form['password'] = $user->getPassword();
		return $response;
	}

	/**
	 * Deletes a user with the data in the form fields.
	 *
	 * Route path : /admin/users/delete
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @return  \Symfony\Component\HttpFoundation\Response The response with JSON content
	 *
	 */
	protected function deleteUser ($form) {
		$id = $form['id'];
		$user = $this->userManager->findUserBy(array('id' => $id));
		if ($user === null) {
			return $this->errorResponse($form, $this->translator->trans("This user doesn't  exists !"));
		}
		$this->userManager->deleteUser($user);
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}
	
}

?>
