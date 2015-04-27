<?php

namespace EUREKA\G6KBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

class BaseAdminController extends Controller {

	protected function errorResponse($form, $error)	{
		$form['error'] = $error;
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;	
	}

	protected function parseDate($format, $dateStr) {
		if (empty($dateStr)) {
			return null;
		}
		$date = \DateTime::createFromFormat($format, $dateStr);
		$errors = \DateTime::getLastErrors();
		if ($errors['error_count'] > 0) {
			throw new \Exception($errors['errors'][0]);
		}
		return $date;
	}

	public function isDevelopmentEnvironment() {
		return in_array($this->get('kernel')->getEnvironment(), array('test', 'dev'));
	}
	
}
